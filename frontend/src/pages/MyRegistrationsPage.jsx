import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';
import ConfirmationModal from '../components/ConfirmationModal';

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Cancel modal state
  const [selectedReg, setSelectedReg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationAPI.getMyRegistrations();
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to fetch registration records.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelClick = (reg) => {
    setSelectedReg(reg);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReg) return;
    setActionLoading(true);
    try {
      await registrationAPI.cancelRegistration(selectedReg._id);
      setAlert({
        type: 'success',
        message: `Registration for "${selectedReg.event.title}" has been cancelled successfully.`
      });
      setSelectedReg(null);
      fetchRegistrations();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel registration.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const now = new Date();

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1">My Registrations</h1>
            <p className="text-muted small mb-0">Complete record of your event reservations and booking status</p>
          </div>
          <Link to="/events" className="btn btn-primary-gradient btn-sm px-3 fw-semibold">
            <i className="bi bi-plus-circle me-1"></i> Explore New Events
          </Link>
        </div>

        {alert && (
          <AlertToast
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
          {loading ? (
            <LoadingSpinner message="Loading your event history..." />
          ) : registrations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-ticket-perforated fs-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold">No Event Registrations</h5>
              <p className="text-muted small mb-3">You haven't registered for any events yet.</p>
              <Link to="/events" className="btn btn-primary px-4 fw-medium">
                Find Events to Attend
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="border-0">Event Name</th>
                    <th scope="col" className="border-0">Category</th>
                    <th scope="col" className="border-0">Event Date & Time</th>
                    <th scope="col" className="border-0">Venue</th>
                    <th scope="col" className="border-0">Registration Status</th>
                    <th scope="col" className="border-0">Registered On</th>
                    <th scope="col" className="border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => {
                    const isEventPast = reg.event && new Date(reg.event.eventDate) < now;
                    const canCancel = reg.status === 'confirmed' && !isEventPast;

                    return (
                      <tr key={reg._id}>
                        <td>
                          {reg.event ? (
                            <Link to={`/events/${reg.event._id}`} className="fw-bold text-dark text-decoration-none">
                              {reg.event.title}
                            </Link>
                          ) : (
                            <span className="text-muted fst-italic">Event deleted</span>
                          )}
                        </td>
                        <td>
                          {reg.event && <span className="badge-category">{reg.event.category}</span>}
                        </td>
                        <td className="small text-muted">
                          {reg.event ? (
                            <>
                              <div>{formatDate(reg.event.eventDate)}</div>
                              <div className="text-xs">{reg.event.startTime} - {reg.event.endTime}</div>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="small text-muted">{reg.event?.venue || '-'}</td>
                        <td>
                          {reg.status === 'confirmed' ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                              <i className="bi bi-check-circle-fill me-1"></i> Confirmed
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">
                              <i className="bi bi-x-circle-fill me-1"></i> Cancelled
                            </span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {reg.event && (
                              <Link
                                to={`/events/${reg.event._id}`}
                                className="btn btn-sm btn-outline-secondary"
                                title="View event details"
                              >
                                View
                              </Link>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancelClick(reg)}
                                className="btn btn-sm btn-outline-danger"
                                title="Cancel registration"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedReg}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your seat for "${selectedReg?.event?.title}"?`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedReg(null)}
        loading={actionLoading}
      />
    </div>
  );
};

export default MyRegistrationsPage;
