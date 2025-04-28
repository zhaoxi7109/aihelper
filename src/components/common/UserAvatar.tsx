"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '@/utils/api';

// 默认头像路径
const DEFAULT_AVATAR = '/images/avatar-placeholder.svg';

// 头像组件属性接口
interface UserAvatarProps {
  userId?: number;             // 用户ID，如果提供则用于刷新指定用户的头像
  avatarUrl?: string;          // 头像URL，可能是签名URL
  name?: string;               // 用户名，用于alt标签
  size?: number | 'large' | 'small' | 'default';  // 头像大小
  className?: string;          // 自定义CSS类
  refreshInterval?: number;    // 刷新间隔，单位为毫秒，默认为45分钟
  onAvatarChange?: (newUrl: string) => void;  // 头像URL变化回调
}

/**
 * 带有自动刷新签名URL功能的用户头像组件
 * 
 * 该组件会自动处理头像URL过期问题，通过以下机制:
 * 1. 定时刷新 - 在签名URL过期前自动请求新的URL
 * 2. 错误处理 - 当加载失败时尝试请求新的签名URL
 * 3. 默认降级 - 如果刷新失败，降级使用默认头像
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  avatarUrl,
  name = '用户',
  size = 'default',
  className = '',
  refreshInterval = 45 * 60 * 1000, // 默认45分钟自动刷新
  onAvatarChange
}) => {
  // 当前显示的头像URL
  const [currentUrl, setCurrentUrl] = useState<string>(avatarUrl || DEFAULT_AVATAR);
  // 加载错误状态
  const [hasError, setHasError] = useState<boolean>(false);
  // 是否需要强制刷新
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  
  // 确定最终显示的URL
  const displayUrl = useMemo(() => {
    // 如果有错误或是Gravatar URL，使用默认头像
    if (hasError || (currentUrl && currentUrl.includes('gravatar.com'))) {
      return DEFAULT_AVATAR;
    }
    // 否则使用当前URL
    return currentUrl || DEFAULT_AVATAR;
  }, [currentUrl, hasError]);
  
  // 处理头像加载错误
  const handleError = () => {
    console.log('头像加载失败，尝试刷新URL');
    setHasError(true);
    setNeedsRefresh(true);
    return true; // 返回true表示错误已处理
  };
  
  // 刷新头像URL
  const refreshAvatarUrl = async () => {
    // 只有当有用户ID或有初始头像URL时才尝试刷新
    if (!userId && !avatarUrl) return;
    
    try {
      console.log('开始刷新头像URL');
      
      // 根据是否有用户ID选择不同的API调用
      const response = userId 
        ? await api.users.refreshUserAvatarUrl(userId)
        : await api.users.refreshAvatarUrl();
      
      if (response && response.data && response.data.avatarUrl) {
        console.log('头像URL刷新成功');
        const newUrl = response.data.avatarUrl;
        setCurrentUrl(newUrl);
        setHasError(false);
        
        // 如果提供了回调，通知外部组件
        if (onAvatarChange) {
          onAvatarChange(newUrl);
        }
      } else {
        console.error('刷新头像URL响应格式不正确:', response);
        throw new Error('刷新头像URL响应格式不正确');
      }
    } catch (error) {
      console.error('刷新头像URL失败:', error);
      setHasError(true);
    } finally {
      setNeedsRefresh(false);
    }
  };
  
  // 初始化时检查头像URL
  useEffect(() => {
    if (avatarUrl) {
      setCurrentUrl(avatarUrl);
      setHasError(false);
    }
  }, [avatarUrl]);
  
  // 当需要刷新时自动刷新
  useEffect(() => {
    if (needsRefresh) {
      refreshAvatarUrl();
    }
  }, [needsRefresh]);
  
  // 定时刷新URL，避免过期
  useEffect(() => {
    // 只有当有用户ID或有初始头像URL时才设置定时器
    if (!userId && !avatarUrl) return;
    
    // 提前于过期时间刷新URL
    const intervalId = setInterval(() => {
      console.log('头像URL定时刷新');
      setNeedsRefresh(true);
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [userId, avatarUrl, refreshInterval]);
  
  // 渲染组件
  const numericSize = typeof size === 'number' ? size : undefined;
  const namedSize = typeof size === 'string' ? size : undefined;
  
  if (displayUrl === DEFAULT_AVATAR) {
    // 使用默认头像
    return (
      <Avatar
        className={className}
        size={namedSize || numericSize}
        icon={<UserOutlined />}
        src={DEFAULT_AVATAR}
      />
    );
  }
  
  // 使用实际头像
  return (
    <Avatar
      className={className}
      size={namedSize || numericSize}
      icon={<UserOutlined />}
      src={displayUrl}
      onError={handleError}
      alt={`${name}的头像`}
    />
  );
};

export default UserAvatar; 