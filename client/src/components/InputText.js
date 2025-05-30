import React from "react";
import PropTypes from "prop-types";

export const InputText = ({
  name,
  label,
  onChange,
  placeholder,
  value,
  error
}) => {
  var type = "text";
  if(name === "email"){
    type = "email";
  }
  let wrapperClass = "form-group";
  if (error && error.length > 0) {
    wrapperClass += " has-error";
  }

  return (
    <div className={wrapperClass}>
      <label htmlFor={name}>{label}</label>
      <div className="field form-group">
        <input
          type={type}
          name={name}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <div className="invalid-feedback">{error}</div>
      </div>
    </div>
  );
};

InputText.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string
};
