import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import FormInput from '../components/FormInput';
import AlertToast from '../components/AlertToast';

const CATEGORIES = [
  'Technical',
  'Hackathon',
  'Workshop',
  'Cultural',
  'Sports',
  'Seminar',
  'Other'
];

const CreateEventPage = () => {
  const navigate = useNavigate();

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeekDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    eventDate: nextWeek,
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venue: '',
    organizer: 'Department of Computer Science',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    registrationDeadline: nextWeekDeadline,
    capacity: 100,
    status: 'published'
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

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

    if (!formData.organizer.trim()) {
      errs.organizer = 'Organizer is required.';
    }

    if (!formData.eventDate) {
      errs.eventDate = 'Event date is required.';
    }

    if (!formData.registrationDeadline) {
      errs.registrationDeadline = 'Registration deadline is required.';
    } else if (new Date(formData.registrationDeadline) > new Date(formData.eventDate)) {
      errs.registrationDeadline = 'Registration deadline cannot be after the event date.';
    }

    if (!formData.capacity || parseInt(formData.capacity, 10) < 1) {
      errs.capacity = 'Capacity must be at least 1 seat.';
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
      const res = await eventAPI.createEvent(payload);
      navigate(`/events/${res.data.event._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create event. Please verify all fields.';
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

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/admin/dashboard" className="text-decoration-none">Admin</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Create New Event</li>
              </ol>
            </nav>

            <div className="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary rounded-3">
                  <i className="bi bi-calendar-plus-fill fs-4"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-dark mb-0">Create Campus Event</h3>
                  <p className="text-muted small mb-0">Publish an academic symposium, competition, or workshop</p>
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
                      placeholder="e.g. Annual Autonomous Robotics Hackathon 2026"
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
                      placeholder="Detailed information regarding the event itinerary, eligibility criteria, rules, prizes, and prerequisites..."
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
                      label="Maximum Capacity (Seats)"
                      name="capacity"
                      type="number"
                      placeholder="e.g. 100"
                      value={formData.capacity}
                      onChange={handleChange}
                      error={errors.capacity}
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
                      helpText="Must be on or before the event date"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Start Time"
                      name="startTime"
                      placeholder="e.g. 09:30 AM"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="End Time"
                      name="endTime"
                      placeholder="e.g. 04:30 PM"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Campus Venue / Auditorium"
                      name="venue"
                      placeholder="e.g. Main Auditorium & Tech Lab 3"
                      value={formData.venue}
                      onChange={handleChange}
                      error={errors.venue}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Hosting Department / Organizer"
                      name="organizer"
                      placeholder="e.g. Department of Computer Science & IEEE"
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
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={handleChange}
                      error={errors.imageUrl}
                      helpText="Provide a high-resolution Unsplash or campus CDN image URL"
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="Publication Status"
                      name="status"
                      type="select"
                      options={[
                        { value: 'published', label: 'Published (Visible to students)' },
                        { value: 'draft', label: 'Draft (Admin only)' },
                        { value: 'closed', label: 'Closed (Registration blocked)' }
                      ]}
                      value={formData.status}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <Link to="/admin/dashboard" className="btn btn-light px-4">
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
                        Publishing Event...
                      </>
                    ) : (
                      'Publish Campus Event'
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

export default CreateEventPage;
