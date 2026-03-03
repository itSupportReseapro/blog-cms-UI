'use client';

import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase();

  const statusStyles = {
    published: {
      color: '#28A745',
      bgColor: '#DFF2E3',
    },
    deleted: {
      color: '#DC3545',
      bgColor: '#FAE1E3',
    },
    created: {
      color: '#0466C8',
      bgColor: '#D9E8F7',
    },
    unpublished: {
      color: '#F5A623',
      bgColor: '#FDF2DE',
    },
    draft: {
      color: '#FF6B35',
      bgColor: '#FFECE5',
    },
    default: {
      color: '#4D4D4D',
      bgColor: '#E6E6E6',
    },
  };

  const badgeConfig = statusStyles[normalized] || statusStyles.default;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 10px',
    borderRadius: '6px', // 🔥 Not full pill
    fontSize: '12px',
    fontWeight: 500,     // 🔥 Medium weight like screenshot
    lineHeight: '16px',
    height: '34px',      // 🔥 Fixed height like UI
    width:'70px',
    color: badgeConfig.color,
    backgroundColor: badgeConfig.bgColor,
    whiteSpace: 'nowrap',
  };

  return <span style={badgeStyle}>{status}</span>;
};

export default StatusBadge;