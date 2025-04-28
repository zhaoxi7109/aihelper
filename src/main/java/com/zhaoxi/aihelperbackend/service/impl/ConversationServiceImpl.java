package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.entity.Conversation;
import com.zhaoxi.aihelperbackend.entity.Message;
import com.zhaoxi.aihelperbackend.mapper.ConversationMapper;
import com.zhaoxi.aihelperbackend.service.ConversationService;
import com.zhaoxi.aihelperbackend.service.MessageService;
import com.zhaoxi.aihelperbackend.service.TitleGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConversationServiceImpl implements ConversationService {

    @Autowired
    private ConversationMapper conversationMapper;

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private TitleGenerationService titleGenerationService;
    
    @Override
    public Conversation createConversation(Long userId) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setTitle("新对话"); // 初始标题，后续可能会更新
        conversation.setModel("deepseek-r1"); // 设置默认模型
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationMapper.insert(conversation);
        return conversation;
    }

    @Override
    public Conversation getConversationById(Long id) {
        return conversationMapper.findById(id);
    }

    @Override
    public List<Conversation> getConversationsByUserId(Long userId) {
        return conversationMapper.findByUserId(userId);
    }

    @Override
    public void updateConversation(Conversation conversation) {
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationMapper.update(conversation);
    }
    
    /**
     * 根据会话内容自动生成标题并更新
     * @param conversationId 会话ID
     * @return 更新后的会话对象
     */
    @Override
    public Conversation generateAndUpdateTitle(Long conversationId) {
        // 获取会话
        Conversation conversation = getConversationById(conversationId);
        if (conversation == null) {
            return null;
        }
        
        // 获取会话中的消息
        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
        if (messages == null || messages.isEmpty()) {
            return conversation;
        }
        
        // 使用标题生成服务生成标题
        String title = titleGenerationService.generateTitle(messages);
        
        // 更新会话标题
        conversation.setTitle(title);
        updateConversation(conversation);
        
        return conversation;
    }

    @Override
    @Transactional
    public void deleteConversation(Long id) {
        // 先删除对话中的所有消息
        messageService.deleteMessagesByConversationId(id);
        // 再删除对话
        conversationMapper.delete(id);
    }
}