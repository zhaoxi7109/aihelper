"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaWeixin } from 'react-icons/fa';
import { SiZhihu } from 'react-icons/si';
import { IoMail } from 'react-icons/io5';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white text-gray-600 py-16 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-8 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl w-full">
          {/* Logo Column */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start md:mr-8">
            <Link href="/" className="inline-block logo-hover-effect">
              <div className="flex items-center">
                <Image 
                  src="/images/whale-logo.svg" 
                  alt="DeepSeek Logo" 
                  width={48} 
                  height={48} 
                  className="mr-3"
                />
                <span className="text-blue-500 text-3xl font-bold tracking-tight">deepseek</span>
              </div>
            </Link>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-5 mt-8">
              <Link href="mailto:info@deepseek.com" aria-label="Email">
                <IoMail className="w-6 h-6 text-gray-400" />
              </Link>
              <Link href="https://github.com/deepseek-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub className="w-6 h-6 text-gray-400" />
              </Link>
              <Link href="https://知乎.com/org/deepseek" target="_blank" rel="noopener noreferrer" aria-label="知乎">
                <SiZhihu className="w-6 h-6 text-gray-400" />
              </Link>
              <Link href="https://weixin.qq.com" target="_blank" rel="noopener noreferrer" aria-label="微信">
                <FaWeixin className="w-6 h-6 text-gray-400" />
              </Link>
            </div>
            
            {/* Copyright */}
            <div className="mt-8 text-sm text-gray-400">
              <p className="mb-2">{t('copyright')}</p>
              <p className="mb-2">浙ICP备202302584号</p>
              <p>浙公网安备 33010502011812 号</p>
            </div>
          </div>
          
          {/* Navigation Columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-800 font-semibold mb-4 text-base">{t('research')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/r1" className="text-gray-600 hover:text-blue-600">
                    DeepSeek R1
                  </Link>
                </li>
                <li>
                  <Link href="/v3" className="text-gray-600 hover:text-blue-600">
                    DeepSeek V3
                  </Link>
                </li>
                <li>
                  <Link href="/coder-v2" className="text-gray-600 hover:text-blue-600">
                    DeepSeek Coder V2
                  </Link>
                </li>
                <li>
                  <Link href="/vl" className="text-gray-600 hover:text-blue-600">
                    DeepSeek VL
                  </Link>
                </li>
                <li>
                  <Link href="/v2" className="text-gray-600 hover:text-blue-600">
                    DeepSeek V2
                  </Link>
                </li>
                <li>
                  <Link href="/coder" className="text-gray-600 hover:text-blue-600">
                    DeepSeek Coder
                  </Link>
                </li>
                <li>
                  <Link href="/math" className="text-gray-600 hover:text-blue-600">
                    DeepSeek Math
                  </Link>
                </li>
                <li>
                  <Link href="/llm" className="text-gray-600 hover:text-blue-600">
                    DeepSeek LLM
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4 text-base">{t('product')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/app" className="text-gray-600 hover:text-blue-600">
                    DeepSeek App
                  </Link>
                </li>
                <li>
                  <Link href="/web" className="text-gray-600 hover:text-blue-600">
                    DeepSeek {t('webVersion')}
                  </Link>
                </li>
                <li>
                  <Link href="/platform" className="text-gray-600 hover:text-blue-600">
                    {t('openPlatform')}
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-gray-600 hover:text-blue-600">
                    {t('apiPrice')}
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-600 hover:text-blue-600">
                    {t('serviceStatus')}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4 text-base">{t('legal')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-blue-600">
                    {t('privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-blue-600">
                    {t('termsOfService')}
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-gray-600 hover:text-blue-600">
                    {t('reportVulnerability')}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-800 font-semibold mb-4 text-base">{t('joinUs')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/careers" className="text-gray-600 hover:text-blue-600">
                    {t('jobDetails')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 