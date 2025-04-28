package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.entity.Message;
import java.util.List;

/**
 * 会话标题生成服务
 * 提供根据会话内容生成标题的功能
 */
public interface TitleGenerationService {
    
    /**
     * 根据会话消息生成标题
     * @param messages 会话中的消息列表
     * @return 生成的标题
     */
    String generateTitle(List<Message> messages);
    
    /**
     * 判断会话是否复杂
     * 复杂会话需要使用AI助手生成标题
     * @param messages 会话中的消息列表
     * @return 是否为复杂会话
     */
    boolean isComplexConversation(List<Message> messages);
}