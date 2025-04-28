"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

export default function Head() {
  const { language } = useLanguage();

  useEffect(() => {
    // 更新页面标题
    document.title = language === 'cn' ? "DeepSeek - 探索未至之境" : "DeepSeek - Explore the Frontier";
    
    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content', 
        language === 'cn' 
          ? "DeepSeek是领先的AI大模型与应用提供商，致力于开发先进的语言模型和人工智能技术。" 
          : "DeepSeek is a leading AI model and application provider, dedicated to developing advanced language models and artificial intelligence technologies."
      );
    }
    
    // 更新HTML lang属性
    document.documentElement.lang = language === 'cn' ? 'zh-CN' : 'en';
  }, [language]);

  return null;
} 