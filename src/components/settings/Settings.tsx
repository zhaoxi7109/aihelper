"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 添加类以使背景模糊，实现模态框弹出时原界面变为浅灰透明状态
      document.body.classList.add('settings-modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('settings-modal-open');
    };
  }, [isOpen, onClose]);

  // 客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  // 处理语言切换
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'cn' | 'en');
  };

  // 处理主题切换
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'system');
  };

  // 渲染标签内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t('language')}</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md bg-[var(--secondary)] text-[var(--foreground)]"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="cn">简体中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t('theme')}</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md bg-[var(--secondary)] text-[var(--foreground)]"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">{t('lightMode')}</option>
                <option value="dark">{t('darkMode')}</option>
                <option value="system">{t('systemTheme')}</option>
              </select>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{language === 'cn' ? '用户名' : 'Username'}</label>
              <div className="flex items-center">
                <span className="text-[var(--foreground)]">AAA 黎力力</span>
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{language === 'cn' ? '已认证' : 'Verified'}</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{language === 'cn' ? '手机号码' : 'Phone Number'}</label>
              <div className="text-[var(--foreground)]">181****0472</div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">{language === 'cn' ? '数据用于优化体验' : 'Data for Experience Optimization'}</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{language === 'cn' ? '允许我们收集您的使用数据以改进DeepSeek的体验和服务，您的隐私将受到保护。' : 'Allow us to collect your usage data to improve DeepSeek experience and services. Your privacy will be protected.'}</p>
            </div>
            <div className="flex justify-between">
              <button className="text-[var(--foreground)] hover:text-[var(--primary)] text-sm">{language === 'cn' ? '登出账号' : 'Logout'}</button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm">{language === 'cn' ? '删除' : 'Delete'}</button>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-medium mb-2">{language === 'cn' ? '用户协议' : 'User Agreement'}</h3>
              <p className="text-sm text-[var(--text-gray)]">{language === 'cn' ? '查看' : 'View'}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-medium mb-2">{language === 'cn' ? '隐私政策' : 'Privacy Policy'}</h3>
              <p className="text-sm text-[var(--text-gray)]">{language === 'cn' ? '查看' : 'View'}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        className="settings-modal rounded-lg w-full max-w-md mx-4 overflow-hidden z-50"
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-light)]">
          <h2 className="text-lg font-medium">{t('settings')}</h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-gray)] hover:text-[var(--primary)] transition-colors"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>
        
        <div className="flex border-b border-[var(--border-light)]">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'general' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-gray)]'}`}
          >
            {t('generalSettings')}
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'account' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-gray)]'}`}
          >
            {t('accountManagement')}
          </button>
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'terms' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-gray)]'}`}
          >
            {t('termsOfService')}
          </button>
        </div>
        
        {renderTabContent()}
      </div>
    </div>,
    document.body
  );
};

export default Settings;