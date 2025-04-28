"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义所有翻译文本
const translations = {
  cn: {
    // Header
    apiPlatform: 'API开放平台',
    english: '英文',
    chinese: '中文',
    
    // Hero
    slogan: '探索未至之境',
    chatTitle: '开始对话',
    chatDescription: '立即体验DeepSeek的强大对话能力',
    appTitle: '获取手机App',
    appDescription: '随时随地与DeepSeek进行交流',
    scanQRCode: '扫码下载 DeepSeek APP',
    
    // Updates Banner
    updateBanner: '🎉 DeepSeek-V3 模型更新，各项能力全面进阶，在网页端、APP 和 API 全面上线。',
    
    // Footer
    research: '研究',
    product: '产品',
    legal: '法务 & 安全',
    joinUs: '加入我们',
    webVersion: '网页版',
    openPlatform: '开放平台',
    apiPrice: 'API 价格',
    serviceStatus: '服务状态',
    privacyPolicy: '隐私政策',
    termsOfService: '用户协议',
    reportVulnerability: '反馈安全漏洞',
    jobDetails: '岗位详情',
    copyright: '© 2025 杭州深度求索人工智能技术研究有限公司 版权所有',
    
    // Chat Page
    newChat: '新建对话',
    enterMessage: '输入消息...',
    enterTitle: '输入标题...',
    saveTitle: '保存标题',
    editTitle: '编辑标题',
    titleUpdated: '标题已更新',
    titleUpdateFailed: '标题更新失败',
    cancel: '取消',
    send: '发送',
    copy: '复制',
    copied: '已复制',
    user: '用户',
    voiceInput: '语音输入',
    deepThinking: '深度思考',
    deepThinkingEnabled: '已深度思考',
    disclaimer: 'DeepSeek 可能会产生不准确的信息。请注意辨别信息准确性。',
    welcomeMessage: '你好！我是 DeepSeek，有什么我可以帮助你的吗？',
    settings: '设置',
    help: '帮助',
    today: '今天',
    yesterday: '昨天',
    daysAgo: '天前',
    justNow: '刚才',
    contactUs: '联系我们',
    logout: '退出登录',
    
    // Settings
    language: '语言',
    theme: '主题',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    systemTheme: '跟随系统',
    generalSettings: '通用设置',
    accountManagement: '账户管理',
    
    // Login Page
    login: '登录',
    register: '注册',
    phoneLogin: '验证码登录',
    passwordLogin: '密码登录',
    phoneNumber: '手机号',
    verificationCode: '验证码',
    password: '密码',
    sendCode: '发送验证码',
    loginButton: '登录',
    wechatLogin: '微信扫码登录',
    loginDesc: '你所在地区仅支持 手机号 / 微信 / 邮箱 登录',
    agreementTip: '注册登录即代表同意并同意我们的',
    userAgreement: '用户协议',
    privacyPolicyText: '隐私政策', // 重命名以避免重复的属性名
    and: '和',
    registerPhone: '未注册的手机号将自动注册',
    delete: '删除',
    confirmDelete: '确认删除',
    messageDeleted: '消息已删除',
    messageDeleteFailed: '删除失败',
    confirmDeleteConversation: '确定要删除这个对话吗？',
    conversationDeleted: '对话已删除',
    conversationDeleteFailed: '删除对话失败，请重试',
  },
  en: {
    // Header
    apiPlatform: 'API Platform',
    english: 'English',
    chinese: 'Chinese',
    
    // Hero
    slogan: 'Explore the Frontier',
    chatTitle: 'Start Chat',
    chatDescription: 'Experience the powerful conversation ability of DeepSeek',
    appTitle: 'Get Mobile App',
    appDescription: 'Chat with DeepSeek anytime, anywhere',
    scanQRCode: 'Scan to download DeepSeek App',
    
    // Updates Banner
    updateBanner: '🎉 DeepSeek-V3 model update, all capabilities comprehensively upgraded, now available on web, APP and API.',
    
    // Footer
    research: 'Research',
    product: 'Products',
    legal: 'Legal & Security',
    joinUs: 'Join Us',
    webVersion: 'Web Version',
    openPlatform: 'Open Platform',
    apiPrice: 'API Pricing',
    serviceStatus: 'Service Status',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    reportVulnerability: 'Report Vulnerability',
    jobDetails: 'Job Opportunities',
    copyright: '© 2025 Hangzhou DeepSeek AI Technology Research Co., Ltd. All Rights Reserved',
    
    // Chat Page
    newChat: 'New Chat',
    enterMessage: 'Enter a message...',
    enterTitle: 'Enter title...',
    saveTitle: 'Save Title',
    editTitle: 'Edit Title',
    titleUpdated: 'Title updated',
    titleUpdateFailed: 'Failed to update title',
    cancel: 'Cancel',
    send: 'Send',
    copy: 'Copy',
    copied: 'Copied',
    user: 'User',
    voiceInput: 'Voice Input',
    deepThinking: 'Deep Thinking',
    deepThinkingEnabled: 'Deep Thinking Enabled',
    disclaimer: 'DeepSeek may generate inaccurate information. Please verify the accuracy of the information.',
    welcomeMessage: 'Hello! I am DeepSeek. How can I help you today?',
    settings: 'Settings',
    help: 'Help',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    justNow: 'Just now',
    contactUs: 'Contact Us',
    logout: 'Logout',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemTheme: 'System',
    generalSettings: 'General Settings',
    accountManagement: 'Account Management',
    
    // Login Page
    login: 'Login',
    register: 'Register',
    phoneLogin: 'Verification Code Login',
    passwordLogin: 'Password Login',
    phoneNumber: 'Phone Number',
    verificationCode: 'Verification Code',
    password: 'Password',
    sendCode: 'Send Code',
    loginButton: 'Login',
    wechatLogin: 'WeChat Login',
    loginDesc: 'Your region only supports Phone / WeChat / Email login',
    agreementTip: 'By registering or logging in, you agree to our',
    userAgreement: 'User Agreement',
    privacyPolicyText: 'Privacy Policy',
    and: 'and',
    registerPhone: 'Unregistered phone numbers will be automatically registered',
    delete: 'Delete',
    confirmDelete: 'Confirm Delete',
    messageDeleted: 'Message deleted',
    messageDeleteFailed: 'Failed to delete',
    confirmDeleteConversation: 'Are you sure you want to delete this conversation?',
    conversationDeleted: 'Conversation deleted',
    conversationDeleteFailed: 'Failed to delete conversation',
  }
};

// 定义上下文类型
type LanguageContextType = {
  language: 'cn' | 'en';
  setLanguage: (lang: 'cn' | 'en') => void;
  t: (key: keyof typeof translations.cn | keyof typeof translations.en) => string;
};

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 创建Provider组件
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'cn' | 'en'>('cn');

  // 获取翻译
  const t = (key: keyof typeof translations.cn | keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 创建使用上下文的钩子
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};