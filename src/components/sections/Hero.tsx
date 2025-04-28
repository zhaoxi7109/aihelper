"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaRocket } from 'react-icons/fa';

const Hero = () => {
  const [showQrCode, setShowQrCode] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="relative pt-32 pb-32 overflow-hidden wave-bg">
      <div className="container mx-auto px-4 md:px-6 text-center">
        {/* 通知横幅 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <Link href="#" className="block">
            <div className="rounded-xl p-4 text-center relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-center">
                <FaRocket className="text-yellow-500 mr-2" />
                <p className="text-gray-700 text-sm">
                  {t('updateBanner')}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="flex flex-col items-center max-w-4xl mx-auto mb-16">
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo size="lg" className="text-blue-500" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gray-700 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('slogan')}
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Link href="#" onClick={handleChatClick} className="block h-full">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer text-left h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-3">{t('chatTitle')}</h2>
                <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                  {t('chatDescription')}
                </p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
            onMouseEnter={() => setShowQrCode(true)}
            onMouseLeave={() => setShowQrCode(false)}
            whileHover={{ y: -5 }}
          >
            {/* QR Code Floating Card - appears on top */}
            {showQrCode && (
              <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-4 qr-code-animation bg-white rounded-xl shadow-xl p-4 w-[240px]">
                <div className="flex flex-col items-center">
                  <Image 
                    src="/images/deepseek-qrcode.svg" 
                    alt="DeepSeek App QR Code" 
                    width={180} 
                    height={180} 
                    className="mb-2"
                  />
                  <p className="text-gray-700 font-medium text-center text-sm">
                    {t('scanQRCode')}
                  </p>
                  {/* Pointer triangle */}
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-white border-r-[8px] border-r-transparent"></div>
                </div>
              </div>
            )}

            {/* App Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer text-left h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{t('appTitle')}</h2>
              <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                {t('appDescription')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;