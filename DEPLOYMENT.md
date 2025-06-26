# Planning Poker - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Planning Poker application to production using Docker and Traefik.

## Prerequisites

- Docker and Docker Compose installed on your server
- Existing Traefik instance running with:
  - Docker provider enabled
  - Network named `traefik`
  - Let's Encrypt certificate resolver configured
- A domain name pointing to your server

## Quick Start

### Production Deployment (with Traefik)

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

### Local Testing (no Traefik)

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

## Detailed Setup

### 1. Environment Configuration

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

### 2. Traefik Integration

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

### 3. Deployment Options

#### Option A: Using the Deployment Script (Recommended)

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

#### Option B: Using npm Scripts

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

#### Option C: Using Docker Compose Directly

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Architecture Overview

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

## Monitoring and Logging

### Health Checks
- Client: HTTP check on port 80
- Server: HTTP check on `/health` endpoint
- Automatic container restart on health check failure

### Logging
- Structured logging to stdout/stderr
- Nginx access and error logs
- Docker log driver integration

### Monitoring Commands

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

## Maintenance

### Updates

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and redeploy:**
   ```bash
   ./deploy.sh deploy
   ```

### Backup

No persistent data is stored by default. If you add database functionality, ensure proper backup procedures.

### SSL Certificate Renewal

Handled automatically by Traefik + Let's Encrypt.

## Troubleshooting

### Common Issues

1. **Containers not starting:**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Check if Traefik network exists
   docker network ls | grep traefik
   ```

2. **Domain not accessible:**
   - Verify DNS points to your server
   - Check Traefik labels in docker-compose.prod.yml
   - Ensure domain matches in .env.production

3. **WebSocket connection issues:**
   - Verify `/socket.io` path prefix routing
   - Check CORS configuration
   - Ensure both containers are in same network

### Debug Commands

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

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Domain DNS configured
- [ ] Traefik network accessible
- [ ] SSL certificates working
- [ ] Health checks passing
- [ ] Logs accessible and monitored
- [ ] Backup procedures in place (if applicable)
- [ ] Security headers active
- [ ] Performance optimizations enabled