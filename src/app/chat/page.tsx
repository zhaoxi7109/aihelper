"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';

// 定义对话类型
interface Conversation {
  id: number;
  userId: number;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

// 定义消息类型
interface Message {
  id?: number;
  conversationId?: number;
  role: 'user' | 'assistant';
  content: string;
  reasoningContent?: string;
  reason?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  hasImages?: boolean;
  images?: Array<{
    id: number;
    signedUrl: string;
    ocrText: string;
    originalFileName: string;
  }>;
}

export default function ChatPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  // 创建临时ID生成函数
  const generateTempId = (): number => {
    return -Math.floor(Math.random() * 1000000);
  };
  
  // 消息状态
  const [messages, setMessages] = useState<Message[]>([
    {id: generateTempId(), role: 'assistant', content: t('welcomeMessage')}
  ]);
  
  // UI状态
  const [isLoading, setIsLoading] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-r1');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在生成中
  
  // 对话状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // 获取用户所有对话历史
  const fetchConversations = async () => {
    if (!isAuthenticated || !user || !user.id) {
      console.log('用户未登录或用户ID不存在，无法获取对话历史');
      return;
    }
    
    try {
      setIsLoadingConversations(true);
      console.log(`开始获取用户(ID: ${user.id})的对话历史...`);
      
      // 使用api工具替代直接fetch调用
      const response = await api.conversations.getAll(user.id);
      
      if (response && response.code === 200 && Array.isArray(response.data)) {
        setConversations(response.data);
        console.log('已获取对话历史:', response.data.length, '条');
      }
    } catch (error) {
      console.error('获取对话历史出错:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };
  
  // 获取指定对话的消息历史
  const fetchConversationMessages = async (conversationId: number) => {
    if (!conversationId) {
      console.error('无效的对话ID');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`开始获取对话(ID: ${conversationId})的消息列表...`);
      
      // 使用api工具替代直接fetch调用
      const response = await api.conversations.getMessages(conversationId);
      
      if (response && response.code === 200 && Array.isArray(response.data)) {
        // 将API返回的消息格式转换为本地消息格式，保留id字段
        const formattedMessages = response.data.map((msg: any) => ({
          id: msg.id || generateTempId(), // 确保每条消息都有ID
          conversationId,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          reason: msg.reasoningContent,
          hasImages: msg.hasImages || false,
          images: msg.images || []
        }));
        
        // 如果没有消息，显示一条欢迎消息
        if (formattedMessages.length === 0) {
          setMessages([{id: generateTempId(), role: 'assistant', content: t('welcomeMessage')}]);
        } else {
          setMessages(formattedMessages);
        }
        
        // 获取对话标题
        const conversationDetails = conversations.find(c => c.id === conversationId);
        if (conversationDetails) {
          setChatTitle(conversationDetails.title);
          
          // 如果对话有指定模型，使用该模型
          if (conversationDetails.model) {
            setSelectedModel(conversationDetails.model);
          }
        }
        
        console.log('已获取对话消息:', response.data.length, '条');
      }
    } catch (error) {
      console.error('获取对话消息出错:', error);
      // 如果获取失败，显示一条错误消息
      setMessages([{id: generateTempId(), role: 'assistant', content: '获取对话历史失败，请重试或开始新的对话。'}]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载用户对话历史
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchConversations();
    }
  }, [isAuthenticated, user?.id]);
  
  // 开始新对话
  const startNewChat = () => {
    setMessages([{id: generateTempId(), role: 'assistant', content: t('welcomeMessage')}]);
    setChatTitle('');
    setCurrentConversationId(null);
  };

  // 切换到指定对话
  const switchConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
    fetchConversationMessages(conversationId);
  };

  // 生成对话标题
  const generateChatTitle = (userMessage: string) => {
    // 简单地取用户第一条消息的前20个字符作为标题
    const title = userMessage.length > 20 
      ? userMessage.substring(0, 20) + '...' 
      : userMessage;
    setChatTitle(title);
    return title;
  };
  
  // 添加用户消息 - 使用临时ID
  const addUserMessage = (message: string) => {
    setMessages(prev => [...prev, {
      id: generateTempId(),
      role: 'user', 
      content: message
    }]);
  };
  
  const addAssistantMessage = (content: string, reason?: string, messageId?: number) => {
    setMessages(prev => [...prev, {
      id: messageId || generateTempId(),
      role: 'assistant', 
      content,
      reason
    }]);
  };
  
  // 停止生成
  const stopGeneration = async () => {
    if (!currentConversationId) {
      console.log('无法停止生成：没有活动的会话ID');
      toast.error('没有活动的会话，无法停止生成');
      return;
    }
    
    console.log(`尝试停止会话 ${currentConversationId} 的生成...`);
    
    try {
      // 调用停止生成接口
      const response = await api.chat.stopGeneration(currentConversationId);
      console.log('停止生成响应:', response);
      
      if (response.code === 200 && response.data) {
        toast.success('已停止生成');
        // 更新最后一条消息，添加中断提示
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += '\n\n---\n*生成已被用户中断*';
          }
          return newMessages;
        });
      } else {
        toast.error(response.message || '停止生成失败');
        console.log('停止生成失败，原因:', response.message);
      }
    } catch (error: any) {
      console.error('停止生成失败:', error);
      
      // 提取错误消息
      let errorMessage = '停止生成失败';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('停止生成错误详情:', errorMessage);
      
      // 如果是404错误（未找到生成请求或已完成），显示更友好的提示
      if (error.response && error.response.status === 404 || 
          (error.response && error.response.data && error.response.data.code === 404) ||
          errorMessage.includes('未找到') || 
          errorMessage.includes('已完成')) {
        toast.success('生成已完成或不存在，无需停止');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  // 处理发送消息
  const handleSendMessage = (message: string, image?: File | null, file?: File | null) => {
    if (isGenerating) {
      // 如果正在生成中，点击发送按钮将停止生成
      stopGeneration();
      return;
    }
    
    // 否则，正常发送消息
    sendMessage(message, image, file);
  };
  
  // 发送消息的函数
  const sendMessage = async (message: string, image?: File | null, file?: File | null) => {
    if (!message.trim() && !image) return;
    
    setIsLoading(true);
    setIsGenerating(true); // 设置为生成中状态
    setError(null);
    
    // 处理图片转换为Base64和创建临时预览
    let imageBase64List: string[] = [];
    let tempPreviewImages: Array<{
      id: number;
      signedUrl: string;
      ocrText: string;
      originalFileName: string;
    }> = [];
    
    if (image) {
      try {
        const base64 = await fileToBase64(image);
        imageBase64List.push(base64);
        
        // 创建临时的图片预览对象
        tempPreviewImages.push({
          id: generateTempId(),
          signedUrl: base64, // 临时使用base64作为预览URL
          ocrText: '正在处理...',
          originalFileName: image.name
        });
      } catch (error) {
        console.error('图片转换Base64失败:', error);
        toast.error('图片处理失败，请重试');
        setIsLoading(false);
        return;
      }
    }
    
    // 创建用户消息对象（带临时ID）
    const tempMessageId = generateTempId();
    const userMessage: Message = {
      id: tempMessageId,
      role: 'user', 
      content: message,
      hasImages: !!image,
      images: tempPreviewImages // 添加临时预览图片
    };
    
    // 将用户消息添加到界面
    setMessages(prev => [...prev, userMessage]);
    
    // 将视图滚动到底部
    scrollToBottom();

    try {
      // 如果没有当前会话ID且用户已登录，则创建新会话
      if (!currentConversationId && isAuthenticated) {
        try {
          // 检查用户是否已登录
          if (!user?.id) {
            toast.error('用户信息不完整，请重新登录');
            setIsLoading(false);
            return;
          }
          
          const newTitle = generateChatTitle(message);
          // 使用api工具创建对话，而不是直接fetch
          const response = await api.conversations.create({
            title: newTitle || '新对话',
            model: selectedModel,
            userId: user.id
          });
          
          if (response && response.code === 200 && response.data && response.data.id) {
            setCurrentConversationId(response.data.id);
            // 刷新对话列表
            fetchConversations();
          } else {
            throw new Error(response?.message || '创建对话失败');
          }
        } catch (err: any) {
          console.error('创建对话失败:', err);
          
          // 提取错误信息
          let errorMessage = '创建对话失败，请重试';
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }
      }
      
      // 发送消息到API
      console.log(`发送消息，深度思考模式: ${deepThinking ? '开启' : '关闭'}`);
      const response = await api.chat.sendMessage({
        prompt: message,
        conversationId: currentConversationId || undefined,
        userId: user?.id, // 添加用户ID
        model: selectedModel,
        deepThinking: deepThinking, // 使用深度思考状态
        imageBase64List: imageBase64List.length > 0 ? imageBase64List : undefined
      });

      if (response.code === 200 && response.data) {
        // 如果是非登录用户的会话，需要更新currentConversationId
        if (!currentConversationId && response.data.conversationId) {
          setCurrentConversationId(response.data.conversationId);
          
          // 如果用户已登录，刷新对话列表
          if (isAuthenticated && user?.id) {
            fetchConversations();
          }
        }
        
        // 更新带图片的用户消息，用实际的图片URL替换临时预览
        if (response.data.images && response.data.images.length > 0) {
          setMessages(prev => prev.map(msg => {
            // 查找最后一条用户消息并更新其图片
            if (msg.role === 'user' && msg.id === tempMessageId) {
              return {
                ...msg,
                hasImages: true,
                images: response.data.images // 使用后端返回的真实图片信息替换临时预览
              };
            }
            return msg;
          }));
        }
        
        // 添加助手回复消息
        addAssistantMessage(
          response.data.response, 
          response.data.reason, 
          response.data.messageId || generateTempId()
        );
      } else {
        throw new Error('发送消息失败');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      // 将所有临时图片标记为处理失败
      if (tempPreviewImages.length > 0) {
        const updatedMessages = [...messages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'user') {
          if (lastMessage.images) {
            lastMessage.images = lastMessage.images.map(img => {
              if (img.signedUrl.startsWith('data:image')) {
                return {
                  ...img,
                  ocrText: '图片处理失败，请重试'
                };
              }
              return img;
            });
            setMessages(updatedMessages);
          }
        }
      }

      // 错误处理逻辑
      if (error.message) {
        // 提取错误信息
        let errorMessage = '发送消息失败，请重试';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
        
        // 根据错误类型提供不同的提示
        if (errorMessage.includes('认证') || errorMessage.includes('授权') || errorMessage.includes('token')) {
          addAssistantMessage('抱歉，您的登录状态已失效，请重新登录后再试。', undefined, generateTempId());
          // 可以在这里添加重定向到登录页面的逻辑
        } else if (errorMessage.includes('会话') || errorMessage.includes('对话')) {
          addAssistantMessage('抱歉，会话创建失败，您可以尝试刷新页面或重新开始对话。', undefined, generateTempId());
        } else {
          addAssistantMessage(`抱歉，发送消息时出现错误：${errorMessage}`, undefined, generateTempId());
        }
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false); // 生成完成
    }
  };
  
  // 处理模型变更
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    console.log('模型已切换至:', modelId);
  };
  
  // 更新会话标题
  const updateConversationTitle = async (conversationId: number, newTitle: string) => {
    if (!conversationId) return;
    
    try {
      // 调用API更新标题
      await api.conversations.updateTitle(conversationId, newTitle);
      console.log('会话标题更新成功:', newTitle);
      
      // 更新本地状态
      setChatTitle(newTitle);
      
      // 更新会话列表中的标题
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? {...conv, title: newTitle} : conv
      ));
      
      toast.success(t('titleUpdated') || '标题已更新');
    } catch (error) {
      console.error('更新会话标题出错:', error);
      toast.error(t('titleUpdateFailed') || '标题更新失败');
    }
  };
  
  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理对话删除后的操作
  const handleConversationDeleted = (id: number) => {
    // 如果删除的是当前对话，开始新对话
    if (id === currentConversationId) {
      startNewChat();
    }
    
    // 刷新对话列表
    fetchConversations();
  };

  // 删除消息的处理函数
  const handleDeleteMessage = async (messageId: number) => {
    if (!messageId) {
      toast.error(t('messageDeleteFailed'));
      return;
    }
    
    try {
      // 调用正确的API删除消息
      await api.messages.delete(messageId);
      console.log('消息删除成功:', messageId);
      
      // 更新界面上的消息
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast.success(t('messageDeleted'));
    } catch (error) {
      console.error('删除消息出错:', error);
      toast.error(t('messageDeleteFailed'));
    }
  };

  // 辅助函数：将文件转换为Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // 辅助函数：滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={switchConversation}
        onNewChat={startNewChat}
        isLoading={isLoadingConversations}
        onConversationDeleted={handleConversationDeleted}
        isExpanded={isSidebarExpanded}
        onToggle={(expanded) => setIsSidebarExpanded(expanded)}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader 
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          chatTitle={chatTitle}
          conversationId={currentConversationId}
          onUpdateTitle={updateConversationTitle}
          isSidebarExpanded={isSidebarExpanded}
        />
        
        <div className="flex-1 overflow-y-auto pt-16 px-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              role={message.role} 
              content={message.content} 
              reason={message.reason}
              showThinking={deepThinking}
              messageId={message.id}
              conversationId={currentConversationId || undefined}
              onDelete={handleDeleteMessage}
              onRegenerate={message.role === 'assistant' ? 
                (messageId) => {
                  // 重新生成最近一条AI回复
                  if (messageId && message.id === messageId) {
                    const lastUserMessage = messages
                      .slice(0, index)
                      .reverse()
                      .find(msg => msg.role === 'user');
                    
                    if (lastUserMessage) {
                      // 重新调用发送函数但不添加用户消息
                      sendMessage(lastUserMessage.content);
                    }
                  }
                } : undefined}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 聊天输入和底部区域 */}
        <div className="bg-gray-50 relative">
          {/* 消息输入区域 - 宽度参考图片中红色方框 */}
          <div className="w-[calc(100%-2rem)] mx-auto mt-0 pt-4" style={{ maxWidth: "1024px" }}>
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              isGenerating={isGenerating}
              deepThinking={deepThinking}
              setDeepThinking={setDeepThinking}
              onNewChat={startNewChat}
              onStopGeneration={stopGeneration}
            />
            {/* 提示文字 */}
            <div className="text-center text-xs text-gray-400 mt-2 mb-4">
              内容由 AI 生成，请仔细甄别
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}