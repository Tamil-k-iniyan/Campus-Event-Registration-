# Comprehensive Viva Voce Preparation & Project Guide

## Campus Event Registration and Management System

---

### 1. Project Overview in Simple English
The **Campus Event Registration and Management System** is a full-stack web application designed for colleges and universities. It replaces slow, error-prone manual paper sign-up sheets and Google Forms with an automated digital platform:
- **Students** can discover upcoming hackathons, workshops, cultural fests, and sports leagues, check remaining seats in real time, register with a single click, view their booking history, and cancel reservations if their schedule changes.
- **Administrators and Faculty** can create and update events, set venue and capacity limits, track live attendee counts, view registered student rosters, search by student name/roll number, and download CSV rosters for attendance marking.

---

### 2. Technology Stack Justifications

#### Why React with Vite?
- **Component Reusability:** Modular components (e.g., `EventCard`, `Navbar`, `FormInput`) keep code DRY and maintainable.
- **Fast Virtual DOM:** Only modified elements re-render, ensuring instant UI updates when registering or filtering without full page reloads.
- **Vite Build Tool:** Extremely fast Hot Module Replacement (HMR) and optimized Rollup-based production bundling.

#### What Node.js and Express.js Do?
- **Node.js:** A JavaScript runtime built on Chrome's V8 engine that runs JavaScript on the server. Its asynchronous, non-blocking I/O model allows it to handle many concurrent HTTP connections efficiently.
- **Express.js:** A minimalist, flexible web framework on top of Node.js that provides routing, middleware pipeline execution, JSON request parsing, and error handling.

#### Why MongoDB and Mongoose?
- **MongoDB:** A NoSQL document database storing data in JSON-like BSON documents. It accommodates hierarchical, semi-structured event documents cleanly.
- **Mongoose ODM:** Provides an Object Data Modeling layer that enforces strict schemas, type validation, virtual properties (like `remainingSeats`), query population (similar to SQL JOIN), and pre-save password hashing hooks.

#### REST API Architecture
- **Representational State Transfer:** Uses standard HTTP methods:
  - `GET` to retrieve data (`/api/events`)
  - `POST` to create resources (`/api/auth/register`, `/api/events`, `/api/registrations/:id`)
  - `PUT` to update resources (`/api/events/:id`)
  - `DELETE` to remove/cancel resources (`/api/registrations/:id`, `/api/events/:id`)
- Stateless communication: each request contains all necessary credentials (JWT token).

#### JWT Authentication and Bcrypt
- **Bcrypt:** A one-way adaptive cryptographic hashing algorithm using random salt rounds (10 rounds in our project) to protect passwords against rainbow table and brute-force attacks.
- **JSON Web Tokens (JWT):** A compact, URL-safe standard (`RFC 7519`) comprising Header, Payload, and Signature. The backend cryptographically signs the user's ID and role. The frontend attaches this token in the `Authorization: Bearer <token>` header for subsequent requests.

#### Client-Side vs Server-Side Validation
- **Client-Side:** Gives immediate feedback to the student (e.g. invalid email format, mismatched passwords, empty fields) for superior user experience.
- **Server-Side:** The critical line of security. A malicious actor can bypass the browser using Postman or cURL. The Express validator checks data types, string lengths, dates, and database constraints before performing database writes.

---

### 3. Key Architecture Questions

#### How are duplicate registrations prevented?
Two complementary layers prevent duplicate registrations:
1. **Application Logic:** The `registrationController` queries `Registration.findOne({ student: studentId, event: eventId, status: 'confirmed' })` and returns `400 Bad Request` if an active registration already exists.
2. **Database-Level Compound Unique Index:** A compound unique index `{ student: 1, event: 1 }` is defined in MongoDB. Even if two concurrent requests race past the application check, the second write is rejected by MongoDB with error code `11000 (Duplicate Key Error)`.

