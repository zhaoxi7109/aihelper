"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  IoCheckmarkDoneOutline, 
  IoCopyOutline, 
  IoChevronDownOutline, 
  IoChevronUpOutline, 
  IoTrashOutline,
  IoCodeSlashOutline,
  IoExpandOutline,
  IoColorPaletteOutline,
  IoListOutline,
  IoLinkOutline,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ComponentPropsWithoutRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  reason?: string;
  showThinking?: boolean;
  messageId?: number;
  conversationId?: number;
  onDelete?: (messageId: number) => void;
  onRegenerate?: (messageId: number) => void;
}

interface CodeBlockProps {
  language: string;
  value: string;
  title?: string;
}

// 代码主题类型
type CodeTheme = 'dark' | 'light';

// 代码块组件
const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, title }) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<CodeTheme>('dark');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // 当进入全屏模式时，禁止body滚动
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const toggleThemeMenu = () => {
    setShowThemeMenu(!showThemeMenu);
  };

  const changeTheme = (newTheme: CodeTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };
  
  // 处理点击外部关闭主题菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 在组件卸载时确保恢复body滚动
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // 获取当前主题样式
  const codeStyle = theme === 'dark' ? vscDarkPlus : vs;
  const bgColor = theme === 'dark' ? '#1e1e1e' : '#f8f8f8';
  const headerBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200';
  const headerTextColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const headerBorderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const buttonHoverColor = theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-800';
  const buttonTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const blockBgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
  
  // 从语言标识符中提取语言名称
  const displayLanguage = language === 'jsx' ? 'React' : 
                         language === 'ts' ? 'TypeScript' :
                         language === 'js' ? 'JavaScript' :
                         language === 'py' ? 'Python' : 
                         language === 'java' ? 'Java' :
                         language === 'html' ? 'HTML' :
                         language === 'css' ? 'CSS' :
                         language.charAt(0).toUpperCase() + language.slice(1);

  // 全屏模式的DOM结构
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className={`relative w-[95vw] h-[90vh] flex flex-col overflow-hidden ${blockBgColor} rounded-lg shadow-2xl`}>
          {/* 代码标题和工具栏 */}
          <div className={`flex justify-between items-center px-3 py-1.5 ${headerBgColor} ${headerTextColor} border-b ${headerBorderColor}`}>
            <div className="flex items-center">
              <IoCodeSlashOutline className="mr-2" />
              <span className="text-sm font-medium">{title || displayLanguage}</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* 主题切换下拉菜单 */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={toggleThemeMenu}
                  className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors flex items-center`}
                  title="切换主题"
                >
                  <IoColorPaletteOutline size={16} />
                  <span className="ml-1 text-xs">{theme === 'dark' ? '深色版本' : '浅色版本'}</span>
                  <IoChevronDownOutline size={14} className="ml-1" />
                </button>
                
                {/* 主题选择下拉菜单 */}
                {showThemeMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => changeTheme('dark')}
                        className={`flex items-center w-full px-3 py-1.5 text-sm text-gray-900 text-left hover:bg-gray-100 ${theme === 'dark' ? 'bg-blue-50' : ''}`}
                      >
                        <span>深色版本</span>
                        {theme === 'dark' && <span className="ml-auto text-blue-500">✓</span>}
                      </button>
                      <button
                        onClick={() => changeTheme('light')}
                        className={`flex items-center w-full px-3 py-1.5 text-sm text-gray-900 text-left hover:bg-gray-100 ${theme === 'light' ? 'bg-blue-50' : ''}`}
                      >
                        <span>浅色版本</span>
                        {theme === 'light' && <span className="ml-auto text-blue-500">✓</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCopyCode}
                className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors`}
                title={copied ? "已复制" : "复制代码"}
              >
                {copied ? <IoCheckmarkDoneOutline size={16} /> : <IoCopyOutline size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors`}
                title="退出全屏"
              >
                <IoExpandOutline size={16} />
              </button>
            </div>
          </div>
          
          {/* 代码内容 */}
          <div className="flex-1 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={codeStyle}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                padding: '0.75rem',
                background: bgColor,
                height: '100%',
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  }

  // 正常模式的DOM结构
  return (
    <div className="relative group my-2">
      <div className={`relative ${blockBgColor} rounded-lg overflow-hidden`}>
        {/* 代码标题和工具栏 */}
        <div className={`flex justify-between items-center px-3 py-1 ${headerBgColor} ${headerTextColor} border-b ${headerBorderColor}`}>
          <div className="flex items-center">
            <IoCodeSlashOutline className="mr-2" />
            <span className="text-sm font-medium">{title || displayLanguage}</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* 主题切换下拉菜单 */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={toggleThemeMenu}
                className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors flex items-center`}
                title="切换主题"
              >
                <IoColorPaletteOutline size={16} />
                <span className="ml-1 text-xs">{theme === 'dark' ? '深色版本' : '浅色版本'}</span>
                <IoChevronDownOutline size={14} className="ml-1" />
              </button>
              
              {/* 主题选择下拉菜单 */}
              {showThemeMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => changeTheme('dark')}
                      className={`flex items-center w-full px-3 py-1.5 text-sm text-gray-900 text-left hover:bg-gray-100 ${theme === 'dark' ? 'bg-blue-50' : ''}`}
                    >
                      <span>深色版本</span>
                      {theme === 'dark' && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                    <button
                      onClick={() => changeTheme('light')}
                      className={`flex items-center w-full px-3 py-1.5 text-sm text-gray-900 text-left hover:bg-gray-100 ${theme === 'light' ? 'bg-blue-50' : ''}`}
                    >
                      <span>浅色版本</span>
                      {theme === 'light' && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleCopyCode}
              className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors`}
              title={copied ? "已复制" : "复制代码"}
            >
              {copied ? <IoCheckmarkDoneOutline size={16} /> : <IoCopyOutline size={16} />}
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-1 ${buttonTextColor} ${buttonHoverColor} rounded transition-colors`}
              title="全屏查看"
            >
              <IoExpandOutline size={16} />
            </button>
          </div>
        </div>
        
        {/* 代码内容 - 去除内边距，使代码块完全贴合容器 */}
        <div className="overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={codeStyle}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              padding: '0.5rem',
              background: bgColor,
            }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {value}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, 
  content, 
  reason, 
  showThinking, 
  messageId, 
  conversationId,
  onDelete,
  onRegenerate
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showReason, setShowReason] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 消息时间 - 实际使用中可从后端获取，这里仅作展示
  const messageTime = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!messageId || !onDelete) return;
    
    if (showDeleteConfirm) {
      // 执行删除操作
      onDelete(messageId);
      setShowDeleteConfirm(false);
      toast.success(t('messageDeleted') || '消息已删除');
    } else {
      // 显示删除确认
      setShowDeleteConfirm(true);
      // 5秒后自动关闭确认
      setTimeout(() => setShowDeleteConfirm(false), 5000);
    }
  };
  
  const handleRegenerate = () => {
    if (!messageId || !onRegenerate) return;
    onRegenerate(messageId);
    toast.success('正在重新生成...');
  };

  // 消息时间显示块
  const TimeDisplay = () => (
    <div className="text-center text-xs text-gray-400 my-2">{messageTime}</div>
  );

  return (
    <>
      {/* 可选的时间显示 */}
      {messageId === 1 && <TimeDisplay />}
      
      {/* 整体容器，增加左右内边距，让内容居中 */}
      <div className="px-4 md:px-10 lg:px-20 xl:px-32 max-w-6xl mx-auto">
        <div 
          className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
        >
          {/* 用户消息 */}
          {role === 'user' ? (
            <div className="flex items-start max-w-[80%]">
              <div className="order-2 ml-2 flex-shrink-0">
                {/* 用户头像 - 使用用户的实际头像 */}
                <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt="User Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500 dark:text-blue-400 font-semibold">
                      {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '用'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col order-1">
                <div className="px-4 py-2 rounded-lg rounded-tr-none bg-blue-500 text-white shadow-sm">
                  {content}
                </div>
                
                {/* 删除按钮 - 仅用户消息可删除 */}
                {messageId && onDelete && (
                  <div className="self-end mt-1">
                    <button
                      onClick={handleDelete}
                      className={`p-1 text-xs rounded transition-colors ${
                        showDeleteConfirm 
                          ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={showDeleteConfirm ? t('confirmDelete') : t('delete')}
                    >
                      {showDeleteConfirm ? '确认删除' : '删除'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AI消息 */
            <div className="flex items-start max-w-[80%]">
              <div className="mr-2 flex-shrink-0">
                {/* AI头像 - 使用网站logo */}
                <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden bg-white flex items-center justify-center">
            <Image 
              src="/images/logo-placeholder.svg" 
              alt="DeepSeek Logo" 
                    width={28} 
                    height={28} 
                    className="object-contain"
                  />
        </div>
          </div>
              <div className="flex flex-col">
          {/* 显示思考过程 */}
                {reason && showThinking && (
                  <div className="mb-1">
              <div 
                      className="flex items-center text-xs text-gray-500 mb-0.5 cursor-pointer"
                onClick={() => setShowReason(!showReason)}
              >
                      <div className="flex items-center bg-gray-200 rounded-full px-2 py-0.5">
                        <span className="mr-1">{t('deepThinkingEnabled') || '深度思考已启用'}</span>
                  {showReason ? (
                    <IoChevronUpOutline size={14} />
                  ) : (
                    <IoChevronDownOutline size={14} />
                  )}
                </div>
              </div>
              
              {showReason && (
                <div className="bg-gray-100 dark:bg-gray-800/50 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reason}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
                <div className="relative">
                  <div className="px-4 py-2 rounded-lg rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-a:transition-colors prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // 自定义代码块渲染
                          code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            
                            // 从代码内容中提取可选标题
                            let content = String(children).replace(/\n$/, '');
                            let title: string | undefined;
                            
                            // 检查代码块第一行是否为标题注释
                            const firstLineMatch = content.match(/^\/\/ (.+)|^# (.+)/);
                            if (firstLineMatch) {
                              title = firstLineMatch[1] || firstLineMatch[2];
                              // 移除标题行
                              content = content.replace(/^\/\/ (.+)\n|^# (.+)\n/, '');
                            }
                            
                            return !inline && match ? (
                              <CodeBlock 
                                language={language} 
                                value={content} 
                                title={title}
                              />
                            ) : (
                              <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-sm font-mono" {...props}>
                                {children}
                              </code>
                            );
                          },
                          // 保留自定义组件渲染
                          h1: ({ children, ...props }) => (
                            <h1 className="text-xl font-bold mt-4 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700" {...props}>
                              {children}
                            </h1>
                          ),
                          h2: ({ children, ...props }) => (
                            <h2 className="text-lg font-bold mt-3 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700" {...props}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children, ...props }) => (
                            <h3 className="text-base font-semibold mt-3 mb-1" {...props}>
                              {children}
                            </h3>
                          ),
                          a: ({ children, href, ...props }) => (
                            <a 
                              href={href} 
                              className="text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-0.5 transition-colors" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              {...props}
                            >
                              <span>{children}</span>
                              <IoLinkOutline size={14} className="inline-block" />
                            </a>
                          ),
                          ul: ({ children, ...props }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
                              {children}
                            </ul>
                          ),
                          ol: ({ children, ...props }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
                              {children}
                            </ol>
                          ),
                          li: ({ children, ...props }) => (
                            <li className="pl-1" {...props}>
                              {children}
                            </li>
                          ),
                          blockquote: ({ children, ...props }) => (
                            <blockquote className="border-l-4 border-blue-300 dark:border-blue-700 pl-4 py-1 my-3 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-r-md" {...props}>
                              {children}
                            </blockquote>
                          ),
                          table: ({ children, ...props }) => (
                            <div className="my-4 overflow-x-auto">
                              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg" {...props}>
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children, ...props }) => (
                            <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
                              {children}
                            </thead>
                          ),
                          tbody: ({ children, ...props }) => (
                            <tbody className="divide-y divide-gray-300 dark:divide-gray-700" {...props}>
                              {children}
                            </tbody>
                          ),
                          tr: ({ children, ...props }) => (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props}>
                              {children}
                            </tr>
                          ),
                          th: ({ children, ...props }) => (
                            <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700" {...props}>
                              {children}
                            </th>
                          ),
                          td: ({ children, ...props }) => (
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800" {...props}>
                              {children}
                            </td>
                          ),
                        }}
                      >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        
                  {/* AI消息底部操作栏 */}
                  <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                    {/* 所有功能按钮左对齐 */}
                    <div className="flex items-center gap-2">
                      {/* 复制按钮 */}
            <button
              onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={copied ? t('copied') || '已复制' : t('copy') || '复制'}
            >
              {copied ? (
                          <>
                            <IoCheckmarkDoneOutline size={14} className="text-green-500" />
                            <span className="text-green-500">{t('copied') || '已复制'}</span>
                          </>
              ) : (
                          <>
                            <IoCopyOutline size={14} />
                            <span>{t('copy') || '复制'}</span>
                          </>
              )}
            </button>
                      
                      {/* 重新生成按钮 */}
                      {onRegenerate && messageId && (
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="重新生成"
                        >
                          <IoRefreshOutline size={14} />
                          <span>重新生成</span>
                        </button>
                      )}
                      
                      {/* 删除按钮 */}
                      {onDelete && messageId && (
                        <button
                          onClick={handleDelete}
                          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                            showDeleteConfirm 
                              ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          title={showDeleteConfirm ? t('confirmDelete') || '确认删除' : t('delete') || '删除'}
                        >
                          <IoTrashOutline size={14} className={showDeleteConfirm ? 'text-red-500' : ''} />
                          <span>{showDeleteConfirm ? (t('confirmDelete') || '确认删除') : (t('delete') || '删除')}</span>
                        </button>
                      )}
                    </div>
                    
                    {/* 反馈按钮 */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="有帮助">
                        <IoThumbsUpOutline size={14} />
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="没帮助">
                        <IoThumbsDownOutline size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ChatMessage;