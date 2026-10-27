import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import FormInput from '../components/FormInput';
import AlertToast from '../components/AlertToast';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'Technical',
  'Hackathon',
  'Workshop',
  'Cultural',
  'Sports',
  'Seminar',
  'Other'
];

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizer: '',
    imageUrl: '',
    registrationDeadline: '',
    capacity: 100,
    status: 'published'
  });

  const [registeredCount, setRegisteredCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventAPI.getEventById(id);
        const evt = res.data.event;
        setRegisteredCount(evt.registeredCount || 0);

        // Format dates for HTML date inputs (YYYY-MM-DD)
        const toInputDate = (d) => {
          try {
            return new Date(d).toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        setFormData({
          title: evt.title || '',
          description: evt.description || '',
          category: evt.category || 'Technical',
          eventDate: toInputDate(evt.eventDate),
          startTime: evt.startTime || '',
          endTime: evt.endTime || '',
          venue: evt.venue || '',
          organizer: evt.organizer || '',
          imageUrl: evt.imageUrl || '',
          registrationDeadline: toInputDate(evt.registrationDeadline),
          capacity: evt.capacity || 100,
          status: evt.status || 'published'
        });
      } catch (err) {
        setAlert({
          type: 'danger',
          message: err.response?.data?.message || 'Failed to load event data.'
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Event title is required.';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Event description is required.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }

    if (!formData.venue.trim()) {
      errs.venue = 'Venue location is required.';
    }

    if (!formData.eventDate) {
      errs.eventDate = 'Event date is required.';
    }

    if (!formData.registrationDeadline) {
      errs.registrationDeadline = 'Registration deadline is required.';
    } else if (new Date(formData.registrationDeadline) > new Date(formData.eventDate)) {
      errs.registrationDeadline = 'Registration deadline cannot be after the event date.';
    }

    const capNum = parseInt(formData.capacity, 10);
    if (!formData.capacity || capNum < 1) {
      errs.capacity = 'Capacity must be at least 1 seat.';
    } else if (capNum < registeredCount) {
      errs.capacity = `Capacity cannot be lower than the current registered students (${registeredCount}).`;
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl.trim())) {
      errs.imageUrl = 'Image URL must be a valid http or https URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10)
      };
      await eventAPI.updateEvent(id, payload);
      navigate(`/events/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update event.';
      setAlert({ type: 'danger', message: msg });
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner fullPage message="Loading event details..." />;
  }

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/admin/dashboard" className="text-decoration-none">Admin</Link></li>
                <li className="breadcrumb-item"><Link to={`/events/${id}`} className="text-decoration-none">{formData.title}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Edit Event</li>
              </ol>
            </nav>

            <div className="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-4">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon-wrapper bg-secondary bg-opacity-10 text-primary rounded-3">
                    <i className="bi bi-pencil-square fs-4"></i>
                  </div>
                  <div>
                    <h3 className="fw-bold text-dark mb-0">Edit Campus Event</h3>
                    <p className="text-muted small mb-0">Update event details, timing, or seat limits</p>
                  </div>
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  {registeredCount} Registered Students
                </div>
              </div>

              {alert && (
                <AlertToast
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <FormInput
                      label="Event Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <FormInput
                      label="Event Description"
                      name="description"
                      type="textarea"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      error={errors.description}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Event Category"
                      name="category"
                      type="select"
                      options={CATEGORIES}
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Maximum Capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleChange}
                      error={errors.capacity}
                      helpText={`Current registered attendees: ${registeredCount}`}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Event Date"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleChange}
                      error={errors.eventDate}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Registration Deadline"
                      name="registrationDeadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                      error={errors.registrationDeadline}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Start Time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="End Time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Campus Venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      error={errors.venue}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Organizer"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleChange}
                      error={errors.organizer}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <FormInput
                      label="Banner Image URL"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      error={errors.imageUrl}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Publication Status"
                      name="status"
                      type="select"
                      options={[
                        { value: 'published', label: 'Published (Active)' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'closed', label: 'Closed' },
                        { value: 'cancelled', label: 'Cancelled' }
                      ]}
                      value={formData.status}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <Link to={`/events/${id}`} className="btn btn-light px-4">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient px-4 py-2 fw-semibold rounded-3 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating Event...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
