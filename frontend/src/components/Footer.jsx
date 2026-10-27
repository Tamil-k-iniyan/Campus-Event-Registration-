import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto" style={{ backgroundColor: 'var(--primary-navy)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3"
                style={{ width: '32px', height: '32px' }}
              >
                <i className="bi bi-calendar-event-fill fs-6"></i>
              </div>
              <h5 className="mb-0 fw-bold text-white">CampusEvents</h5>
            </div>
            <p className="text-secondary small mb-3">
              The unified digital platform for collegiate event discovery, seat reservation,
              and academic conference administration. Built for modern university ecosystems.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-secondary">React + Vite</span>
              <span className="badge bg-secondary">Node.js Express</span>
              <span className="badge bg-secondary">MongoDB</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Navigation</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none text-secondary hover-white">Home</Link></li>
              <li><Link to="/events" className="text-decoration-none text-secondary hover-white">All Events</Link></li>
              <li><Link to="/login" className="text-decoration-none text-secondary hover-white">Student Login</Link></li>
              <li><Link to="/register" className="text-decoration-none text-secondary hover-white">Registration</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Event Categories</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><Link to="/events?category=Technical" className="text-decoration-none text-secondary">Technical Symposia</Link></li>
              <li><Link to="/events?category=Hackathon" className="text-decoration-none text-secondary">Hackathons & Coding</Link></li>
              <li><Link to="/events?category=Workshop" className="text-decoration-none text-secondary">Workshops & Bootcamps</Link></li>
              <li><Link to="/events?category=Cultural" className="text-decoration-none text-secondary">Cultural Celebrations</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Campus Helpdesk</h6>
            <p className="text-secondary small mb-2">
              <i className="bi bi-geo-alt me-2 text-primary"></i>Student Activities Center, Main Campus
            </p>
            <p className="text-secondary small mb-2">
              <i className="bi bi-envelope me-2 text-primary"></i>events@campus.edu
            </p>
            <p className="text-secondary small mb-0">
              <i className="bi bi-telephone me-2 text-primary"></i>+1 (555) 019-2830
            </p>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <span className="text-secondary small">
              &copy; {new Date().getFullYear()} Campus Event Registration and Management System. All rights reserved.
            </span>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <span className="text-secondary small">
              College Web Technology Full-Stack Capstone Project
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
