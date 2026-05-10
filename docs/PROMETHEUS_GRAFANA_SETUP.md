# Prometheus and Grafana Setup Guide for STARK Application

This guide walks you through setting up Prometheus and Grafana for monitoring the STARK application.

## Prerequisites

- Server with root or sudo access
- Docker and Docker Compose installed
- STARK application running and accessible

## Architecture Overview

```
STARK App (Port 3003)
    ↓ (exposes /metrics endpoint)
Prometheus (Port 9090)
    ↓ (scrapes metrics)
Grafana (Port 3000)
    ↓ (visualizes data)
Dashboard
```

## Step 1: Install Docker and Docker Compose

If not already installed:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 2: Create Monitoring Directory

```bash
mkdir -p ~/stark-monitoring
cd ~/stark-monitoring
```

## Step 3: Create Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files:
  # - "alerts/*.yml"

scrape_configs:
  - job_name: 'stark-api'
    scrape_interval: 15s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['host.docker.internal:3003']
        labels:
          application: 'stark'
          environment: 'production'
```

**Note**: `host.docker.internal` allows Docker containers to access the host machine. If deploying on Linux, you may need to use the actual IP address.

## Step 4: Create Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: stark-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: stark-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=changeme
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
    driver: bridge
```

## Step 5: Configure Grafana Data Source

Create directory structure:

```bash
mkdir -p grafana/provisioning/datasources
```

Create `grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

## Step 6: Start Monitoring Stack

```bash
docker-compose up -d
```

## Step 7: Verify Setup

### Check Prometheus
1. Open http://localhost:9090
2. Click "Status" > "Targets"
3. Verify "stark-api" target is "UP"

### Check Grafana
1. Open http://localhost:3000
2. Login with admin/changeme
3. Go to Configuration > Data Sources
4. Verify Prometheus data source is connected

## Step 8: Import Dashboard

### Manual Import

1. In Grafana, go to "+" > "Import"
2. Paste the dashboard JSON (see below)
3. Select Prometheus as data source
4. Click "Import"

### Dashboard JSON

```json
{
  "dashboard": {
    "title": "STARK Application Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Request Duration",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "Average"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Active Connections",
        "targets": [
          {
            "expr": "active_connections",
            "legendFormat": "Active Connections"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

## Step 9: Set Up Alerts

### Create Alert Rules

Create `alerts/stark-alerts.yml`:

```yaml
groups:
  - name: stark_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighRequestRate
        expr: rate(http_requests_total[5m]) > 100
        for: 5m
        labels:
          severity: info
        annotations:
          summary: "High request rate detected"
          description: "Request rate is {{ $value }} requests/sec"

      - alert: ServiceDown
        expr: up{job="stark-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "STARK API is down"
          description: "The STARK API service has been down for more than 1 minute"
```

Update `prometheus.yml` to include alert rules:

```yaml
rule_files:
  - "alerts/*.yml"
```

Restart Prometheus:

```bash
docker-compose restart prometheus
```

## Step 10: Configure Alert Notifications

### Email Alerts (Optional)

Install Alertmanager:

```yaml
# Add to docker-compose.yml
  alertmanager:
    image: prom/alertmanager:latest
    container_name: stark-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    restart: unless-stopped
    networks:
      - monitoring
```

Create `alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'email-notifications'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@yourdomain.com'
        from: 'alertmanager@yourdomain.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

## Step 11: Secure Grafana

1. Change default admin password
2. Enable anonymous viewing (optional)
3. Configure LDAP/SSO (optional)
4. Set up reverse proxy with SSL

## Step 12: Backup Configuration

```bash
# Backup monitoring configuration
tar -czf stark-monitoring-backup-$(date +%Y%m%d).tar.gz ~/stark-monitoring

# Backup Grafana dashboards
docker exec stark-grafana grafana-cli admin export-dashboard > dashboard-backup.json
```

## Metrics Available

The STARK application exposes the following Prometheus metrics:

### Default Metrics (Node.js)
- `process_cpu_seconds_total` - Total CPU time
- `nodejs_heap_size_total_bytes` - Total heap size
- `nodejs_heap_size_used_bytes` - Used heap size
- `eventloop_lag_seconds` - Event loop lag

### Custom Metrics
- `http_request_duration_seconds` - HTTP request duration histogram
- `http_requests_total` - Total HTTP requests counter
- `active_connections` - Active WebSocket connections
- `database_connections` - Database connection count

## Troubleshooting

### Prometheus can't scrape metrics

1. Check if STARK app is running: `curl http://localhost:3003/metrics`
2. Verify Prometheus configuration targets
3. Check Docker network connectivity
4. Review Prometheus logs: `docker-compose logs prometheus`

### Grafana can't connect to Prometheus

1. Verify Prometheus is running: `docker-compose ps`
2. Check Grafana data source configuration
3. Ensure both are on the same Docker network
4. Review Grafana logs: `docker-compose logs grafana`

### Metrics not showing up

1. Check if metrics endpoint is accessible
2. Verify Prometheus is successfully scraping
3. Check for errors in application logs
4. Ensure prometheus middleware is applied

## Maintenance

### Regular Tasks
- Update Prometheus and Grafana images monthly
- Review and update alert rules quarterly
- Backup Grafana dashboards weekly
- Review disk usage for Prometheus data

### Scaling Considerations
- For high-traffic applications, consider:
  - Long-term storage for Prometheus (Thanos, VictoriaMetrics)
  - Separate monitoring server
  - Load balancing Grafana
  - Distributed tracing (Jaeger, Zipkin)

## Next Steps

- [ ] Set up additional dashboards for specific metrics
- [ ] Configure Slack/Teams notifications
- [ ] Set up log aggregation (ELK Stack, Loki)
- [ ] Configure distributed tracing
- [ ] Set up synthetic monitoring (Uptime Robot, Pingdom)

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
