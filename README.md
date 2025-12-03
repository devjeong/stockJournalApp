# Trade Mate (Stock Journal App)

A hybrid mobile application for tracking stock trades, built with React, Vite, Tailwind CSS, Firebase, and Capacitor.

## Prerequisites

- Node.js (v18+)
- Android Studio (for Android build)
- Firebase Project (with Auth, Firestore, Storage enabled)

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Update `.env` with your Firebase configuration keys:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    ...
    ```

3.  **Run Locally (Web):**
    ```bash
    npm run dev
    ```

## Building for Mobile

1.  **Build Web Assets:**
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor:**
    ```bash
    npx cap sync
    ```

3.  **Open Android Project:**
    ```bash
    npx cap open android
    ```

## Features

- **Authentication:** Google, Apple (Demo), Anonymous.
- **Trade Log:** Create, Read, Delete trades.
- **Dashboard:** View stats and recent activity.
- **Smart Scan:** Mock OCR for trade screenshots.
- **Hybrid:** Runs on Web and Android.

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Screen components.
- `src/services`: Firebase and other services.
- `src/contexts`: Global state (Auth).
- `src/layouts`: Layout wrappers.
