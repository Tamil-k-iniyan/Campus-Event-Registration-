import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  rows,
  options = [],
  helpText,
  icon
}) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label fw-semibold small text-dark d-flex align-items-center gap-1">
          {icon && <i className={`bi ${icon} text-primary`}></i>}
          <span>{label}</span>
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          rows={rows || 4}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      ) : isSelect ? (
        <select
          id={name}
          name={name}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {error ? (
        <div className="invalid-feedback d-block small mt-1">{error}</div>
      ) : helpText ? (
        <div className="form-text small text-muted mt-1">{helpText}</div>
      ) : null}
    </div>
  );
};

export default FormInput;