#### How is event capacity enforced without race conditions?
Instead of a vulnerable two-step pattern (*read seat count, then save*), we execute an **atomic conditional update** in MongoDB:
```javascript
const updatedEvent = await Event.findOneAndUpdate(
  {
    _id: eventId,
    status: 'published',
    $expr: { $lt: ['$registeredCount', '$capacity'] }
  },
  { $inc: { registeredCount: 1 } },
  { new: true }
);
```
- If 1 seat remains and two students submit simultaneously, MongoDB processes writes sequentially. The first operation matches `$expr: { $lt: ['$registeredCount', '$capacity'] }` and increments `registeredCount`.
- The second operation evaluates the condition, finds that `registeredCount == capacity`, matches 0 documents, and returns `null`. The backend then sends an immediate `400 Event Full` response. Overselling is physically impossible.

---

### 4. 25 Frequent Viva Voce Questions & Answers

1. **Q: What is the MERN stack?**
   *A:* MERN stands for MongoDB (database), Express.js (backend framework), React (frontend library), and Node.js (runtime environment).

2. **Q: What is the role of `package.json`?**
   *A:* It is the manifest file containing project metadata, executable scripts (`start`, `dev`, `build`, `seed`, `test`), and dependency package versions.

3. **Q: Why don't we store passwords in plain text?**
   *A:* Storing plain text passwords exposes user credentials if the database is leaked. We hash passwords with `bcryptjs` and 10 salt rounds before saving.

4. **Q: What does the salt in bcrypt do?**
   *A:* A salt is random cryptographic data appended to the password before hashing, ensuring identical passwords produce completely different hash strings.

