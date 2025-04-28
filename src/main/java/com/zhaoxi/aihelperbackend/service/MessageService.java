package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.entity.Message;
import java.util.List;

public interface MessageService {
    void saveMessage(Message message);
    Message getMessageById(Long id);
    List<Message> getMessagesByConversationId(Long conversationId);
    void updateMessage(Message message);
    void deleteMessagesByConversationId(Long conversationId);
    void deleteMessageById(Long id);
    
    /**
     * 获取消息，包含带签名URL的图片信息
     *
     * @param messageId 消息ID
     * @return 消息信息，包含图片
     */
    Message getMessageWithImages(Long messageId) throws Exception;
    
    /**
     * 获取会话的所有消息，包含带签名URL的图片信息
     *
     * @param conversationId 会话ID
     * @return 消息列表，包含图片
     */
    List<Message> getMessagesWithImagesByConversationId(Long conversationId) throws Exception;
}