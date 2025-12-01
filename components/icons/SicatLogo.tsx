
import React from 'react';

const SicatLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <g id="person">
        <circle cx="0" cy="-35" r="8" />
        <path d="M 0 -25 C -15 -15, -15 10, 0 10 S 15 -15, 0 -25 Z" />
      </g>
    </defs>
    <circle cx="50" cy="50" r="22" fill="currentColor" />
    <g transform="translate(50, 50)" fill="currentColor">
      <use href="#person" />
      <use href="#person" transform="rotate(60)" />
      <use href="#person" transform="rotate(120)" />
      <use href="#person" transform="rotate(180)" />
      <use href="#person" transform="rotate(240)" />
      <use href="#person" transform="rotate(300)" />
    </g>
  </svg>
);

export default SicatLogo;
