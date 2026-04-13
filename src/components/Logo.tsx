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
        className="px-4 py-1.5 transform -skew-x-12"
        style={{
          backgroundColor: '#1DB954',
        }}
      >
        <span
          className="text-white font-black text-xl tracking-tight uppercase block transform skew-x-12"
          style={{
            fontFamily: 'Inter Variable, sans-serif',
          }}
        >
          LEMONADE
        </span>
      </div>
    </div>
  );
}
