# RESTful API Specification

## Campus Event Registration and Management System

- **Base URL:** `http://localhost:5000/api`
- **Format:** JSON (`Content-Type: application/json`)
- **Authentication:** HTTP Authorization Header with Bearer Token (`Authorization: Bearer <jwt_token>`)

---

### API Endpoint Summary Table

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | System status and uptime health check |
| `POST` | `/auth/register` | Public | Register a new student profile |
| `POST` | `/auth/login` | Public | Authenticate student or admin and issue JWT |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile details |
| `PUT` | `/auth/profile` | Authenticated | Update name, department, roll ID, or phone |
| `GET` | `/events` | Public | Search, filter, and paginate events |
| `GET` | `/events/:id` | Public / Optional Auth | Get detailed event info and student booking state |
| `POST` | `/events` | Admin Only | Create a new campus event |
| `PUT` | `/events/:id` | Admin Only | Update an existing campus event |
| `DELETE` | `/events/:id` | Admin Only | Delete an event and cascade purge registrations |
| `POST` | `/registrations/:eventId` | Student Only | Atomically reserve a seat for an event |
| `GET` | `/registrations/my` | Student Only | List student's registration history |
| `DELETE` | `/registrations/:id` | Student Only | Relinquish an eligible event registration |
| `GET` | `/admin/dashboard` | Admin Only | Administrative metrics, counts, and summaries |
| `GET` | `/admin/events/:eventId/registrations` | Admin Only | Query attendees for a specific event |
| `GET` | `/admin/registrations/export/:eventId` | Admin Only | Download CSV roster of attendees |

---

### Detailed Endpoint Specifications

#### 1. Authentication Endpoints

##### 1.1 Student Registration
- **Route:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex.johnson@campus.edu",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "phone": "+1 555-0144",
    "department": "Computer Science & Engineering",
    "studentId": "CS2026-081"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful! Welcome to Campus Events.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "673f1a2b...",
      "name": "Alex Johnson",
      "email": "alex.johnson@campus.edu",
      "role": "student",
      "department": "Computer Science & Engineering",
      "studentId": "CS2026-081",
      "phone": "+1 555-0144",
      "createdAt": "2026-10-27T10:00:00.000Z"
    }
  }
  ```

##### 1.2 User Login
- **Route:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "student@campus.edu",
    "password": "Student@password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "673f1a2b...",
      "name": "Alex Johnson",
      "email": "student@campus.edu",
      "role": "student",
      "department": "Computer Science & Engineering"
    }
  }
  ```

---

#### 2. Event Endpoints

##### 2.1 Get Public Events
- **Route:** `GET /api/events`
- **Query Parameters:**
  - `search` (string): Title/venue keyword search
  - `category` (string): Technical | Workshop | Cultural | Sports | Seminar | Hackathon | Other
  - `timeframe` (string): `upcoming` | `past` | `all`
  - `order` (string): `asc` | `desc`
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 9)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 6,
    "total": 7,
    "page": 1,
    "totalPages": 1,
    "events": [...]
  }
  ```

##### 2.2 Get Event By ID
- **Route:** `GET /api/events/:id`
- **Optional Header:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "event": {
      "_id": "673f1b4c...",
      "title": "National AI & Cloud Computing Hackathon 2026",
      "description": "A 24-hour intensive coding marathon...",
      "category": "Hackathon",
      "eventDate": "2026-11-10T09:00:00.000Z",
      "startTime": "09:00 AM",
      "endTime": "09:00 AM (Next Day)",
      "venue": "Campus Innovation Center & Lab 4",
      "capacity": 120,
      "registeredCount": 24,
      "status": "published",
      "remainingSeats": 96
    },
    "isUserRegistered": false,
    "registrationId": null
  }
  ```

##### 2.3 Create Event (Admin Only)
- **Route:** `POST /api/events`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request Body:**
  ```json
  {
    "title": "Cybersecurity & Ethical Hacking Symposium",
    "description": "Comprehensive practical workshop on network penetration testing.",
    "category": "Technical",
    "eventDate": "2026-11-20T09:30:00.000Z",
    "startTime": "09:30 AM",
    "endTime": "03:30 PM",
    "venue": "Cyber Defense Lab 2",
    "organizer": "Cyber Security Research Group",
    "imageUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    "registrationDeadline": "2026-11-18T18:00:00.000Z",
    "capacity": 75,
    "status": "published"
  }
  ```
- **Success Response (201 Created)**

---

#### 3. Student Registration Endpoints

##### 3.1 Register for Event (Atomic Seat Reservation)
- **Route:** `POST /api/registrations/:eventId`
- **Headers:** `Authorization: Bearer <student_token>`
- **Request Body:**
  ```json
  {
    "notes": "Team member in competitive programming track."
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Successfully registered for the event!",
    "registration": {
      "_id": "673f2c5d...",
      "student": "673f1a2b...",
      "event": "673f1b4c...",
      "status": "confirmed",
      "registeredAt": "2026-10-27T10:15:00.000Z",
      "notes": "Team member in competitive programming track."
    },
    "remainingSeats": 95
  }
  ```

##### 3.2 Cancel Registration
- **Route:** `DELETE /api/registrations/:id`
- **Headers:** `Authorization: Bearer <student_token>`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Registration cancelled successfully.",
    "registration": {
      "_id": "673f2c5d...",
      "status": "cancelled",
      "cancelledAt": "2026-10-27T10:20:00.000Z"
    }
  }
  ```

---

#### 4. Admin Management Endpoints

##### 4.1 Admin Dashboard Metrics
- **Route:** `GET /api/admin/dashboard`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "stats": {
      "totalEvents": 7,
      "upcomingEvents": 6,
      "totalStudents": 3,
      "totalRegistrations": 4,
      "confirmedRegistrations": 4
    },
    "categoryStats": [
      { "_id": "Technical", "count": 2 },
      { "_id": "Workshop", "count": 1 },
      { "_id": "Cultural", "count": 2 }
    ],
    "recentRegistrations": [...],
    "eventsList": [...]
  }
  ```

##### 4.2 Export Attendees as CSV
- **Route:** `GET /api/admin/registrations/export/:eventId`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Headers:**
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="registrations_AI_Hackathon_1730000000.csv"`
- **Response Body:** CSV file content stream
