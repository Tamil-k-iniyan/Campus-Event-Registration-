import React from 'react';

const CATEGORIES = [
  'All',
  'Technical',
  'Hackathon',
  'Workshop',
  'Cultural',
  'Sports',
  'Seminar',
  'Other'
];

const FilterPanel = ({
  category,
  onCategoryChange,
  timeframe,
  onTimeframeChange,
  order,
  onOrderChange
}) => {
  return (
    <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
      <div className="row g-3 align-items-center">
        {/* Category Pills/Select */}
        <div className="col-lg-6 col-md-12">
          <label className="form-label text-muted small fw-bold text-uppercase mb-2">Category</label>
          <div className="d-flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 fw-medium ${
                  category === cat ? 'btn-primary' : 'btn-outline-secondary border-0 bg-light'
                }`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="col-lg-3 col-sm-6">
          <label className="form-label text-muted small fw-bold text-uppercase mb-2">Timeframe</label>
          <select
            className="form-select form-select-sm"
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="col-lg-3 col-sm-6">
          <label className="form-label text-muted small fw-bold text-uppercase mb-2">Sort By Date</label>
          <select
            className="form-select form-select-sm"
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
          >
            <option value="asc">Earliest First (Ascending)</option>
            <option value="desc">Latest First (Descending)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
