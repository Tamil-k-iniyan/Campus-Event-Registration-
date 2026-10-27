import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const {
    _id,
    title,
    description,
    category,
    eventDate,
    startTime,
    venue,
    imageUrl,
    capacity,
    registeredCount = 0,
    status
  } = event;

  const remaining = Math.max(0, capacity - registeredCount);
  const percentFull = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isPast = new Date(eventDate) < new Date();
  const isFull = remaining <= 0;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card card-hover h-100 d-flex flex-column overflow-hidden">
      <div className="position-relative">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="w-100 event-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
          <span className="badge-category shadow-sm">{category}</span>
          {isPast ? (
            <span className="badge bg-secondary shadow-sm">Completed</span>
          ) : status === 'closed' ? (
            <span className="badge bg-danger shadow-sm">Closed</span>
          ) : isFull ? (
            <span className="badge bg-warning text-dark shadow-sm">House Full</span>
          ) : (
            <span className="badge bg-success shadow-sm">Open</span>
          )}
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4 flex-grow-1">
        <div className="d-flex align-items-center text-muted small mb-2 gap-3">
          <span>
            <i className="bi bi-calendar3 me-1 text-primary"></i>
            {formatDate(eventDate)}
          </span>
          <span>
            <i className="bi bi-clock me-1 text-primary"></i>
            {startTime}
          </span>
        </div>

        <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2" style={{ lineHeight: '1.3' }}>
          <Link to={`/events/${_id}`} className="text-decoration-none text-dark hover-primary">
            {title}
          </Link>
        </h5>

        <p className="card-text text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>

        <div className="mb-3 text-muted small">
          <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
          <span className="text-truncate d-inline-block align-bottom" style={{ maxWidth: '85%' }}>
            {venue}
          </span>
        </div>

        {/* Capacity Bar */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center small mb-1">
            <span className="text-muted">Seats Available</span>
            <span className={`fw-semibold ${remaining > 10 ? 'text-success' : remaining > 0 ? 'text-warning' : 'text-danger'}`}>
              {remaining} / {capacity}
            </span>
          </div>
          <div className="progress mb-3" style={{ height: '6px' }}>
            <div
              className={`progress-bar ${percentFull >= 90 ? 'bg-danger' : percentFull >= 70 ? 'bg-warning' : 'bg-primary'}`}
              role="progressbar"
              style={{ width: `${percentFull}%` }}
              aria-valuenow={percentFull}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          <Link
            to={`/events/${_id}`}
            className="btn btn-outline-primary w-100 rounded-3 fw-semibold py-2 d-flex align-items-center justify-content-center gap-2"
          >
            <span>View Details</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
