"use client";

import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { IoSettingsOutline, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5';
import { FiMessageSquare } from 'react-icons/fi';
import UserAvatar from '@/components/common/UserAvatar';

// 格式化邮箱，只显示@前面的部分首字符和@后面的域名
const formatEmail = (email: string | undefined): string => {
  if (!email) return '';
  if (!email.includes('@')) return email;
  
  const [prefix, domain] = email.split('@');
  if (prefix.length <= 2) return email;
  
  return `${prefix.substring(0, 2)}***@${domain}`;
};

// 避免不必要的重新渲染
const MemoizedAvatar = memo(({ src, alt, onError }: { src: string, alt: string, onError: () => void }) => {
  // 避免Gravatar加载超时问题
  const imageProps = useMemo(() => {
    // 如果是外部头像（特别是Gravatar），使用unoptimized属性跳过图像优化
    const unoptimized = src.includes('gravatar.com');
    
    return {
      src,
      alt,
      width: 32,
      height: 32,
      className: "object-cover",
      onError,
      priority: true,
      loading: "eager" as const, // 立即加载
      unoptimized: unoptimized, // 跳过优化以避免Gravatar 500错误
    };
  }, [src, alt, onError]);

  return <Image {...imageProps} />;
});

MemoizedAvatar.displayName = 'MemoizedAvatar';

const PersonalInfo: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { openSettings } = useSettings();
  const { openProfile } = useProfile();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 获取用户名 - 使用useMemo减少重新计算
  const userName = useMemo(() => {
    return user?.nickname || user?.username || '未登录用户';
  }, [user?.nickname, user?.username]);
  
  // 获取用户头像 - 使用useMemo减少重新计算
  const userAvatar = useMemo(() => {
    // 如果头像URL来自Gravatar，直接使用本地默认头像避免500错误
    if (imgError || !user?.avatar || (user?.avatar?.includes('gravatar.com'))) {
      return '/images/avatar-placeholder.svg';
    }
    return user.avatar;
  }, [user?.avatar, imgError]);
  
  // 处理点击事件
  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 图片加载错误处理
  const handleImageError = () => {
    console.log('头像加载失败，使用默认头像');
    setImgError(true);
  };

  // 只在用户变化时重置图片错误状态，避免频繁变化
  useEffect(() => {
    if (user?.id) {
      setImgError(false);
    }
  }, [user?.id]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 菜单项点击处理
  const handleMenuItemClick = (action: string) => {
    // 根据不同的操作执行不同的逻辑
    if (action === 'logout') {
      logout(); // 使用AuthContext中的登出方法
    } else if (action === 'settings') {
      openSettings();
    } else if (action === 'login' && !isAuthenticated) {
      router.push('/login');
    } else if (action === 'profile') {
      openProfile(); // 使用ProfileContext中的openProfile方法
    }
    console.log(`执行操作: ${action}`);
    setIsMenuOpen(false);
  };

  // 渲染头像部分
  const renderAvatar = () => {
    if (!isAuthenticated) {
      return <IoPersonOutline className="text-gray-400" size={20} />;
    }
    
    return (
      <UserAvatar
        userId={user?.id}
        avatarUrl={user?.avatar || '/images/avatar-placeholder.svg'}
        name={userName}
        size={32}
      />
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 个人信息按钮 */}
      <div 
        onClick={handleClick}
        className="flex items-center p-3 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
          {renderAvatar()}
        </div>
        <span className="text-gray-700 truncate max-w-[160px]">{userName}</span>
      </div>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
          {isAuthenticated && (
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-xs text-gray-500">ID: {user?.id}</div>
              <div className="text-xs text-gray-500 truncate">{user?.nickname || user?.username}</div>
              {/* 不再显示手机号，只在特殊情况下显示邮箱 */}
              {user?.email && <div className="text-xs text-gray-500 truncate">{formatEmail(user.email)}</div>}
            </div>
          )}
          
          {!isAuthenticated ? (
            <button 
              onClick={() => handleMenuItemClick('login')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <IoLogOutOutline className="mr-3" size={16} />
              <span>登录</span>
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleMenuItemClick('profile')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <IoPersonOutline className="mr-3" size={16} />
                <span>个人资料</span>
              </button>
            
              <button 
                onClick={() => handleMenuItemClick('settings')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <IoSettingsOutline className="mr-3" size={16} />
                <span>{t('settings')}</span>
              </button>
              
              <button 
                onClick={() => handleMenuItemClick('contact')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiMessageSquare className="mr-3" size={16} />
                <span>{t('contactUs')}</span>
              </button>
              
              <button 
                onClick={() => handleMenuItemClick('logout')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <IoLogOutOutline className="mr-3" size={16} />
                <span>{t('logout')}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;