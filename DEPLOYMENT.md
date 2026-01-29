# Unitulkki Deployment Guide

Complete guide for deploying Unitulkki to production.

## Prerequisites

Install required CLI tools:

```bash
# Vercel CLI (backend deployment)
npm install -g vercel

# EAS CLI (app builds)
npm install -g eas-cli

# GitHub CLI (optional, for repo management)
# macOS: brew install gh
# Windows: winget install GitHub.cli
# Linux: https://cli.github.com/
```

## Quick Start

```bash
# 1. Setup GitHub repository (first time only)
./scripts/setup-repo.sh

# 2. Deploy everything
./scripts/deploy.sh all
```

---

## Step-by-Step Deployment

### 1. Setup GitHub Repository

```bash
# Login to GitHub CLI
gh auth login

# Run setup script
./scripts/setup-repo.sh
```

This will:
- Create a private GitHub repository
- Configure .gitignore
- Commit all changes
- Push to GitHub

### 2. Configure Environment Variables

#### Backend (Vercel)

```bash
cd backend

# Login to Vercel
vercel login

# Link to project (first time)
vercel link

# Set environment variables
vercel env add OPENAI_API_KEY production
# Enter your OpenAI API key when prompted
```

#### Mobile App (EAS)

```bash
# Login to EAS
eas login

# Set secrets
eas secret:create --name REVENUECAT_API_KEY_ANDROID --value "your-key"
eas secret:create --name REVENUECAT_API_KEY_IOS --value "your-key"
```

### 3. Deploy Backend

```bash
./scripts/deploy.sh backend

# Or manually:
cd backend && vercel --prod
```

Verify deployment:
```bash
curl https://your-vercel-url.vercel.app/api/interpret-structured
# Should return: {"status":"ready","provider":"openai",...}
```

### 4. Update API URL

Edit `lib/config.ts` with your Vercel production URL:

```typescript
export const CONFIG = {
  API_BASE_URL: "https://your-project.vercel.app",
  // ...
};
```

Or set it in `eas.json` under `build.production.env`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-project.vercel.app"
      }
    }
  }
}
```

### 5. Build Android AAB

```bash
./scripts/deploy.sh android

# Or manually:
eas build --platform android --profile production
```

Build takes ~15-20 minutes. Monitor at: https://expo.dev/

### 6. Download and Submit to Google Play

1. Go to [EAS Dashboard](https://expo.dev/)
2. Find your completed build
3. Click "Download" to get the `.aab` file
4. Upload to [Google Play Console](https://play.google.com/console)

Or use EAS Submit:
```bash
eas submit --platform android --latest
```

### 7. Build iOS (Optional)

```bash
./scripts/deploy.sh ios

# Submit to App Store
eas submit --platform ios --latest
```

---

## Deployment Commands Reference

| Command | Description |
|---------|-------------|
| `./scripts/deploy.sh all` | Deploy backend + build Android |
| `./scripts/deploy.sh backend` | Deploy backend only |
| `./scripts/deploy.sh android` | Build Android AAB |
| `./scripts/deploy.sh ios` | Build iOS IPA |
| `./scripts/deploy.sh preview` | Build test APK |
| `./scripts/deploy.sh status` | Check deployment status |
| `./scripts/deploy.sh version patch` | Bump patch version |
| `./scripts/deploy.sh version minor` | Bump minor version |

---

## Environment Configuration

### Production Checklist

- [ ] OpenAI API key set in Vercel
- [ ] RevenueCat keys set in EAS secrets
- [ ] API URL updated in config/eas.json
- [ ] App version bumped
- [ ] Google Play signing key configured
- [ ] App Store certificates configured (iOS)

### Required Secrets

| Secret | Where | Purpose |
|--------|-------|---------|
| `OPENAI_API_KEY` | Vercel | Dream interpretation API |
| `REVENUECAT_API_KEY_ANDROID` | EAS | In-app purchases (Android) |
| `REVENUECAT_API_KEY_IOS` | EAS | In-app purchases (iOS) |
| `EXPO_TOKEN` | GitHub Actions | CI/CD builds |

---

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./backend
          vercel-args: '--prod'
```

---

## Troubleshooting

### Backend Issues

**"MISSING_API_KEY" error:**
```bash
cd backend
vercel env ls  # Check if OPENAI_API_KEY is set
vercel env add OPENAI_API_KEY production
```

**Streaming not working:**
- Ensure using `streamObject` in `interpret-structured.ts`
- Check Vercel function logs: `vercel logs`

### Build Issues

**EAS build fails:**
```bash
# Check build logs
eas build:list
eas build:view [build-id]

# Clear cache and rebuild
eas build --platform android --clear-cache
```

**Version mismatch:**
```bash
# Sync version
./scripts/deploy.sh version patch
```

### App Issues

**API calls fail on device:**
- Check API URL in config matches Vercel deployment
- Verify CORS headers are set (already configured)
- Test with: `curl -X POST your-api-url/api/interpret-structured`

---

## Version History

When releasing new versions:

```bash
# 1. Bump version
./scripts/deploy.sh version minor  # or patch/major

# 2. Commit version change
git add app.json
git commit -m "chore: bump version to x.y.z"
git push

# 3. Deploy
./scripts/deploy.sh all

# 4. Tag release
git tag v1.2.0
git push --tags
```

---

## Support

- EAS Documentation: https://docs.expo.dev/eas/
- Vercel Documentation: https://vercel.com/docs
- AI SDK Documentation: https://sdk.vercel.ai/docs
