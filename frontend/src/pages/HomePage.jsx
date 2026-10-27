import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, adminAPI } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 7,
    students: 3,
    registrations: 4
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await eventAPI.getEvents({ timeframe: 'upcoming', limit: 6 });
        setFeaturedEvents(eventsRes.data.events || []);

        // Attempt to fetch public overview count or default
        try {
          const dashRes = await adminAPI.getDashboard();
          if (dashRes.data?.stats) {
            setStats({
              events: dashRes.data.stats.totalEvents,
              students: dashRes.data.stats.totalStudents,
              registrations: dashRes.data.stats.totalRegistrations
            });
          }
        } catch {
          // Public users won't access admin dashboard, use event total count
          setStats((prev) => ({
            ...prev,
            events: eventsRes.data.total || 7
          }));
        }
      } catch (err) {
        console.error('Failed to load home page events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { name: 'Technical', icon: 'bi-cpu-fill', color: 'primary', desc: 'Hackathons, coding challenges & tech talks' },
    { name: 'Workshop', icon: 'bi-tools', color: 'success', desc: 'Hands-on practical skill building masterclasses' },
    { name: 'Cultural', icon: 'bi-music-note-beamed', color: 'danger', desc: 'Music, drama, fine arts & festival nights' },
    { name: 'Sports', icon: 'bi-trophy-fill', color: 'warning', desc: 'Inter-departmental leagues & tournaments' },
    { name: 'Seminar', icon: 'bi-people-fill', color: 'info', desc: 'Industry leadership keynotes & panel talks' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5 py-lg-6">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 text-uppercase fw-bold letter-spacing-1">
                <i className="bi bi-mortarboard-fill me-2"></i>Campus Event Hub 2026
              </span>
              <h1 className="display-4 fw-extrabold mb-3 tracking-tight">
                Discover, Register & Excel in <span className="text-primary text-gradient">Campus Life</span>
              </h1>
              <p className="lead text-light opacity-90 mb-4">
                The centralized university portal for student tech symposiums, hackathons,
                workshops, and cultural celebrations. Secure instant seat registration with real-time capacity tracking.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/events" className="btn btn-primary-gradient btn-lg px-4 py-3 rounded-3 shadow-lg">
                  <i className="bi bi-compass me-2"></i>Explore Upcoming Events
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4 py-3 rounded-3">
                  <i className="bi bi-person-plus me-2"></i>Join As Student
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 p-4 rounded-4 shadow-lg text-white">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge-fill text-warning"></i>
                  Platform At A Glance
                </h5>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-white bg-opacity-10 rounded-3 text-center">
                      <h2 className="fw-bold mb-0 text-white">{stats.events}+</h2>
                      <span className="small text-light opacity-75">Curated Events</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-white bg-opacity-10 rounded-3 text-center">
                      <h2 className="fw-bold mb-0 text-white">{stats.students}+</h2>
                      <span className="small text-light opacity-75">Active Students</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-white bg-opacity-10 rounded-3 d-flex align-items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-circle">
                        <i className="bi bi-shield-check fs-5"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Atomic Seat Reservation</div>
                        <div className="small text-light opacity-75">Concurreny-safe registration & real-time updates</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold small text-uppercase">Browse By Interest</span>
              <h2 className="fw-bold mb-0">Event Categories</h2>
            </div>
            <Link to="/events" className="text-decoration-none fw-semibold d-none d-md-inline-block">
              View All Categories <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat) => (
              <div key={cat.name} className="col-lg col-md-4 col-sm-6">
                <Link
                  to={`/events?category=${cat.name}`}
                  className="card h-100 text-decoration-none border text-dark p-3 text-center card-hover rounded-3"
                >
                  <div
                    className={`stat-icon-wrapper bg-${cat.color} bg-opacity-10 text-${cat.color} mx-auto mb-3`}
                  >
                    <i className={`bi ${cat.icon}`}></i>
                  </div>
                  <h6 className="fw-bold mb-1">{cat.name}</h6>
                  <p className="text-muted small mb-0">{cat.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-5">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="text-primary fw-bold small text-uppercase">Trending On Campus</span>
              <h2 className="fw-bold mb-0">Featured Upcoming Events</h2>
            </div>
            <Link to="/events" className="btn btn-outline-primary fw-semibold px-3 rounded-3">
              View Full Calendar <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus events..." />
          ) : featuredEvents.length === 0 ? (
            <div className="card p-5 text-center border-dashed">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
              <h5 className="fw-bold">No Upcoming Events Found</h5>
              <p className="text-muted">Check back later or explore our past events archive.</p>
              <Link to="/events" className="btn btn-primary btn-sm mx-auto">
                Browse All Events
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {featuredEvents.map((evt) => (
                <div key={evt._id} className="col-lg-4 col-md-6">
                  <EventCard event={evt} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Showcase Banner */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h5 className="fw-bold">One-Click Registration</h5>
                <p className="text-muted small">
                  Instant registration with smart seat reservation and cancellation controls up to event start time.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="stat-icon-wrapper bg-indigo bg-opacity-10 text-primary mx-auto mb-3">
                  <i className="bi bi-bell-fill"></i>
                </div>
                <h5 className="fw-bold">Transparent Deadlines</h5>
                <p className="text-muted small">
                  Live countdowns and automated seat counts so you never miss registration windows.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mx-auto mb-3">
                  <i className="bi bi-file-earmark-spreadsheet-fill"></i>
                </div>
                <h5 className="fw-bold">Faculty Administration</h5>
                <p className="text-muted small">
                  Complete admin analytics, attendee management, and single-click CSV roster export.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
