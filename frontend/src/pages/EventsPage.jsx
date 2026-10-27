import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventAPI } from '../services/api';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [timeframe, setTimeframe] = useState(searchParams.get('timeframe') || 'upcoming');
  const [order, setOrder] = useState(searchParams.get('order') || 'asc');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        category: category !== 'All' ? category : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        timeframe: timeframe !== 'all' ? timeframe : undefined,
        order
      };

      const res = await eventAPI.getEvents(params);
      setEvents(res.data.events || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, timeframe, order, page]);

  const handleSearchSubmit = () => {
    setPage(1);
    fetchEvents();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    setPage(1);
  };

  const handleOrderChange = (ord) => {
    setOrder(ord);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setTimeframe('upcoming');
    setOrder('asc');
    setPage(1);
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        {/* Header Title */}
        <div className="row mb-4 align-items-center">
          <div className="col-lg-6 mb-3 mb-lg-0">
            <h1 className="fw-bold text-dark mb-1">Explore Campus Events</h1>
            <p className="text-muted small mb-0">
              Browse academic seminars, technical hackathons, workshops, and sports championships
            </p>
          </div>
          <div className="col-lg-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearchSubmit}
            />
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          category={category}
          onCategoryChange={handleCategoryChange}
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          order={order}
          onOrderChange={handleOrderChange}
        />

        {/* Results Count & Active Status */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="text-muted small fw-medium">
            Showing <strong className="text-dark">{events.length}</strong> of <strong className="text-dark">{total}</strong> total events
          </span>
          {(category !== 'All' || searchTerm || timeframe !== 'upcoming') && (
            <button
              onClick={handleResetFilters}
              className="btn btn-sm btn-link text-decoration-none text-danger"
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : events.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center my-4 bg-white">
            <div className="text-muted mb-3">
              <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="fw-bold text-dark">No Events Match Your Search</h4>
            <p className="text-muted small mb-4">
              We couldn't find any events matching your selected category, timeframe, or keyword criteria.
            </p>
            <div>
              <button onClick={handleResetFilters} className="btn btn-primary px-4 fw-medium">
                Clear Filters & Show All
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            {events.map((evt) => (
              <div key={evt._id} className="col-lg-4 col-md-6">
                <EventCard event={evt} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Event pagination" className="d-flex justify-content-center">
            <ul className="pagination shadow-sm">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li key={num} className={`page-item ${num === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(num)}>
                    {num}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
