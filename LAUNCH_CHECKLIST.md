# Unitulkki - Launch Checklist

## Overview

This checklist guides you through launching Unitulkki on the App Store and Google Play Store.

**Estimated time: 3-5 days** (mostly waiting for store review)

---

## Phase 1: Configuration (Required)

### 1.1 RevenueCat Production Keys

Get your production API keys from [RevenueCat Dashboard](https://app.revenuecat.com):

1. Log in to RevenueCat Dashboard
2. Select your project (or create one for Unitulkki)
3. Go to **Project Settings** → **API Keys**
4. Copy the **Public SDK Key** for each platform

Update `.env.local`:

```bash
# Replace these test keys with production keys
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxx
```

### 1.2 RevenueCat Product Setup

In RevenueCat Dashboard, configure:

1. **Products** (must match App Store Connect / Google Play Console):
   - `unitulkki_pro_monthly` - Monthly subscription
   - `unitulkki_pro_yearly` - Yearly subscription
   - `unitulkki_pro_lifetime` - Lifetime purchase

2. **Entitlements**:
   - Create entitlement: `Unitulkki Pro`
   - Attach all three products to this entitlement

3. **Offerings**:
   - Create offering: `default`
   - Add packages: Monthly, Annual, Lifetime

### 1.3 App Store Connect Setup (iOS)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app with bundle ID: `com.unitulkki.app`
3. Get your credentials:

| Field | Where to Find | Example |
|-------|---------------|---------|
| `appleId` | Your Apple ID email | `yourname@icloud.com` |
| `ascAppId` | App Store Connect → App → App Information → Apple ID | `1234567890` |
| `appleTeamId` | Apple Developer Portal → Membership → Team ID | `ABC123XYZ` |

4. Update `eas.json`:
```json
"ios": {
  "appleId": "yourname@icloud.com",
  "ascAppId": "1234567890",
  "appleTeamId": "ABC123XYZ"
}
```

5. Create in-app purchases:
   - Go to **Monetization** → **Subscriptions**
   - Create subscription group: "Unitulkki Pro"
   - Add products with IDs matching RevenueCat

### 1.4 Google Play Console Setup (Android)

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create new app with package: `com.unitulkki.app`
3. Create Service Account:
   - Go to **Setup** → **API access**
   - Create new service account with permissions
   - Download JSON key file
   - Save as `google-play-service-account.json` in project root
   - Add to `.gitignore` if not already there

4. Create subscriptions:
   - Go to **Monetization** → **Subscriptions**
   - Create products matching RevenueCat IDs

### 1.5 Privacy Policy & Website

The website is already created in the `website/` folder. Deploy it to: **https://unitulkki.site**

The website includes:
- `index.html` - Landing page
- `tietosuoja.html` - Privacy policy (GDPR compliant)
- `kayttoehdot.html` - Terms of service
- `tuki.html` - Support page with FAQ

The app links to:
```
https://unitulkki.site/tietosuoja
```

**To deploy the website:**
1. Use any static hosting (Vercel, Netlify, GitHub Pages, Cloudflare Pages)
2. Point your domain `unitulkki.site` to the hosting
3. Upload the contents of the `website/` folder

---

## Phase 2: Build & Test

### 2.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2.2 Build for Testing

```bash
# iOS (TestFlight)
eas build --platform ios --profile preview

# Android (APK for testing)
eas build --platform android --profile preview
```

### 2.3 Test Checklist

Test on **real devices** (not just simulator):

- [ ] App launches without crash
- [ ] Dream input works
- [ ] Dream interpretation completes
- [ ] Dreams are saved to history
- [ ] Dreams can be deleted
- [ ] Settings changes persist
- [ ] Language toggle works (Finnish/English)
- [ ] Premium modal opens
- [ ] **IAP Test**: Purchase flow (use sandbox accounts)
- [ ] **IAP Test**: Restore purchases works
- [ ] Customer Center opens
- [ ] PDF export works (premium)
- [ ] Voice recording starts (transcription shows Finnish error - expected)
- [ ] Privacy policy link opens

### 2.4 IAP Sandbox Testing

**iOS:**
1. Create Sandbox Tester in App Store Connect
2. Sign out of App Store on device
3. Test purchase with sandbox account

**Android:**
1. Add license testers in Play Console
2. Test with listed Google accounts

---

## Phase 3: Production Build

### 3.1 Final Environment Check

Verify `.env.local` has production values:

```bash
# Should be production keys, not test_xxxxx
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxx
```

### 3.2 Production Build

```bash
# Build both platforms
eas build --platform all --profile production

# Or separately
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 3.3 Submit to Stores

```bash
# Submit iOS to App Store
eas submit --platform ios --profile production

# Submit Android to Play Store
eas submit --platform android --profile production
```

---

## Phase 4: Store Listing

### 4.1 App Store (iOS)

**App Information:**
- Name: `Unitulkki - Unien tulkinta`
- Subtitle: `AI-pohjainen unitulkki`
- Category: Health & Fitness (or Lifestyle)
- Age Rating: 4+

**Finnish Description:**
```
Unitulkki on tekoälypohjainen sovellus, joka auttaa sinua ymmärtämään uniesi merkityksiä.

OMINAISUUDET:
• Tekoälypohjainen unien tulkinta
• Unihistorian tallennus
• Unikuvioiden seuranta
• PDF-vienti (Premium)
• Suomenkielinen käyttöliittymä

ILMAINEN VERSIO:
• 3 tulkintaa kuukaudessa
• Unihistorian tallennus

PREMIUM (Unitulkki Pro):
• Rajattomat tulkinnat
• Syvempi analyysi
• PDF-vienti
• Unikuvioiden seuranta

Tilaus uusiutuu automaattisesti. Voit peruuttaa milloin tahansa Asetuksista.
```

**Keywords (Finnish):**
```
unet,unitulkki,unien tulkinta,psykologia,AI,tekoäly,unikirja,unitutkimus
```

**Screenshots:**
- 6.7" iPhone (required): 1290 x 2796 px
- 6.5" iPhone (required): 1284 x 2778 px
- 12.9" iPad Pro (if supporting tablet)

### 4.2 Google Play

**Finnish Description:** Same as iOS

**Feature Graphic:** 1024 x 500 px
**Screenshots:** At least 2, recommended 8

---

## Phase 5: Post-Launch

### 5.1 Monitor

- [ ] Check RevenueCat Dashboard for purchases
- [ ] Monitor crash reports (consider adding Sentry)
- [ ] Respond to user reviews
- [ ] Check analytics events

### 5.2 First Update Preparation

After launch, consider:
- Implementing voice transcription (Whisper API)
- Adding more dream analysis features
- Collecting user feedback

---

## Quick Reference Commands

```bash
# Development
npx expo start

# Type checking
npx tsc --noEmit

# Build preview (testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Build production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Check build status
eas build:list
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npx expo start --clear
eas build --platform ios --clear-cache
```

### IAP Not Working

1. Check RevenueCat Dashboard for errors
2. Verify product IDs match exactly
3. Check entitlement name is `Unitulkki Pro`
4. Ensure sandbox/test account is set up

### App Rejected

Common reasons:
- Missing privacy policy
- IAP not working in review
- Incomplete metadata
- Crashes during review

---

## Files to Update Before Launch

| File | What to Change |
|------|----------------|
| `.env.local` | Production RevenueCat keys |
| `eas.json` | Apple/Google credentials |
| `app/(tabs)/settings.tsx` | Privacy policy URL (if different) |
| `app.json` | Version number (if needed) |

---

## Support

- RevenueCat Docs: https://www.revenuecat.com/docs
- Expo EAS Docs: https://docs.expo.dev/eas/
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
