# Student Enrollment Management System

A full-stack web application for managing student enrollments with automatic section assignment, capacity control, and unit limit enforcement. Built with Django REST Framework backend and React + TypeScript frontend.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Running the Application](#running-the-application)
- [Database Setup & Seeding](#database-setup--seeding)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Features

### Core Features
- **Student Management**: Create, read, update, delete student records
- **Teacher Management**: Manage instructor information
- **Course Management**: Define courses with units and assigned teachers
- **Section Management**: Create course sections with capacity control
- **Enrollment System**: Enroll students in courses with automatic section assignment

### Advanced Features
- **21-Unit Limit Enforcement**: Students can enroll in up to 21 units (editable)
- **Automatic Section Assignment**: System automatically assigns students to available sections
- **Capacity Control**: Prevent over-enrollment in sections
- **Duplicate Prevention**: Prevent students from enrolling in the same course twice
- **Bulk Enrollment**: Enroll one student in multiple courses simultaneously
- **View Enrolled Students**: See which students are enrolled in each section
- **Real-time Unit Tracking**: Monitor student unit load in real-time

### User Interface
- Modern, responsive design with Tailwind CSS
- Intuitive navigation with tabs for different modules
- Real-time form validation
- Detailed error messages for user guidance
- Scrollable modals for viewing enrolled students

---

## Tech Stack

### Backend
- **Python 3.x**
- **Django** - Web framework
- **Django REST Framework** - API development
- **django-cors-headers** - CORS support
- **SQLite** - Database (development)

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Create React App** - Project setup

---

## Project Structure

```
Enrollment-System-CRUD-in-Django/
├── backend/
│   ├── manage.py
│   ├── settings.py
│   ├── urls.py
│   ├── seed_data.py              # Script to populate sample data
│   └── api/
│       ├── models.py              # Student, Teacher, Course, Section, Enrollment
│       ├── serializers.py         # API serializers
│       ├── views.py               # API viewsets & endpoints
│       ├── urls.py                # API URL routing
│       └── migrations/            # Database migrations
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts                 # API client & type definitions
│   │   └── component/
│   │       ├── StudentList.tsx
│   │       ├── TeacherList.tsx
│   │       ├── CourseList.tsx
│   │       ├── SectionList.tsx
│   │       ├── EnrollmentList.tsx
│   │       ├── BulkEnrollmentForm.tsx
│   │       └── EnrollmentSummary.tsx
│   └── public/
└── README.md
```

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Python** (3.8 or higher)
   - Download from: https://www.python.org/downloads/
   - **Important**: Check "Add Python to PATH" during installation

2. **Node.js & npm** (v14 or higher)
   - Download from: https://nodejs.org/
   - Comes with npm package manager

3. **Git** (optional, for cloning the repository)
   - Download from: https://git-scm.com/

**Verify Installation:**
```bash
python --version
node --version
npm --version
```

---

## Installation Guide

### Step 1: Clone or Download the Project

If you have Git:
```bash
git clone <repository-url>
cd Enrollment-System-CRUD-in-Django
```

Or download as ZIP and extract the folder.

---

### Step 2: Setup Backend

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Python Virtual Environment
```bash
python -m venv venv
```

#### 2.3 Activate Virtual Environment

**On Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**On Windows (PowerShell):**
```bash
.\venv\Scripts\Activate.ps1
```

**On Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal.

#### 2.4 Install Python Dependencies
```bash
pip install django==4.2.0
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.0.0
pip install pymysql
```

Or install all at once:
```bash
pip install -r requirements.txt
```

#### 2.5 Run Database Migrations
```bash
python manage.py migrate
```

This creates the SQLite database and tables.

#### 2.6 (Optional) Seed Sample Data
To populate the database with sample data (30 students, 2 teachers, 5 courses):
```bash
python manage.py seed_data.py
```

Or:
```bash
python seed_data.py
```

---

### Step 3: Setup Frontend

#### 3.1 Open New Terminal and Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

This may take 2-3 minutes.

---

## Running the Application

### Step 1: Start Backend Server

In the `backend` directory (with virtual environment activated):

```bash
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
```

**Leave this running** in the first terminal.

---

### Step 2: Start Frontend Server

**In a new terminal**, navigate to `frontend` directory:

```bash
npm start
```

Expected output:
```
Compiled successfully!
You can now view the app in your browser.
Local: http://localhost:3000/
```

The app will automatically open in your default browser at `http://localhost:3000`.

---

## Database Setup & Seeding

### Manual Database Reset

If you need to start fresh:

```bash
# Delete the database file (optional)
del db.sqlite3

# Run migrations to recreate database
python manage.py migrate

# Seed sample data
python seed_data.py
```

### Sample Data Includes

- **30 Students**: Various names and emails
- **2 Teachers**: Ready to be assigned to courses
- **5 Courses**: Different subjects with 3-4 units each
- **10 Sections**: Multiple sections per course with 30-unit capacity

---

## API Endpoints

### Base URL: `http://localhost:8000/api`

### Students
- `GET /students/` - List all students
- `POST /students/` - Create a student
- `GET /students/{id}/` - Get student details
- `PATCH /students/{id}/` - Update student
- `DELETE /students/{id}/` - Delete student

### Teachers
- `GET /teachers/` - List all teachers
- `POST /teachers/` - Create a teacher
- `GET /teachers/{id}/` - Get teacher details
- `PATCH /teachers/{id}/` - Update teacher
- `DELETE /teachers/{id}/` - Delete teacher

### Courses
- `GET /courses/` - List all courses
- `POST /courses/` - Create a course
- `GET /courses/{id}/` - Get course details
- `PATCH /courses/{id}/` - Update course
- `DELETE /courses/{id}/` - Delete course

### Sections
- `GET /sections/` - List all sections
- `POST /sections/` - Create a section
- `GET /sections/{id}/` - Get section details
- `PATCH /sections/{id}/` - Update section
- `DELETE /sections/{id}/` - Delete section

### Enrollments
- `GET /enrollments/` - List all enrollments
- `POST /enrollments/` - Create an enrollment
- `POST /enrollments/bulk_enroll/` - Bulk enroll student in multiple sections
- `PATCH /enrollments/{id}/` - Update enrollment
- `DELETE /enrollments/{id}/` - Delete enrollment

---

## Screenshots

![Student View]
<img width="1366" height="727" alt="student" src="https://github.com/user-attachments/assets/b9326f78-1d78-4072-b598-67443002c718" />

![Teacher View]
<img width="1366" height="727" alt="teacher" src="https://github.com/user-attachments/assets/49d3a39e-e984-4ec9-9ad0-90b7c1358330" />

![Course View]
<img width="1366" height="727" alt="course" src="https://github.com/user-attachments/assets/6c1d729f-550a-4d4d-9bab-2931a49e56fc" />

![Enrollment View]
<img width="1366" height="727" alt="enrollment" src="https://github.com/user-attachments/assets/6bda5bea-5134-47cc-bcbb-05cccd7822b4" />

---

## Troubleshooting

### Backend Issues

**Problem**: "python: command not found" or "python is not recognized"
- **Solution**: Python is not in your PATH. Uninstall and reinstall Python, making sure to check "Add Python to PATH"

**Problem**: Module not found errors (e.g., "No module named 'django'")
- **Solution**: Make sure the virtual environment is activated (you should see `(venv)` in terminal)
- Run: `pip install -r requirements.txt`

**Problem**: "Port 8000 already in use"
- **Solution**: Use a different port: `python manage.py runserver 8001`

**Problem**: Database errors or "no such table"
- **Solution**: Rerun migrations: `python manage.py migrate`

### Frontend Issues

**Problem**: "npm: command not found"
- **Solution**: Node.js is not installed. Download and install from https://nodejs.org/

**Problem**: "port 3000 already in use"
- **Solution**: Kill the process using port 3000 or use a different port

**Problem**: Module not found errors
- **Solution**: Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

**Problem**: CORS errors when accessing API
- **Solution**: Make sure backend is running on `http://localhost:8000` and has CORS enabled

**Problem**: Changes not appearing after editing
- **Solution**: Hard refresh browser with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Restart both `npm start` and `python manage.py runserver`

### General Tips

1. **Always run backend first**, then frontend
2. **Keep both servers running** - don't close either terminal
3. **Check terminal output** for error messages
4. **Use Ctrl+C** to stop a server gracefully
5. **Restart both servers** if you make changes to backend code

---

## Common Workflows

### Adding a New Student
1. Navigate to "Students" tab
2. Click "Add Student"
3. Fill in first name, last name, email, and age
4. Click "Create"

### Enrolling a Student in Multiple Courses
1. Navigate to "Bulk Enroll" tab
2. Select a student from dropdown
3. (Optional) Adjust the unit limit (default 21)
4. Check the courses you want to enroll the student in
5. Monitor the projected unit total
6. Click "Enroll in Selected Sections"

### Viewing Enrolled Students in a Section
1. Navigate to "Sections" tab
2. Click "View Enrolled" on any section
3. A modal will show all enrolled students
4. Use the scrollbar if there are many students
5. Click the X button to close the modal

---

## Notes for Instructors

- The system uses SQLite by default (suitable for development)
- Sample data is randomly generated and can be reset anytime
- All validations are enforced both on frontend and backend
- The 21-unit limit is configurable in the bulk enrollment form
- CORS is enabled to allow frontend-backend communication on localhost

---

## Support

If you encounter issues not covered in troubleshooting:
1. Check terminal error messages carefully
2. Ensure both servers are running
3. Try restarting both frontend and backend
4. Clear browser cache (`Ctrl+Shift+Delete`)
5. Reset database and re-seed data if needed

---

**Happy Teaching!** 🎓


