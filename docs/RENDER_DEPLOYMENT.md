# Render Deployment Guide for STARK Application

This guide walks you through deploying the STARK application to Render.

## Prerequisites

- GitHub repository (already pushed: https://github.com/Dera309/STARK.git)
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Email service credentials (e.g., Gmail, SendGrid)

## Step 1: Set Up MongoDB Atlas

### Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project named "STARK"

### Create Database Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (free tier)
3. Select a region closest to your users
4. Create cluster (takes 2-3 minutes)

### Configure Network Access
1. Go to "Network Access" > "IP Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0) for Render
4. Click "Confirm"

### Configure Database Access
1. Go to "Database Access" > "MongoDB Users"
2. Click "Create Database User"
3. Choose "Password Authentication"
4. Username: `stark_user` (or your preferred username)
5. Password: Generate a strong password (save this!)
6. Database User Privileges: "Read and write to any database"
7. Click "Create User"

### Get Connection String
1. Go to "Database" > "Connect"
2. Choose "Connect your application"
3. Driver: Node.js
4. Version: 4.1 or later
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Keep this connection string for Render configuration

**Example connection string:**
```
mongodb+srv://stark_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stark
```

## Step 2: Deploy Server to Render

### Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Select "STARK" repository
5. Configure service:

**Basic Settings:**
- **Name**: `stark-api`
- **Region**: Choose region closest to MongoDB
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3003` | Server port |
| `NODE_ENV` | `production` | Environment |
| `MONGODB_URI` | Your MongoDB connection string | Database connection |
| `JWT_SECRET` | Generate strong secret (32+ chars) | JWT signing key |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `EMAIL_HOST` | `smtp.gmail.com` or your SMTP server | Email server |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | Your email address | SMTP username |
| `EMAIL_PASS` | Your email password/app password | SMTP password |
| `CLIENT_URL` | Your client Render URL (e.g., https://stark-client.onrender.com) | CORS origin |

### Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Create Service
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Copy the service URL (e.g., https://stark-api.onrender.com)
4. Test the health endpoint: `https://stark-api.onrender.com/api/v1/health`

## Step 3: Deploy Client to Render

### Create Web Service
1. Go to Render Dashboard
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Select "STARK" repository
5. Configure service:

**Basic Settings:**
- **Name**: `stark-client`
- **Region**: Same region as server
- **Branch**: `main`
- **Root Directory**: `client`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`

**Environment Variables:**
Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | Your server Render URL + `/api/v1` | API endpoint |
| `VITE_SOCKET_URL` | Your server Render URL | WebSocket URL |
| `VITE_TAWK_PROPERTY_ID` | Your Tawk.to property ID | Chat widget |
| `VITE_TAWK_WIDGET_ID` | Your Tawk.to widget ID | Chat widget |

**Example:**
```
VITE_API_URL=https://stark-api.onrender.com/api/v1
VITE_SOCKET_URL=https://stark-api.onrender.com
```

### Create Service
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Copy the service URL (e.g., https://stark-client.onrender.com)
4. Access the application in your browser

## Step 4: Update Server CORS Configuration

After deploying the client, update the server's `CLIENT_URL` environment variable:

1. Go to Render Dashboard > `stark-api` service
2. Click "Environment"
3. Update `CLIENT_URL` with your client URL
4. Click "Save Changes"
5. Render will automatically redeploy the server

## Step 5: Configure Email Service

### Using Gmail
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings > Security
3. Enable "App Passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use this as `EMAIL_PASS` in Render

### Using SendGrid (Recommended for Production)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Get your API key
3. Use these settings:
   - `EMAIL_HOST`: `smtp.sendgrid.net`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USER`: `apikey`
   - `EMAIL_PASS`: Your SendGrid API key

## Step 6: Configure Tawk.to (Optional)

1. Go to [Tawk.to](https://tawk.to)
2. Sign up for free account
3. Create a new widget
4. Copy Property ID and Widget ID
5. Add to client environment variables:
   - `VITE_TAWK_PROPERTY_ID`: Your property ID
   - `VITE_TAWK_WIDGET_ID`: Your widget ID

## Step 7: Test Deployment

### Test Server Health
```bash
curl https://stark-api.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "mongodb": "connected"
}
```

### Test Metrics Endpoint
```bash
curl https://stark-api.onrender.com/api/v1/metrics
```

### Test Prometheus Metrics
```bash
curl https://stark-api.onrender.com/metrics
```

### Test Client
1. Open your client URL in browser
2. Try to register a new user
3. Verify email functionality
4. Test login and dashboard

## Step 8: Set Up Monitoring (Optional)

### Render Built-in Monitoring
Render provides built-in metrics:
- CPU usage
- Memory usage
- Response time
- Error rate

Access via: Render Dashboard > Service > Metrics

### External Monitoring
Follow the Prometheus/Grafana setup guide in `docs/PROMETHEUS_GRAFANA_SETUP.md`

## Step 9: Set Up Database Backups

### MongoDB Atlas Backups
MongoDB Atlas provides automated backups:
1. Go to MongoDB Atlas > Database > Backup
2. Enable automated backups (available on paid plans)
3. Configure retention policy

### Manual Backups
Use the backup scripts in `scripts/` directory:
```bash
# On your local machine or a separate server
MONGODB_URI="your-mongodb-uri" ./scripts/backup-mongodb.sh
```

## Troubleshooting

### Server Won't Start
- Check Render logs: Dashboard > Service > Logs
- Verify all environment variables are set
- Check MongoDB connection string is correct
- Verify MongoDB IP whitelist includes 0.0.0.0/0

### Client Can't Connect to API
- Verify `VITE_API_URL` is correct
- Check server is running and accessible
- Verify CORS `CLIENT_URL` matches client URL
- Check browser console for errors

### Email Not Sending
- Verify email credentials are correct
- For Gmail, use App Password (not regular password)
- Check SMTP server and port are correct
- Review Render logs for email errors

### Database Connection Errors
- Verify MongoDB cluster is running
- Check IP whitelist includes 0.0.0.0/0
- Verify database user has correct permissions
- Check connection string format

### WebSocket Connection Issues
- Verify `VITE_SOCKET_URL` matches server URL
- Check server is running Socket.io
- Review Render logs for WebSocket errors

## Cost Estimates

### Render Free Tier
- **Server**: Free (512 MB RAM, 0.1 CPU)
- **Client**: Free (512 MB RAM, 0.1 CPU)
- **Limitations**: Spins down after 15 min inactivity, takes ~30 sec to wake

### Render Paid Plans (Recommended for Production)
- **Starter**: $7/month per service (512 MB RAM, 0.5 CPU, always on)
- **Standard**: $25/month per service (2 GB RAM, 1 CPU, always on)

### MongoDB Atlas
- **M0 Sandbox**: Free (512 MB storage)
- **M2**: $9/month (2 GB storage)
- **M5**: $60/month (5 GB storage)

### Total Estimated Cost (Production)
- **Free Tier**: $0/month (with limitations)
- **Basic Production**: ~$23/month (2 services + M2 MongoDB)
- **Recommended Production**: ~$59/month (2 standard services + M5 MongoDB)

## Scaling Considerations

### When to Scale Up
- Consistent traffic (> 1000 daily users)
- Slow response times (> 2s)
- Frequent timeouts
- Memory errors in logs

### Scaling Options
1. **Upgrade Render Plan**: More CPU/RAM
2. **Add Redis**: For session management and caching
3. **Load Balancing**: Multiple server instances
4. **CDN**: For static assets

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Configure MongoDB IP whitelist
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (already configured)
- [ ] Configure CORS properly
- [ ] Set up monitoring and alerts
- [ ] Test backup and restore procedures
- [ ] Review security audit checklist: `docs/SECURITY_AUDIT_CHECKLIST.md`

## Next Steps

1. ✅ Deploy to Render
2. ✅ Test all functionality
3. ✅ Set up monitoring
4. ✅ Configure backups
5. ✅ Perform security audit
6. ✅ Set up custom domain (optional)
7. ✅ Configure SSL certificate (automatic on Render)
8. ✅ Set up error tracking (Sentry, etc.)

## Support

For issues:
- Check Render logs: Dashboard > Service > Logs
- Review MongoDB Atlas logs
- Check browser console for client errors
- Verify environment variables
- Test health endpoint: `/api/v1/health`

## Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Render Free Tier Limits](https://render.com/docs/free)
