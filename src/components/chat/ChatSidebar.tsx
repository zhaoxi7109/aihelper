"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IoAddOutline, IoTrashOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalInfo from './PersonalInfo';
import api from '@/utils/api';
import toast from 'react-hot-toast';

interface Conversation {
  id: number;
  userId: number;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  isLoading: boolean;
  onConversationDeleted: (id: number) => void;
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isLoading,
  onConversationDeleted,
  isExpanded,
  onToggle
}) => {
  const { t, language } = useLanguage();

  const handleDeleteChat = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(t('confirmDeleteConversation'))) {
      return;
    }
    
    try {
      // 使用api工具代替直接的fetch调用
      await api.conversations.delete(id);
      
      console.log('对话删除成功:', id);
      // 通知父组件对话已删除
      onConversationDeleted(id);
      
      // 使用toast提示操作成功
      toast.success(t('conversationDeleted'));
      
    } catch (error) {
      console.error('删除对话出错:', error);
      // 使用toast提示操作失败
      toast.error(t('conversationDeleteFailed'));
    }
  };

  const toggleSidebar = () => {
    onToggle(!isExpanded);
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 判断是今天、昨天还是更早
    if (date.toDateString() === now.toDateString()) {
      return t('today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday');
    } else {
      // 显示具体日期，格式：MM-DD
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  };

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-16'} bg-gray-100 border-r border-gray-200 flex flex-col h-full transition-all duration-300 relative`}>
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 border border-gray-200 rounded-full p-1 hover:bg-gray-200 transition-colors z-10"
      >
        {isExpanded ? <IoChevronBackOutline size={16} /> : <IoChevronForwardOutline size={16} />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <button 
              onClick={onNewChat}
              className="w-full flex items-center justify-center py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <IoAddOutline size={20} className={isExpanded ? 'mr-2' : ''} />
              {isExpanded && <span>{t('newChat')}</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="animate-pulse">加载对话历史中...</div>
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ x: 4 }}
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`
                      flex justify-between items-center p-3 rounded-lg cursor-pointer group
                      ${currentConversationId === conversation.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'}
                    `}
                  >
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{conversation.title}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="mr-2">{formatDate(conversation.createdAt)}</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-1 rounded">{conversation.model}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleDeleteChat(conversation.id, e)}
                      className={`
                        p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-100
                        ${currentConversationId === conversation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                      `}
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  没有对话历史
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 个人信息组件 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-auto border-t border-gray-200 p-2"
          >
            <PersonalInfo />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatSidebar;