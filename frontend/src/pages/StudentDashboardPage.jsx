import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await registrationAPI.getMyRegistrations();
        setRegistrations(res.data.registrations || []);
      } catch (err) {
        console.error('Failed to fetch dashboard registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const now = new Date();
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed');
  const upcomingRegs = confirmedRegs.filter((r) => r.event && new Date(r.event.eventDate) >= now);
  const pastRegs = confirmedRegs.filter((r) => r.event && new Date(r.event.eventDate) < now);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Welcome Header */}
        <div className="card border-0 shadow-sm p-4 p-md-5 mb-4 bg-white rounded-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-1 rounded-pill mb-2">
                Student Portal
              </span>
              <h2 className="fw-bold text-dark mb-1">Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0 small">
                {user?.department || 'Department of Computer Science'} &bull; Roll ID: {user?.studentId || 'N/A'}
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/events" className="btn btn-primary-gradient px-4 py-2 fw-semibold rounded-3 shadow-sm">
                <i className="bi bi-compass me-2"></i> Browse Events
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-card shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-ticket-detailed-fill"></i>
              </div>
              <div>
                <h3 className="fw-bold mb-0 text-dark">{confirmedRegs.length}</h3>
                <span className="text-muted small">Total Confirmed</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <div>
                <h3 className="fw-bold mb-0 text-dark">{upcomingRegs.length}</h3>
                <span className="text-muted small">Upcoming Scheduled</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stat-card shadow-sm border-0 d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper bg-secondary bg-opacity-10 text-secondary">
                <i className="bi bi-award-fill"></i>
              </div>
              <div>
                <h3 className="fw-bold mb-0 text-dark">{pastRegs.length}</h3>
                <span className="text-muted small">Completed Events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Registered Events Section */}
        <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold text-dark mb-0">Upcoming Event Registrations</h5>
              <p className="text-muted small mb-0">Events you are scheduled to participate in</p>
            </div>
            <Link to="/student/registrations" className="btn btn-outline-secondary btn-sm fw-medium">
              View All History <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your registrations..." />
          ) : upcomingRegs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-plus fs-1 text-muted mb-3 d-block"></i>
              <h6 className="fw-bold">No Upcoming Registered Events</h6>
              <p className="text-muted small mb-3">You haven't reserved a seat for any upcoming campus events yet.</p>
              <Link to="/events" className="btn btn-primary btn-sm px-4">
                Explore Available Events
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="border-0">Event Title</th>
                    <th scope="col" className="border-0">Category</th>
                    <th scope="col" className="border-0">Event Date</th>
                    <th scope="col" className="border-0">Venue</th>
                    <th scope="col" className="border-0">Status</th>
                    <th scope="col" className="border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingRegs.map((reg) => (
                    <tr key={reg._id}>
                      <td>
                        <Link to={`/events/${reg.event._id}`} className="fw-semibold text-dark text-decoration-none">
                          {reg.event.title}
                        </Link>
                      </td>
                      <td>
                        <span className="badge-category">{reg.event.category}</span>
                      </td>
                      <td className="small text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(reg.event.eventDate)} ({reg.event.startTime})
                      </td>
                      <td className="small text-muted">{reg.event.venue}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                          Confirmed
                        </span>
                      </td>
                      <td className="text-end">
                        <Link to={`/events/${reg.event._id}`} className="btn btn-sm btn-outline-primary">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
