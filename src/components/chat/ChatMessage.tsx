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
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import mermaid from 'mermaid';
import { Components } from 'react-markdown';
import UserAvatar from '@/components/common/UserAvatar';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  reason?: string;
  showThinking?: boolean;
  messageId?: number;
  conversationId?: number;
  onDelete?: (messageId: number) => void;
  onRegenerate?: (messageId: number) => void;
  hasImages?: boolean;
  images?: Array<{
    id: number;
    signedUrl: string;
    ocrText: string;
    originalFileName: string;
  }>;
}

interface CodeBlockProps {
  language: string;
  value: string;
  title?: string;
}

// 代码主题类型
type CodeTheme = 'dark' | 'light';

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  }
});

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
  const codeStyle = theme === 'dark' ? oneDark : oneDark;
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
              PreTag="div" // 使用div替代pre标签，避免嵌套问题
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
        
        {/* 代码内容 - 避免在p标签内嵌套pre */}
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
            PreTag="div" // 使用div替代pre标签，避免嵌套问题
          >
            {value}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

// Mermaid 图表组件
const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (chartRef.current) {
        try {
          const { svg } = await mermaid.render('mermaid-chart', chart);
          setSvg(svg);
        } catch (error) {
          console.error('Mermaid 图表渲染失败:', error);
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="my-4 p-4 bg-white rounded-lg shadow-sm overflow-auto">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="text-gray-400 text-center py-4">图表加载中...</div>
      )}
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
  onRegenerate,
  hasImages,
  images
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
        <div className="grid grid-cols-[40px_1fr_40px] gap-2">
          {/* AI头像 */}
          <div className={`${role === 'assistant' ? 'col-start-1' : 'col-start-3'}`}>
            {role === 'assistant' ? (
              <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden bg-white flex items-center justify-center">
                <Image 
                  src="/images/logo-placeholder.svg" 
                  alt="DeepSeek Logo" 
                  width={28} 
                  height={28} 
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {user?.avatar ? (
                  <UserAvatar 
                    userId={user.id}
                    avatarUrl={user.avatar}
                    name={user.nickname || user.username || '用户'} 
                    size={32}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500 dark:text-blue-400 font-semibold">
                    {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '用'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 消息内容 */}
          <div className={`col-start-2 flex flex-col ${role === 'user' ? 'items-end' : 'items-start'}`}>
          
          {/* 图片显示部分 */}
          {hasImages && images && images.length > 0 && (
            <div className="mb-2 max-w-[calc(100%-6rem)]">
              <div className="flex flex-col gap-4">
                {images.map((img) => (
                  <div key={img.id} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="relative">
                      {/* 图片预览 */}
                      <a 
                        href={img.signedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block"
                        onClick={(e) => {
                          // 如果是base64图片且是临时预览，阻止点击打开新标签页
                          if (img.signedUrl.startsWith('data:image')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <img 
                          src={img.signedUrl} 
                          alt={img.originalFileName} 
                          className="max-w-full max-h-64 object-contain bg-gray-50"
                        />
                      </a>
                      
                      {/* 如果是临时预览(Base64格式)，显示加载指示器 */}
                      {img.signedUrl.startsWith('data:image') && !img.ocrText.includes('失败') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <div className="bg-white px-3 py-1 rounded-full text-xs flex items-center">
                            <div className="animate-spin h-3 w-3 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                            <span>正在处理...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* 如果图片处理失败，显示错误提示 */}
                      {img.ocrText && img.ocrText.includes('失败') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="bg-white px-3 py-1 rounded-full text-xs flex items-center text-red-500">
                            <span>处理失败</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {img.ocrText && (
                      <div className="p-3 bg-white border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">识别的文本:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {img.ocrText === '正在处理...' ? (
                            <div className="flex items-center text-gray-500">
                              <div className="animate-pulse flex space-x-1 mr-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                              正在识别文本...
                            </div>
                          ) : img.ocrText.includes('失败') ? (
                            <div className="text-red-500">{img.ocrText}</div>
                          ) : (
                            img.ocrText
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 显示思考过程 */}
          {role === 'assistant' && reason && showThinking && (
              <div className="mb-1 max-w-[calc(100%-6rem)]">
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
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 处理p标签内可能的div嵌套问题
                        p: ({ children, ...props }: any) => {
                          // 检查children是否包含不允许在p标签内的元素
                          const isSimpleChildren = React.Children.toArray(children).every(
                            (child) => typeof child === 'string' || 
                                      (typeof child === 'object' && 
                                      'type' in child && 
                                      typeof child.type === 'string' && 
                                      ['a', 'em', 'strong', 'code', 'span', 'br'].includes(child.type))
                          );

                          // 如果children中有复杂元素，使用div代替p
                          return isSimpleChildren ? (
                            <p {...props}>{children}</p>
                          ) : (
                            <div {...props}>{children}</div>
                          );
                        },
                        // 如果有代码块，避免嵌套问题
                        code: ({ node, inline, className, children, ...props }: any) => {
                          if (inline) {
                            return <code className={className} {...props}>{children}</code>;
                          }
                          return <div className="bg-gray-800 rounded p-2 my-2 text-gray-200 overflow-x-auto"><code className={className} {...props}>{children}</code></div>;
                        }
                      }}
                    >
                    {reason}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          
            <div className={`${
              role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              } px-4 py-2 rounded-lg ${role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm max-w-[calc(100%-6rem)]`}
            >
              {role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-a:transition-colors prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const value = String(children).replace(/\n$/, '');

                        // 处理 Mermaid 图表
                        if (language === 'mermaid') {
                          // 这里直接返回MermaidChart，不会嵌套在p标签内
                          return <MermaidChart chart={value} />;
                        }

                        // 处理普通代码块
                        if (!inline) {
                          const titleMatch = value.match(/^\/\/ ?title: ?(.+)$/m);
                          const title = titleMatch ? titleMatch[1] : undefined;
                          const codeValue = titleMatch ? value.replace(/^\/\/ ?title: ?(.+)$/m, '') : value;
                          
                          // 这里直接返回CodeBlock，不会嵌套在p标签内
                          return (
                            <CodeBlock
                              language={language}
                              value={codeValue.trim()}
                              title={title}
                            />
                          );
                        }

                        // 内联代码仍然可以放在p标签内
                        return <code className={className} {...props}>{children}</code>;
                      },
                      // 处理p标签内可能的div嵌套问题
                      p: ({ children, ...props }: any) => {
                        // 检查children是否包含不允许在p标签内的元素
                        const isSimpleChildren = React.Children.toArray(children).every(
                          (child) => typeof child === 'string' || 
                                    (typeof child === 'object' && 
                                     'type' in child && 
                                     typeof child.type === 'string' && 
                                     ['a', 'em', 'strong', 'code', 'span', 'br'].includes(child.type))
                        );

                        // 如果children中有复杂元素，使用div代替p
                        return isSimpleChildren ? (
                          <p {...props}>{children}</p>
                        ) : (
                          <div {...props}>{children}</div>
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
              ) : (
                content
              )}
        </div>
        
            {/* 消息操作按钮 */}
        {role === 'assistant' && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 max-w-[calc(100%-6rem)]">
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
                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="有帮助">
                    <IoThumbsUpOutline size={14} />
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="没帮助">
                    <IoThumbsDownOutline size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* 删除按钮 - 仅用户消息可删除 */}
            {role === 'user' && messageId && onDelete && (
              <div className="mt-1">
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

          {/* 空白列，用于保持布局对称 */}
          <div className="col-start-3"></div>
        </div>
      </div>
    </>
  );
};

export default ChatMessage;