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
    <button
      type="button"
      className={`cursor-pointer hover:opacity-90 transition-opacity inline-block border-none p-0 bg-transparent ${className}`}
      onClick={handleClick}
      aria-label="Lemonade Home"
    >
      <div
        className="px-6 py-2 transform -skew-x-12 bg-primary"
      >
        <span
          className="text-white font-black text-2xl uppercase block transform skew-x-12"
          style={{
            fontFamily: 'Inter Variable, sans-serif',
            fontStyle: 'italic',
            fontWeight: 900,
          }}
        >
          LEMONADE
        </span>
      </div>
    </button>
  );
}
