# Deployment Guide

This guide covers various deployment options for the Hestia application.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Traditional Deployment](#traditional-deployment)
- [Production Considerations](#production-considerations)
- [Environment Variables](#environment-variables)

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Google API key with Gemini access

### Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Hestia-AI-Advocate-for-Tenants.git
   cd Hestia-AI-Advocate-for-Tenants
   ```

2. **Set up environment variables:**
   ```bash
   # Create backend .env file
   echo "GOOGLE_API_KEY=your_google_api_key_here" > backend/.env
   ```

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:8001
   - API Health Check: http://localhost:8001/health

### Docker Commands

**Build the image:**
```bash
docker build -t hestia:latest .
```

**Run the container:**
```bash
docker run -d \
  --name hestia \
  -p 3002:3002 \
  -p 8001:8001 \
  --env-file backend/.env \
  hestia:latest
```

**View logs:**
```bash
docker logs -f hestia
```

**Stop the container:**
```bash
docker stop hestia
```

**Remove the container:**
```bash
docker rm hestia
```

## Traditional Deployment

### Backend Deployment (Flask)

#### Production Server with Gunicorn

1. **Install Gunicorn:**
   ```bash
   cd backend
   pip install gunicorn
   ```

2. **Run with Gunicorn:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8001 app.main:app
   ```

   Options:
   - `-w 4`: Number of worker processes (adjust based on CPU cores)
   - `-b 0.0.0.0:8001`: Bind to all interfaces on port 8001
   - `--timeout 120`: Request timeout (increase for long AI operations)

3. **Create a systemd service (Linux):**

   Create `/etc/systemd/system/hestia-backend.service`:
   ```ini
   [Unit]
   Description=Hestia Backend Service
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/Hestia-AI-Advocate-for-Tenants/backend
   Environment="PATH=/path/to/venv/bin"
   ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:8001 app.main:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   sudo systemctl enable hestia-backend
   sudo systemctl start hestia-backend
   ```

### Frontend Deployment (Next.js)

#### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm run start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "hestia-frontend" -- run start
   pm2 save
   pm2 startup
   ```

### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/hestia`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8001/health;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/hestia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Production Considerations

### Security

1. **HTTPS Setup with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate API keys regularly

3. **CORS Configuration:**
   Update backend to restrict origins in production:
   ```python
   from flask_cors import CORS

   CORS(app, origins=["https://your-domain.com"])
   ```

4. **Rate Limiting:**
   - The application includes built-in rate limiting
   - Consider adding nginx rate limiting for additional protection:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

   location /api/ {
       limit_req zone=api burst=20 nodelay;
       # ... rest of proxy config
   }
   ```

### Performance

1. **Caching:**
   - Implement Redis for caching repeated analyses
   - Cache static assets with proper headers

2. **Database (Future):**
   - When adding user accounts, use PostgreSQL or MongoDB
   - Set up connection pooling

3. **CDN:**
   - Serve static assets through a CDN (Cloudflare, AWS CloudFront)
   - Enable gzip/brotli compression

4. **Monitoring:**
   - Set up application monitoring (New Relic, Datadog, Sentry)
   - Monitor API response times
   - Track Gemini AI API usage and costs

### Scaling

1. **Horizontal Scaling:**
   - Run multiple backend instances behind a load balancer
   - Use Redis for session storage if needed

2. **Auto-scaling (AWS Example):**
   - Deploy on AWS ECS/EKS with auto-scaling groups
   - Use Application Load Balancer
   - Configure auto-scaling based on CPU/memory or request count

3. **Database Scaling:**
   - Read replicas for database queries
   - Sharding for multi-tenant setups

## Environment Variables

### Backend (.env)

```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional
FLASK_ENV=production
LOG_LEVEL=INFO
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
RATE_LIMIT_UPLOADS=5      # Uploads per minute
RATE_LIMIT_REQUESTS=20    # API requests per minute

# Redis (if using caching)
REDIS_URL=redis://localhost:6379/0

# Database (future)
DATABASE_URL=postgresql://user:pass@localhost/hestia
```

### Frontend

```bash
# Next.js
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production

# Analytics (future)
NEXT_PUBLIC_GA_ID=your_ga_id
```

## Health Checks

The application includes health check endpoints:

- **Backend:** `GET /health`
  ```json
  {
    "status": "healthy",
    "ai_configured": true
  }
  ```

Use these endpoints for:
- Load balancer health checks
- Kubernetes liveness/readiness probes
- Monitoring systems

## Backup and Recovery

1. **Knowledge Base:**
   - Backup `backend/app/rules/` directory
   - Version control with git

2. **User Data (future):**
   - Regular database backups
   - Point-in-time recovery

3. **Logs:**
   - Centralized logging (ELK stack, CloudWatch)
   - Log retention policies

## Troubleshooting

### Common Issues

1. **"AI service unavailable" errors:**
   - Check GOOGLE_API_KEY is set correctly
   - Verify API key has Gemini access
   - Check API quotas/billing

2. **High latency:**
   - Monitor Gemini API response times
   - Check network connectivity
   - Review worker process count

3. **File upload failures:**
   - Verify MAX_UPLOAD_SIZE setting
   - Check disk space
   - Review nginx client_max_body_size

## CI/CD Pipeline Example

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Build and push Docker image
      run: |
        docker build -t your-registry/hestia:latest .
        docker push your-registry/hestia:latest

    - name: Deploy to server
      run: |
        ssh user@your-server 'docker pull your-registry/hestia:latest && docker-compose up -d'
```

## Support

For deployment issues:
- Check logs: `docker logs hestia` or `journalctl -u hestia-backend`
- Review [INTERVIEW_NOTES.md](./INTERVIEW_NOTES.md) for architecture details
- Open an issue on GitHub
