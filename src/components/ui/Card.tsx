import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
};
