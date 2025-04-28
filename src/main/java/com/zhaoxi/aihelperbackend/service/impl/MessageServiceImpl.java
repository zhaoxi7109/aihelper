package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.entity.Message;
import com.zhaoxi.aihelperbackend.entity.MessageImage;
import com.zhaoxi.aihelperbackend.mapper.MessageMapper;
import com.zhaoxi.aihelperbackend.service.MessageImageService;
import com.zhaoxi.aihelperbackend.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private MessageImageService messageImageService;

    @Override
    public void saveMessage(Message message) {
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.insert(message);
    }

    @Override
    public Message getMessageById(Long id) {
        return messageMapper.findById(id);
    }

    @Override
    public List<Message> getMessagesByConversationId(Long conversationId) {
        return messageMapper.findByConversationId(conversationId);
    }

    @Override
    public void updateMessage(Message message) {
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.update(message);
    }

    @Override
    public void deleteMessagesByConversationId(Long conversationId) {
        messageMapper.deleteByConversationId(conversationId);
    }

    @Override
    public void deleteMessageById(Long id) {
        try {
            // 先删除关联的图片
            messageImageService.deleteImagesByMessageId(id);
        } catch (Exception e) {
            log.error("删除消息图片失败: {}", e.getMessage());
            // 继续删除消息
        }
        
        messageMapper.deleteById(id);
    }
    
    @Override
    public Message getMessageWithImages(Long messageId) throws Exception {
        Message message = messageMapper.findById(messageId);
        if (message == null) {
            return null;
        }
        
        // 获取消息关联的图片
        List<MessageImage> images = messageImageService.getImagesByMessageId(messageId);
        if (!images.isEmpty()) {
            message.setHasImages(true);
            message.setImages(images);
        }
        
        return message;
    }
    
    @Override
    public List<Message> getMessagesWithImagesByConversationId(Long conversationId) throws Exception {
        List<Message> messages = messageMapper.findByConversationId(conversationId);
        
        // 为每个消息加载图片
        for (Message message : messages) {
            List<MessageImage> images = messageImageService.getImagesByMessageId(message.getId());
            if (!images.isEmpty()) {
                message.setHasImages(true);
                message.setImages(images);
            }
        }
        
        return messages;
    }
}