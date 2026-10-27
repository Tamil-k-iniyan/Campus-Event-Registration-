import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertToast from '../components/AlertToast';

const EventRegistrationsPage = () => {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getEventRegistrations(eventId, {
        search: searchTerm,
        status: statusFilter
      });
      setEvent(res.data.event);
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to load attendee registrations.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRegistrations();
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const res = await adminAPI.exportRegistrationsCsv(eventId);
      // Create blob link to trigger download
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitized = (event?.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `attendees_${sanitized}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: 'Failed to export CSV file.'
      });
    } finally {
      setExportLoading(false);
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
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/admin/dashboard" className="text-decoration-none">Admin</Link></li>
            <li className="breadcrumb-item"><Link to={`/events/${eventId}`} className="text-decoration-none">{event?.title || 'Event'}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Attendee Roster</li>
          </ol>
        </nav>

        {alert && (
          <AlertToast
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header Summary Banner */}
        <div className="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-4 mb-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-1 rounded-pill mb-2">
                Event Attendee Management
              </span>
              <h2 className="fw-bold text-dark mb-1">{event?.title || 'Loading Event...'}</h2>
              <div className="text-muted small">
                <i className="bi bi-calendar3 me-1"></i> {event?.eventDate ? formatDate(event.eventDate) : '-'} &bull;{' '}
                <i className="bi bi-geo-alt me-1"></i> {event?.venue || '-'} &bull;{' '}
                <span className="fw-semibold text-dark">
                  {event?.registeredCount || 0} / {event?.capacity || 0} Seats Occupied
                </span>
              </div>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button
                onClick={handleExportCsv}
                className="btn btn-success fw-semibold px-4 py-2 rounded-3 shadow-sm"
                disabled={exportLoading || registrations.length === 0}
              >
                {exportLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i> Export to CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Search by student name, email, department, or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-primary px-4 fw-semibold" type="submit">
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="col-md-5 d-flex justify-content-md-end gap-2 align-items-center">
              <label className="small text-muted fw-bold mb-0 text-nowrap">Filter Status:</label>
              <select
                className="form-select form-select-sm w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Registered Students Roster</h5>
            <span className="badge bg-secondary">{registrations.length} Students Listed</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching registered students list..." />
          ) : registrations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-bold">No Registrations Found</h5>
              <p className="text-muted small">No students have registered yet or no records match your filter criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="border-0">Student Name</th>
                    <th scope="col" className="border-0">Email</th>
                    <th scope="col" className="border-0">Phone</th>
                    <th scope="col" className="border-0">Department</th>
                    <th scope="col" className="border-0">Roll / ID</th>
                    <th scope="col" className="border-0">Status</th>
                    <th scope="col" className="border-0">Registered At</th>
                    <th scope="col" className="border-0">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => {
                    const student = reg.student || {};
                    return (
                      <tr key={reg._id}>
                        <td className="fw-semibold text-dark">{student.name || 'Anonymous Student'}</td>
                        <td className="small text-muted">{student.email}</td>
                        <td className="small text-muted">{student.phone || '-'}</td>
                        <td className="small text-muted">{student.department || '-'}</td>
                        <td className="small font-monospace">{student.studentId || '-'}</td>
                        <td>
                          {reg.status === 'confirmed' ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                              Confirmed
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {new Date(reg.registeredAt).toLocaleString()}
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '160px' }}>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={reg.notes}>
                            {reg.notes || '-'}
                          </span>
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
    </div>
  );
};

export default EventRegistrationsPage;
