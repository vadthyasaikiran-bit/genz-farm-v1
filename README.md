# GenZ Farm 🌱
> **Production-Ready AI Agricultural Assistant & Personal Farm Buddy**

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_52-20232A?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Powered-8E75C2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Open-Meteo](https://img.shields.io/badge/Weather-Open--Meteo_API-FFA500?style=for-the-badge)](https://open-meteo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**GenZ Farm** is a modern, mobile-first farming companion built on one foundational principle: **the farmer should not need to guess the crop first**. 

Traditional agricultural apps ask farmers to pick a crop immediately. In contrast, GenZ Farm evaluates the farm's unique environmental conditions first—soil composition, water source, irrigation type, budget, labor availability, and live hyper-local climate—and recommends optimal crop strategies with transparent risk-reward breakdowns.

Beyond planning, GenZ Farm features **Farm Buddy AI**: a warm, conversational, and context-aware personal AI agronomist that remembers your farm profile, tracks daily field observations, guides you step-by-step through every phase of your harvest, and manages your entire year's farming calendar.

---

## ✨ Key Features

### 🤖 1. Farm Buddy AI (Personal Agronomic Companion)
- **Conversational & Friendly**: Talks like an experienced, trusted agricultural friend rather than a sterile robotic tool.
- **360° Farm Context Awareness**: Farm Buddy AI automatically knows your farm size, soil type, irrigation system, active crop, live weather forecast, and nearby market prices.
- **Persistent Long-Term Memory**: Remembers past conversations, past issues, spray schedules, and observations across sessions using local persistent storage.
- **Whole-Year Work Schedule**: Seamlessly toggle between conversational guidance and a structured 12-month agricultural timeline (Pre-Sowing, Sowing, Vegetative, Flowering, Maturity, Harvest, Post-Harvest).
- **Dual AI Engine**: Powered by Google Gemini live models (`gemini-1.5-flash`) with instant offline-capable intelligent agronomic fallbacks.

### 🌾 2. Condition-First Crop Planning
- Generates data-backed crop options tailored to physical land parameters and climate data.
- Side-by-side trade-off analysis (Projected yield, cost per acre, market volatility, water demand, pest risk).
- Generates phased, day-by-day actionable task schedules with strict validation.
- Preserves historical completed tasks when conditions change and plans are regenerated.

### 🌤️ 3. Hyper-Local Live Weather & Ag-Radar
- Direct integration with **Open-Meteo** using verified farm GPS coordinates.
- Displays real-time temperature, humidity, wind speed, rainfall probability, and soil surface conditions.
- 7-day agricultural forecast strip with weather alerts tailored for farming activities (spraying windows, irrigation timing, harvest safety).

### 📈 4. Mandi Market Intelligence & Net Selling Calculator
- Real-time and curated APMC Mandi prices covering key commodities (Cotton, Maize, Soyabean, Paddy, Chilli, Turmeric, etc.).
- **Net In-Pocket Calculator**: Factors in distance, transport costs per ton, bagging charges, and mandi fees to rank markets by actual take-home profit rather than deceptive gross prices.

### 📝 5. Daily Task Management & Field Feedback
- Actionable daily checklist categorized by field actions, irrigation, and nutrition.
- Daily field feedback logger (weather impacts, pest sightings, crop health status).
- Safe task replanning that dynamically adjusts future dates without altering completed milestones.

### 📱 6. Farmer-Centric Soft UI / UX
- Designed with soft, accessible aesthetics, high contrast, readable typography, and tactile cards.
- Dark, clean visual hierarchy optimized for outdoor sunlight visibility and night-time planning.
- Smooth animations and zero clutter.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Expo SDK 52](https://expo.dev/) & [React Native](https://reactnative.dev/) | Cross-platform native mobile foundation (Android, iOS, Web) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type-safety across models, services, and UI components |
| **Routing** | [Expo Router v4](https://docs.expo.dev/router/introduction/) | File-based typed routing with tab navigation and onboarding guards |
| **State & Persistence** | [AsyncStorage](https://react-native-async-storage/async-storage) | Offline-first persistent storage for farm profiles, chat history, and plans |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) | Conversational assistant and dynamic crop planning intelligence |
| **Weather Engine** | [Open-Meteo API](https://open-meteo.com/) | Real-time weather forecasting based on latitude & longitude |
| **Icons & Design** | [Ionicons / @expo/vector-icons](https://icons.expo.fyi/) | Modern, clean visual icons |

---

## 📂 Project Structure

```
genz-farm/
├── assets/                  # App icons, splash screens, and images
├── src/
│   ├── app/                 # Expo Router file-based screens
│   │   ├── _layout.tsx      # Root layout, theme provider, and route guards
│   │   ├── login.tsx        # Phone authentication screen
│   │   ├── otp.tsx          # 6-digit verification code screen
│   │   ├── onboarding.tsx   # Comprehensive farm profile setup (GPS, soil, water, budget)
│   │   └── tabs/            # Main navigation tabs
│   │       ├── _layout.tsx  # Bottom tab navigator configuration
│   │       ├── index.tsx    # Home dashboard (Weather radar, quick AI, alerts, daily tasks)
│   │       ├── ai.tsx       # Farm Buddy AI (Chat companion & full-year work schedule)
│   │       ├── farm.tsx     # Land parameters, soil health, and plan generator
│   │       ├── markets.tsx  # Mandi price board and net selling calculator
│   │       └── profile.tsx  # Farmer profile, system status, and configurations
│   ├── services/            # Business logic and external API integrations
│   │   ├── ai.ts            # Gemini integration & agronomic intelligence engine
│   │   ├── crop-calculations.ts # Crop viability algorithms & net profit formulas
│   │   ├── feedback.ts      # Field observation logger & dynamic replanning
│   │   ├── market.ts        # Mandi price fetcher and market comparator
│   │   ├── market-demo.ts   # Curated baseline Mandi records
│   │   ├── plan.ts          # Crop schedule generator & validator
│   │   ├── storage.ts       # Type-safe AsyncStorage wrapper
│   │   ├── types.ts         # Central TypeScript interfaces and data models
│   │   └── weather.ts       # Open-Meteo live forecast client
├── .env.example             # Template for API keys and configuration
├── .gitignore               # Strict git ignore definitions (secrets, builds, node_modules)
├── app.json                 # Expo application configuration
├── package.json             # Project dependencies and npm scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device (Android / iOS), or an emulator, or a modern web browser.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vadthyasaikiran-bit/genz-farm.git
   cd genz-farm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your keys (optional for local smart mode):
   ```env
   # AI Integration Mode (options: local | gemini)
   EXPO_PUBLIC_AI_MODE=gemini
   EXPO_PUBLIC_AI_MODEL=gemini-1.5-flash
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

   # Mandi Market Intelligence (options: mock | live)
   EXPO_PUBLIC_MARKET_MODE=mock
   EXPO_PUBLIC_MARKET_API_URL=https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
   EXPO_PUBLIC_MARKET_API_KEY=
   EXPO_PUBLIC_MARKET_RESPONSE_FIELDS=state,district,market,commodity,variety,arrival_date,min_price,max_price,modal_price
   ```
   > **Note:** If `EXPO_PUBLIC_GEMINI_API_KEY` is left blank, the app will seamlessly run using its built-in agronomic intelligence engine without interruption.

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on your platform of choice:**
   - Press **`w`** in your terminal to open in your web browser.
   - Scan the terminal QR code with the **Expo Go** app on Android or the Camera app on iOS.
   - Press **`a`** for Android emulator or **`i`** for iOS simulator.

---

## 🔒 Security & Privacy

- **No Hardcoded Secrets**: Secrets and API tokens are managed strictly through environment variables.
- **Offline Persistence**: Farmer data, land profiles, chat logs, and crop plans are stored on-device using encrypted local storage.
- **Git Hygiene**: Sensitive environment files (`.env`, `.env.local`), native build outputs, and node dependencies are strictly ignored in `.gitignore`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/vadthyasaikiran-bit/genz-farm/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with ❤️ for farmers worldwide by <a href="https://github.com/vadthyasaikiran-bit">Sai Kiran Vadthya</a>
</p>
