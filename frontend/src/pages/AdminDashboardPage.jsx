import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, eventAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      setStats(res.data.stats);
      setEvents(res.data.eventsList || []);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load administrator dashboard metrics.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await eventAPI.deleteEvent(deleteTarget._id);
      setAlert({
        type: 'success',
        message: `Event "${deleteTarget.title}" and its registrations were deleted successfully.`
      });
      setDeleteTarget(null);
      fetchDashboardData();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete event.'
      });
    } finally {
      setActionLoading(false);
    }
  };

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
        {/* Admin Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="badge bg-danger bg-opacity-10 text-danger fw-bold px-3 py-1 rounded-pill mb-2">
              <i className="bi bi-shield-fill-check me-1"></i> Admin Console
            </span>
            <h1 className="fw-bold text-dark mb-1">Campus Events Administration</h1>
            <p className="text-muted small mb-0">Overview of campus registrations, capacity analytics, and event rosters</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/events/new" className="btn btn-primary-gradient px-4 py-2 fw-semibold rounded-3 shadow-sm">
              <i className="bi bi-plus-circle-fill me-2"></i> Create New Event
            </Link>
          </div>
        </div>

        {alert && (
          <AlertToast
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {loading ? (
          <LoadingSpinner fullPage message="Loading administrative metrics..." />
        ) : (
          <>
            {/* KPI Stat Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3 col-sm-6">
                <div className="stat-card shadow-sm border-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Total Events</span>
                    <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-calendar-range-fill"></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-0">{stats?.totalEvents || 0}</h2>
                  <div className="small text-muted mt-1">Across all categories</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="stat-card shadow-sm border-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Upcoming</span>
                    <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
                      <i className="bi bi-calendar-check-fill"></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-0">{stats?.upcomingEvents || 0}</h2>
                  <div className="small text-muted mt-1">Open for attendance</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="stat-card shadow-sm border-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Students</span>
                    <div className="stat-icon-wrapper bg-indigo bg-opacity-10 text-primary">
                      <i className="bi bi-mortarboard-fill"></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-0">{stats?.totalStudents || 0}</h2>
                  <div className="small text-muted mt-1">Registered student profiles</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="stat-card shadow-sm border-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-muted small fw-bold text-uppercase">Bookings</span>
                    <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
                      <i className="bi bi-ticket-perforated-fill"></i>
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-0">{stats?.confirmedRegistrations || 0}</h2>
                  <div className="small text-muted mt-1">Confirmed event reservations</div>
                </div>
              </div>
            </div>

            {/* Events Management Table */}
            <div className="card border-0 shadow-sm p-4 bg-white rounded-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Events Catalog & Seat Capacity</h5>
                <span className="text-muted small">{events.length} events loaded</span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="border-0">Event Title</th>
                      <th scope="col" className="border-0">Category</th>
                      <th scope="col" className="border-0">Event Date</th>
                      <th scope="col" className="border-0">Venue</th>
                      <th scope="col" className="border-0" style={{ minWidth: '150px' }}>Capacity Utilization</th>
                      <th scope="col" className="border-0">Status</th>
                      <th scope="col" className="border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt) => {
                      const registered = evt.registeredCount || 0;
                      const cap = evt.capacity;
                      const percent = Math.min(100, Math.round((registered / cap) * 100));

                      return (
                        <tr key={evt._id}>
                          <td>
                            <Link to={`/events/${evt._id}`} className="fw-bold text-dark text-decoration-none">
                              {evt.title}
                            </Link>
                          </td>
                          <td>
                            <span className="badge-category">{evt.category}</span>
                          </td>
                          <td className="small text-muted">{formatDate(evt.eventDate)}</td>
                          <td className="small text-muted">{evt.venue}</td>
                          <td>
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>{registered} / {cap}</span>
                              <span className="fw-semibold">{percent}%</span>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                              <div
                                className={`progress-bar ${percent >= 90 ? 'bg-danger' : percent >= 70 ? 'bg-warning' : 'bg-primary'}`}
                                role="progressbar"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                evt.status === 'published'
                                  ? 'bg-success'
                                  : evt.status === 'closed'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                              }`}
                            >
                              {evt.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/admin/events/${evt._id}/registrations`}
                                className="btn btn-outline-primary"
                                title="View registered students"
                              >
                                <i className="bi bi-people-fill me-1"></i> Students
                              </Link>
                              <Link
                                to={`/admin/events/${evt._id}/edit`}
                                className="btn btn-outline-secondary"
                                title="Edit event"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(evt)}
                                className="btn btn-outline-danger"
                                title="Delete event"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All student registration records for this event will also be permanently removed.`}
        confirmText="Delete Event"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminDashboardPage;
