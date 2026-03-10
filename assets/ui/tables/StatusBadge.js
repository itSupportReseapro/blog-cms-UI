'use client';

import React from 'react';

const StatusBadge = ({ status }) => {

  const normalized = status?.toLowerCase();

  const statusStyles = {

    /* ROLE BADGES */

    admin:{
      color:'var( --White)',
      bgColor:'var( --Primary)',
      width:'80px'
    },

    editor:{
      color:'var(--White)',
      bgColor:'var(--Green)',
      width:'80px'
    },

    viewer:{
      color:'var(--Yellow)',
      bgColor:'var(--YellowPastel)',
      width:'80px'
    },

    /* OTHER STATUSES */

    published:{
      color:'var(--Green)',
      bgColor:'var(--GreenPastel)',
      width:'95px'
    },

    draft:{
      color:'var(--Orange)',
      bgColor:'var(--OrangePastel)',
      width:'80px'
    },

    deleted:{
      color:'var(--Red)',
      bgColor:'var(--RedPastel)',
      width:'80px'
    },

    created:{
      color:'var(--Primary)',
      bgColor:'var(--PrimaryPastel)',
      width:'80px'
    },

    default:{
      color:'var(--Text1)',
      bgColor:'var(--Grey2)',
      width:'80px'
    }

  };

  const badgeConfig = statusStyles[normalized] || statusStyles.default;

  const badgeStyle = {
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    height:'34px',
    width:badgeConfig.width,
    borderRadius:'6px',
    fontSize:'var(--font-size-sm)',
    fontWeight:'var(--font-weight-medium)',
    color:badgeConfig.color,
    backgroundColor:badgeConfig.bgColor,
    whiteSpace:'nowrap'
  };

  const formattedStatus =
    status?.charAt(0).toUpperCase() + status?.slice(1);

  return <span style={badgeStyle}>{formattedStatus}</span>;

};

export default StatusBadge;