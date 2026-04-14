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
        className="px-6 py-2.5 transform -skew-x-12"
        style={{
          backgroundColor: '#5cb85c',
        }}
      >
        <span
          className="text-white font-black text-[1.75rem] tracking-[0.05em] uppercase block transform skew-x-12"
          style={{
            fontFamily: 'Inter Variable, sans-serif',
            fontStyle: 'italic',
          }}
        >
          LEMONADE
        </span>
      </div>
    </div>
  );
}
