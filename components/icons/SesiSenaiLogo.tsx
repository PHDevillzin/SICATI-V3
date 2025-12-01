
import React from 'react';

const SesiSenaiLogo: React.FC<{ className?: string, textColor?: string }> = ({ className, textColor = 'black' }) => (
  <svg className={className} viewBox="0 0 200 30" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="white-stripes" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="white" strokeWidth="1" />
      </pattern>
      <mask id="stripe-mask">
        <rect width="200" height="30" fill="url(#white-stripes)" />
      </mask>
    </defs>
    <style>
      {`
        .sesi-senai-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 2px;
        }
      `}
    </style>
    <g>
      <rect x="0" y="0" width="90" height="30" fill="#D8242D" />
      <rect x="0" y="0" width="90" height="30" fill="rgba(0,0,0,0.2)" mask="url(#stripe-mask)" />
      <text x="45" y="22" textAnchor="middle" fill="white" className="sesi-senai-text">SESI</text>
    </g>
    <g transform="translate(100, 0)">
      <rect x="0" y="0" width="100" height="30" fill="#333333" />
      <rect x="0" y="0" width="100" height="30" fill="rgba(0,0,0,0.2)" mask="url(#stripe-mask)" />
      <text x="50" y="22" textAnchor="middle" fill="white" className="sesi-senai-text">SENAI</text>
    </g>
  </svg>
);

export default SesiSenaiLogo;
