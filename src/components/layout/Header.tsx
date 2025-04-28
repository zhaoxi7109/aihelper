"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'cn' ? 'en' : 'cn');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f5f9ff]">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center logo-hover-effect">
            <Image 
              src="/images/whale-logo.svg" 
              alt="DeepSeek Logo" 
              width={32} 
              height={32} 
              className="mr-2"
            />
            <span className="text-blue-500 text-xl font-bold tracking-tight">deepseek</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-8">
          <Link 
            href="/api-platform" 
            className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center transition-colors duration-200"
          >
            <span>{t('apiPlatform')}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1"
            >
              <path 
                d="M6.5 3.5L10 7L6.5 10.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          
          <button 
            onClick={toggleLanguage} 
            className="text-gray-600 hover:text-blue-600 text-sm font-medium cursor-pointer transition-colors duration-200"
          >
            {language === 'cn' ? t('english') : t('chinese')}
          </button>
          
          <button 
            className="md:hidden text-gray-700 p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <IoClose className="h-5 w-5" />
            ) : (
              <IoMenu className="h-5 w-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              href="/api-platform" 
              className="block py-2 text-gray-600 hover:text-blue-600 font-medium"
            >
              {t('apiPlatform')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 