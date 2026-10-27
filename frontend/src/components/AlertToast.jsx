import React from 'react';

const AlertToast = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const bgClasses = {
    success: 'alert-success border-success text-success-emphasis',
    danger: 'alert-danger border-danger text-danger-emphasis',
    warning: 'alert-warning border-warning text-warning-emphasis',
    info: 'alert-info border-info text-info-emphasis'
  };

  const icons = {
    success: 'bi-check-circle-fill',
    danger: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  return (
    <div
      className={`alert ${bgClasses[type] || bgClasses.info} alert-dismissible fade show d-flex align-items-center shadow-sm rounded-3 py-2 px-3 mb-4`}
      role="alert"
    >
      <i className={`bi ${icons[type] || icons.info} fs-5 me-2 flex-shrink-0`}></i>
      <div className="flex-grow-1 small fw-medium">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close py-2"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default AlertToast;
