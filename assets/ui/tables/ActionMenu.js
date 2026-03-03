'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTable } from '@/context/TableContext';
import ThreeDotsIcon from '@/assets/Images/icon/3-dots.svg';
import './ActionMenu.css';

const ActionMenu = ({ row, onActionExecute }) => {
  const { actions } = useTable();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const availableActions = actions.filter((action) => {
    if (action.condition && typeof action.condition === 'function') {
      return action.condition(row);
    }
    return true;
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionClick = (actionKey) => {
    if (onActionExecute) {
      onActionExecute(actionKey, row);
    }
    setIsOpen(false);
  };

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        className="action-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="More actions"
        aria-label="More actions"
      >
        <Image
          src={ThreeDotsIcon}
          alt="More"
          width={18}
          height={18}
        />
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          {availableActions.length > 0 ? (
            availableActions.map((action) => (
              <button
                key={action.key}
                className="action-menu-item"
                onClick={() => handleActionClick(action.key)}
              >
                {action.label}
              </button>
            ))
          ) : (
            <div className="action-menu-empty">
              No actions available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;