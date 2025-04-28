package com.zhaoxi.aihelperbackend.service.impl;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.zhaoxi.aihelperbackend.dto.ChatRequest;
import com.zhaoxi.aihelperbackend.dto.ChatResponse;
import com.zhaoxi.aihelperbackend.dto.MessageImageResponse;
import com.zhaoxi.aihelperbackend.entity.Conversation;
import com.zhaoxi.aihelperbackend.entity.MessageImage;
import com.zhaoxi.aihelperbackend.service.ChatService;
import com.zhaoxi.aihelperbackend.service.ConversationService;
import com.zhaoxi.aihelperbackend.service.MessageImageService;
import com.zhaoxi.aihelperbackend.service.MessageService;
import com.zhaoxi.aihelperbackend.service.ChatRequestTracker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    @Value("${dashscope.api-key}")
    private String apiKey;
    
    @Value("${dashscope.model}")
    private String model;
    
    @Autowired
    private ConversationService conversationService;
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private MessageImageService messageImageService;

    @Autowired
    private ChatRequestTracker chatRequestTracker;

    @Override
    @Transactional
    public ChatResponse chat(ChatRequest request) {
        try {
            if (request.getConversationId() != null) {
                chatRequestTracker.registerRequest(request.getConversationId());
            }
            
            // 处理会话
            Conversation conversation;
            List<com.zhaoxi.aihelperbackend.entity.Message> messageHistory = new ArrayList<>();
            
            if (request.getConversationId() != null) {
                // 使用现有会话
                conversation = conversationService.getConversationById(request.getConversationId());
                if (conversation == null) {
                    throw new RuntimeException("会话不存在");
                }
                // 获取历史消息
                messageHistory = messageService.getMessagesByConversationId(conversation.getId());
            } else {
                // 获取用户ID，如果请求中没有提供，则从安全上下文中获取
                Long userId = request.getUserId();
                if (userId == null) {
                    // 从当前认证信息中获取用户ID
                    org.springframework.security.core.Authentication authentication = 
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (authentication != null && authentication.getPrincipal() instanceof com.zhaoxi.aihelperbackend.entity.User) {
                        com.zhaoxi.aihelperbackend.entity.User currentUser = 
                            (com.zhaoxi.aihelperbackend.entity.User) authentication.getPrincipal();
                        userId = currentUser.getId();
                    }
                    
                    if (userId == null) {
                        throw new RuntimeException("无法确定用户ID，请提供有效的用户ID或确保用户已登录");
                    }
                }
                
                // 创建新会话，使用请求中的model或默认model
                String modelName = request.getModel() != null ? request.getModel() : this.model;
                conversation = conversationService.createConversation(userId);
                conversation.setModel(modelName);
                conversationService.updateConversation(conversation);
            }
            
            // 保存用户消息
            com.zhaoxi.aihelperbackend.entity.Message userMessage = new com.zhaoxi.aihelperbackend.entity.Message();
            userMessage.setConversationId(conversation.getId());
            userMessage.setRole("user");
            userMessage.setContent(request.getPrompt());
            userMessage.setOrder(messageHistory.size());
            userMessage.setCreatedAt(LocalDateTime.now());
            userMessage.setUpdatedAt(LocalDateTime.now());
            
            // 判断是否有图片
            boolean hasImages = !CollectionUtils.isEmpty(request.getImageBase64List());
            if (hasImages) {
                userMessage.setHasImages(true);
            }
            
            // 保存消息，获取消息ID
            messageService.saveMessage(userMessage);
            
            // 处理用户消息中的图片并获取OCR文本
            StringBuilder ocrTextBuilder = new StringBuilder();
            List<MessageImage> processedImages = new ArrayList<>();
            
            if (hasImages) {
                Long userId = request.getUserId();
                if (userId == null) {
                    // 从当前认证信息中获取用户ID
                    org.springframework.security.core.Authentication authentication = 
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (authentication != null && authentication.getPrincipal() instanceof com.zhaoxi.aihelperbackend.entity.User) {
                        com.zhaoxi.aihelperbackend.entity.User currentUser = 
                            (com.zhaoxi.aihelperbackend.entity.User) authentication.getPrincipal();
                        userId = currentUser.getId();
                    }
                }
                
                for (String base64Image : request.getImageBase64List()) {
                    try {
                        // 处理Base64图片
                        MessageImage image = messageImageService.createFromBase64(
                                base64Image, 
                                userMessage.getId(), 
                                userId, 
                                conversation.getId()
                        );
                        
                        processedImages.add(image);
                        
                        // 收集OCR文本
                        if (image.getOcrText() != null && !image.getOcrText().isEmpty()) {
                            if (ocrTextBuilder.length() > 0) {
                                ocrTextBuilder.append("\n\n");
                            }
                            ocrTextBuilder.append("图片文本: ").append(image.getOcrText());
                        }
                    } catch (Exception e) {
                        log.error("处理图片失败: {}", e.getMessage());
                        // 继续处理其他图片
                    }
                }
                
                // 设置图片到消息
                userMessage.setImages(processedImages);
            }
            
            // 准备API调用
            Generation gen = new Generation();
            List<Message> messages = convertToApiMessages(messageHistory);
            
            // 组合图片OCR文本和用户输入文本作为完整的用户消息
            String userPrompt = request.getPrompt();
            if (ocrTextBuilder.length() > 0) {
                userPrompt += "\n\n" + ocrTextBuilder.toString();
            }
            
            // 添加当前用户消息
            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(userPrompt)
                    .build());
            
            // 检查是否应该停止生成
            if (request.getConversationId() != null && chatRequestTracker.shouldStop(request.getConversationId())) {
                // 生成已被用户中断
                chatRequestTracker.completeRequest(request.getConversationId());
                
                // 创建中断响应
                ChatResponse response = new ChatResponse(conversation.getId(), "生成已被用户中断", null);
                return response;
            }
            
            // 调用AI模型API
            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(conversation.getModel())
                    .messages(messages)
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();
            
            GenerationResult result = gen.call(param);
            
            // 提取AI响应
            String aiResponse = result.getOutput().getChoices().get(0).getMessage().getContent();
            String reasoningContent = null;
            
            // 如果需要深度思考，提取思考过程
            if (request.getDeepThinking()) {
                reasoningContent = result.getOutput().getChoices().get(0).getMessage().getReasoningContent();
            }
            
            // 保存AI回复
            com.zhaoxi.aihelperbackend.entity.Message aiMessage = new com.zhaoxi.aihelperbackend.entity.Message();
            aiMessage.setConversationId(conversation.getId());
            aiMessage.setRole("assistant");
            aiMessage.setContent(aiResponse);
            aiMessage.setReasoningContent(reasoningContent);
            aiMessage.setOrder(messageHistory.size() + 1);
            aiMessage.setCreatedAt(LocalDateTime.now());
            aiMessage.setUpdatedAt(LocalDateTime.now());
            messageService.saveMessage(aiMessage);
            
            // 更新会话最后更新时间
            conversation.setUpdatedAt(LocalDateTime.now());
            conversationService.updateConversation(conversation);
            
            // 自动生成并更新会话标题（仅当是新会话或第一条消息时）
            if (messageHistory.isEmpty() || messageHistory.size() <= 1) {
                conversationService.generateAndUpdateTitle(conversation.getId());
            }
            
            // 构造响应对象，包含图片信息
            ChatResponse response = new ChatResponse(conversation.getId(), aiResponse, reasoningContent);
            
            // 如果用户消息有图片，将图片信息转换为响应DTO
            if (hasImages && !processedImages.isEmpty()) {
                try {
                    List<MessageImageResponse> imageResponses = processedImages.stream()
                            .map(image -> {
                                try {
                                    return messageImageService.toResponseDto(image);
                                } catch (Exception e) {
                                    log.error("转换图片DTO失败: {}", e.getMessage());
                                    return null;
                                }
                            })
                            .filter(img -> img != null)
                            .collect(Collectors.toList());
                    
                    response.setImages(imageResponses);
                } catch (Exception e) {
                    log.error("处理图片响应失败: {}", e.getMessage());
                }
            }
            
            if (request.getConversationId() != null) {
                chatRequestTracker.completeRequest(request.getConversationId());
            }
            
            return response;
            
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            throw new RuntimeException("AI服务调用失败: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("处理聊天请求失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 将数据库中的消息转换为API调用所需的消息格式
     */
    private List<Message> convertToApiMessages(List<com.zhaoxi.aihelperbackend.entity.Message> messageHistory) {
        List<Message> messages = new ArrayList<>();
        
        for (com.zhaoxi.aihelperbackend.entity.Message dbMessage : messageHistory) {
            Role role;
            if ("user".equals(dbMessage.getRole())) {
                role = Role.USER;
            } else if ("assistant".equals(dbMessage.getRole())) {
                role = Role.ASSISTANT;
            } else {
                role = Role.SYSTEM;
            }
            
            messages.add(Message.builder()
                    .role(role.getValue())
                    .content(dbMessage.getContent())
                    .build());
        }
        
        return messages;
    }

    @Override
    public boolean stopGeneration(Long conversationId) {
        if (conversationId == null) {
            return false;
        }
        return chatRequestTracker.requestStop(conversationId);
    }
}