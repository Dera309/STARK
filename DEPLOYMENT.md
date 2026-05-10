# STARK Deployment Guide

## Quick Start

For a complete pre-deployment check, run:
```bash
./scripts/pre-deploy-check.sh
```

## GitHub Actions Secrets Configuration

To use the CI/CD pipeline, configure the following secrets in your GitHub repository settings:

### Required Secrets for Client Build
```
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_SOCKET_URL=https://your-api-domain.com
VITE_TAWK_PROPERTY_ID=your_tawk_property_id
VITE_TAWK_WIDGET_ID=your_tawk_widget_id
```

### Required Secrets for Server Build
```
PORT=3003
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stark
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASS=your-email-password
CLIENT_URL=https://your-production-domain.com
```

### Optional Secrets for Deployment
```
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
KUBE_CONFIG=your_kubernetes_config (base64 encoded)
```

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret from the lists above

## Local Development Setup

### Server Setup
```bash
cd server
cp .env.example .env
# Edit .env with your local configuration
npm install
npm run dev
```

### Client Setup
```bash
cd client
cp .env.example .env
# Edit .env with your local configuration
npm install
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended for Development)
```bash
# Create .env file with production values
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Docker Images Manually
```bash
# Build server image
docker build -t stark-server:latest .

# Build client image (if separated)
docker build -f Dockerfile.client -t stark-client:latest .
```

## Production Deployment Steps

### 1. Prepare Environment Variables
Create production `.env` files with actual values:
- Server: `server/.env.production`
- Client: `client/.env.production`

### 2. Build Applications
```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

### 3. Deploy Server
Options:
- **Docker**: Use the provided Dockerfile and docker-compose.yml
- **PM2**: Use PM2 process manager for Node.js
- **Kubernetes**: Use provided K8s manifests (if available)

### 4. Deploy Client
Options:
- **Nginx**: Serve the built `dist` folder with Nginx
- **CDN**: Upload to Cloudflare, AWS CloudFront, or similar
- **Docker**: Use the multi-stage Dockerfile

### 5. Configure Reverse Proxy (Nginx Example)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Client static files
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Database Backup Strategy

### MongoDB Backup Script
Create a cron job to run regular backups:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/stark"

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Monitoring Setup

### Health Check Endpoint
The server provides a health check endpoint:
```
GET /api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "mongodb": "connected"
}
```

### Metrics Endpoint
The server provides a metrics endpoint:
```
GET /api/v1/metrics
```

Response includes:
- Request counts by method, path, and status
- Error rates
- Response time statistics (min, max, avg, p95)
- Memory usage

### Setting Up Prometheus (Optional)
1. Install Prometheus
2. Add scrape config to `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'stark-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3003']
```

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Run the pre-deployment verification script: `./scripts/pre-deploy-check.sh`
- [ ] Configured all GitHub Actions secrets (see docs/GITHUB_SECRETS_SETUP.md)
- [ ] Set up production environment variables
- [ ] Configured database backup cron job: `./scripts/setup-backup-cron.sh`
- [ ] Reviewed and completed security audit checklist (see docs/SECURITY_AUDIT_CHECKLIST.md)
- [ ] Set up monitoring (Prometheus/Grafana) - see docs/PROMETHEUS_GRAFANA_SETUP.md
- [ ] Tested backup and restore procedures
- [ ] Verified all builds pass locally
- [ ] Reviewed logs for any errors
- [ ] Confirmed team is ready for deployment

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database access control
- [ ] Enable rate limiting (already configured)
- [ ] Configure CORS properly (already configured)
- [ ] Set up log monitoring
- [ ] Enable security headers (helmet)
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Disaster recovery plan documented

## Troubleshooting

### Server won't start
- Check MongoDB connection string
- Verify PORT is not in use
- Check logs in `logs/` directory

### Client build fails
- Verify VITE_API_URL is correct
- Check Node.js version (requires Node 20+)
- Clear node_modules and reinstall

### Database connection issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas whitelist
- Ensure MongoDB is running (local)

### WebSocket connection issues
- Verify SOCKET_URL matches server URL
- Check firewall allows WebSocket connections
- Ensure reverse proxy handles WebSocket upgrades

## Rollback Procedure

If deployment fails:

1. **Docker**: `docker-compose down && docker-compose up -d --build`
2. **PM2**: `pm2 restart stark-server`
3. **Git**: `git revert <commit-hash>` and redeploy
4. **Database**: Restore from latest backup if needed

## Additional Documentation

- **GitHub Secrets Setup**: See `docs/GITHUB_SECRETS_SETUP.md` for detailed GitHub Actions secrets configuration
- **Security Audit**: See `docs/SECURITY_AUDIT_CHECKLIST.md` for comprehensive security audit checklist
- **Monitoring Setup**: See `docs/PROMETHEUS_GRAFANA_SETUP.md` for Prometheus and Grafana setup guide
- **Environment Validation**: Use `scripts/validate-env.sh` or `scripts/validate-env.js` to validate environment variables

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages in browser console
- Verify environment variables are set correctly
- Check health endpoint: `GET /api/v1/health`
