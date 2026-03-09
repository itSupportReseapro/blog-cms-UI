'use client';

import React from 'react';

const StatusBadge = ({ status }) => {

  const normalized = status?.toLowerCase();

  const statusStyles = {
    published: {
      color: 'var(--Green)',
      bgColor: 'var(--GreenPastel)',
      width: '95px',
    },

    unpublished: {
      color: 'var(--Yellow)',
      bgColor: 'var(--YellowPastel)',
      width: '114px',
    },

    deleted: {
      color: 'var(--Red)',
      bgColor: 'var(--RedPastel)',
      width: '79px',
    },

    draft: {
      color: 'var(--Orange)',
      bgColor: 'var(--OrangePastel)',
      width: '60px',
    },

    created: {
      color: 'var(--Primary)',
      bgColor: 'var(--PrimaryPastel)',
      width: '81px',
    },

    default: {
      color: 'var(--Text1)',
      bgColor: 'var(--Grey2)',
      width: '80px',
    },
  };

  const badgeConfig = statusStyles[normalized] || statusStyles.default;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    height: '34px',
    width: badgeConfig.width,

    paddingTop: '6px',
    paddingRight: '12px',
    paddingBottom: '6px',
    paddingLeft: '12px',

    borderRadius: '6px',

    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',

    lineHeight: '16px',

    color: badgeConfig.color,
    backgroundColor: badgeConfig.bgColor,

    whiteSpace: 'nowrap',
  };

  const formattedStatus =
    status?.charAt(0).toUpperCase() + status?.slice(1);

  return <span style={badgeStyle}>{formattedStatus}</span>;
};

export default StatusBadge;