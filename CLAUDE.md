# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Unitulkki** (Finnish for "Dream Interpreter") is a React Native/Expo mobile app that provides AI-powered dream interpretation. It uses Perplexity AI for dream analysis and targets the Finnish market as a blue ocean strategy.

## Development Commands

```bash
# Start development (choose one)
npx expo start              # Metro bundler + QR code
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
npx expo start --web        # Web browser

# Backend development (separate Vercel serverless functions)
cd backend && npm run dev   # Run Vercel dev server locally

# Build for production
eas build --platform ios
eas build --platform android
```

## Architecture

### Mobile App (Expo Router)

```
app/
├── _layout.tsx          # Root layout with PremiumProvider, theme
├── (tabs)/              # Tab navigator screens
│   ├── index.tsx        # Home - dream input & interpretation
│   ├── history.tsx      # Saved dreams journal
│   ├── patterns.tsx     # Dream pattern analysis
│   └── settings.tsx     # User preferences
└── api/                 # Expo API routes (development only)
    ├── interpret+api.ts         # Dream interpretation (Perplexity)
    ├── interpret-structured+api.ts  # Structured interpretation
    └── transcribe+api.ts        # Voice-to-text (OpenAI Whisper)
```

### Core Layers

- **lib/** - Business logic and utilities
  - `design-tokens.ts` - Single source of truth for colors, spacing, typography
  - `storage.ts` - AsyncStorage CRUD for Dream objects
  - `revenuecat.ts` - RevenueCat SDK wrapper for subscriptions
  - `premium.ts` - Free tier limits configuration
  - `voice-input.ts` - Audio recording and transcription
  - `i18n/` - Finnish-first internationalization

- **hooks/** - React hooks
  - `useDreamInterpretation.ts` - AI SDK chat integration
  - `useStructuredDream.ts` - Structured interpretation flow
  - `useRevenueCat.ts` - Subscription status

- **contexts/** - React Context providers
  - `PremiumContext.tsx` - Subscription state, usage tracking, paywall presentation

- **components/** - UI components organized by domain
  - `ui/` - Reusable primitives (GlassCard, GlowButton, DreamInput)
  - `interpretation/` - Dream interpretation display
  - `premium/` - Paywall, usage meter, upsell components
  - `screens/` - Full-screen components (WelcomeScreen, LoadingState)

### Backend (Vercel Serverless)

```
backend/
├── api/
│   ├── interpret.ts           # POST: Perplexity streaming interpretation
│   ├── interpret-structured.ts # POST: Structured object generation
│   └── transcribe.ts          # POST: OpenAI Whisper transcription
└── vercel.json               # Vercel config
```

Production API: `https://api.unitulkki.site`

## Key Patterns

### Design Tokens
All styling flows from `lib/design-tokens.ts`. Never use hardcoded colors or spacing:
```typescript
import { colors, spacing, typography } from "@/lib/design-tokens";
```

### Glassmorphism UI
The app uses a dark purple glassmorphism aesthetic. Components use semi-transparent backgrounds with blur effects. See `glass` tokens in design-tokens.

### AI Integration
Uses Vercel AI SDK 6.x with streaming:
- `@ai-sdk/perplexity` for dream interpretation (sonar-pro model)
- `@ai-sdk/openai` for Whisper transcription
- `@ai-sdk/react` useChat hook on client

### Premium/Freemium Model
- Free tier: Limited interpretations per month (tracked in AsyncStorage)
- Premium: RevenueCat subscriptions via native IAP
- `PremiumContext` manages all subscription state

### Path Aliases
TypeScript path alias `@/*` maps to project root.

## Environment Variables

Copy `.env.example` to `.env.local`:
- `PERPLEXITY_API_KEY` - Dream interpretation
- `OPENAI_API_KEY` - Speech-to-text
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` - iOS subscriptions
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` - Android subscriptions

## Language

The app is Finnish-first. UI text, error messages, and AI prompts are in Finnish. English locale exists but Finnish is the default.
