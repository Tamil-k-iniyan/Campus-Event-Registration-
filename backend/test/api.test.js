const mongoose = require('mongoose');
const http = require('http');
const app = require('../app');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const PORT = 5002;
let server;
let baseUrl = `http://127.0.0.1:${PORT}/api`;

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, rawHeaders: res.headers });
        } catch {
          resolve({ status: res.statusCode, rawBody: data, rawHeaders: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('=== STARTING AUTOMATED API TEST SUITE ===\n');

  try {
    // 1. Connect DB and start test server
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events';
    await mongoose.connect(mongoUri);
    console.log('[Test DB] Connected to MongoDB');

    server = app.listen(PORT);
    console.log(`[Test Server] Running on http://127.0.0.1:${PORT}\n`);

    let passed = 0;
    let failed = 0;

    const assert = (condition, title) => {
      if (condition) {
        console.log(`  ✓ PASS: ${title}`);
        passed++;
      } else {
        console.error(`  ✗ FAIL: ${title}`);
        failed++;
      }
    };

    // TEST 1: Health check
    console.log('Test Group 1: Health & Public Endpoints');
    const health = await makeRequest('GET', '/health');
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // TEST 2: List public events
    const eventsRes = await makeRequest('GET', '/events?category=All');
    assert(eventsRes.status === 200 && Array.isArray(eventsRes.body.events), 'GET /api/events returns event list');
    const firstEvent = eventsRes.body.events[0];
    assert(firstEvent && firstEvent.title, 'Events have title and schema attributes');

    // TEST 3: Auth - Login Demo Admin
    console.log('\nTest Group 2: Authentication & Authorization');
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@campus.edu',
      password: 'Admin@password123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, 'POST /api/auth/login authenticates admin successfully');
    const adminToken = adminLogin.body.token;

    // TEST 4: Auth - Login Demo Student
    const studentLogin = await makeRequest('POST', '/auth/login', {
      email: 'student@campus.edu',
      password: 'Student@password123'
    });
    assert(studentLogin.status === 200 && studentLogin.body.token, 'POST /api/auth/login authenticates student successfully');
    const studentToken = studentLogin.body.token;

    // TEST 5: Auth - Rejection on invalid credentials
    const invalidLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@campus.edu',
      password: 'WrongPassword'
    });
    assert(invalidLogin.status === 401, 'POST /api/auth/login rejects invalid password with 401');

    // TEST 6: Student Register new test account
    const testEmail = `test_student_${Date.now()}@campus.edu`;
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Automated Tester',
      email: testEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      department: 'Computer Science & Engineering',
      phone: '+1 555-9988'
    });
    assert(regRes.status === 201 && regRes.body.token, 'POST /api/auth/register creates new student account');
    const newStudentToken = regRes.body.token;

    // TEST 7: Duplicate email rejection
    const dupReg = await makeRequest('POST', '/auth/register', {
      name: 'Duplicate Tester',
      email: testEmail,
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    assert(dupReg.status === 400, 'POST /api/auth/register rejects duplicate email with 400');

    // TEST 8: Protected Route - Student Profile
    const meRes = await makeRequest('GET', '/auth/me', null, newStudentToken);
    assert(meRes.status === 200 && meRes.body.user.email === testEmail, 'GET /api/auth/me returns authenticated profile');

    // TEST 9: Student forbidden from Admin endpoint
    console.log('\nTest Group 3: Role-Based Access Control');
    const forbiddenRes = await makeRequest('GET', '/admin/dashboard', null, newStudentToken);
    assert(forbiddenRes.status === 403, 'GET /api/admin/dashboard blocks student with 403 Forbidden');

    // TEST 10: Admin allowed on Admin dashboard
    const adminDashRes = await makeRequest('GET', '/admin/dashboard', null, adminToken);
    assert(adminDashRes.status === 200 && adminDashRes.body.stats, 'GET /api/admin/dashboard grants admin access with statistics');

    // TEST 11: Admin Create Event
    console.log('\nTest Group 4: Event CRUD Operations');
    const newEventRes = await makeRequest('POST', '/events', {
      title: 'Automated Test Symposium 2026',
      description: 'A comprehensive testing symposium to verify event creation and atomic booking.',
      category: 'Technical',
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      venue: 'Lab 101',
      organizer: 'Quality Engineering Board',
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 25,
      status: 'published'
    }, adminToken);
    assert(newEventRes.status === 201 && newEventRes.body.event._id, 'POST /api/events creates event with admin token');
    const createdEventId = newEventRes.body.event._id;

    // TEST 12: Atomic Registration for Event
    console.log('\nTest Group 5: Registration Workflow & Atomic Capacity Management');
    const bookRes = await makeRequest('POST', `/registrations/${createdEventId}`, {
      notes: 'Testing seat reservation'
    }, newStudentToken);
    assert(bookRes.status === 201 && bookRes.body.registration, 'POST /api/registrations/:id registers student for event');
    const registrationId = bookRes.body.registration._id;

    // Verify seat count was incremented
    const checkEvt = await makeRequest('GET', `/events/${createdEventId}`);
    assert(checkEvt.body.event.registeredCount === 1, 'Event registeredCount atomically incremented to 1');

    // TEST 13: Prevent Duplicate Registration by same student
    const dupBook = await makeRequest('POST', `/registrations/${createdEventId}`, null, newStudentToken);
    assert(dupBook.status === 400, 'POST /api/registrations/:id prevents duplicate registration with 400');

    // TEST 14: Get Student's registrations
    const myRegs = await makeRequest('GET', '/registrations/my', null, newStudentToken);
    assert(myRegs.status === 200 && myRegs.body.registrations.length >= 1, 'GET /api/registrations/my lists active registration');

    // TEST 15: Admin view registered students for the event
    const attendeesRes = await makeRequest('GET', `/admin/events/${createdEventId}/registrations`, null, adminToken);
    assert(attendeesRes.status === 200 && attendeesRes.body.registrations.length === 1, 'GET /api/admin/events/:id/registrations shows attendee');

    // TEST 16: Admin export CSV
    const csvRes = await makeRequest('GET', `/admin/registrations/export/${createdEventId}`, null, adminToken);
    assert(csvRes.status === 200 && csvRes.rawHeaders['content-type'].includes('text/csv'), 'GET /api/admin/registrations/export/:id returns CSV file stream');

    // TEST 17: Cancel Registration & Verify Capacity Increment
    const cancelRes = await makeRequest('DELETE', `/registrations/${registrationId}`, null, newStudentToken);
    assert(cancelRes.status === 200, 'DELETE /api/registrations/:id cancels registration successfully');

    const checkEvtAfterCancel = await makeRequest('GET', `/events/${createdEventId}`);
    assert(checkEvtAfterCancel.body.event.registeredCount === 0, 'Event registeredCount atomically decremented back to 0');

    // TEST 18: Admin Delete Event
    const delEventRes = await makeRequest('DELETE', `/events/${createdEventId}`, null, adminToken);
    assert(delEventRes.status === 200, 'DELETE /api/events/:id deletes event and cleans up dependencies');

    // Cleanup test user
    await User.deleteOne({ email: testEmail });

    console.log('\n===============================================');
    console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================\n');

    server.close();
    await mongoose.connection.close();

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
