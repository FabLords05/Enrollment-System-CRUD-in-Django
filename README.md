# EduTrack Enrollment System

A full-stack university enrollment platform with a **Django REST Framework** backend, **React + Vite** web frontend, and an **Expo React Native** mobile student portal.

---

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed:
* **Python 3.11+**
* **Node.js (v18 or higher)** & **npm**
* **Git**
* **Optional**: `expo-cli` for local mobile development (`npm install -g expo-cli`)

---

## 🚀 Getting Started

First, clone the repository to your local machine:
```bash
git clone <your-repository-url>
cd Enrollment
```

---

## 🐍 Part 1: Backend Setup (Django)

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

### 1. Create and Activate a Virtual Environment

This keeps your global Python installation clean.

* **On Linux/macOS:**

```bash
python3 -m venv venv
source venv/bin/activate
```

* **On Windows (Command Prompt):**

```cmd
python -m venv venv
venv\Scripts\activate
```

* **On Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Python Packages

```bash
pip install -r requirements.txt
```

### 3. Initialize the Database

Run the migrations to create your local database tables:

```bash
python manage.py makemigrations accounts academics enrollment scheduling
python manage.py migrate
```

### 4. Create an Admin Account

Create the administrator account and follow the prompts:

```bash
python manage.py createsuperuser
```

> ⚠️ **Important:** After creating the superuser, set their `role` to `ADMIN` inside Django Admin at `http://127.0.0.1:8000/admin/` so web permissions work correctly.

### 5. Start the Django Server

```bash
python manage.py runserver 0.0.0.0:8000
```

Keep this terminal open while you use the app.

---

## ⚛️ Part 2: Frontend Setup (React + Vite)

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

### 1. Install Node Modules

```bash
npm install
```

### 2. Start the Local Frontend Server

```bash
npm run dev
```

The app should now be available at **`http://localhost:5173/`**.

---

## 📱 Part 3: Mobile App Setup (Expo)

The mobile student portal is located in the `mobile/` folder and uses Expo.

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Backend Access

Open `mobile/src/api/axiosSetup.ts` and set `BASE_URL` to your Django backend URL, for example:

```ts
export const BASE_URL = 'http://<YOUR_DJANGO_SERVER_IP>:8000/api/';
```

If you are testing on a physical device, use the machine's local network IP rather than `localhost`.

### 3. Run the Mobile App

```bash
npx expo start
```

Then open the app using Expo Go on your device or an emulator.

---

## 🔧 Project Notes

* The mobile app shares the same Django REST backend as the web frontend.
* Branding has been updated from `EMS` to **EduTrack** across the web, mobile, and admin interfaces.
* The student finance screen now includes payment history, receipt preview, and overpayment protection.

---

## 🔍 Troubleshooting & Quick Tips

* **React/Web White Screen:** Check the browser console for missing API data fields or invalid auth state.
* **Django CORS Errors:** Confirm `django-cors-headers` is enabled in `INSTALLED_APPS` and your allowed origins include `http://localhost:5173`.
* **Mobile device connection:** Ensure the phone and backend server are on the same local network, and use the actual machine IP for `BASE_URL`.
