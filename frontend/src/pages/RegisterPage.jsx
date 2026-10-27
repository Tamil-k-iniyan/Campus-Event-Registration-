import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import AlertToast from '../components/AlertToast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: 'Computer Science & Engineering',
    studentId: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const DEPARTMENTS = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration (MBA)',
    'Biotechnology',
    'Mathematics & Computing',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid college or personal email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (formData.phone && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please provide a valid phone number (7-15 digits).';
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
      await register(formData);
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check the fields and try again.';
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
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">
          <div className="card shadow-sm border-0 p-4 p-sm-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
                style={{ width: '60px', height: '60px' }}
              >
                <i className="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h3 className="fw-bold text-dark">Student Registration</h3>
              <p className="text-muted small">Create your student portal profile to participate in campus events</p>
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
                <div className="col-md-12">
                  <FormInput
                    label="Full Name"
                    name="name"
                    placeholder="e.g. Alex Johnson"
                    icon="bi-person"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="student@campus.edu"
                    icon="bi-envelope"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Contact Phone"
                    name="phone"
                    placeholder="+1 555-0144"
                    icon="bi-telephone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Department"
                    name="department"
                    type="select"
                    icon="bi-building"
                    options={DEPARTMENTS}
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Student / Roll ID"
                    name="studentId"
                    placeholder="e.g. CS2026-081"
                    icon="bi-card-text"
                    value={formData.studentId}
                    onChange={handleChange}
                    helpText="Optional campus roll number"
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    icon="bi-lock"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    icon="bi-lock-fill"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-gradient w-100 py-2 fw-semibold rounded-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering Account...
                    </>
                  ) : (
                    'Create Student Account'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
