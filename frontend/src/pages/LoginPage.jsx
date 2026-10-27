import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import AlertToast from '../components/AlertToast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear field error on edit
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
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
      const user = await login(formData.email, formData.password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/login' ? '/student/dashboard' : from);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill buttons for evaluation
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@campus.edu',
        password: 'Admin@password123'
      });
    } else {
      setFormData({
        email: 'student@campus.edu',
        password: 'Student@password123'
      });
    }
    setErrors({});
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 p-4 p-sm-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <i className="bi bi-person-lock fs-2"></i>
              </div>
              <h3 className="fw-bold text-dark">Welcome Back</h3>
              <p className="text-muted small">Sign in to your Campus Event account</p>
            </div>

            {location.search.includes('sessionExpired=true') && (
              <AlertToast
                type="warning"
                message="Your session has expired. Please sign in again to continue."
              />
            )}

            {alert && (
              <AlertToast
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            {/* Quick Demo Fill Buttons for Evaluation */}
            <div className="bg-light p-3 rounded-3 mb-4 border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-bold text-muted text-uppercase">
                  <i className="bi bi-key-fill text-warning me-1"></i> Quick Demo Logins:
                </span>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary flex-grow-1"
                  onClick={() => setDemoCredentials('student')}
                >
                  <i className="bi bi-person-fill me-1"></i> Demo Student
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger flex-grow-1"
                  onClick={() => setDemoCredentials('admin')}
                >
                  <i className="bi bi-shield-lock-fill me-1"></i> Demo Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. student@campus.edu"
                icon="bi-envelope"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                icon="bi-shield-lock"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <button
                type="submit"
                className="btn btn-primary-gradient w-100 py-2 fw-semibold rounded-3 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-4 text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register as a Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
