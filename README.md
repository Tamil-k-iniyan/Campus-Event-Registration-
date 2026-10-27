# Campus Event Registration and Management System

A modern, full-stack, enterprise-grade web application for university event discovery, atomic seat reservation, attendee tracking, and faculty administration. Built for college Web Technology projects and Capstone submissions.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-v18.3-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-v6.2-purple?logo=vite)
![Express](https://img.shields.io/badge/Express-v4.21-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-v8.x-emerald?logo=mongodb)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5.3-indigo?logo=bootstrap)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation and Setup](#installation-and-setup)
- [Database Seeding & Default Credentials](#database-seeding--default-credentials)
- [Running the Application](#running-the-application)
- [Automated API Testing](#automated-api-testing)
- [REST API Endpoints](#rest-api-endpoints)
- [Documentation & Viva Voce Preparation](#documentation--viva-voce-preparation)
- [License](#license)

---

## Project Overview
Higher education institutions routinely coordinate symposia, hackathons, guest lectures, and cultural galas. Manual paper sign-ups and disparate Google Forms lead to duplicate submissions, overbooking past venue capacity, and tedious attendance reconciliation.

The **Campus Event Registration and Management System** solves these challenges through:
1. **Centralized Discovery:** Searchable and filterable catalog across Technical, Hackathon, Workshop, Cultural, Sports, and Seminar categories.
2. **Atomic Seat Reservations:** Concurrency-safe seat reservation using MongoDB conditional operators (`findOneAndUpdate` with `$expr`) to eliminate overselling under peak traffic.
3. **Compound Unique Constraints:** Database-level compound indexes `{ student: 1, event: 1 }` preventing duplicate active bookings.
4. **Role-Based Access Control (RBAC):** Strict JWT-authenticated role segregation separating student attendees from faculty administrators.
5. **Administrative Console:** Real-time capacity utilization progress bars, student attendee rosters, and one-click CSV export for offline records.

---

## Key Features

### For Students:
- Secure account registration and authentication.
- Explore upcoming events with keyword search across title, description, and venue.
- Category filtering and chronological date sorting.
- Real-time seat availability gauges and registration deadline alerts.
- One-click seat reservation with optional special notes.
- Personal Student Dashboard and booking history tracking.
- Self-service registration cancellation before event commencement.
- Student profile customization (Department, Roll ID, Contact Number).

### For Faculty Administrators:
- Protected Admin Console with high-level KPI cards (Total Events, Upcoming, Registered Students, Confirmed Bookings).
- Event CRUD operations (Create, Read, Update, Delete) with validation preventing capacity reduction below current attendee counts.
- Event attendee management with student name, email, department, and roll number search.
- Single-click CSV roster download with complete student attendance data.
- Event publication status toggling (`published`, `draft`, `closed`, `cancelled`).

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Routing:** React Router DOM 6
- **Styling:** Bootstrap 5.3 + Bootstrap Icons + Custom University Navy/Indigo CSS Theme
- **HTTP Client:** Axios with automated JWT Bearer interceptor

### Backend
- **Runtime:** Node.js (v18 – v22)
- **Framework:** Express.js 4
- **Database:** MongoDB Community Server / MongoDB Atlas
- **Object Data Modeling:** Mongoose 8
- **Security:** Bcrypt.js (10 salt rounds), JSON Web Tokens (JWT), Helmet, CORS, Express Rate Limit
- **Validation:** express-validator for client and server input sanitization

---

## System Architecture

```
[ React 18 + Vite (Port 5173) ]
             |
             | HTTP REST API (JSON / JWT)
             v
[ Express.js + Node.js (Port 5000) ]
   ├── Helmet & CORS Security Middleware
   ├── JWT Auth & Role Authorization Middleware
   ├── express-validator Middleware
   └── Central Error Handler
             |
             v
[ MongoDB Engine (campus_events) ]
   ├── users (Unique email, hashed passwords)
   ├── events (Indexed on eventDate, status, category)
   └── registrations (Compound Unique Index: student + event)
```

---

## Project Directory Structure

```
campus-event-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile endpoints
│   │   ├── eventController.js    # Public & admin event CRUD
│   │   ├── registrationController.js # Atomic seat reservation & cancellation
│   │   └── adminController.js    # Metrics, attendee rosters, CSV export
│   ├── middleware/
│   │   ├── auth.js               # JWT protect & role authorization
│   │   ├── validator.js          # express-validator schemas
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Student & Admin schema with bcrypt hooks
│   │   ├── Event.js              # Event schema with virtual remainingSeats
│   │   └── Registration.js       # Unique compound index schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/
│   │   ├── seed.js               # Populates realistic demo events and users
│   │   └── generateDocxReport.js # Compiles DOCX academic project report
│   ├── test/
│   │   └── api.test.js           # Automated integration test suite
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   └── AlertToast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & helper methods
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── EventDetailsPage.jsx
│   │   │   ├── StudentDashboardPage.jsx
│   │   │   ├── MyRegistrationsPage.jsx
│   │   │   ├── StudentProfilePage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── CreateEventPage.jsx
│   │   │   ├── EditEventPage.jsx
│   │   │   ├── EventRegistrationsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Design system styling
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md      # Full REST endpoint specifications
│   ├── DATABASE_SCHEMA.md        # Mongoose schemas, indexes, and ERD
│   ├── TEST_CASES.md             # 25 verified test scenarios
│   ├── VIVA_QUESTIONS.md         # 25 viva voce answers and demo guide
│   ├── PROJECT_REPORT.md         # Comprehensive academic report (Markdown)
│   └── PROJECT_REPORT.docx       # Editable Microsoft Word academic report
├── .gitignore
├── LICENSE
└── README.md
```

---

## Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js:** v18.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **MongoDB:** Local MongoDB service running (`localhost:27017`) or a free MongoDB Atlas connection string.
- **Git:** (`git --version`)

---

## Environment Configuration

### Backend Configuration
Create a `.env` file in the `backend/` directory (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_events
JWT_SECRET=campus_event_jwt_super_secret_key_change_in_production_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

*(If using MongoDB Atlas, replace `MONGO_URI` with your connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_events?retryWrites=true&w=majority`)*

### Frontend Configuration
Create a `.env` file in the `frontend/` directory (or copy from `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation and Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Database Seeding & Default Credentials
Populate MongoDB with realistic demo events across multiple categories and pre-configured student and admin accounts:

```bash
cd backend
npm run seed
```

### Demo Login Accounts:
- **Campus Administrator:**
  - **Email:** `admin@campus.edu`
  - **Password:** `Admin@password123`
  - **Role:** Administrator (Full event CRUD, capacity management, CSV exports)

- **Student User:**
  - **Email:** `student@campus.edu`
  - **Password:** `Student@password123`
  - **Role:** Student (Event discovery, registration, cancellation, profile editing)

*(Note: The login page features quick one-click demo fill buttons for immediate testing during viva evaluation!)*

---

## Running the Application

### Option A: Run Backend and Frontend in Separate Terminals

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# React Vite application will start on http://localhost:5173
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## Automated API Testing
The project includes an automated test harness covering health status, JWT issuance, duplicate registrations, RBAC authorization, atomic reservation, and CSV export:

```bash
cd backend
npm test
```
**Test Results:** `21 Passed, 0 Failed (100% Pass Rate)`.

To verify the frontend production build:
```bash
cd frontend
npm run build
```

---

## REST API Endpoints Overview

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and health check |
| `POST` | `/api/auth/register` | Public | Student account registration |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile details |
| `GET` | `/api/events` | Public | Search, filter, and paginate events |
| `GET` | `/api/events/:id` | Public / Auth | Event details & user registration state |
| `POST` | `/api/events` | Admin Only | Create new campus event |
| `PUT` | `/api/events/:id` | Admin Only | Modify event attributes |
| `DELETE` | `/api/events/:id` | Admin Only | Delete event and registrations |
| `POST` | `/api/registrations/:eventId` | Student Only | Atomic seat reservation |
| `DELETE` | `/api/registrations/:id` | Student Only | Cancel registered seat |
| `GET` | `/api/registrations/my` | Student Only | Student registration history |
| `GET` | `/api/admin/dashboard` | Admin Only | Overview metrics and statistics |
| `GET` | `/api/admin/events/:eventId/registrations` | Admin Only | Attendee list for an event |
| `GET` | `/api/admin/registrations/export/:eventId` | Admin Only | Stream CSV attendee roster |

---

## Documentation & Viva Voce Preparation
The `docs/` folder contains complete academic and technical documentation:
- **`docs/PROJECT_REPORT.docx`**: Fully formatted, editable Microsoft Word academic project report.
- **`docs/PROJECT_REPORT.md`**: Markdown academic report containing Title Page, Abstract, Architecture, DFDs, Use-Case Diagrams, Test Cases, and Results.
- **`docs/VIVA_QUESTIONS.md`**: 25 detailed viva voce questions and answers, technology justifications, and a 5-minute project demonstration script.
- **`docs/DATABASE_SCHEMA.md`**: Complete entity relationship details, MongoDB indexes, and concurrency strategy.
- **`docs/API_DOCUMENTATION.md`**: REST API endpoints, query params, and JSON payloads.
- **`docs/TEST_CASES.md`**: Test matrix covering 25 test cases with 100% pass verification.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
