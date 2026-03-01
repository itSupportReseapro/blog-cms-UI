"use client";
import React from "react";
import Image from "next/image";
import "./PdpButton.css";

const PdpButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary",        // primary | outline | danger | success | ghost
  size = "md",                // sm | md | lg
  radius = "md",              // sm | md | lg | pill
  fullWidth = false,
  icon = null,
  iconPosition = "right",     // left | right
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pdp-btn 
        pdp-btn-${variant}
        pdp-btn-${size}
        pdp-btn-radius-${radius}
        ${fullWidth ? "pdp-btn-full" : ""}
        ${disabled ? "pdp-btn-disabled" : ""}
        ${className}
      `}
    >
      {icon && iconPosition === "left" && (
        <span className="pdp-btn-icon left">
          <Image src={icon} alt="icon" />
        </span>
      )}

      <span className="pdp-btn-text">{children}</span>

      {icon && iconPosition === "right" && (
        <span className="pdp-btn-icon right">
          <Image src={icon} alt="icon" />
        </span>
      )}
    </button>
  );
};

export default PdpButton;