"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IoSendOutline, IoStopOutline, IoRefreshOutline, IoImageOutline, IoAttach, IoCloseOutline, IoBulbOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChatInputProps {
  onSendMessage: (message: string, image?: File | null, file?: File | null) => void;
  isLoading: boolean;
  isGenerating?: boolean;
  deepThinking: boolean;
  setDeepThinking: (value: boolean) => void;
  onNewChat?: () => void;
  onStopGeneration?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isGenerating = false, deepThinking, setDeepThinking, onNewChat, onStopGeneration }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // 自动调整文本域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);
  
  // 处理发送消息
  const handleSend = () => {
    if ((message.trim() || selectedImage || selectedFile) && !isLoading) {
      onSendMessage(message.trim(), selectedImage, selectedFile);
      setMessage('');
      setSelectedImage(null);
      setSelectedFile(null);
      setImagePreview(null);
      
      // 重置输入
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      
      // 重置文本域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } else if (isLoading && isGenerating && onStopGeneration) {
      // 如果正在生成中，则认为用户想停止生成
      onStopGeneration();
    }
  };
  
  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (isGenerating && onStopGeneration) {
        // 如果正在生成，按下Enter键停止生成
        onStopGeneration();
      } else if (!isLoading && (message.trim() || selectedImage || selectedFile)) {
        // 否则发送消息
        handleSend();
      }
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!isAuthenticated) {
        toast.error('请先登录后再上传文件');
        return;
      }
      
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        toast.error('文件大小不能超过10MB');
        return;
      }
      
      setSelectedFile(file);
      
      // 清除可能已选择的图片
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      
      toast.success(`已选择文件: ${file.name}`);
      
      // 自动在消息框添加文件信息
      setMessage(prev => 
        prev + (prev.length > 0 && prev.trim().charAt(prev.length - 1) !== '\n' ? '\n' : '') + 
        `[文件: ${file.name} (${(file.size / 1024).toFixed(1)}KB)]`
      );
    }
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!isAuthenticated) {
        toast.error('请先登录后再上传图片');
        return;
      }
      
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB限制
        toast.error('图片大小不能超过5MB');
        return;
      }
      
      // 清除可能已选择的文件
      if (selectedFile) {
        removeSelectedFile();
      }
      
      setSelectedImage(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('图片已选择');
    }
  };

  // 移除已选择的图片
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // 移除已选择的文件
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // 从消息中移除文件信息
    const fileRegex = /\[文件: .+ \(\d+(\.\d+)?KB\)\]/g;
    setMessage(prev => prev.replace(fileRegex, '').trim());
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors duration-200">
      {/* 深度思考状态提示 */}
      {deepThinking && (
        <div className="text-center mt-1 mb-1">
          <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-200">
            <IoBulbOutline size={12} />
            <span>深度思考已开启</span>
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* 图片预览区域 */}
        {imagePreview && (
          <div className="p-2 border-b border-gray-200">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Selected" 
                className="max-h-40 max-w-full rounded-lg"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition-all"
                title="移除图片"
              >
                <IoCloseOutline size={16} />
              </button>
            </div>
          </div>
        )}
        
        {selectedFile && (
          <div className="p-2 border-b border-gray-200 flex items-center">
            <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 max-w-full">
              <IoAttach size={16} className="text-gray-600 shrink-0" />
              <span className="truncate text-sm text-gray-700">{selectedFile.name}</span>
              <span className="text-xs text-gray-500 shrink-0">({(selectedFile.size / 1024).toFixed(1)}KB)</span>
              <button
                onClick={removeSelectedFile}
                className="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-all"
                title="移除文件"
              >
                <IoCloseOutline size={14} />
              </button>
            </div>
          </div>
        )}
        
        {/* 输入框区域 */}
        <div className="flex items-end bg-white rounded-lg overflow-hidden">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="给 DeepSeek 发送消息"
            className="flex-1 p-3 max-h-[200px] resize-none outline-none border-none text-base"
            disabled={isLoading}
          />
          
          <div className="flex items-center p-2 space-x-1">
            {/* 文件上传 - 隐藏的文件输入 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            />
            
            {/* 图片上传 - 隐藏的图片输入 */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageSelect}
              className="hidden"
              accept="image/*"
            />
            
            {/* 附件上传图标 */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="添加附件"
              disabled={isLoading || isGenerating}
            >
              <IoAttach size={20} />
            </button>
            
            {/* 图片上传图标 */}
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="添加图片"
              disabled={isLoading || isGenerating}
            >
              <IoImageOutline size={20} />
            </button>
            
            {/* 深度思考开关按钮 */}
            <button 
              onClick={() => {
                const newState = !deepThinking;
                setDeepThinking(newState);
                if (newState) {
                  toast.success('已开启深度思考，AI将展示思考过程');
                } else {
                  toast.success('已关闭深度思考');
                }
              }}
              className={`p-2 rounded-full transition-colors ${
                deepThinking 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={deepThinking ? "关闭深度思考" : "开启深度思考模式，查看AI的思考过程"}
              disabled={isLoading || isGenerating}
            >
              <IoBulbOutline size={20} />
            </button>
            
            {/* 新建对话按钮 */}
            <button 
              onClick={onNewChat}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title={t('newChat')}
              disabled={isLoading || isGenerating}
            >
              <IoRefreshOutline size={18} />
            </button>
            
            {/* 发送按钮 */}
            <button 
              onClick={handleSend}
              disabled={(!message.trim() && !selectedImage && !selectedFile) && !isGenerating}
              className={`
                p-2 rounded-full transition-colors
                ${(!message.trim() && !selectedImage && !selectedFile) && !isGenerating
                  ? 'text-gray-400 cursor-not-allowed' 
                  : isGenerating
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                    : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'}
              `}
              title={isGenerating ? '停止生成' : '发送'}
            >
              {isGenerating ? (
                <IoStopOutline size={20} />
              ) : (
                <IoSendOutline size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;