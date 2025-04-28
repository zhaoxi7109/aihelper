"use client";

import Link from 'next/link';
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
}) => {
  const baseStyles = 'font-medium transition-colors inline-flex items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };
  
  const sizeStyles = {
    sm: 'text-sm py-2 px-4',
    md: 'py-2.5 px-6',
    lg: 'py-3 px-6 text-base'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={buttonStyles}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={buttonStyles} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button; 