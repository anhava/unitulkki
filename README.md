# 🌙 Unitulkki – AI-Powered Dream Interpreter

> **Tekoälypohjainen unitulkki** – Ymmärrä uniesi merkitys AI:n avulla

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo%2054-4630EB?logo=expo)](https://expo.dev)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-v6-blue)](https://sdk.vercel.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Unitulkki** is an AI-powered dream interpretation app built with React Native and Expo. Describe your dream – by text or voice – and get instant, structured AI analysis including symbols, emotions, life connections, and a personalized key message.

Built by [**Tuomas Piirainen**](https://github.com/anhava) at [**Anhis Smart Innovations**](https://anhis.fi) – the team behind [**Aihio AI**](https://aihio.ai), a Finnish-first AI chatbot builder platform.

---

## ✨ Features

- **AI Dream Interpretation** – Real-time streaming analysis powered by AI SDK 6 (`streamObject`)
- **Structured Output** – Symbols, emotions, life connections & personalized key message
- **Voice Input** – Describe your dream by speaking (OpenAI Whisper transcription)
- **Dream Journal** – Full history with search and filtering
- **Pattern Analysis** – Discover recurring themes and symbols across your dreams
- **Streak Tracking** – Gamification to build a daily dream journaling habit
- **Premium Subscriptions** – Monetization via RevenueCat
- **Smart Reminders** – Alarm & notification support for dream logging
- **Beautiful UI** – Glass morphism design inspired by Calm & Headspace

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native 0.81, Expo 54, Expo Router |
| **Language** | TypeScript 5.9 |
| **AI** | [AI SDK 6](https://sdk.vercel.ai) with `streamObject` for real-time structured streaming |
| **Voice** | OpenAI Whisper API |
| **Backend** | Vercel Serverless Functions |
| **Styling** | NativeWind (TailwindCSS) + Glass morphism |
| **Animations** | React Native Reanimated |
| **Storage** | AsyncStorage (local persistence) |
| **Payments** | RevenueCat (react-native-purchases) |
| **Fonts** | Inter & Space Grotesk (Expo Google Fonts) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npx expo`)
- iOS Simulator / Android Emulator or [Expo Go](https://expo.dev/go)

### Installation

```bash
# Clone the repository
git clone https://github.com/anhava/unitulkki.git
cd unitulkki

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
```

### Running

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# Web
npx expo start --web
```

## 📁 Project Structure

```
unitulkki/
├── app/                  # Expo Router pages & API routes
│   ├── (tabs)/           # Tab-based navigation
│   └── api/              # Serverless API endpoints
├── backend/              # Backend logic
├── components/           # Reusable React Native components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions & helpers
├── scripts/              # Build & dev scripts
└── assets/               # Images, fonts, static files
```

## 🤖 How It Works

1. **Input** – User describes their dream via text or voice recording
2. **Transcription** – Voice input is transcribed using OpenAI Whisper
3. **AI Analysis** – Dream description is sent to AI SDK 6 `streamObject`, which streams a structured interpretation in real-time
4. **Structured Result** – User receives: dream symbols, emotional themes, life connections, and a personalized key message
5. **History & Patterns** – Dreams are stored locally and analyzed for recurring themes over time

## 📱 Screenshots

*Coming soon*

## 🇫🇮 About the Creator

**Unitulkki** is developed by [**Tuomas Piirainen**](https://github.com/anhava), a Finnish full-stack developer with 20+ years of programming experience, specializing in AI-powered applications and modern web technologies.

### 🔗 Aihio AI – Finnish-First AI Chatbot Platform

This project is part of the [**Aihio AI**](https://aihio.ai) ecosystem by [**Anhis Smart Innovations**](https://anhis.fi). Aihio AI is building the leading Finnish-first AI chatbot builder – a no-code SaaS platform for creating intelligent, GDPR-compliant AI chatbots for businesses across Finland and the EU.

**Explore Aihio AI:**
- 🌐 **Website:** [https://aihio.ai](https://aihio.ai)
- 💻 **GitHub:** [https://github.com/anhava](https://github.com/anhava)

> *If you're looking for an AI solutions for your business, check out [Anhis Smart Innovations](https://anhis.fi) – empowering Finnish businesses with intelligent AI automation.*

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⭐ Support

If you find this project useful, please consider giving it a star! For AI chatbot solutions for your business, visit [**Aihio AI**](https://aihio.ai).

---

<p align="center">
  Made with ❤️ in Finland by <a href="https://anhis.fi"><strong>Anhis Smart Innovations</strong></a><br>
  <sub>Creators of <a href="https://aihio.ai">Aihio AI</a> – The Finnish-First AI Chatbot Platform</sub>
</p>
