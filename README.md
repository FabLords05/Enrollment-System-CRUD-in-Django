```markdown
# Enrollment Management System (EMS)

A full-stack university enrollment application built with **React (Vite + TypeScript)** on the frontend and **Django REST Framework** on the backend.

---

## 🛠️ Prerequisites

Before getting started, make sure everyone in your group has the following installed:
* **Python 3.11+**
* **Node.js (v18 or higher)** & **npm**
* **Git**

---

## 🚀 Getting Started

First, clone the repository to your local machine:
```bash
git clone <your-repository-url>
cd enrollment

```

---

## 🐍 Part 1: Backend Setup (Django)

Open your terminal and navigate to the backend folder:

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

*(If you do not have a requirements.txt file, run: `pip install django djangorestframework django-cors-headers djangorestframework-simplejwt`)*

### 3. Initialize the Database

Run the migrations to physically construct your local SQLite database tables:

```bash
python manage.py makemigrations accounts academics enrollment scheduling
python manage.py migrate

```

### 4. Create an Admin Account

You will need an administrator profile to log into the system. Run this command and follow the prompts (use a valid email layout since the system uses email instead of username):

```bash
python manage.py createsuperuser

```

> ⚠️ **Important:** After creating the superuser, make sure to set their `role` to `ADMIN` inside the database (or via Django Admin at `http://127.0.0.1:8000/admin/`) so the React dashboard knows which permissions to grant you!

### 5. Start the Django Server

```bash
python manage.py runserver 0.0.0.0:8000

```

Keep this terminal tab open.

---

## ⚛️ Part 2: Frontend Setup (React + Vite)

Open a **second, separate terminal window** and navigate to the frontend folder:

```bash
cd frontend

```

### 1. Install Node Modules

```bash
npm install

```

### 2. Start the Local Development Server

```bash
npm run dev

```

The terminal will generate a local link, typically: **`http://localhost:5173/`**

---

## 🔍 TroubleShooting & Quick Tips

* **Circular Import / Crash on Startup:** If Django throws a dependency loop error, ensure you are running python 3.11+ and that all files match the latest repository pull.
* **White Screen on Frontend:** If a dashboard tab turns completely white, right-click the screen, hit **Inspect -> Console**, and check for missing API data fields or unassigned student parameters.
* **CORS Blocked Errors:** Ensure `django-cors-headers` is listed under `INSTALLED_APPS` and `MIDDLEWARE` in your backend `settings.py`, and your `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

```

```