5. **Q: What is a JWT and what are its three parts?**
   *A:* A JSON Web Token contains Header (algorithm), Payload (claims/user data), and Signature (HMAC-SHA256 signature signed by the server's secret).

6. **Q: What does CORS stand for, and why is it needed?**
   *A:* Cross-Origin Resource Sharing. Browsers block scripts from making HTTP requests to a different origin (e.g. port 5173 to port 5000) unless the server permits it via CORS headers.

7. **Q: What is the purpose of the `useEffect` hook in React?**
   *A:* It performs side effects in functional components, such as fetching data from our Express REST API when a page loads or when dependency states change.

8. **Q: What is the purpose of `useContext` in React?**
   *A:* It enables global state sharing (like `user`, `token`, `login`, and `logout`) without prop drilling through intermediate components.

9. **Q: How does ProtectedRoute work?**
   *A:* It checks whether an authenticated user object exists. If unauthenticated, it redirects the visitor to `/login` while saving the attempted path.

10. **Q: How does AdminRoute prevent unauthorized access?**
    *A:* It checks `user.role === 'admin'`. If a student attempts to navigate directly to an admin URL, it renders an access restricted notice and redirects them.

11. **Q: Can a student elevate their role by modifying frontend code?**
    *A:* No. The Express backend verifies the cryptographically signed JWT on every private route using `protect` and `authorize('admin')` middleware. Server-side authorization cannot be bypassed by frontend tampering.

12. **Q: What is an index in MongoDB, and why did we add one on `eventDate`?**
    *A:* An index is a B-tree data structure that speeds up document lookups. Adding an index on `{ eventDate: 1, status: 1 }` allows the database to sort and filter upcoming events without scanning all documents in the collection.

13. **Q: What is a Mongoose virtual property?**
    *A:* A computed document property that is not stored in MongoDB but calculated on the fly, such as `remainingSeats: capacity - registeredCount`.

14. **Q: What does `populate()` do in Mongoose?**
    *A:* It automatically replaces a stored `ObjectId` reference with the corresponding document from another collection, equivalent to a SQL JOIN.

15. **Q: What is middleware in Express.js?**
    *A:* A function with access to `req`, `res`, and `next`. It intercepts incoming requests to perform tasks like parsing JSON, validating input, verifying JWT tokens, and logging.

16. **Q: What HTTP status codes are used in this project?**
    *A:* `200 OK` (success), `201 Created` (resource created), `400 Bad Request` (validation error), `401 Unauthorized` (missing/invalid token), `403 Forbidden` (role unauthorized), `404 Not Found` (resource missing), `500 Internal Server Error`.

17. **Q: What is atomic increment in MongoDB?**
    *A:* The `$inc` operator modifies a numeric field directly on the database engine level in a single uninterruptible step, preventing race conditions.

18. **Q: How does the application handle registration cancellation?**
    *A:* The student clicks Cancel. The backend checks if the event date is in the future. If valid, the registration status becomes `cancelled` and the event's `registeredCount` is decremented by 1.

19. **Q: How does the CSV export feature work?**
    *A:* The backend queries the registrations for the event, formats the student names, emails, and departments into standard comma-separated values, and streams it with `Content-Type: text/csv` and a download attachment header.

20. **Q: What is the purpose of `express-rate-limit`?**
    *A:* It protects the authentication endpoints from brute-force login attempts and denial-of-service by limiting the number of requests per IP window.

21. **Q: What is Helmet in Express?**
    *A:* A security middleware package that sets various HTTP response headers (Content-Security-Policy, X-Frame-Options, etc.) to defend against cross-site scripting and clickjacking.

22. **Q: What is the difference between `npm install` and `npm run build`?**
    *A:* `npm install` downloads dependencies listed in `package.json`. `npm run build` bundles, minifies, and optimizes source code into production static assets.

23. **Q: Why use environment variables (`.env`)?**
    *A:* To keep sensitive configurations (database connection strings, JWT secret keys, port numbers) outside of version control for security.

24. **Q: How does the search and filter functionality work?**
    *A:* The frontend sends query parameters (`search`, `category`, `timeframe`, `order`, `page`) to `GET /api/events`. The backend builds a MongoDB query object using `$regex` and `$gte`/`$lt` on dates and returns the filtered subset.

25. **Q: How does this system handle scalability?**
    *A:* Stateless JWT authentication allows horizontal scaling across multiple Node.js server instances, while indexed MongoDB queries and atomic operations maintain database consistency without locking entire tables.

---

### 5. Project Demonstration Script (Viva / Presentation Walkthrough)

Follow this 5-minute step-by-step procedure during your viva voce or faculty evaluation:

#### Step 1: Landing Page & Public Browsing
1. Open `http://localhost:5173`.
2. Point out the hero section, live platform statistics (Events, Active Students, Bookings), and category cards.
3. Show the Featured Upcoming Events section with real-time seat availability progress bars.
4. Click on **Explore Events** in the navigation bar.

#### Step 2: Search, Filter, and Pagination
1. Filter events by clicking the **Hackathon** category pill. Show that only hackathons display.
2. In the Search bar, type **Web** and click Search. Show that the workshop appears.
3. Change the sort order to **Latest First**.
4. Click **Reset Filters** to restore all events.

#### Step 3: Student Workflow (Login & Registration)
1. Click **Log In** in the top navigation.
2. Click the convenient **Demo Student** button to auto-fill `student@campus.edu` / `Student@password123`.
3. Click **Sign In**. Notice immediate redirect to the **Student Dashboard**.
4. Show the student's metrics: Total Confirmed, Upcoming Scheduled, and Completed Events.
5. Click **Explore Events**, select the **Cybersecurity & Ethical Hacking Symposium**, and click **View Details**.
6. Click **Register for Event**. Add an optional note: *"Interested in penetration testing track"*.
7. Click **Confirm Registration**. Point out that the seat is reserved, the available seat count decrements, and a green confirmed badge appears.
8. Go to **My Registrations**. Verify the new event is listed.
9. Click **Cancel** on a registration to show the confirmation modal and seat count incrementing back.
10. Navigate to **My Profile** and show how student roll number, phone, and department can be updated.

#### Step 4: Admin Workflow (Management & CSV Export)
1. Sign out and sign in using the **Demo Admin** button (`admin@campus.edu` / `Admin@password123`).
2. Notice the navbar changes to show **Admin Dashboard** and **Create Event**.
3. Open the **Admin Dashboard**: show the 4 live KPI cards (Total Events, Upcoming, Students, Confirmed Bookings).
4. Review the **Events Catalog & Seat Capacity** table with utilization bars.
5. Click **Students** on any event to view the **Event Attendee Roster**.
6. Use the student search box to search for a specific student name.
7. Click **Export to CSV**. Open the downloaded `.csv` file in Excel/Notepad to demonstrate the formatted student roster.
8. Click **Create New Event**, fill in title, venue, and capacity, and publish. Show that it immediately appears on the public events feed!
