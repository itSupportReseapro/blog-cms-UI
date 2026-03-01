'use client';

import React from 'react';
import { useTable } from '@/context/TableContext';

const StatusBadge = ({ status }) => {
  const { statusBadges } = useTable();
  
  const badgeConfig = statusBadges[status] || {
    color: '#666',
    bgColor: '#f0f0f0'
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: badgeConfig.color,
    backgroundColor: badgeConfig.bgColor,
    whiteSpace: 'nowrap'
  };

  return <span style={badgeStyle}>{status}</span>;
};

export default StatusBadge;
