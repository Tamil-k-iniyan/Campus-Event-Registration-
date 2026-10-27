# Test Suite & Verification Matrix

## Campus Event Registration and Management System

### Summary
- **Total Test Cases Executed:** 25
- **Passed:** 25
- **Failed:** 0
- **Pass Rate:** 100%

---

### Detailed Test Cases

| ID | Test Category | Test Case Scenario | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Auth | Student valid registration | Name, unique email, 6+ char password, match confirmPassword | 201 Created, JWT token and user profile returned | Token returned, user created in MongoDB | **PASS** |
| **TC02** | Auth | Duplicate student registration | Same registered email | 400 Bad Request: "An account with this email address already exists" | 400 returned with duplicate message | **PASS** |
| **TC03** | Auth | Password mismatch | Password != confirmPassword | 400 Bad Request: "Passwords do not match" | 400 returned, validation error caught | **PASS** |
| **TC04** | Auth | Short password (< 6 chars) | Password "123" | 400 Bad Request: "Password must be at least 6 characters long" | 400 returned with field error | **PASS** |
| **TC05** | Auth | Valid login | Registered email + correct password | 200 OK, JWT token and user role returned | 200 OK, token issued | **PASS** |
| **TC06** | Auth | Invalid password | Valid email + incorrect password | 401 Unauthorized: "Invalid email or password" | 401 Unauthorized | **PASS** |
| **TC07** | Auth | Non-existent user login | `unknown@campus.edu` | 401 Unauthorized (generic error prevents enumeration) | 401 Unauthorized | **PASS** |
| **TC08** | RBAC | Student access to admin API | GET `/api/admin/dashboard` with Student JWT | 403 Forbidden: User role 'student' is not authorized | 403 Forbidden returned | **PASS** |
| **TC09** | RBAC | Admin access to admin API | GET `/api/admin/dashboard` with Admin JWT | 200 OK with platform statistics | 200 OK with analytics data | **PASS** |
| **TC10** | RBAC | Unauthenticated access to private API | GET `/api/auth/me` without Bearer token | 401 Unauthorized: Not authorized to access this route | 401 Unauthorized | **PASS** |
| **TC11** | Events | Fetch public events feed | GET `/api/events` | 200 OK with published events array and pagination | 200 OK with count and array | **PASS** |
| **TC12** | Events | Category filter | GET `/api/events?category=Hackathon` | Only events with category 'Hackathon' returned | Filtered array returned | **PASS** |
| **TC13** | Events | Keyword search | GET `/api/events?search=Hackathon` | Matches events containing query in title or venue | Relevant events returned | **PASS** |
| **TC14** | Events | Admin create event | Valid event payload + Admin JWT | 201 Created with new event object | 201 Created in MongoDB | **PASS** |
| **TC15** | Events | Student cannot create event | POST `/api/events` with Student JWT | 403 Forbidden | 403 Forbidden | **PASS** |
| **TC16** | Events | Capacity boundary validation | Capacity = 0 or negative | 400 Bad Request: "Capacity must be a positive whole number" | 400 Bad Request | **PASS** |
| **TC17** | Events | Deadline after event date | Registration deadline > eventDate | 400 Bad Request: "Registration deadline cannot be after the event date" | 400 Bad Request | **PASS** |
| **TC18** | Registration | Student registers for open event | Valid event ID + Student JWT | 201 Created, seat reserved, registeredCount incremented | 201 Created, registeredCount incremented | **PASS** |
| **TC19** | Registration | Duplicate registration attempt | Same student registers twice | 400 Bad Request: "You have already registered for this event" | 400 Bad Request | **PASS** |
| **TC20** | Registration | Event maximum capacity full | Attempt booking when registeredCount == capacity | 400 Bad Request: "Event is already at maximum capacity" | 400 Bad Request, no oversell | **PASS** |
| **TC21** | Registration | Expired deadline booking | Attempt booking when now > registrationDeadline | 400 Bad Request: "Registration deadline has passed" | 400 Bad Request | **PASS** |
| **TC22** | Registration | Student cancels seat | DELETE `/api/registrations/:id` for upcoming event | 200 OK, status 'cancelled', registeredCount decremented | 200 OK, seat released atomically | **PASS** |
| **TC23** | Registration | Cancel past event | Attempt cancelling registration for concluded event | 400 Bad Request: "Cannot cancel registration for event that has already occurred" | 400 Bad Request | **PASS** |
| **TC24** | Admin | Query event attendees roster | GET `/api/admin/events/:id/registrations` | 200 OK with populated student names, emails, roll IDs | 200 OK with roster | **PASS** |
| **TC25** | Admin | Export attendee roster to CSV | GET `/api/admin/registrations/export/:id` | 200 OK with `text/csv` header and CSV spreadsheet data | 200 OK, valid CSV downloaded | **PASS** |
