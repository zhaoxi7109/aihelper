"use client";

import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark',
  size = 'md',
  className = ''
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-blue-500';
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <Link href="/" className={`font-bold flex items-center ${className}`}>
      <span className={`${textColor} ${sizeClasses[size]} font-bold tracking-tight`}>deepseek</span>
    </Link>
  );
};

export default Logo; 