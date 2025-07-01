# Planning Poker - Deployment Guide

This guide covers automated deployment using GitHub Actions CI/CD, local testing with Docker, and production deployment using Traefik.

## Prerequisites

- Docker and Docker Compose installed on your server
- Existing Traefik instance running with:
  - Docker provider enabled
  - Network named `traefik`
  - Let's Encrypt certificate resolver configured
- A domain name pointing to your server
- GitHub repository with Actions enabled
- SSH access to your VPS server

## Table of Contents

1. [GitHub Actions CI/CD](#github-actions-cicd)
2. [Local Testing with Act](#local-testing-with-act)
3. [Manual Docker Deployment](#manual-docker-deployment)
4. [Architecture & Security](#architecture--security)
5. [Troubleshooting](#troubleshooting)

## GitHub Actions CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`) provides automated deployment to your VPS with comprehensive testing and verification.

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | Your VPS server IP address or hostname | `192.168.1.100` or `myserver.com` |
| `VPS_USER` | Username for SSH connection to VPS | `deployer` |
| `VPS_SSH_KEY` | Private SSH key for authentication | Contents of your `~/.ssh/id_rsa` file |
| `VPS_PORT` | SSH port (optional, defaults to 22) | `22` or `2222` |

### SSH Key Setup

1. **Generate SSH key pair on your local machine:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions@planning-poker"
   ```
   Save as: `/home/your-user/.ssh/planning_poker_deploy`

2. **Copy public key to your VPS:**
   ```bash
   ssh-copy-id -i ~/.ssh/planning_poker_deploy.pub deployer@your-vps-ip
   ```

3. **Add private key to GitHub secrets:**
   ```bash
   cat ~/.ssh/planning_poker_deploy
   ```
   Copy the entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) to the `VPS_SSH_KEY` secret.

### VPS Server Setup

1. **Create deployment user:**
   ```bash
   sudo adduser deployer
   sudo usermod -aG docker deployer
   sudo mkdir -p /home/deployer
   sudo chown deployer:deployer /home/deployer
   ```

2. **Install required software:**
   ```bash
   # Docker & Docker Compose
   sudo apt update
   sudo apt install docker.io docker-compose git -y
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

3. **Configure deployment directory:**
   ```bash
   sudo -u deployer mkdir -p /home/deployer/planning-poker
   sudo -u deployer git clone https://github.com/YOUR_USERNAME/planning-poker.git /home/deployer/planning-poker
   ```

4. **Configure environment file:**
   ```bash
   cd /home/deployer/planning-poker
   sudo -u deployer cp .env.production.example .env.production
   sudo -u deployer nano .env.production
   ```
   Update the following key values:
   ```env
   # Your domain name
   DOMAIN=your-domain.com
   
   # CORS configuration - must match your domain
   CLIENT_URL=https://your-domain.com
   CORS_ORIGIN=https://your-domain.com
   
   # Production settings
   NODE_ENV=production
   PORT=3001
   ```

### Workflow Features

- **Automatic Deployment:** Triggers on pushes to `main` branch
- **Manual Deployment:** Use workflow dispatch with environment selection (production/staging)
- **Testing:** Runs full test suite before deployment
- **Build Verification:** Ensures application builds successfully
- **Container Verification:** Confirms containers are running after deployment
- **Rollback Safety:** Maintains git history for easy rollbacks

### Deployment Environments

**Production Environment:**
- Automatically deploys from `main` branch
- Uses `./deploy.sh deploy` (production Docker configuration)
- Requires all secrets configured

**Staging Environment:**
- Manual deployment via workflow dispatch
- Uses `./deploy.sh local` (local Docker configuration)
- Useful for testing before production deployment

## Local Testing with Act

You can test GitHub Actions workflows locally using the `act` tool before pushing to GitHub.

### Installing Act

**macOS (with Homebrew):**
```bash
brew install act
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows:**
```bash
choco install act-cli
```

### Local Testing Setup

1. **Create `.actrc` file in your project root:**
   ```bash
   echo "-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest" > .actrc
   ```

2. **Create local secrets file (`.secrets`):**
   ```bash
   VPS_HOST=your-test-server-ip
   VPS_USER=your-test-user
   VPS_SSH_KEY="$(cat ~/.ssh/your_test_key)"
   VPS_PORT=22
   ```

3. **Test the workflow locally:**
   ```bash
   # Test push event (automatic deployment)
   act push --secret-file .secrets

   # Test manual deployment with staging environment
   act workflow_dispatch --secret-file .secrets -j deploy \
     --input environment=staging

   # Test specific job only
   act push --secret-file .secrets -j deploy
   ```

### Local Testing Tips

- **Dry Run:** Add `--dry-run` flag to see what would be executed
- **Verbose Output:** Use `-v` flag for detailed logging
- **Test SSH Connection:** Verify your SSH setup works before running the full workflow
- **Container Resource:** Act uses Docker containers, ensure you have sufficient resources
- **Network Access:** Ensure your local machine can reach your test VPS

### Example Local Test Commands

```bash
# Quick syntax check
act --list

# Test with verbose output
act push --secret-file .secrets -v

# Test specific workflow
act workflow_dispatch --secret-file .secrets \
  --input environment=staging \
  --job deploy

# Dry run to check workflow steps
act push --secret-file .secrets --dry-run
```

## Manual Docker Deployment

### Quick Start

#### Production Deployment (with Traefik)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url> planning-poker
   cd planning-poker
   ```

2. **Configure environment:**
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
   Update `DOMAIN` and other configuration values.

3. **Deploy:**
   ```bash
   ./deploy.sh
   ```

#### Local Testing (no Traefik)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url> planning-poker
   cd planning-poker
   ```

2. **Deploy locally:**
   ```bash
   ./deploy.sh local
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:8081

### Detailed Setup

#### 1. Environment Configuration

Copy the example environment file and customize it:

```bash
cp .env.production.example .env.production
```

Key configuration options:

```env
# Your domain name
DOMAIN=planning-poker.yourdomain.com

# Node.js server configuration
NODE_ENV=production
PORT=3001

# CORS configuration
CLIENT_URL=https://planning-poker.yourdomain.com
CORS_ORIGIN=https://planning-poker.yourdomain.com

# Traefik configuration
TRAEFIK_NETWORK=traefik
CERT_RESOLVER=letsencrypt
```

#### 2. Traefik Integration

Ensure your existing Traefik configuration includes:

```yaml
# traefik.yml
providers:
  docker:
    network: traefik
    exposedByDefault: false

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

#### 3. Deployment Options

##### Option A: Using the Deployment Script (Recommended)

**Production Deployment (with Traefik):**
```bash
# Deploy to production
./deploy.sh deploy

# View production logs
./deploy.sh logs

# Stop production application
./deploy.sh stop

# Restart production application
./deploy.sh restart
```

**Local Deployment (no Traefik):**
```bash
# Deploy locally for testing
./deploy.sh local

# View local logs
./deploy.sh logs-local

# Stop local application
./deploy.sh stop-local

# Restart local application
./deploy.sh restart-local
```

##### Option B: Using npm Scripts

**Production (with Traefik):**
```bash
# Build containers
npm run docker:build

# Deploy
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down
```

**Local (no Traefik):**
```bash
# Deploy locally
npm run docker:local

# View local logs
npm run docker:local-logs

# Stop local
npm run docker:local-stop

# Restart local
npm run docker:local-restart
```

##### Option C: Using Docker Compose Directly

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Architecture & Security

### Container Structure

- **planning-poker-client**: Nginx container serving the React build
- **planning-poker-server**: Node.js container running the Socket.IO server

### Networking

- **traefik**: External network connecting to your existing Traefik instance
- **internal**: Internal bridge network for container communication

### Routing

- Frontend: `https://yourdomain.com` → Client container (port 80)
- Backend: `https://yourdomain.com/socket.io` → Server container (port 3001)

## Security Features

### Container Security
- Non-root user execution in server container
- Minimal base images (Alpine Linux)
- Security headers via Traefik middleware
- Network isolation with internal bridge network

### HTTP Security Headers
- Frame-Options: DENY
- Content-Type-Options: nosniff
- XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy restrictions

### File Security
- Nginx blocks access to sensitive files (.git, .env, etc.)
- Static file serving with proper MIME types
- Gzip compression for performance

## Performance Optimizations

### Client Container
- Multi-stage build reducing final image size
- Gzip compression for static assets
- Browser caching with versioned assets (1 year)
- Pre-compressed static files support

### Server Container
- Production-only dependencies
- Health checks for container monitoring
- Graceful shutdown handling
- Resource limits (configurable)

### Monitoring and Logging

#### Health Checks
- Client: HTTP check on port 80
- Server: HTTP check on `/health` endpoint
- Automatic container restart on health check failure

#### Logging
- Structured logging to stdout/stderr
- Nginx access and error logs
- Docker log driver integration

#### Monitoring Commands

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View live logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Inspect container health
docker inspect --format='{{.State.Health.Status}}' planning-poker-client
```

### Maintenance

#### Updates

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and redeploy:**
   ```bash
   ./deploy.sh deploy
   ```

#### Backup

No persistent data is stored by default. If you add database functionality, ensure proper backup procedures.

#### SSL Certificate Renewal

Handled automatically by Traefik + Let's Encrypt.

## Troubleshooting

### Common Issues

#### GitHub Actions Deployment Issues

**SSH Connection Failed:**
- Verify VPS_HOST, VPS_USER, and VPS_PORT are correct
- Check SSH key format (must include header/footer lines)
- Ensure public key is in VPS `~/.ssh/authorized_keys`
- Test SSH connection manually: `ssh -i ~/.ssh/key deployer@vps-ip`

**Container Start Failed:**
- Check Docker daemon is running on VPS
- **Verify environment files exist (`.env.production`)** - Most common issue!
- Ensure `.env.production` is properly configured with your domain
- Check container logs: `docker-compose logs`
- Ensure ports are not in use

**Missing Environment File:**
- Error: `No such file or directory: .env.production`
- Solution: Create and configure `.env.production` file in `/home/deployer/planning-poker/`
- Copy from example: `cp .env.production.example .env.production`
- Update domain settings to match your server

**Build Failures:**
- Check Node.js version compatibility
- Verify dependencies install correctly
- Run tests locally first: `npm test`
- Check for environment-specific configuration

**Git Issues:**
- Verify repository clone succeeded
- Check branch exists and is accessible
- Ensure git credentials are configured
- Verify commit SHA matches expected

#### Docker Deployment Issues

**Containers not starting:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if Traefik network exists
docker network ls | grep traefik
```

**Domain not accessible:**
- Verify DNS points to your server
- Check Traefik labels in docker-compose.prod.yml
- Ensure domain matches in .env.production

**WebSocket connection issues:**
- Verify `/socket.io` path prefix routing
- Check CORS configuration
- Ensure both containers are in same network

### Debug Commands

#### GitHub Actions Debugging
```bash
# Check deployment status on VPS
ssh deployer@your-vps "cd /home/deployer/planning-poker && docker ps"

# View recent deployment logs
ssh deployer@your-vps "cd /home/deployer/planning-poker && docker-compose logs --tail=100"

# Check git status on VPS
ssh deployer@your-vps "cd /home/deployer/planning-poker && git status"

# Test local act execution
act --list --secret-file .secrets
```

#### Docker Debugging
```bash
# Access client container
docker exec -it planning-poker-client sh

# Access server container
docker exec -it planning-poker-server sh

# Check Traefik routing
curl -H "Host: yourdomain.com" http://localhost/health

# Test internal connectivity
docker exec planning-poker-client ping planning-poker-server
```

### Log Analysis

```bash
# Client (nginx) logs
docker exec planning-poker-client tail -f /var/log/nginx/access.log

# Server application logs
docker-compose -f docker-compose.prod.yml logs -f planning-poker-server

# All logs with timestamps
docker-compose -f docker-compose.prod.yml logs -f -t
```

### Security Best Practices

#### SSH Key Security
- Use separate SSH keys for GitHub Actions (never reuse personal keys)
- Rotate SSH keys regularly
- Use strong passphrases for key generation
- Limit SSH key permissions on VPS (`authorized_keys` file should be 600)

#### GitHub Secrets Management
- Never commit secrets to repository
- Use environment-specific secrets when possible
- Regularly audit secret access and usage
- Remove unused secrets promptly

#### VPS Security
- Keep deployment user permissions minimal
- Use fail2ban for SSH protection
- Regular security updates
- Monitor deployment logs for suspicious activity

## Scaling Considerations

### Horizontal Scaling
For multiple server instances, consider:
- Session affinity (sticky sessions)
- Shared state management
- Load balancer configuration

### Resource Limits
Add resource limits to docker-compose.prod.yml:

```yaml
services:
  planning-poker-client:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Security Best Practices

1. **Regular Updates:**
   - Keep base images updated
   - Update dependencies regularly
   - Monitor security advisories

2. **Access Control:**
   - Use strong passwords for private rooms
   - Consider implementing rate limiting
   - Monitor access logs

3. **Network Security:**
   - Use internal networks for container communication
   - Limit exposed ports
   - Consider implementing IP whitelisting if needed

## Support

For issues or questions:
1. Check the logs using the commands above
2. Review the troubleshooting section
3. Check the main README.md for application-specific information
4. Open an issue in the project repository

### Getting Help

- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Act Documentation:** https://github.com/nektos/act
- **Docker Compose Documentation:** https://docs.docker.com/compose/
- **SSH Troubleshooting:** Check VPS system logs with `sudo journalctl -u sshd`

## Production Checklist

### GitHub Actions Setup
- [ ] GitHub secrets configured (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT)
- [ ] SSH keys generated and deployed to VPS
- [ ] Deployment user created with Docker permissions
- [ ] VPS firewall configured for SSH and HTTP/HTTPS
- [ ] Test workflow with `act` locally

### Docker Deployment Setup
- [ ] Environment variables configured
- [ ] Domain DNS configured
- [ ] Traefik network accessible
- [ ] SSL certificates working
- [ ] Health checks passing
- [ ] Logs accessible and monitored
- [ ] Backup procedures in place (if applicable)
- [ ] Security headers active
- [ ] Performance optimizations enabled

### Next Steps After Setup
1. Configure GitHub secrets with your VPS credentials
2. Test SSH connection manually to verify setup
3. Run local test with `act` to validate workflow
4. Create a test commit to trigger automatic deployment
5. Monitor first deployment and verify containers are running
6. Set up monitoring and alerting for production deployments