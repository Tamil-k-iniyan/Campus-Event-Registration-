# Project Presentation & Viva Voce Comprehensive Guide

## Campus Event Registration and Management System

---

### Student & Institution Details
- **Student Name:** Tamilzhniyan K.
- **Register / Roll Number:** URK24CS1140
- **Department:** Computer Science and Engineering
- **Institution:** Karunya University
- **Academic Year:** 2026
- **Project Title:** Campus Event Registration and Management System
- **GitHub Repository:** [https://github.com/Tamil-k-iniyan/Campus-Event-Registration-](https://github.com/Tamil-k-iniyan/Campus-Event-Registration-)
- **Live Deployment:** [https://tamil-k-iniyan.github.io/Campus-Event-Registration-/](https://tamil-k-iniyan.github.io/Campus-Event-Registration-/)

---

## 1. Complete Slide-by-Slide Presentation Script (5–7 Minutes)

Use this spoken transcript during your PowerPoint presentation. It is designed to be natural, professional, and clear.

---

### Slide 1: Title Slide
> **Spoken Script:**
> *"Respected faculty members and examiners, a very good morning. My name is Tamilzhniyan K., bearing registration number URK24CS1140 from the Department of Computer Science and Engineering at Karunya University. Today, I am proud to present my Web Technology Capstone Project: the **Campus Event Registration and Management System**—a full-stack digital platform engineered to modernize how collegiate events, hackathons, workshops, and symposiums are discovered, booked, and administered."*

---

### Slide 2: Project Overview
> **Spoken Script:**
> *"In any thriving university ecosystem, co-curricular and technical events are organized year-round. However, the registration process is often fragmented. Our system establishes a centralized digital portal connecting two key user groups: Students and Faculty Administrators. Students can browse curated events, check remaining seat capacity in real time, and reserve their seat with a single click. Faculty Administrators gain complete oversight: scheduling events, enforcing venue capacity limits, tracking student attendees, and generating instant CSV rosters for attendance."*

---

### Slide 3: Problem Statement
> **Spoken Script:**
> *"Before developing this system, we analyzed the existing legacy methods used on campus, which rely primarily on paper forms or Google Forms. These manual workflows exhibit four critical vulnerabilities:
> 1. **Zero Real-Time Capacity Control:** Forms cannot stop accepting registrations the moment a lab or auditorium reaches maximum capacity, leading to severe overselling.
> 2. **Duplicate Submissions:** Students frequently submit multiple times, corrupting attendance numbers.
> 3. **Scattered Discovery:** Notices are buried across WhatsApp groups and notice boards, causing students to miss deadlines.
> 4. **Administrative Burden:** Organizers spend hours manually reconciling spreadsheets and compiling attendee rosters."*

---

### Slide 4: Project Objectives
> **Spoken Script:**
> *"To solve these challenges, our project accomplished seven specific engineering objectives:
> - Centralize all campus technical, cultural, and sports events into one searchable catalog.
> - Deliver an intuitive, responsive student seat reservation interface.
> - Eliminate overbooking through atomic, concurrency-safe capacity enforcement.
> - Enforce database-level duplicate prevention via unique compound indexes.
> - Provide a protected faculty dashboard for event CRUD and live metrics.
> - Implement role-based access control separating students from administrators.
> - Ensure robust data persistence using MongoDB and Mongoose."*

---

### Slide 5: Proposed System & Key Features
> **Spoken Script:**
> *"The proposed system strictly segregates capabilities by user role:
> - **For Students:** Secure registration and login, keyword search across titles and venues, category filtering (Hackathon, Technical, Cultural, Sports, Workshop, Seminar), real-time seat availability gauges, single-click booking, personal registration history, and self-service cancellation for upcoming events.
> - **For Administrators:** Comprehensive metrics on events and bookings, full CRUD controls, capacity utilization bars, student attendee rosters, and a single-click CSV roster export feature for offline records."*

---

### Slide 6: Technology Stack
> **Spoken Script:**
> *"Our project is architected on the modern MERN stack:
> - **Frontend:** React 18 built with Vite for high performance, styled with Bootstrap 5, Bootstrap Icons, and a custom university navy/indigo design system.
> - **Backend:** Node.js runtime with Express.js RESTful API architecture.
> - **Database:** MongoDB document database utilizing Mongoose 8 for schema modeling and indexing.
> - **Security & Auth:** JSON Web Tokens (JWT) for stateless sessions, bcrypt.js with 10 salt rounds for password encryption, and express-validator for robust server-side sanitization.
> - **Tooling:** Git, GitHub, and GitHub Actions for continuous deployment."*

---

### Slide 7: System Architecture
> **Spoken Script:**
> *"Here we see the 3-Tier System Architecture:
> 1. **Presentation Tier:** The React Single Page Application runs in the client browser, handling state via React Context and dispatching asynchronous HTTP requests through Axios with automated JWT Bearer interceptors.
> 2. **Application Logic Tier:** Express.js processes requests through security middleware—including Helmet, CORS, and Rate Limiting—before passing through authentication guards, role authorization, and input validation to dedicated controllers.
> 3. **Data Persistence Tier:** Controllers interact with MongoDB collections via Mongoose ODM schemas, ensuring referential integrity and atomic data writes."*

---

### Slide 8: Database Design
> **Spoken Script:**
> *"Our database is named `campus_events` and comprises three core collections:
> 1. **`users`:** Stores student and administrator records with fields for name, unique email, hashed password, role (`student` or `admin`), department, roll ID, and phone number.
> 2. **`events`:** Stores event details including title, category, event date, start/end times, venue, organizer, capacity, registered count, status, and createdBy reference. A compound index on event date and status optimizes query speeds.
> 3. **`registrations`:** Connects students to events with fields for student ID, event ID, status (`confirmed` or `cancelled`), registration timestamp, and optional attendee notes. Notice the crucial compound unique index on `{ student: 1, event: 1 }`, which mathematically prevents any student from registering twice for the same event."*

---

### Slide 9: Frontend Design & User Interface
> **Spoken Script:**
> *"The frontend UI was crafted with a university-standard design language using navy blue, indigo, white, and subtle gradients. 
> Key screens include:
> - The **Landing Page** with platform statistics and category cards.
> - The **Event Explorer** featuring live search, category pills, timeframe toggles, and responsive cards with seat progress bars.
> - The **Event Details Page** showing complete syllabus, venue, deadline countdown, and a dynamic registration button."*

---

### Slide 10: Student Registration Workflow
> **Spoken Script:**
> *"Let us examine the student booking lifecycle:
> When an authenticated student clicks 'Register for Event', the request hits `POST /api/registrations/:eventId`. 
> The backend executes three sequential checks:
> 1. Verifies the event is published and the registration deadline has not passed.
> 2. Checks if an active registration already exists for this student.
> 3. Performs an **atomic conditional update** in MongoDB: `{ _id: eventId, status: 'published', $expr: { $lt: ['$registeredCount', '$capacity'] } }` with `{ $inc: { registeredCount: 1 } }`.
> Because this operation is atomic, if two students click simultaneously for the last seat, only one succeeds and the other receives an immediate 'Event Full' error. Once reserved, a registration record is created and the UI updates in real time."*

---

### Slide 11: Administrator Dashboard
> **Spoken Script:**
> *"The Admin Console gives faculty organizers total visibility:
> - Four top-level KPI cards track Total Events, Upcoming Scheduled, Registered Students, and Confirmed Bookings.
> - The Events Catalog table visualizes seat capacity utilization with dynamic color-coded progress bars.
> - Administrators can open the Attendee Roster for any event to view registered student names, emails, departments, roll numbers, and notes.
> - Clicking 'Export to CSV' instantly streams a formatted spreadsheet file directly to the admin's downloads folder for attendance marking."*

---

### Slide 12: Backend & REST API Integration
> **Spoken Script:**
> *"Our backend exposes a clean, RESTful API organized by resource:
> - `/api/auth` handles user registration, login, and profile updates.
> - `/api/events` provides public search, filtering, and pagination, as well as admin-only event creation, updates, and deletion.
> - `/api/registrations` powers atomic seat booking and cancellation.
> - `/api/admin` provides dashboard analytics, attendee querying, and CSV streaming.
> All private routes are strictly protected by JWT verification and role authorization middleware."*

---

### Slide 13: Input Validation & Security Safeguards
> **Spoken Script:**
> *"Security was prioritized throughout development:
> - **Multi-Layer Validation:** React validates inputs client-side for immediate user feedback, while `express-validator` rigorously sanitizes data on the server.
> - **Chronological Rules:** Registration deadlines cannot be set after event start dates; event capacity must be a positive integer $\ge 1$; capacity cannot be reduced below current attendees.
> - **Security Hardening:** Passwords hashed with 10 bcrypt salt rounds; Helmet sets protective HTTP headers; rate-limiting prevents brute-force login attempts; and all database secrets are managed through environment variables."*

---

### Slide 14: MongoDB Demonstration & Data Integrity
> **Spoken Script:**
> *"In MongoDB, data integrity is verified by examining the physical documents:
> - Event documents store event metadata and the current `registeredCount`.
> - Registration documents store individual attendee bookings referencing `student` and `event` ObjectIds.
> - Even under high simultaneous loads, our compound unique index `{ student: 1, event: 1 }` guarantees that no race condition can ever create duplicate booking documents."*

---

### Slide 15: Testing Methodology & Verification Results
> **Spoken Script:**
> *"To ensure reliability, we built an automated test harness in `backend/test/api.test.js`.
> - **21 Automated Integration Tests** were executed covering health checks, authentication, duplicate rejections, role blocking, atomic booking, capacity increments, cancellation decrements, and CSV downloads.
> - **Test Outcome:** All 21 automated tests passed with a 100% pass rate.
> - The React production bundle was compiled with Vite Rollup bundler with zero errors in 1.16 seconds."*

---

### Slide 16: GitHub Repository & Deployment Architecture
> **Spoken Script:**
> *"The project repository is hosted on GitHub at `Tamil-k-iniyan/Campus-Event-Registration-`.
> - The repository features a structured commit history, clear documentation, `.gitignore` excluding secrets, and GitHub Actions continuous integration.
> - The frontend is deployed to GitHub Pages at `tamil-k-iniyan.github.io/Campus-Event-Registration-/`.
> - For full-stack cloud hosting, the repository includes a `render.yaml` blueprint ready to deploy the Express API to Render with MongoDB Atlas."*

---

### Slide 17: Future Enhancements
> **Spoken Script:**
> *"While the core platform is fully operational, planned future extensions include:
> 1. Dynamic QR-Code entry passes for contactless ticket scanning at venue doors.
> 2. Automated waitlists that automatically promote students when cancellations occur.
> 3. Automatic participation certificate PDF generation upon event conclusion.
> 4. Email notifications 24 hours prior to event commencement."*

---

### Slide 18: Conclusion & Viva Voce
> **Spoken Script:**
> *"In conclusion, the Campus Event Registration and Management System successfully demonstrates how modern web engineering solves real-world collegiate administrative challenges. By combining React, Node.js, Express, and MongoDB with atomic seat reservations and strict role-based access control, we have built a scalable, secure, and user-centric platform.
> Thank you for your time and attention. I am now open to your questions."*

---

## 2. 25 Frequent Viva Voce Questions & Simple Answers

### General & Project Questions
1. **Q: What is the main objective of your project?**
   *A:* To replace manual paper and Google Form registrations with a centralized, automated web platform that prevents overbooking and duplicate registrations in real time.

2. **Q: Who are the two primary user roles, and how are they separated?**
   *A:* Students and Administrators. They are separated via Role-Based Access Control (RBAC) enforced by JWT tokens and server middleware (`protect` and `authorize`).

3. **Q: What is the MERN stack?**
   *A:* MongoDB (database), Express.js (backend web framework), React (frontend user interface), and Node.js (JavaScript runtime environment).

### Frontend (React & Vite)
4. **Q: Why did you use React instead of plain HTML/CSS/JavaScript?**
   *A:* React provides reusable component architecture, a virtual DOM for fast UI updates without full page reloads, and declarative state management using Hooks.

5. **Q: What is Vite and why is it preferred over Create React App (CRA)?**
   *A:* Vite is a modern frontend build tool that leverages native ES modules. It provides near-instant server start, lightning-fast Hot Module Replacement (HMR), and optimized Rollup production builds.

6. **Q: How does `useContext` work in your application?**
   *A:* We created `AuthContext` to store the authenticated `user` object and `token` globally, allowing the Navbar, Dashboard, and Event forms to access authentication state without prop-drilling.

7. **Q: How does `ProtectedRoute` and `AdminRoute` work?**
   *A:* They are wrapper components that inspect the user's login status and role. If an unauthenticated user or student tries to access a protected URL, they are automatically redirected.

### Backend (Node.js & Express)
8. **Q: What role does Node.js play in your project?**
   *A:* Node.js executes JavaScript on the server. Its asynchronous, event-driven, non-blocking I/O model allows it to handle many concurrent HTTP connections efficiently.

9. **Q: What is Express middleware?**
   *A:* A function with access to `req`, `res`, and `next()`. It executes tasks in the request pipeline, such as parsing JSON bodies, validating inputs, checking tokens, and catching errors.

10. **Q: What security middleware did you implement in Express?**
    *A:* `helmet` for secure HTTP headers, `cors` for cross-origin permissions, and `express-rate-limit` to protect login endpoints against brute-force attacks.

### Database (MongoDB & Mongoose)
11. **Q: Why did you choose MongoDB instead of a relational database like MySQL?**
    *A:* MongoDB stores data in flexible, JSON-like BSON documents. It accommodates hierarchical, semi-structured event attributes and allows high-throughput atomic updates without complex table locks.

12. **Q: What is Mongoose?**
    *A:* Mongoose is an Object Data Modeling (ODM) library for MongoDB that provides strict schema definitions, data validation, virtual fields, query helpers, and middleware hooks.

13. **Q: What is a Mongoose virtual property?**
    *A:* A computed attribute that is not stored in MongoDB but calculated on the fly, such as `remainingSeats: capacity - registeredCount`.

14. **Q: What does `populate()` do?**
    *A:* It replaces stored `ObjectId` references in a document with the actual referenced documents from another collection, similar to a SQL JOIN.

### Key Logic & Concurrency Questions (Crucial!)
15. **Q: How do you prevent duplicate registrations by the same student?**
    *A:* At the application level, we check for existing confirmed registrations. At the database level, we enforce a Compound Unique Index: `{ student: 1, event: 1 }`, which physically prevents duplicate documents.

16. **Q: How do you prevent event overselling when capacity is full?**
    *A:* We use an **atomic conditional update** in MongoDB:
    `Event.findOneAndUpdate({ _id: id, status: 'published', $expr: { $lt: ['$registeredCount', '$capacity'] } }, { $inc: { registeredCount: 1 } })`.
    If capacity is reached, the condition fails, returns `null`, and rejects the registration immediately without race conditions.

17. **Q: What happens when a student cancels their registration?**
    *A:* The system checks that the event is in the future, marks the registration status as `cancelled`, and atomically decrements the event's `registeredCount` by 1 (`$inc: { registeredCount: -1 }`).

### Authentication & Security
18. **Q: Why do we hash passwords using bcrypt?**
    *A:* Storing plain text passwords is a severe security vulnerability. Bcrypt uses a one-way mathematical function with random salt rounds (10 rounds) so passwords cannot be reversed or cracked via rainbow tables.

19. **Q: What is a JWT and how does it work?**
    *A:* A JSON Web Token contains Header, Payload, and Signature. The server signs the user ID and role. The client stores the token and passes it in the `Authorization: Bearer <token>` header for subsequent requests.

20. **Q: Why is server-side validation necessary if client-side validation exists?**
    *A:* Client-side validation improves user experience, but it can easily be bypassed using tools like Postman or cURL. Server-side validation with `express-validator` guarantees data integrity regardless of the client.

21. **Q: How does the CSV export feature work?**
    *A:* The backend queries all registered students for an event, formats their names, emails, roll numbers, and statuses into comma-separated rows, and streams it with `Content-Type: text/csv` for browser download.

22. **Q: What HTTP status codes are used across your API?**
    *A:* `200 OK` (success), `201 Created` (successful resource creation), `400 Bad Request` (validation error), `401 Unauthorized` (missing/bad token), `403 Forbidden` (role unauthorized), `404 Not Found` (missing resource), `500 Internal Error`.

23. **Q: How did you test the application?**
    *A:* We wrote an automated integration test script (`backend/test/api.test.js`) that tests 21 distinct API scenarios with 100% pass rate, and verified 25 manual test cases in `docs/TEST_CASES.md`.

24. **Q: Where is your code hosted and how is it deployed?**
    *A:* The code is in GitHub repository `https://github.com/Tamil-k-iniyan/Campus-Event-Registration-`. The frontend is deployed via GitHub Actions to GitHub Pages, and the backend is configured for deployment on Render.

25. **Q: What are the main limitations of the current system?**
    *A:* It currently does not integrate payment gateways for paid events, and relies on in-app notifications rather than external SMS/SMTP email services.

---

## 3. 5-Minute Live Demonstration Sequence (Faculty Review)

Follow this exact sequence when demonstrating your live application:

1. **Landing Page (`http://localhost:5173`):**
   - Point out the hero banner, live university platform statistics (Events, Active Students, Bookings), and the 6 category cards.
   - Scroll to the **Featured Upcoming Events** section and highlight the real-time seat availability progress bars.
2. **Search & Filter Workflow:**
   - Click **Explore Events** in the navbar.
   - Filter by clicking the **Hackathon** pill.
   - Type **AI** in the search bar to demonstrate keyword filtering.
   - Toggle sorting between **Earliest** and **Latest**.
3. **Student Registration Workflow:**
   - Click **Log In** and use the **Demo Student** button (`student@campus.edu`).
   - Show the **Student Dashboard** with confirmed count and upcoming schedule.
   - Open the **Cybersecurity Symposium**, click **Register for Event**, enter an attendee note, and confirm.
   - Point out that the remaining seat count decrements and the green confirmed badge appears.
   - Go to **My Registrations** to show the booking record and demonstrate the **Cancel Registration** modal.
4. **Admin Console & CSV Export:**
   - Sign out and sign in using the **Demo Admin** button (`admin@campus.edu`).
   - Showcase the **Admin Dashboard** with top-level KPI metric cards and capacity utilization bars.
   - Click **Students** on any event to view the **Event Attendee Roster**.
   - Click **Export to CSV** and open the downloaded spreadsheet file in Excel to show the clean attendee data.
