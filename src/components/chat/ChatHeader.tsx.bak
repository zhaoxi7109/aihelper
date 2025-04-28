"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IoPencilOutline, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

// 定义模型选项
const modelOptions = [
  { id: 'deepseek-r1', name: 'DeepSeek-R1', description: '通用大语言模型' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', description: '增强版大语言模型' },
  { id: 'qwen-plus', name: 'Qwen-Plus', description: '通义千问大模型' }
];

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  chatTitle?: string;
  conversationId?: number | null;
  onUpdateTitle?: (id: number, newTitle: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedModel, onModelChange, chatTitle, conversationId, onUpdateTitle }) => {
  const { t } = useLanguage();
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // 获取当前选中的模型数据
  const currentModel = modelOptions.find(model => model.id === selectedModel) || modelOptions[0];
  
  // 点击外部关闭模型菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setModelMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleModelMenu = () => {
    setModelMenuOpen(!modelMenuOpen);
  };

  const selectModel = (modelId: string) => {
    onModelChange(modelId);
    setModelMenuOpen(false);
  };
  
  // 开始编辑标题
  const startEditingTitle = () => {
    if (chatTitle && conversationId) {
      setTitleInput(chatTitle);
      setIsEditingTitle(true);
      // 在下一个渲染周期聚焦输入框
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  };
  
  // 保存标题
  const saveTitle = () => {
    if (conversationId && onUpdateTitle && titleInput.trim()) {
      onUpdateTitle(conversationId, titleInput.trim());
    }
    setIsEditingTitle(false);
  };
  
  // 取消编辑
  const cancelEditing = () => {
    setIsEditingTitle(false);
  };
  
  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  return (
    <div className="fixed top-0 left-[260px] z-10 p-2 bg-white bg-opacity-95 shadow-md m-2 max-w-[300px] rounded-lg">
      <div className="flex flex-col items-start space-y-2">
        {/* 会话标题 */}
        {chatTitle && conversationId && (
          <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-all duration-200 w-full">
            {isEditingTitle ? (
              <div className="flex items-center w-full">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-3 py-1.5 bg-white border-0 focus:ring-2 focus:ring-blue-500 rounded-l-lg outline-none text-sm flex-1 transition-all"
                  placeholder={t('enterTitle')}
                />
                <button 
                  onClick={saveTitle}
                  className="p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                  title={t('saveTitle')}
                >
                  <IoCheckmarkOutline size={18} className="transform hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={cancelEditing}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-r-lg transition-colors"
                  title={t('cancel')}
                >
                  <IoCloseOutline size={18} className="transform hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center w-full">
                <span className="px-3 py-1.5 text-gray-700 font-medium text-sm truncate flex-1">{chatTitle}</span>
                <button 
                  onClick={startEditingTitle}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-all duration-200"
                  title={t('editTitle')}
                >
                  <IoPencilOutline size={16} className="transform hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* 模型选择下拉菜单 */}
        <div ref={modelMenuRef} className="relative w-full">
          <button 
            onClick={toggleModelMenu}
            className="flex items-center justify-between w-full py-1.5 px-3 text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-gray-200 shadow-sm hover:shadow"
          >
            <span className="font-medium text-sm">{currentModel.name}</span>
            {modelMenuOpen ? 
              <FiChevronUp size={14} className="text-blue-500 transition-transform duration-200" /> : 
              <FiChevronDown size={14} className="transition-transform duration-200" />}
          </button>
          
          {modelMenuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-full z-20 animate-fadeIn">
              {modelOptions.map(model => (
                <div 
                  key={model.id}
                  onClick={() => selectModel(model.id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ${selectedModel === model.id ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${selectedModel === model.id ? 'text-blue-600' : 'text-gray-700'}`}>
                      {model.name}
                    </span>
                    {selectedModel === model.id && (
                      <span className="text-blue-500 ml-2 text-sm">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;