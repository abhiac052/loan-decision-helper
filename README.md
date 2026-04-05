# Loan Decision Helper – India 🇮🇳

A clean, fast Android app to calculate EMIs, compare loans, and check affordability. Built with React Native (Expo).

## Features

- **EMI Calculator** — Monthly EMI, total interest, total payment with pie chart breakdown
- **Loan Comparison** — Compare 2 loans side by side with visual winner indicator
- **Affordability Check** — Know your safe EMI range based on income, expenses & existing EMIs
- **Save & Share** — Save calculations locally, share as text
- **Dark Mode** — Toggle between light and dark themes
- **AdMob Ready** — Placeholder banner for future monetization

## Folder Structure

```
LoanDecisionHelper/
├── App.js                    # Root: navigation + providers
├── app.json                  # Expo config (package name, splash, etc.)
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AdBanner.js       # AdMob placeholder
│   │   ├── Button.js         # Primary/outline button
│   │   ├── Card.js           # Card container
│   │   ├── InputField.js     # Labeled numeric input
│   │   ├── PieChart.js       # Lightweight SVG pie chart
│   │   └── SegmentToggle.js  # Years/Months toggle
│   ├── constants/
│   │   └── theme.js          # Colors, fonts, spacing, radius
│   ├── context/
│   │   └── AppContext.js      # Dark mode + ad-free state (Context API)
│   ├── screens/
│   │   ├── HomeScreen.js          # Home with 3 feature cards
│   │   ├── EMICalculatorScreen.js # EMI calc + pie chart + save/share
│   │   ├── LoanComparisonScreen.js# Side-by-side loan comparison
│   │   ├── AffordabilityScreen.js # Income-based affordability check
│   │   └── HistoryScreen.js       # Saved calculations list
│   └── utils/
│       ├── calculations.js    # EMI formula, affordability, INR formatting
│       └── storage.js         # AsyncStorage CRUD for history
└── assets/                    # Icons, splash screen
```

## Run Locally

### Prerequisites
- Node.js 18+
- Expo CLI (comes with npx)
- Android phone with **Expo Go** app OR Android emulator

### Steps

```bash
cd C:\Users\abhishek\Projects\LoanDecisionHelper

# Install dependencies (already done)
npm install

# Start dev server
npx expo start

# Scan QR code with Expo Go app on your phone
# OR press 'a' to open in Android emulator
```

## Build APK

### Option 1: EAS Build (Recommended for Play Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

Add this to `eas.json` (created by `eas build:configure`):

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Option 2: Local Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK using Gradle
cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/
```

## Play Store Release Checklist

1. **Build AAB** using `eas build --platform android --profile production`
2. **Create Google Play Console** account ($25 one-time fee)
3. **Prepare assets:**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500)
   - Screenshots (min 2, phone + tablet recommended)
4. **Store listing:**
   - Title: "Loan Decision Helper – EMI Calculator India"
   - Short description: "Calculate EMI, compare loans & check affordability"
   - Category: Finance
   - Content rating: Everyone
5. **Privacy policy** — Required for Finance apps (host on a simple webpage)
6. **Upload AAB** → Internal testing → Closed testing → Production
7. **Target API level** — Ensure `targetSdkVersion` meets Play Store requirements

## AdMob Integration (When Ready)

1. Install: `npx expo install react-native-google-mobile-ads`
2. Add AdMob app ID to `app.json`:
   ```json
   "android": {
     "config": {
       "googleMobileAdsAppId": "ca-app-pub-xxxxxxxx~yyyyyyyy"
     }
   }
   ```
3. Replace placeholder in `src/components/AdBanner.js` with actual BannerAd component
4. Toggle `adFree` flag in AppContext to hide ads for premium users

## Tech Stack

- React Native (Expo SDK 54)
- React Navigation (Native Stack)
- AsyncStorage (local persistence)
- react-native-svg (pie chart)
- Context API (state management)
