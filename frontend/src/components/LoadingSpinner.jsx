import React from 'react';

const LoadingSpinner = ({ message = 'Loading campus events...', fullPage = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: '3rem', height: '3rem' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium small mb-0">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-vh-50 d-flex align-items-center justify-content-center py-5">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
