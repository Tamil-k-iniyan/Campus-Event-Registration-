import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';
import ConfirmationModal from '../components/ConfirmationModal';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [alert, setAlert] = useState(null);

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regNotes, setRegNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Admin delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getEventById(id);
      setEvent(res.data.event);
      setIsRegistered(res.data.isUserRegistered);
      setRegistrationId(res.data.registrationId);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load event details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      const res = await registrationAPI.registerForEvent(id, regNotes);
      setIsRegistered(true);
      setRegistrationId(res.data.registration._id);
      setShowRegModal(false);
      setAlert({
        type: 'success',
        message: 'Successfully registered for this event! Your seat has been reserved.'
      });
      // Refresh event capacity
      fetchEvent();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationId) return;
    setActionLoading(true);
    try {
      await registrationAPI.cancelRegistration(registrationId);
      setIsRegistered(false);
      setRegistrationId(null);
      setShowCancelModal(false);
      setAlert({
        type: 'info',
        message: 'Your event registration has been cancelled.'
      });
      fetchEvent();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Cancellation failed.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setActionLoading(true);
    try {
      await eventAPI.deleteEvent(id);
      navigate('/events', { replace: true });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete event.'
      });
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching event details..." />;
  }

  if (!event) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border-0 shadow-sm max-w-md mx-auto">
          <i className="bi bi-calendar-x fs-1 text-danger mb-3"></i>
          <h3>Event Not Found</h3>
          <p className="text-muted">The requested event could not be found or may have been removed.</p>
          <Link to="/events" className="btn btn-primary btn-sm mx-auto">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const remainingSeats = Math.max(0, event.capacity - (event.registeredCount || 0));
  const isFull = remainingSeats <= 0;
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isEventPast = new Date() > new Date(event.eventDate);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/events" className="text-decoration-none">Events</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
          </ol>
        </nav>

        {alert && (
          <AlertToast
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="row g-4">
          {/* Main Content Column */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm overflow-hidden mb-4 bg-white">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-100"
                style={{ maxHeight: '420px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <div className="p-4 p-md-5">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge-category">{event.category}</span>
                  <span className={`badge ${event.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                    {event.status.toUpperCase()}
                  </span>
                  {isEventPast && <span className="badge bg-secondary">EVENT CONCLUDED</span>}
                </div>

                <h1 className="fw-bold text-dark mb-4">{event.title}</h1>

                <h5 className="fw-bold text-dark mb-3">About This Event</h5>
                <p className="text-secondary leading-relaxed mb-4" style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.8' }}>
                  {event.description}
                </p>

                <hr className="my-4" />

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary flex-shrink-0">
                        <i className="bi bi-geo-alt-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Campus Venue</h6>
                        <p className="text-muted small mb-0">{event.venue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success flex-shrink-0">
                        <i className="bi bi-person-badge-fill"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">Event Organizer</h6>
                        <p className="text-muted small mb-0">{event.organizer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Sidebar Column */}
          <div className="col-lg-4">
            {/* Registration Card */}
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white sticky-top" style={{ top: '90px' }}>
              <h5 className="fw-bold text-dark mb-3">Registration Status</h5>

              {/* Event Time & Schedule */}
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-calendar-event text-primary fs-5"></i>
                  <div>
                    <div className="small text-muted">Event Date</div>
                    <div className="fw-bold small">{formatDate(event.eventDate)}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-clock-fill text-primary fs-5"></i>
                  <div>
                    <div className="small text-muted">Time Schedule</div>
                    <div className="fw-bold small">{event.startTime} - {event.endTime}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-alarm-fill text-danger fs-5"></i>
                  <div>
                    <div className="small text-muted">Registration Deadline</div>
                    <div className="fw-bold small text-danger">{formatDate(event.registrationDeadline)}</div>
                  </div>
                </div>
              </div>

              {/* Capacity Progress */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-semibold">Seat Availability</span>
                  <span className="small fw-bold text-dark">
                    {remainingSeats} of {event.capacity} seats left
                  </span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className={`progress-bar ${remainingSeats === 0 ? 'bg-danger' : 'bg-primary'}`}
                    role="progressbar"
                    style={{ width: `${Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons based on User Role & Status */}
              <div className="d-grid gap-2">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/events/${id}` } }}
                    className="btn btn-primary-gradient py-2 fw-semibold"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i> Sign In to Register
                  </Link>
                ) : isRegistered ? (
                  <>
                    <div className="alert alert-success d-flex align-items-center py-2 px-3 mb-2 small fw-semibold">
                      <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                      You are officially registered!
                    </div>
                    {!isEventPast && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="btn btn-outline-danger py-2 fw-semibold"
                      >
                        <i className="bi bi-x-circle me-1"></i> Cancel Registration
                      </button>
                    )}
                  </>
                ) : isAdmin ? (
                  <div className="alert alert-info py-2 px-3 small">
                    <i className="bi bi-shield-fill-check me-2"></i>
                    Signed in as Administrator. Use admin tools below to manage this event.
                  </div>
                ) : isEventPast ? (
                  <button className="btn btn-secondary py-2 fw-semibold" disabled>
                    Event Already Concluded
                  </button>
                ) : isDeadlinePassed ? (
                  <button className="btn btn-secondary py-2 fw-semibold" disabled>
                    Registration Deadline Passed
                  </button>
                ) : isFull ? (
                  <button className="btn btn-danger py-2 fw-semibold" disabled>
                    Event At Maximum Capacity
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRegModal(true)}
                    className="btn btn-primary-gradient py-2 fw-semibold shadow-sm"
                  >
                    <i className="bi bi-ticket-perforated-fill me-2"></i> Register for Event
                  </button>
                )}
              </div>

              {/* Admin Management Tools */}
              {isAdmin && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-muted small text-uppercase mb-3">Admin Controls</h6>
                  <div className="d-grid gap-2">
                    <Link
                      to={`/admin/events/${id}/registrations`}
                      className="btn btn-outline-primary btn-sm fw-medium d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-people-fill"></i> View Registered Students ({event.registeredCount || 0})
                    </Link>
                    <Link
                      to={`/admin/events/${id}/edit`}
                      className="btn btn-outline-secondary btn-sm fw-medium d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-pencil-square"></i> Edit Event Details
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn btn-outline-danger btn-sm fw-medium d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-trash-fill"></i> Delete Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Registration Modal */}
      {showRegModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">Confirm Registration</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRegModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body px-4 py-3">
                <div className="alert alert-light border small mb-3">
                  <div className="fw-bold text-dark">{event.title}</div>
                  <div className="text-muted">{formatDate(event.eventDate)} &bull; {event.venue}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Student Name</label>
                  <input type="text" className="form-control" value={user?.name || ''} disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">College Email</label>
                  <input type="email" className="form-control" value={user?.email || ''} disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Special Notes / Requirements (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Dietary preferences, team name, laptop requirements..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 pb-4 px-4 gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => setShowRegModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary-gradient px-4 fw-semibold"
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Confirming...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Event Registration"
        message="Are you sure you want to cancel your seat for this event? Your seat will be made available to other students immediately."
        confirmText="Yes, Cancel Seat"
        confirmVariant="danger"
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelModal(false)}
        loading={actionLoading}
      />

      {/* Admin Delete Event Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${event.title}"? All student registration records for this event will also be deleted.`}
        confirmText="Yes, Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteModal(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default EventDetailsPage;
