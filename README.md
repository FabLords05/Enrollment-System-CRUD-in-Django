```markdown
# Student Management System API

A Django REST Framework (DRF) backend for managing university records. This project implements full **CRUD (Create, Read, Update, Delete)** operations for Students, Teachers, Courses, and Enrollments based on the provided Entity Relationship Diagram (ERD).

> **Note:** This project includes the **Bonus** requirement: Implementation of the **Update** operation.

##  Features

* **Student Management:** Register, view, update, and remove student records.
* **Teacher Management:** Manage teacher profiles and assignments.
* **Course Management:** Distinct courses linked to specific teachers.
* **Enrollment System:** Track student enrollments with timestamps.
* **Browsable API:** Utilizes DRF's built-in web interface for easy testing.
* **RESTful Architecture:** Follows standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

## Tech Stack

* **Language:** Python 3.x
* **Framework:** Django 6.x
* **API Toolkit:** Django REST Framework (DRF)
* **Database:** SQLite (Default for development)
* **Tooling:** `virtualenv`

## Screenshots

### Student View
![Student View](pic/student.png)

### Teacher View
![Teacher View](pic/teacher.png)

### Course View
![Course View](pic/course.png)

### Enrollment View
![Enrollment View](pic/enrollment.png)

## How to Run

Follow these steps to set up the project locally.

### 1. Create and Activate Virtual Environment
```bash
python -m venv venv
source venv/bin/activate

```

### 2. Install Dependencies

```bash
pip install django djangorestframework

```

### 3. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate

```

### 4. Run the Server

```bash
python manage.py runserver

```

Access the API at: `http://127.0.0.1:8000/api/`

## 🔗 API Endpoints

| Endpoint | Description | Methods Allowed |
| --- | --- | --- |
| `/api/students/` | List/Create students | `GET`, `POST` |
| `/api/students/{id}/` | Student details | `GET`, `PUT`, `PATCH`, `DELETE` |
| `/api/teachers/` | List/Create teachers | `GET`, `POST` |
| `/api/teachers/{id}/` | Teacher details | `GET`, `PUT`, `PATCH`, `DELETE` |
| `/api/courses/` | List/Create courses | `GET`, `POST` |
| `/api/courses/{id}/` | Course details | `GET`, `PUT`, `PATCH`, `DELETE` |
| `/api/enrollments/` | List/Create enrollments | `GET`, `POST` |
| `/api/enrollments/{id}/` | Enrollment details | `GET`, `PUT`, `PATCH`, `DELETE` |

## 📝 Database Schema (ERD)

* **Student:** `first_name`, `last_name`, `email`, `age`
* **Teacher:** `teacher_name`, `email`
* **Course:** `course_name`, `units`, `teacher` (FK)
* **Enrollment:** `student` (FK), `course` (FK), `enrollment_date`
