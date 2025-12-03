import React from 'react';

// FIX: Add size prop to support different button sizes.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'text-white bg-primary hover:bg-blue-700 focus:ring-primary',
    secondary: 'text-white bg-secondary hover:bg-emerald-600 focus:ring-secondary',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-primary',
    danger: 'text-white bg-danger hover:bg-red-600 focus:ring-danger',
  };

  const sizeClasses = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {icon && <span className="mr-2 -ml-1 h-5 w-5">{icon}</span>}
      {children}
    </button>
  );
};
