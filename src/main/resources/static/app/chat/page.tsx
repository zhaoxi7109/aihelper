"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessage from '@/components/chat/ChatMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { IoAlertCircleOutline } from 'react-icons/io5';
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
}

export default function ChatPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // 消息状态
  const [messages, setMessages] = useState<Message[]>([
    {role: 'assistant', content: t('welcomeMessage')}
  ]);
  
  // UI状态
  const [isLoading, setIsLoading] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [chatTitle, setChatTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-r1');
  const [error, setError] = useState<string | null>(null);
  
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
          id: msg.id,
          conversationId,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          reason: msg.reasoningContent
        }));
        
        // 如果没有消息，显示一条欢迎消息
        if (formattedMessages.length === 0) {
          setMessages([{role: 'assistant', content: t('welcomeMessage')}]);
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
      setMessages([{role: 'assistant', content: '获取对话历史失败，请重试或开始新的对话。'}]);
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
    setMessages([{role: 'assistant', content: t('welcomeMessage')}]);
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
  
  // 将新消息加入到界面
  const addUserMessage = (message: string) => {
    setMessages(prev => [...prev, {role: 'user', content: message}]);
  };
  
  const addAssistantMessage = (content: string, reason?: string, messageId?: number) => {
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant', 
      content,
      reason
    }]);
  };
  
  // 发送消息的函数
  const sendMessage = async (message: string, image?: File | null, file?: File | null) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // 如果有当前会话ID，直接发送消息
      if (!currentConversationId) {
        try {
          const newTitle = generateChatTitle(message);
          // 使用request函数创建对话
          const response = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: newTitle || '新对话',
              model: selectedModel
            })
          });
          
          const data = await response.json();
          if (data && data.code === 200 && data.data && data.data.id) {
            setCurrentConversationId(data.data.id);
            // 刷新对话列表
            fetchConversations();
          } else {
            throw new Error('创建对话失败');
          }
        } catch (err) {
          console.error('创建对话失败:', err);
          setError('创建对话失败，请重试');
          setIsLoading(false);
          return;
        }
      }
      
      addUserMessage(message);

      // 发送消息到API
      const response = await api.chat.sendMessage({
        prompt: message,
        conversationId: currentConversationId || undefined,
        model: selectedModel,
        deepThinking: false
      });

      if (response.code === 200 && response.data) {
        addAssistantMessage(
          response.data.response, 
          response.data.reason, 
          response.data.messageId
        );
      } else {
        throw new Error('发送消息失败');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError('发送消息失败，请重试');
      // 如果是网络错误，添加一条提示消息
      addAssistantMessage('抱歉，发送消息时出现错误，请重试。');
    } finally {
      setIsLoading(false);
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
                      sendMessage(lastUserMessage.content, undefined, undefined);
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
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
              deepThinking={deepThinking}
              setDeepThinking={setDeepThinking}
              onNewChat={startNewChat}
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