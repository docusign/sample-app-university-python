import React from "react";
import PropTypes from "prop-types";

export const InputCheckbox = ({ name, onChange, label, isChecked, error }) => {
  let wrapperClass = "form-check";
  if (error && error.length > 0) {
    wrapperClass += " " + "has-error";
  }

  return (
    <div className={wrapperClass}>
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={isChecked}
        className="form-check-input"
        onChange={onChange}
      />
      <label className="form-check-label" htmlFor={name}>
        {label}
      </label>
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
};

InputCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool,
  error: PropTypes.string
};
