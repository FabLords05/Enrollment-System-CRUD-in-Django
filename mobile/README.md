# EMS Student Mobile App
### Expo SDK 54 · React Native · TypeScript

A mobile replica of the **Enrollment Management System** Student Portal, built with Expo SDK 54.
It connects to the same Django REST backend as the web frontend.

---

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Login** | JWT login (student role only, blocks other roles) |
| **Dashboard** | Welcome banner, stat cards, enrolled subjects preview, notices |
| **Subjects** | Full subject list with search, instructor & room info |
| **Schedule** | Toggle between **List** view and **Grid** view |
| **Finance** | Fee breakdown, payment history, dynamic by enrollment status |
| **Profile** | View & edit name/phone, read-only registrar-managed fields, sign out |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set your backend IP
Open `src/api/axiosSetup.ts` and update:
```ts
export const BASE_URL = 'http://<YOUR_DJANGO_SERVER_IP>:8000/api/';
```
The Django server must be running with `python manage.py runserver 0.0.0.0:8000`.
Make sure your phone and server are on the **same Wi-Fi network**.

### 3. Run the app
```bash
# Start Expo dev server
npx expo start

# Open on Android
npx expo start --android

# Open on iOS
npx expo start --ios
```

Scan the QR code with **Expo Go** (iOS/Android) or run on an emulator.

---

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| `expo ~54.0.0` | Build toolchain |
| `react-navigation` | Stack + Bottom Tab navigation |
| `axios` | HTTP client |
| `@react-native-async-storage/async-storage` | Token persistence (replaces `localStorage`) |
| `jwt-decode` | Decode JWT to extract user info |
| `react-native-safe-area-context` | Safe area insets |

---

## ⚠️ Notes

- **Student-only**: Non-student roles (ADMIN, CASHIER, REGISTRAR) are blocked at login.
- **Same backend**: Reuses all existing Django REST API endpoints — no backend changes needed.
- **Android cleartext**: `usesCleartextTraffic: true` is enabled in `app.json` for HTTP (local dev). Use HTTPS for production.

---

## 📁 Project Structure

```
src/
├── api/
│   └── axiosSetup.ts          # Axios + AsyncStorage token interceptors
├── constants/
│   └── colors.ts              # USTP brand colors
├── context/
│   └── AuthContext.tsx        # Auth state + login/logout
├── components/
│   └── StatCard.tsx           # Reusable stat card
├── navigation/
│   ├── AppNavigator.tsx       # Root stack (login → tabs)
│   └── StudentTabNavigator.tsx # Bottom tab bar
└── screens/
    ├── LoginScreen.tsx
    └── student/
        ├── StudentDashboardScreen.tsx
        ├── StudentSubjectsScreen.tsx
        ├── StudentScheduleScreen.tsx
        ├── StudentFinanceScreen.tsx
        └── StudentProfileScreen.tsx
```
