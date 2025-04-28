"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

// 引入API基础配置
const API_BASE_URL = 'http://localhost:8080';

// MCP服务定义
const mcpServices = [
  { 
    id: 'amap', 
    name: '高德地图', 
    nameEn: 'AMap Maps',
    description: '提供地理位置和地图服务'
  }
  // 可以在这里添加更多MCP服务
];

interface McpServicePanelProps {
  onClose?: () => void;
}

const McpServicePanel: React.FC<McpServicePanelProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [servicesStatus, setServicesStatus] = useState<Record<string, any>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // 获取MCP服务状态
  const fetchMcpServiceStatus = async (mcpType: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      // 注意：API已更改为POST请求，并需要请求体
      const response = await fetch(`${API_BASE_URL}/api/settings/mcp/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mcpType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServicesStatus(prev => ({
          ...prev,
          [mcpType]: data.data
        }));
        return data.data;
      }
    } catch (error) {
      console.error(`获取${mcpType}服务状态失败:`, error);
    }
    return null;
  };

  // 启用MCP服务
  const enableMcpService = async (mcpType: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/settings/mcp/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mcpType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServicesStatus(prev => ({
          ...prev,
          [mcpType]: data.data
        }));
        return data.data;
      }
    } catch (error) {
      console.error(`启用${mcpType}服务失败:`, error);
    }
    return null;
  };

  // 禁用MCP服务
  const disableMcpService = async (mcpType: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/settings/mcp/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mcpType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServicesStatus(prev => ({
          ...prev,
          [mcpType]: data.data
        }));
        return data.data;
      }
    } catch (error) {
      console.error(`禁用${mcpType}服务失败:`, error);
    }
    return null;
  };

  // 切换MCP服务状态
  const toggleMcpService = async (mcpType: string) => {
    const currentStatus = servicesStatus[mcpType];
    if (currentStatus && currentStatus.enabled) {
      await disableMcpService(mcpType);
    } else {
      await enableMcpService(mcpType);
    }
  };

  // 获取状态指示灯颜色
  const getStatusColor = (service: any) => {
    if (!service) return 'bg-gray-500'; // 未知状态，灰色
    if (!service.enabled) return 'bg-gray-800'; // 关闭状态，黑色
    if (service.statusCode === 'running') return 'bg-green-500'; // 正常运行，绿色
    return 'bg-red-500'; // 异常状态，红色
  };

  // 初始化时获取所有MCP服务状态
  useEffect(() => {
    const fetchAllServices = async () => {
      for (const service of mcpServices) {
        await fetchMcpServiceStatus(service.id);
      }
    };
    
    if (isPanelOpen) {
      fetchAllServices();
    }
  }, [isPanelOpen]);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <div className="w-full">
      <button 
        onClick={togglePanel}
        className="flex items-center justify-between w-full py-1.5 px-3 text-gray-700 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-gray-200 shadow-sm hover:shadow mt-2"
      >
        <span className="font-medium text-sm">{language === 'cn' ? 'MCP服务' : 'MCP Services'}</span>
        {isPanelOpen ? 
          <FiChevronUp size={14} className="text-blue-500 transition-transform duration-200" /> : 
          <FiChevronDown size={14} className="transition-transform duration-200" />}
      </button>
      
      {isPanelOpen && (
        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn">
          <div className="space-y-3">
            {mcpServices.map(service => {
              const status = servicesStatus[service.id];
              return (
                <div key={service.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center">
                    {/* 状态指示灯 */}
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} mr-2 mt-0.5`}></div>
                    <div>
                      {/* 更有效地垂直居中文字 */}
                      <div className="flex items-center h-5">
                        <span className="text-sm font-medium">{language === 'cn' ? service.name : service.nameEn}</span>
                      </div>
                      <div className="text-xs text-gray-500">{status?.statusDescription || '-'}</div>
                    </div>
                  </div>
                  {/* 精简的开关按钮 */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={status?.enabled || false}
                      onChange={() => toggleMcpService(service.id)}
                      disabled={status?.systemEnabled === false}
                    />
                    <div className={`w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 ${status?.systemEnabled === false ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default McpServicePanel; 