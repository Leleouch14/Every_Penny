# Every Penny Counts 🪙

[![Downloads](https://img.shields.io/github/downloads/Leleouch14/Every_Penny/total?style=flat-square&color=BF5B3E)](https://github.com/Leleouch14/Every_Penny/releases/latest)
[![Release](https://img.shields.io/github/v/release/Leleouch14/Every_Penny?style=flat-square&color=437158)](https://github.com/Leleouch14/Every_Penny/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> A modern, local-first, privacy-focused mobile & web expense tracker built with Vite, Tailwind CSS, Capacitor, and SQLite. Designed with a cosy, tactile **Bisque & Terracotta** aesthetic.

---

## 📥 Downloads & Quick Links

* **[📥 Download Latest Android APK Release](https://github.com/Leleouch14/Every_Penny/releases/latest)**
* **[💬 Community Discussions & Feedback](https://github.com/Leleouch14/Every_Penny/discussions)**
* **[🚀 Report a Bug or Request a Feature](https://github.com/Leleouch14/Every_Penny/issues)**

---

## ✨ Key Features

1. **Warm & Tactile Design System (`Bisque & Terracotta`)**
   * Eye-friendly toasted oat backgrounds (`#ECE4DC`), warm milk cards (`#F4EFEA`), rich terracotta expense accents (`#BF5B3E`), and eucalyptus income accents (`#437158`).
2. **Interactive Financial Analytics (`📊 Stats`)**
   * Doughnut charts breaking down expenses by category tags (Food, Travel, Bills, Gaming, Stationary, General).
   * Grouped bar charts comparing daily and monthly earnings against expenses.
3. **Friend-to-Friend Splits (`🤝 Splits`)**
   * Built-in Splitwise peer expense sharing. Track who owes what with direction selectors (`Paid to Me` vs `Paid to Them`).
   * **Settled / Completed Toggles:** Cross off completed splits with one tap (`✓`). Settled entries receive a strikethrough and are automatically excluded from active balances and standing charts.
4. **Data Portability (`⚙️ Configs`)**
   * Export database tables as separate formatted `.csv` files or download full application backups as `.json`.
   * Import `.csv` or `.json` backup files to restore or merge table states dynamically.
5. **Daily & Monthly Chart Aggregation**
   * Seamlessly toggle between daily cash flow trends and aggregated monthly (`YYYY-MM`) comparisons across the year.
6. **Smart Recent Transactions Feed**
   * Displays the 5 most recent transactions by default, with an expandable **"See More (N more) ⌄"** toggle button.
7. **Native SQLite Storage**
   * Runs locally in the browser via `localStorage` during development and bridges securely to native SQLite (`every_penny_db`) on Android via Capacitor.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS (JIT via CDN), Chart.js
* **Build Tool:** Vite v8
* **Mobile Wrapper:** Capacitor v7 (`@capacitor/android`)
* **Database:** `@capacitor-community/sqlite` (Native SQLite C-library bridge)
* **CI/CD Pipeline:** GitHub Actions (Automated Gradle APK compilation & GitHub Releases)

---

## 🏗️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Leleouch14/Every_Penny.git
   cd Every_Penny/every-penny-vite
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run local dev server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📱 Building the Android APK Natively

1. **Sync Capacitor Android assets:**
   ```bash
   npx cap sync android
   ```
2. **Open Android Studio or build via Gradle:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   *(The compiled debug APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`)*

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
