// SnackbarContainer.js
"use client"
import React, { useState, useEffect } from 'react';
import Snackbar from './Snackbar';
import './SnackbarContainer.css';

const MAX_SNACKBARS = 1;

const SnackbarContainer = () => {
  const [snackbars, setSnackbars] = useState([]);
  


  const addSnackbar = (message, type = "error") => {
    setSnackbars((prevSnackbars) => {
      const newSnackbar = { id: `${Date.now()}-${Math.random()}`, message, type };

      // Enforce the MAX_SNACKBARS limit with FIFO
      const updatedSnackbars = [...prevSnackbars, newSnackbar];
      if (updatedSnackbars.length > MAX_SNACKBARS) {
        updatedSnackbars.shift(); // Remove the oldest snackbar if limit exceeded
      }

      return updatedSnackbars;
    });
  };

  const removeSnackbar = (id) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((snackbar) => snackbar.id !== id));
  };

  useEffect(() => {
    window.addSnackbar = addSnackbar;
    window.clearSnackbars = () => setSnackbars([]);
  }, []);

  return (
    <div className="snackbar-container">
      {snackbars.map(({ id, message, type }) => (
        <Snackbar
          key={id}
          message={message}
          type={type}
          onClose={() => removeSnackbar(id)}
        />
      ))}
    </div>
  );
};

export default SnackbarContainer;
