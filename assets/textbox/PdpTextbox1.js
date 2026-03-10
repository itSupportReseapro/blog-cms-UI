// PdpTextbox1.js
import React, { useState, useEffect, useRef } from "react";
import "./PdpTextbox1.css";
import PropTypes from "prop-types";
import EyeOpenicon from "@/assets/Images/icon/eye-openICON.svg";
import EyeCloseIcon from "@/assets/Images/icon/eye-closeICON.svg";
import linkIcon from "@/assets/Images/icon/linkICON.svg";
import CalendarIcon from "@/assets/Images/icon/calenderICON.svg";
import Image from "next/image";

const PdpTextbox1 = ({
  label,
  value,
  onChange = () => {},
  onFocus,
  placeholder,  
  type = "text",
  name,
  id,
  readOnly = false,
  autoComplete,
  dataValidation = false,
  indicator = false,
  maskText = false,
  dropdownOptions = null,
  editable = true,
  minDate,
  maxDate,
  min,
  max,
  step,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);
  const [showText, setShowText] = useState(!maskText);
  const [localValue, setLocalValue] = useState(value);

  const inputRef = useRef(null); // ✅ safer than document.getElementById

  useEffect(() => {
    if (inputRef.current?.value) {
      setIsFocused(true);
    }
  }, []);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getErrorMessage = (type) => {
    switch (type) {
      case "mobile":
        return "Mobile number must be exactly 10 digits.";
      case "email":
        return "Invalid email format. Correct format: example@domain.com";
      case "gst":
        return "GST format: 15 characters (2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, 1 'Z', 1 alphanumeric)";
      case "pan":
        return "PAN format: 10 characters (5 letters, 4 digits, 1 letter). Example: BYMPP1330F";
      case "pincode":
        return "Pincode must be exactly 6 digits.";
      case "number":
        return `Value must be between ${min} and ${max}.`;
      default:
        return "Invalid input format.";
    }
  };

  const partialValidateInput = (input) => {
    switch (type) {
      case "mobile":
        return /^[0-9]{0,10}$/.test(input);
      case "email":
        return /^[A-Za-z0-9._%+-]*@?[A-Za-z0-9.-]*\.?[A-Za-z]*$/.test(input);
      case "gst":
        return /^[0-9a-zA-Z]*$/.test(input);
      case "pan":
        return /^[a-zA-Z0-9]*$/.test(input);
      case "pincode":
        return /^[0-9]{0,6}$/.test(input);
      case "number":
        if (min !== undefined && Number(min) >= 0) {
          return /^[0-9]*$/.test(input);
        }
        return /^-?\d*$/.test(input);
      default:
        return true;
    }
  };

  const validateInput = (input) => {
    if (!dataValidation || input === "") return true;

    switch (type) {
      case "mobile":
        return /^[0-9]{10}$/.test(input);
      case "email":
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(input);
      case "gst":
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(input);
      case "pan":
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(input);
      case "pincode":
        return /^[0-9]{6}$/.test(input);
      case "number":
        if (min !== undefined && Number(input) < Number(min)) return false;
        if (max !== undefined && Number(input) > Number(max)) return false;
        return true;
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (dataValidation && !partialValidateInput(newValue)) {
      return;
    }
    setLocalValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (dataValidation && localValue !== "") {
      const validationResult = validateInput(
        type === "number" ? localValue : localValue.toUpperCase()
      );
      setIsValid(validationResult);
      setHasValidated(true);
      if (!validationResult) {
        window.addSnackbar(getErrorMessage(type));
      }
    } else {
      setHasValidated(false);
    }

    const transformedValue =
      type === "gst" || type === "pan" ? localValue.toUpperCase() : localValue;
    onChange({ target: { name, value: transformedValue } });
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const toggleShowText = () => setShowText((prev) => !prev);

  const handleNumberChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange({ target: { name, value: newValue } });
  };

  const shouldLabelBeFocused =
    isFocused ||
    (localValue !== undefined && localValue !== null && localValue !== "");

  return (
    <div
      className={`pdp-textbox-container ${
        shouldLabelBeFocused ? "focused" : ""
      }`}
    >
      <label className="pdp-textbox-label" htmlFor={id}>
        {label}
      </label>

      {dropdownOptions ? (
        <select
          name={name}
          id={id}
          className="pdp-textbox-dropdown"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={!editable}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {dropdownOptions.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <div className="pdp-file-wrapper">
          <input
            type="text"
            readOnly
            value={localValue ? localValue.name : ""}
            placeholder={isFocused ? placeholder : ""}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`pdp-textbox-input ${
              !isValid || error ? "invalid" : ""
            }`}
            onClick={() => document.getElementById(`${id}-hidden`).click()}
          />
          <input
            type="file"
            id={`${id}-hidden`}
            name={name}
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0] || null;
              setLocalValue(file);
              onChange({ target: { name, value: file } });
            }}
          />
          <span
            className="pdp-file-icon"
            onClick={() => document.getElementById(`${id}-hidden`).click()}
          >
            <Image src={linkIcon} alt="link-btn" />
          </span>
        </div>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          id={id}
          className={`pdp-textbox-input pdp-textarea ${
            !isValid || error ? "invalid" : ""
          }`}
          value={localValue}
          onChange={handleInputChange}
          placeholder={isFocused ? placeholder : ""}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={!editable}
          rows={4}
        />
      ) : type === "date" ? (
        <div className="pdp-date-wrapper">
          <input
            ref={inputRef}
            type="date"
            name={name}
            id={id}
            className={`pdp-textbox-input ${
              !isValid || error ? "invalid" : ""
            }`}
            value={localValue ?? ""}
            onChange={handleInputChange}
            placeholder={isFocused ? placeholder : ""}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={!editable}
            min={minDate}
            max={maxDate}
          />
          <span
            className="pdp-date-icon"
            onClick={() => {
              if (inputRef.current) {
                if (inputRef.current.showPicker) {
                  inputRef.current.showPicker();
                } else {
                  inputRef.current.focus();
                  inputRef.current.click();
                }
              }
            }}
          >
            <Image src={CalendarIcon} alt="calendar-icon" />
          </span>
        </div>
      ) : (
        <input
          type={type === "number" ? "number" : showText ? "text" : "password"}
          name={name}
          id={id}
          className={`pdp-textbox-input ${!isValid || error ? "invalid" : ""}`}
          value={localValue ?? ""}
          onChange={type === "number" ? handleNumberChange : handleInputChange}
          placeholder={isFocused ? placeholder : ""}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={readOnly || !editable}
          autoComplete={autoComplete}
          min={type === "number" ? min : undefined}
          max={type === "number" ? max : undefined}
          step={type === "number" ? step : undefined}
        />
      )}

      {maskText && type !== "date" && (
        <span
          className="toggle-visibility"
          onMouseDown={() => setShowText(true)}
          onMouseUp={() => setShowText(false)}
          onMouseLeave={() => setShowText(false)}
        >
          {showText ? (
            <Image src={EyeOpenicon} alt="eyeopen" />
          ) : (
            <Image src={EyeCloseIcon} alt="eyeclose" />
          )}
        </span>
      )}
      {indicator && hasValidated && (
        <span className={`indicator ${isValid ? "valid" : "invalid"}`}>
          {isValid ? "✓" : "✕"}
        </span>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

PdpTextbox1.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
    PropTypes.bool,
  ]).isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  dataValidation: PropTypes.bool,
  indicator: PropTypes.bool,
  maskText: PropTypes.bool,
  dropdownOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  editable: PropTypes.bool,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.string,
};

export default PdpTextbox1;
