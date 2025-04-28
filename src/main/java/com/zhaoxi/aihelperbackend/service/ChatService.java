package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.dto.ChatRequest;
import com.zhaoxi.aihelperbackend.dto.ChatResponse;

public interface ChatService {
    /**
     * 发送聊天请求并获取回复
     * 
     * @param request 聊天请求
     * @return 聊天响应
     */
    ChatResponse chat(ChatRequest request);
    
    /**
     * 停止指定会话的生成过程
     * 
     * @param conversationId 会话ID
     * @return 是否成功停止
     */
    boolean stopGeneration(Long conversationId);
} 