# GitHub Actions Secrets Setup Guide

This guide walks you through setting up the required secrets for the STARK CI/CD pipeline.

## Prerequisites

- GitHub repository access with admin permissions
- Production MongoDB connection string
- Production email service credentials
- Production domain names configured

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret**

### 2. Add Server Secrets

Create the following secrets with your production values:

#### Required Server Secrets

| Secret Name | Description | Example Format |
|-------------|-------------|----------------|
| `PORT` | Server port | `3003` |
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/stark` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-jwt-key-here-minimum-32-chars` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | `noreply@yourdomain.com` |
| `EMAIL_PASS` | SMTP password/app password | `your-app-password` |
| `CLIENT_URL` | Production client URL | `https://yourdomain.com` |

#### Important Notes

- **MONGODB_URI**: Use your MongoDB Atlas connection string for production
- **JWT_SECRET**: Generate a strong, random string (minimum 32 characters). You can generate one using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **EMAIL_PASS**: For Gmail, use an App Password (not your regular password)
- **CLIENT_URL**: Must match your production domain exactly (including https://)

### 3. Add Client Secrets

Create the following secrets for the client build:

| Secret Name | Description | Example Format |
|-------------|-------------|----------------|
| `VITE_API_URL` | API endpoint URL | `https://api.yourdomain.com/api/v1` |
| `VITE_SOCKET_URL` | WebSocket URL | `https://api.yourdomain.com` |
| `VITE_TAWK_PROPERTY_ID` | Tawk.to property ID | `your_property_id` |
| `VITE_TAWK_WIDGET_ID` | Tawk.to widget ID | `your_widget_id` |

#### Important Notes

- **VITE_API_URL**: Should point to your production API server
- **VITE_SOCKET_URL**: Should match your API server domain for WebSocket connections
- **Tawk.to IDs**: Get these from https://tawk.to/dashboard > Administration > Channels > Chat Widget

### 4. Optional Deployment Secrets (for Docker/K8s deployment)

If using Docker or Kubernetes deployment, add these secrets:

| Secret Name | Description |
|-------------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/access token |
| `KUBE_CONFIG` | Base64-encoded Kubernetes config |

#### Base64 Encoding Kube Config

```bash
cat ~/.kube/config | base64 -w 0
```

### 5. Verify Secrets

After adding all secrets, verify they're configured correctly:

1. Go to **Actions** tab in your repository
2. Click on any workflow run to see if secrets are being used
3. Check that the workflow runs successfully

### 6. Test CI/CD Pipeline

1. Push a commit to trigger the CI pipeline
2. Check the Actions tab to see the build status
3. Verify that both client and server build successfully
4. Check that security scans pass

## Security Best Practices

1. **Never commit secrets to the repository** - Always use GitHub Secrets
2. **Rotate secrets regularly** - Update secrets every 90 days
3. **Use different secrets per environment** - Development, staging, production
4. **Limit secret access** - Only give access to team members who need it
5. **Audit secret usage** - Review who has access to secrets regularly
6. **Use strong secrets** - Minimum 32 characters for JWT_SECRET, use app passwords for email

## Troubleshooting

### Workflow fails with "secret not found"

- Check that the secret name exactly matches (case-sensitive)
- Ensure the secret is added to the correct repository (not organization)
- Verify you have the correct repository selected

### Build succeeds but deployment fails

- Check deployment-specific secrets (DOCKER_USERNAME, KUBE_CONFIG)
- Verify credentials are valid and have necessary permissions
- Check deployment logs in the Actions workflow

### Secrets appear in logs

- Ensure secrets are not being logged in the workflow
- Use `::add-mask::` in GitHub Actions if needed
- Review workflow YAML files for accidental secret exposure

## Environment-Specific Secrets

For multiple environments (dev, staging, production), consider using:

1. **Environment secrets** - GitHub supports environment-specific secrets
2. **Secret naming convention** - Prefix with environment (e.g., `PROD_MONGODB_URI`)
3. **Separate workflows** - Different workflows for different environments

### Setting Up Environment-Specific Secrets

1. Go to **Settings** > **Environments**
2. Create new environments (e.g., `staging`, `production`)
3. Add environment-specific secrets
4. Update workflow YAML to use environment-specific secrets

## Next Steps

After setting up secrets:

1. ✅ Configure production environment variables locally
2. ✅ Set up database backup cron job
3. ✅ Configure monitoring and alerting
4. ✅ Perform security audit
5. ✅ Deploy to production

For more information, see:
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Main deployment guide
