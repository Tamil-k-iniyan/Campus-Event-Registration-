import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm" style={{ backgroundColor: 'var(--primary-navy) !important' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3"
            style={{ width: '38px', height: '38px' }}
          >
            <i className="bi bi-calendar-event-fill fs-5"></i>
          </div>
          <span>Campus<span className="text-primary">Events</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/events">
                Explore Events
              </NavLink>
            </li>
            {isAuthenticated && !isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/student/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/student/registrations">
                    My Registrations
                  </NavLink>
                </li>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/admin/dashboard">
                    Admin Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/admin/events/new">
                    Create Event
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary-gradient btn-sm px-3">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-6"></i>
                  <span>{user?.name}</span>
                  <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} ms-1`} style={{ fontSize: '0.65rem' }}>
                    {isAdmin ? 'ADMIN' : 'STUDENT'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{user?.name}</div>
                    <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{user?.email}</div>
                  </li>
                  {isAdmin ? (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/dashboard">
                          <i className="bi bi-speedometer2 me-2 text-primary"></i>Admin Panel
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/events/new">
                          <i className="bi bi-plus-circle me-2 text-success"></i>New Event
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/dashboard">
                          <i className="bi bi-grid me-2 text-primary"></i>My Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/profile">
                          <i className="bi bi-person-gear me-2 text-secondary"></i>My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/registrations">
                          <i className="bi bi-ticket-perforated me-2 text-info"></i>Registrations
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
