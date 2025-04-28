"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  resolvedTheme: 'light' | 'dark'; // 实际应用的主题
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 默认使用系统主题
  const [theme, setTheme] = useState<ThemeType>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 监听系统主题变化
  useEffect(() => {
    // 从localStorage获取保存的主题设置
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // 根据当前主题设置应用相应的类名
    updateTheme(savedTheme || theme);
  }, []);

  // 更新主题
  const updateTheme = (newTheme: ThemeType) => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');

    // 根据主题设置应用相应的类名
    if (newTheme === 'system') {
      // 检测系统主题
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      // 不添加特定类，使用:root中的默认值和媒体查询
    } else {
      root.classList.add(`${newTheme}-theme`);
      setResolvedTheme(newTheme);
    }
  };

  // 设置主题并保存到localStorage
  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateTheme(newTheme);
  };

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};