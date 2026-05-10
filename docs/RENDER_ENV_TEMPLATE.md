# Render Environment Variables Template

Copy these values to your Render services after deployment.

## Server Service (stark-api)

### Required Variables
```
PORT=3003
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/stark
JWT_SECRET=GENERATE_32_CHAR_SECRET_HERE
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
CLIENT_URL=https://stark-client.onrender.com
```

### Instructions
1. Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your MongoDB credentials
2. Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. For Gmail, enable 2FA and generate an App Password for EMAIL_PASS
4. Replace `stark-client.onrender.com` with your actual client URL

## Client Service (stark-client)

### Required Variables
```
VITE_API_URL=https://stark-api.onrender.com/api/v1
VITE_SOCKET_URL=https://stark-api.onrender.com
VITE_TAWK_PROPERTY_ID=your_tawk_property_id
VITE_TAWK_WIDGET_ID=your_tawk_widget_id
```

### Instructions
1. Replace `stark-api.onrender.com` with your actual server URL
2. Get Tawk.to IDs from https://tawk.to/dashboard (optional)

## Quick Reference

### MongoDB Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication
2. Go to Google Account > Security > App Passwords
3. Generate new app password for "Mail"
4. Use the 16-character password as EMAIL_PASS

### Tawk.to Setup (Optional)
1. Sign up at https://tawk.to
2. Create a widget
3. Copy Property ID and Widget ID
4. Add to client environment variables
