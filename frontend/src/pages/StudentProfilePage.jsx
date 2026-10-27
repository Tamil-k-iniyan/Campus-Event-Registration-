import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import FormInput from '../components/FormInput';
import AlertToast from '../components/AlertToast';

const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || 'Computer Science & Engineering',
    studentId: user?.studentId || ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      setAlert({
        type: 'success',
        message: 'Your student profile details have been updated successfully!'
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update profile details.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div
                  className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary rounded-circle"
                  style={{ width: '64px', height: '64px', fontSize: '2rem' }}
                >
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="fw-bold text-dark mb-0">{user?.name}</h3>
                  <div className="text-muted small">
                    {user?.email} &bull; <span className="badge bg-primary text-uppercase">{user?.role}</span>
                  </div>
                </div>
              </div>

              {alert && (
                <AlertToast
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              )}

              <h5 className="fw-bold text-dark mb-3">Academic & Contact Information</h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <FormInput
                      label="Full Name"
                      name="name"
                      icon="bi-person"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      label="College Email Address"
                      name="email"
                      type="email"
                      icon="bi-envelope"
                      value={user?.email || ''}
                      disabled
                      helpText="Email address cannot be changed"
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
                      icon="bi-card-text"
                      placeholder="e.g. CS2026-081"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      icon="bi-telephone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary-gradient px-4 py-2 fw-semibold rounded-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Profile Details'
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

export default StudentProfilePage;
