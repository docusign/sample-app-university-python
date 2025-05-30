import React from "react";
import PropTypes from "prop-types";

export const InputRadio = ({
    onChange,
    error,
    options,
    value,
    name
}) => {
    let style = {
        display: "block"
    }
    return (
        <div className="form-group">
            {options.map((option, index) => (
                <div className="field" key={index}>
                    <input type="radio" id={index} className="form-control" name={name} value={index} 
                    checked={option.text === value} onChange={onChange} required/>
                    <label htmlFor={index}>{option.text}</label>
                    <br/>
                </div>
            ))}
            <div className="invalid-feedback" style={style}>{error}</div>
        </div>
    )
};

InputRadio.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    error: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.object)
};