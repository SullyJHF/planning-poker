#!/bin/bash

# Planning Poker Production Deployment Script
# This script helps deploy the Planning Poker application to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Check if production environment file exists
check_env_file() {
    local env_file="${1:-.env.production}"
    local env_example="${env_file}.example"
    
    if [ ! -f "$env_file" ]; then
        log_warning "Environment file $env_file not found."
        log_info "Creating $env_file from example..."
        
        if [ -f "$env_example" ]; then
            cp "$env_example" "$env_file"
            log_warning "Please edit $env_file with your configuration"
            log_info "Opening $env_file for editing..."
            ${EDITOR:-nano} "$env_file"
        else
            log_error "$env_example not found. Cannot create environment file."
            exit 1
        fi
    fi
}

# Build and deploy the application (production with Traefik)
deploy() {
    log_info "Starting production deployment with Traefik..."
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        log_info "Loading environment variables from .env.production..."
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Stop existing containers if running
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans || true
    
    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
    
    # Wait for containers to be healthy
    log_info "Waiting for containers to be healthy..."
    sleep 10
    
    # Check container status
    if docker-compose -f docker-compose.prod.yml --env-file .env.production ps | grep -q "Up"; then
        log_success "Production deployment successful!"
        log_info "Application should be available at: https://$(grep DOMAIN .env.production | cut -d= -f2)"
    else
        log_error "Deployment failed. Check container logs:"
        docker-compose -f docker-compose.prod.yml --env-file .env.production logs
        exit 1
    fi
}

# Build and deploy the application locally (no Traefik)
deploy_local() {
    log_info "Starting local deployment (no Traefik)..."
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        log_info "Loading environment variables from .env.local..."
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Stop existing containers if running
    log_info "Stopping existing local containers..."
    docker-compose -f docker-compose.local.yml down --remove-orphans || true
    
    # Build and start containers
    log_info "Building and starting local containers..."
    docker-compose -f docker-compose.local.yml up -d --build
    
    # Wait for containers to be healthy
    log_info "Waiting for containers to be healthy..."
    sleep 10
    
    # Check container status
    if docker-compose -f docker-compose.local.yml ps | grep -q "Up"; then
        log_success "Local deployment successful!"
        log_info "Application is available at:"
        log_info "  Frontend: http://localhost:8080"
        log_info "  Backend:  http://localhost:8081"
        log_info ""
        log_info "To test the application, open your browser to: http://localhost:8080"
    else
        log_error "Local deployment failed. Check container logs:"
        docker-compose -f docker-compose.local.yml logs
        exit 1
    fi
}

# Show logs (production)
show_logs() {
    log_info "Showing production application logs..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
}

# Show logs (local)
show_logs_local() {
    log_info "Showing local application logs..."
    docker-compose -f docker-compose.local.yml logs -f
}

# Stop the application (production)
stop() {
    log_info "Stopping production application..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production down
    log_success "Production application stopped"
}

# Stop the application (local)
stop_local() {
    log_info "Stopping local application..."
    docker-compose -f docker-compose.local.yml down
    log_success "Local application stopped"
}

# Restart the application (production)
restart() {
    log_info "Restarting production application..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production restart
    log_success "Production application restarted"
}

# Restart the application (local)
restart_local() {
    log_info "Restarting local application..."
    docker-compose -f docker-compose.local.yml restart
    log_success "Local application restarted"
}

# Show help
show_help() {
    echo "Planning Poker Deployment Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Production Commands (with Traefik):"
    echo "  deploy         Build and deploy to production with Traefik (default)"
    echo "  logs           Show production application logs"
    echo "  stop           Stop production application"
    echo "  restart        Restart production application"
    echo
    echo "Local Commands (no Traefik):"
    echo "  local          Build and deploy locally without Traefik"
    echo "  logs-local     Show local application logs"
    echo "  stop-local     Stop local application"
    echo "  restart-local  Restart local application"
    echo
    echo "Other Commands:"
    echo "  help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 deploy         # Deploy to production with Traefik"
    echo "  $0 local          # Deploy locally for testing (http://localhost:8080)"
    echo "  $0 logs           # Show production logs"
    echo "  $0 logs-local     # Show local logs"
    echo "  $0 stop-local     # Stop local containers"
    echo
    echo "Local deployment uses:"
    echo "  - Frontend: http://localhost:8080"
    echo "  - Backend:  http://localhost:8081"
    echo "  - No SSL/Traefik required"
}

# Main script logic
main() {
    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            check_env_file ".env.production"
            deploy
            ;;
        "local")
            check_dependencies
            check_env_file ".env.local"
            deploy_local
            ;;
        "logs")
            show_logs
            ;;
        "logs-local")
            show_logs_local
            ;;
        "stop")
            stop
            ;;
        "stop-local")
            stop_local
            ;;
        "restart")
            restart
            ;;
        "restart-local")
            restart_local
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"