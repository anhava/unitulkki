#!/bin/bash

# =============================================================================
# Unitulkki Repository Setup Script
# =============================================================================
# This script:
# - Creates GitHub repository
# - Sets up git configuration
# - Commits all changes
# - Pushes to remote
#
# Prerequisites:
# - GitHub CLI (gh) installed and authenticated
# - Git configured with user.name and user.email
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
REPO_NAME="unitulkki"
REPO_DESCRIPTION="AI-powered dream interpreter app - React Native / Expo"
REPO_VISIBILITY="private"  # Change to "public" if desired

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not found. Install from: https://cli.github.com/"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub. Run: gh auth login"
        exit 1
    fi

    if ! git config user.name &> /dev/null; then
        print_error "Git user.name not configured. Run: git config --global user.name 'Your Name'"
        exit 1
    fi

    if ! git config user.email &> /dev/null; then
        print_error "Git user.email not configured. Run: git config --global user.email 'your@email.com'"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Update .gitignore
update_gitignore() {
    print_status "Updating .gitignore..."

    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Expo
.expo/
dist/
web-build/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*

# Native builds
*.hprof
android/
ios/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
backend/.env

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output

# Build artifacts
*.tsbuildinfo

# Secrets (NEVER commit these)
google-play-service-account.json
*.keystore
*.jks
AuthKey_*.p8

# Vercel
.vercel

# EAS
.easignore

# Temporary files
*.tmp
*.temp
*.log
EOF

    print_success ".gitignore updated"
}

# Create GitHub repository
create_github_repo() {
    print_status "Creating GitHub repository..."

    # Check if repo already exists
    if gh repo view "$REPO_NAME" &> /dev/null; then
        print_warning "Repository '$REPO_NAME' already exists"
        return 0
    fi

    # Create repository
    gh repo create "$REPO_NAME" \
        --description "$REPO_DESCRIPTION" \
        --"$REPO_VISIBILITY" \
        --source=. \
        --remote=origin \
        --push=false

    print_success "GitHub repository created: $REPO_NAME"
}

# Stage and commit all changes
commit_changes() {
    print_status "Staging all changes..."

    # Add all files
    git add -A

    # Show what will be committed
    echo ""
    echo "Files to be committed:"
    git diff --cached --stat | head -30
    echo ""

    # Commit
    print_status "Creating commit..."
    git commit -m "feat: Complete Unitulkki implementation

- AI-powered dream interpretation with streaming (AI SDK 6)
- React Native / Expo app with glass morphism design
- Features:
  - Dream interpretation with symbols, emotions, life connections
  - Voice input with transcription
  - Dream history and patterns
  - Streak tracking (gamification)
  - Premium subscriptions (RevenueCat)
  - Alarm/reminder notifications
- Backend: Vercel serverless functions
- Design: Calm/Headspace-inspired UI

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

    print_success "Changes committed"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub..."

    # Set upstream and push
    git push -u origin main

    print_success "Pushed to GitHub!"

    # Get repo URL
    REPO_URL=$(gh repo view --json url -q .url)
    echo ""
    print_success "Repository URL: $REPO_URL"
}

# Main
main() {
    echo "========================================"
    echo "  Unitulkki Repository Setup"
    echo "========================================"
    echo ""

    check_prerequisites
    update_gitignore
    create_github_repo
    commit_changes
    push_to_github

    echo ""
    echo "========================================"
    print_success "Repository setup complete!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Add secrets to GitHub repository settings:"
    echo "     - EXPO_TOKEN (from expo.dev)"
    echo "     - VERCEL_TOKEN (from vercel.com)"
    echo ""
    echo "  2. Deploy backend:"
    echo "     ./scripts/deploy.sh backend"
    echo ""
    echo "  3. Build Android AAB:"
    echo "     ./scripts/deploy.sh android"
    echo ""
}

main "$@"
