import React from "react";
import PropTypes from "prop-types";

export const InputSelect = ({
  name,
  label,
  onChange,
  defaultOption,
  value,
  error,
  options
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <div className="field">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="form-control"
        required
      >
        <option value="">{defaultOption}</option>
        {options.map((option, index) => (
          <option key={index} value={index}>
            {option.text}
          </option>
        ))}
      </select>
      <div className="invalid-feedback">{error}</div>
    </div>
  </div>
);

InputSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultOption: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object)
};
