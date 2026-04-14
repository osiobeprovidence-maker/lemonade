import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export function Logo({ className = '', onClick }: LogoProps) {
  const navigate = useNavigate();

  const handleClick = onClick || (() => navigate('/'));

  return (
    <div
      className={`cursor-pointer hover:opacity-90 transition-opacity inline-block ${className}`}
      onClick={handleClick}
    >
      <div
        className="px-5 py-2 transform -skew-x-12"
        style={{
          backgroundColor: '#4CAF50',
        }}
      >
        <span
          className="text-white font-black text-2xl tracking-wide uppercase block transform skew-x-12 italic"
          style={{
            fontFamily: 'Inter Variable, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          LEMONADE
        </span>
      </div>
    </div>
  );
}
