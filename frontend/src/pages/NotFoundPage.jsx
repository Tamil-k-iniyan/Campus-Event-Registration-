import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 my-auto text-center">
      <div className="card border-0 shadow-sm p-5 mx-auto rounded-4 bg-white" style={{ maxWidth: '580px' }}>
        <div className="text-primary mb-3">
          <i className="bi bi-compass fs-1" style={{ fontSize: '4.5rem' }}></i>
        </div>
        <h1 className="display-4 fw-extrabold text-dark mb-2">404</h1>
        <h4 className="fw-bold text-dark mb-3">Page Not Found</h4>
        <p className="text-muted mb-4">
          The page or campus event resource you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-primary-gradient px-4 py-2 fw-semibold rounded-3">
            <i className="bi bi-house-door-fill me-2"></i> Return to Home
          </Link>
          <Link to="/events" className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3">
            <i className="bi bi-calendar-event me-2"></i> Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
