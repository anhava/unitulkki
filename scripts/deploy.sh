#!/bin/bash

# =============================================================================
# Unitulkki Deployment Script
# =============================================================================
# This script handles:
# - Backend deployment to Vercel
# - Android AAB build via EAS
# - iOS build via EAS (optional)
# - Version bumping
#
# Usage:
#   ./scripts/deploy.sh [command]
#
# Commands:
#   all         - Deploy everything (backend + Android AAB)
#   backend     - Deploy backend to Vercel only
#   android     - Build Android AAB only
#   ios         - Build iOS IPA only
#   preview     - Build preview APK for testing
#   version     - Bump version only
#   status      - Check deployment status
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi

    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI not found. Install with: npm i -g eas-cli"
        exit 1
    fi

    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI not found. Some features may not work."
    fi

    print_success "All dependencies found"
}

# Deploy backend to Vercel
deploy_backend() {
    print_status "Deploying backend to Vercel..."

    cd backend

    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Running login..."
        vercel login
    fi

    # Deploy to production
    print_status "Deploying to production..."
    DEPLOY_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*vercel.app' | head -1)

    if [ -n "$DEPLOY_URL" ]; then
        print_status "Setting stable alias unitulkki-api.vercel.app..."
        vercel alias set "$DEPLOY_URL" unitulkki-api.vercel.app
        print_success "Alias set: https://unitulkki-api.vercel.app"
    fi

    cd ..

    print_success "Backend deployed successfully!"
}

# Build Android AAB
build_android() {
    print_status "Building Android AAB..."

    # Check if logged in to EAS
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to EAS. Running login..."
        eas login
    fi

    # Run production build
    print_status "Starting EAS build for Android..."
    eas build --platform android --profile production --non-interactive

    print_success "Android build submitted to EAS!"
    print_status "Check build status at: https://expo.dev/accounts/[your-account]/projects/unitulkki/builds"
}

# Build iOS IPA
build_ios() {
    print_status "Building iOS IPA..."

    # Check if logged in to EAS
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to EAS. Running login..."
        eas login
    fi

    # Run production build
    print_status "Starting EAS build for iOS..."
    eas build --platform ios --profile production --non-interactive

    print_success "iOS build submitted to EAS!"
}

# Build preview APK for testing
build_preview() {
    print_status "Building preview APK..."

    eas build --platform android --profile preview --non-interactive

    print_success "Preview APK build submitted!"
}

# Bump version
bump_version() {
    local bump_type=${1:-patch}

    print_status "Bumping version ($bump_type)..."

    # Get current version from app.json
    current_version=$(node -p "require('./app.json').expo.version")
    print_status "Current version: $current_version"

    # Calculate new version
    IFS='.' read -r major minor patch <<< "$current_version"

    case $bump_type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
    esac

    new_version="$major.$minor.$patch"
    print_status "New version: $new_version"

    # Update app.json
    node -e "
        const fs = require('fs');
        const app = require('./app.json');
        app.expo.version = '$new_version';
        fs.writeFileSync('./app.json', JSON.stringify(app, null, 2) + '\n');
    "

    print_success "Version bumped to $new_version"
}

# Check deployment status
check_status() {
    print_status "Checking deployment status..."

    echo ""
    echo "=== Backend Status ==="
    if command -v vercel &> /dev/null; then
        cd backend
        vercel ls --prod 2>/dev/null | head -5 || print_warning "Could not fetch Vercel status"
        cd ..
    fi

    echo ""
    echo "=== EAS Build Status ==="
    if command -v eas &> /dev/null; then
        eas build:list --limit 5 --non-interactive 2>/dev/null || print_warning "Could not fetch EAS status"
    fi

    echo ""
    echo "=== Git Status ==="
    git status --short

    echo ""
    echo "=== Current Version ==="
    node -p "require('./app.json').expo.version"
}

# Full deployment
deploy_all() {
    print_status "Starting full deployment..."

    # Check TypeScript
    print_status "Running TypeScript check..."
    npx tsc --noEmit
    print_success "TypeScript check passed"

    # Deploy backend first
    deploy_backend

    # Build Android
    build_android

    print_success "Full deployment complete!"
    echo ""
    print_status "Next steps:"
    echo "  1. Wait for EAS build to complete"
    echo "  2. Download AAB from EAS dashboard"
    echo "  3. Upload to Google Play Console"
    echo "  4. For iOS, run: ./scripts/deploy.sh ios"
}

# Show help
show_help() {
    echo "Unitulkki Deployment Script"
    echo ""
    echo "Usage: ./scripts/deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  all              Deploy backend + build Android AAB"
    echo "  backend          Deploy backend to Vercel only"
    echo "  android          Build Android AAB only"
    echo "  ios              Build iOS IPA only"
    echo "  preview          Build preview APK for testing"
    echo "  version [type]   Bump version (major|minor|patch)"
    echo "  status           Check deployment status"
    echo "  help             Show this help"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh all"
    echo "  ./scripts/deploy.sh backend"
    echo "  ./scripts/deploy.sh version minor"
}

# Main entry point
main() {
    local command=${1:-help}

    echo "========================================"
    echo "  Unitulkki Deployment"
    echo "========================================"
    echo ""

    check_dependencies

    case $command in
        all)
            deploy_all
            ;;
        backend)
            deploy_backend
            ;;
        android)
            build_android
            ;;
        ios)
            build_ios
            ;;
        preview)
            build_preview
            ;;
        version)
            bump_version ${2:-patch}
            ;;
        status)
            check_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
