require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database.');

    // Clear existing collections
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    console.log('[Seed] Cleared existing Users, Events, and Registrations.');

    // Create Admin User
    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@campus.edu',
      password: 'Admin@password123', // will be hashed by pre-save hook
      role: 'admin',
      phone: '+1 555-0199',
      department: 'Office of Student Affairs',
      studentId: 'FAC-9021'
    });

    // Create Demo Students
    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'student@campus.edu',
      password: 'Student@password123', // will be hashed by pre-save hook
      role: 'student',
      phone: '+1 555-0144',
      department: 'Computer Science & Engineering',
      studentId: 'CS2023001'
    });

    const student2 = await User.create({
      name: 'Maya Patel',
      email: 'maya.patel@campus.edu',
      password: 'Student@password123',
      role: 'student',
      phone: '+1 555-0177',
      department: 'Information Technology',
      studentId: 'IT2023045'
    });

    const student3 = await User.create({
      name: 'Liam Chen',
      email: 'liam.chen@campus.edu',
      password: 'Student@password123',
      role: 'student',
      phone: '+1 555-0188',
      department: 'Electrical & Electronics',
      studentId: 'EE2023089'
    });

    console.log('[Seed] Created default Admin and 3 Student accounts.');

    // Dates helpers
    const now = new Date();
    const inDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const pastDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    // Realistic Demo Events
    const demoEvents = [
      {
        title: 'National AI & Cloud Computing Hackathon 2026',
        description:
          'A 24-hour intensive coding marathon bringing together talented student developers to build generative AI solutions, cloud-native microservices, and sustainable smart campus applications. Free mentorship from industry engineers and exciting cash prizes.',
        category: 'Hackathon',
        eventDate: inDays(14),
        startTime: '09:00 AM',
        endTime: '09:00 AM (Next Day)',
        venue: 'Campus Innovation Center & Lab 4',
        organizer: 'Department of Computer Science & ACM Student Chapter',
        imageUrl:
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(10),
        capacity: 120,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Full-Stack Modern Web Engineering Workshop',
        description:
          'Hands-on masterclass focusing on React 18, Vite, Node.js microservices, MongoDB schema optimization, and secure JWT authentication. Attendees will build and deploy a live project during the session.',
        category: 'Workshop',
        eventDate: inDays(7),
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        venue: 'Tech Auditorium B, 3rd Floor',
        organizer: 'Web Technologies Club',
        imageUrl:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(5),
        capacity: 60,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Annual Inter-College Cultural Gala: Resonance 2026',
        description:
          'Experience the most anticipated cultural spectacle of the semester! Featuring vibrant dance competitions, acoustic music nights, theatrical drama, fashion runway, and food carnival from culinary clubs.',
        category: 'Cultural',
        eventDate: inDays(21),
        startTime: '05:30 PM',
        endTime: '10:00 PM',
        venue: 'Grand University Open-Air Amphitheatre',
        organizer: 'University Cultural Council',
        imageUrl:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(18),
        capacity: 350,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Inter-Departmental Badminton & Futsal Championship',
        description:
          'Compete for the Dean trophy in fast-paced knockout tournaments. Open to men and women doubles in badminton and 5-a-side futsal. Medals, jerseys, and refreshments provided.',
        category: 'Sports',
        eventDate: inDays(12),
        startTime: '08:00 AM',
        endTime: '06:00 PM',
        venue: 'University Sports Complex Indoor Arena',
        organizer: 'Campus Athletics & Physical Education Board',
        imageUrl:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(9),
        capacity: 80,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Executive Leadership & Industry 4.0 Seminar',
        description:
          'Distinguished guest lecture featuring senior engineering leads from top global tech firms discussing autonomous AI agents, ethical automation, and preparing students for competitive engineering careers.',
        category: 'Seminar',
        eventDate: inDays(18),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Dr. APJ Abdul Kalam Convention Hall',
        organizer: 'Industry-Institute Relations Cell',
        imageUrl:
          'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(15),
        capacity: 150,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Cybersecurity & Ethical Hacking Symposium',
        description:
          'Dive deep into penetration testing, network defense, reverse engineering, and threat mitigation. Features a live capture-the-flag (CTF) interactive contest with vulnerability discovery.',
        category: 'Technical',
        eventDate: inDays(25),
        startTime: '09:30 AM',
        endTime: '03:30 PM',
        venue: 'Cyber Defense Lab 2',
        organizer: 'Cyber Security Research Group',
        imageUrl:
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: inDays(22),
        capacity: 75,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      },
      {
        title: 'Campus Photography & Visual Arts Exhibition',
        description:
          'Showcasing stunning photographs, digital illustration, traditional canvas paintings, and student multimedia installations. Interactive jury critique and visitor choice award.',
        category: 'Cultural',
        eventDate: pastDays(10), // Past event for history and filter testing
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        venue: 'Student Activities Center - Central Gallery',
        organizer: 'Fine Arts & Photography Club',
        imageUrl:
          'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
        registrationDeadline: pastDays(12),
        capacity: 100,
        registeredCount: 0,
        status: 'published',
        createdBy: adminUser._id
      }
    ];

    const createdEvents = await Event.insertMany(demoEvents);
    console.log(`[Seed] Created ${createdEvents.length} demo events.`);

    // Seed registrations for the first student so their dashboard is pre-populated
    const reg1 = await Registration.create({
      student: student1._id,
      event: createdEvents[0]._id, // AI Hackathon
      status: 'confirmed',
      notes: 'Participating as team lead for generative AI project.'
    });

    const reg2 = await Registration.create({
      student: student1._id,
      event: createdEvents[1]._id, // Web Workshop
      status: 'confirmed',
      notes: 'Interested in React and backend API architecture.'
    });

    // Seed registrations for student2 and student3
    await Registration.create({
      student: student2._id,
      event: createdEvents[0]._id,
      status: 'confirmed',
      notes: 'Frontend developer and UI designer.'
    });

    await Registration.create({
      student: student3._id,
      event: createdEvents[0]._id,
      status: 'confirmed',
      notes: 'Backend and cloud infrastructure engineer.'
    });

    // Update registeredCount for seeded events
    await Event.findByIdAndUpdate(createdEvents[0]._id, { registeredCount: 3 });
    await Event.findByIdAndUpdate(createdEvents[1]._id, { registeredCount: 1 });

    console.log('[Seed] Seeded initial confirmed registrations.');
    console.log('--------------------------------------------------');
    console.log(' SEEDING COMPLETED SUCCESSFULLY');
    console.log(' Default Admin:   admin@campus.edu   / Admin@password123');
    console.log(' Default Student: student@campus.edu / Student@password123');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
