package com.zhaoxi.aihelperbackend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 聊天请求跟踪器
 * 用于跟踪正在进行的AI生成请求，并允许中断请求
 */
@Component
@Slf4j
public class ChatRequestTracker {
    
    // 存储会话ID到生成状态的映射
    private final Map<Long, GenerationStatus> activeRequests = new ConcurrentHashMap<>();
    
    /**
     * 注册一个新的生成请求
     * 
     * @param conversationId 会话ID
     */
    public void registerRequest(Long conversationId) {
        log.info("注册会话请求: {}", conversationId);
        activeRequests.put(conversationId, new GenerationStatus(false));
    }
    
    /**
     * 完成一个生成请求
     * 
     * @param conversationId 会话ID
     */
    public void completeRequest(Long conversationId) {
        log.info("完成会话请求: {}", conversationId);
        activeRequests.remove(conversationId);
    }
    
    /**
     * 请求停止指定会话的生成
     * 
     * @param conversationId 会话ID
     * @return 是否成功标记为停止
     */
    public boolean requestStop(Long conversationId) {
        GenerationStatus status = activeRequests.get(conversationId);
        if (status != null) {
            log.info("请求停止会话生成: {}", conversationId);
            status.setStopped(true);
            return true;
        }
        return false;
    }
    
    /**
     * 检查生成是否应该停止
     * 
     * @param conversationId 会话ID
     * @return 是否应该停止生成
     */
    public boolean shouldStop(Long conversationId) {
        GenerationStatus status = activeRequests.get(conversationId);
        return status != null && status.isStopped();
    }
    
    /**
     * 生成状态类
     */
    private static class GenerationStatus {
        private boolean stopped;
        
        public GenerationStatus(boolean stopped) {
            this.stopped = stopped;
        }
        
        public boolean isStopped() {
            return stopped;
        }
        
        public void setStopped(boolean stopped) {
            this.stopped = stopped;
        }
    }
} 