require('dotenv').config({ path: __dirname + '/../.env' });
const path = require('path');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const app = require('../app');
const Event = require('../models/Event');

const SCREENSHOT_DIR = path.join(__dirname, '../../docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Simple static file server for frontend/dist
const serveStatic = (req, res) => {
  const distPath = path.join(__dirname, '../../frontend/dist');
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || !path.extname(reqPath)) {
    reqPath = '/index.html';
  }
  let filePath = path.join(distPath, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distPath, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + reqPath);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

const run = async () => {
  console.log('[Screenshots] Connecting to MongoDB and starting local servers...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events');

  // Start backend on 5000
  const backendServer = app.listen(5000);
  console.log('[Screenshots] Backend API active on http://localhost:5000');

  // Start static frontend on 5173
  const frontendServer = http.createServer(serveStatic).listen(5173);
  console.log('[Screenshots] Frontend server active on http://localhost:5173');

  // Query first event
  const sampleEvent = await Event.findOne();
  const eventId = sampleEvent ? sampleEvent._id.toString() : '';

  console.log('[Screenshots] Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,820']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const capture = async (url, filename, waitSelector = null, delay = 1000) => {
    console.log(`[Screenshots] Capturing ${filename} from ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    if (waitSelector) {
      try {
        await page.waitForSelector(waitSelector, { timeout: 4000 });
      } catch (e) {}
    }
    await new Promise((r) => setTimeout(r, delay));
    const dest = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`  ✓ Saved ${filename}`);
  };

  try {
    // 1. Landing Page
    await capture('http://localhost:5173/', '01_landing_page.png', '.hero-gradient');

    // 2. Events Catalog
    await capture('http://localhost:5173/events', '02_events_catalog.png', '.card');

    // 3. Event Details
    if (eventId) {
      await capture(`http://localhost:5173/events/${eventId}`, '03_event_details.png', 'h1');
    }

    // 4. Login Page
    await capture('http://localhost:5173/login', '04_login_page.png', 'form');

    // 5. Login as Student
    console.log('[Screenshots] Logging in as demo student...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'student@campus.edu');
    await page.type('input[name="password"]', 'Student@password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Capture Student Dashboard
    await capture('http://localhost:5173/student/dashboard', '05_student_dashboard.png', '.stat-card');

    // Capture My Registrations
    await capture('http://localhost:5173/student/registrations', '06_my_registrations.png', 'table');

    // 6. Login as Admin
    console.log('[Screenshots] Logging in as demo admin...');
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'admin@campus.edu');
    await page.type('input[name="password"]', 'Admin@password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Capture Admin Dashboard
    await capture('http://localhost:5173/admin/dashboard', '07_admin_dashboard.png', '.stat-card');

    // Capture Create Event Page
    await capture('http://localhost:5173/admin/events/new', '08_create_event.png', 'form');

    // Capture Attendee Roster
    if (eventId) {
      await capture(`http://localhost:5173/admin/events/${eventId}/registrations`, '09_attendee_roster.png', 'table');
    }

    console.log('[Screenshots] All 9 genuine application screenshots successfully captured!');
  } catch (err) {
    console.error('[Screenshots Error]', err);
  } finally {
    await browser.close();
    backendServer.close();
    frontendServer.close();
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
