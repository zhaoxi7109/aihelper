package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.entity.Conversation;
import java.util.List;

public interface ConversationService {
    Conversation createConversation(Long userId);

    Conversation getConversationById(Long id);
    List<Conversation> getConversationsByUserId(Long userId);
    void updateConversation(Conversation conversation);
    void deleteConversation(Long id);
    
    /**
     * 根据会话内容自动生成标题并更新
     * @param conversationId 会话ID
     * @return 更新后的会话对象
     */
    Conversation generateAndUpdateTitle(Long conversationId);
}