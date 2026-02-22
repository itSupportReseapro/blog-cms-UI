"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./Snackbar.css";

import SuccessIcon from "@/assets/Images/img/snackbar-success.svg";
import ErrorIcon from "@/assets/Images/img/snackbar-error.svg";

import SuccessCross from "@/assets/Images/icon/success-cross.svg";
import ErrorCross from "@/assets/Images/icon/error-cross.svg";

const Snackbar = ({ message, onClose, duration = 5000, type = "error" }) => {
  const [exiting, setExiting] = useState(false);

  // Start exit after duration
  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // Remove after exit animation
  useEffect(() => {
    if (exiting) {
      const exitTimer = setTimeout(onClose, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [exiting, onClose]);

  return (
    <div
      className={`snackbar snackbar-${type} ${
        exiting ? "exit" : "enter"
      }`}
    >
      {/* ICON */}
      <div className={`snackbar-icon-box ${type}`}>
        <Image
          src={type === "success" ? SuccessIcon : ErrorIcon}
          alt={type}
          width={18}
          height={18}
        />
      </div>

      {/* CONTENT */}
      <div className="snackbar-content">
        <div className="snackbar-title">
          {type === "success" ? "Success" : "Loading"}
        </div>
        <div className="snackbar-message">{message}</div>
      </div>

      {/* CLOSE */}
      <button
        className={`snackbar-close ${type}`}
        onClick={() => setExiting(true)}
        aria-label="Close"
      >
        <Image
          src={type === "success" ? SuccessCross : ErrorCross}
          alt="close"
          width={10}
          height={10}
        />
      </button>
    </div>
  );
};

export default Snackbar;
