import React from 'react';

const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search events by title, keyword, or venue...' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) setTimeout(onSearch, 50);
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="input-group shadow-sm rounded-3 overflow-hidden border">
        <span className="input-group-text bg-white border-0 text-muted ps-3">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control border-0 py-2 shadow-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="btn bg-white border-0 text-muted"
            onClick={handleClear}
            title="Clear search"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
        <button className="btn btn-primary-gradient px-4 fw-semibold" type="submit">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
