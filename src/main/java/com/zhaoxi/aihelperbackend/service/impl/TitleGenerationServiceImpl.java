package com.zhaoxi.aihelperbackend.service.impl;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.zhaoxi.aihelperbackend.entity.Conversation;
import com.zhaoxi.aihelperbackend.service.TitleGenerationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 会话标题生成服务实现类
 * 使用混合方案生成标题：
 * 1. 简单会话：提取用户第一条消息的关键内容
 * 2. 复杂会话：调用AI助手生成标题（不记录该对话）
 */
@Service
public class TitleGenerationServiceImpl implements TitleGenerationService {

    @Value("${dashscope.api-key}")
    private String apiKey;
    
    @Value("${dashscope.model}")
    private String model;
    
    // 消息数量阈值，超过此值视为复杂会话
    private static final int COMPLEX_CONVERSATION_THRESHOLD = 3;
    
    // 消息长度阈值，超过此值视为复杂会话
    private static final int COMPLEX_MESSAGE_LENGTH_THRESHOLD = 200;
    
    @Override
    public String generateTitle(List<com.zhaoxi.aihelperbackend.entity.Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return "新对话";
        }
        
        // 判断是否为复杂会话
        if (isComplexConversation(messages)) {
            return generateTitleWithAI(messages);
        } else {
            return generateSimpleTitle(messages);
        }
    }
    
    @Override
    public boolean isComplexConversation(List<com.zhaoxi.aihelperbackend.entity.Message> messages) {
        if (messages == null) {
            return false;
        }
        
        // 消息数量超过阈值
        if (messages.size() > COMPLEX_CONVERSATION_THRESHOLD) {
            return true;
        }
        
        // 检查是否有长消息
        for (com.zhaoxi.aihelperbackend.entity.Message message : messages) {
            if (message.getContent() != null && 
                message.getContent().length() > COMPLEX_MESSAGE_LENGTH_THRESHOLD) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 为简单会话生成标题
     * 提取用户第一条消息的前N个字符或第一行
     */
    private String generateSimpleTitle(List<com.zhaoxi.aihelperbackend.entity.Message> messages) {
        // 查找第一条用户消息
        for (com.zhaoxi.aihelperbackend.entity.Message message : messages) {
            if ("user".equals(message.getRole()) && message.getContent() != null) {
                String content = message.getContent().trim();
                
                // 如果内容为空，返回默认标题
                if (content.isEmpty()) {
                    return "新对话";
                }
                
                // 提取第一行或前20个字符
                String[] lines = content.split("\\n", 2);
                String firstLine = lines[0].trim();
                
                // 如果第一行太长，截取前20个字符
                if (firstLine.length() > 20) {
                    return firstLine.substring(0, 20) + "...";
                } else {
                    return firstLine;
                }
            }
        }
        
        return "新对话";
    }
    
    /**
     * 使用AI助手生成标题
     * 这个特殊对话不会被记录到数据库
     */
    private String generateTitleWithAI(List<com.zhaoxi.aihelperbackend.entity.Message> messages) {
        try {
            // 准备消息内容
            StringBuilder conversationContent = new StringBuilder();
            for (com.zhaoxi.aihelperbackend.entity.Message message : messages) {
                if (message.getContent() != null) {
                    conversationContent.append(message.getRole())
                                      .append(": ")
                                      .append(message.getContent())
                                      .append("\n");
                }
            }
            
            // 创建系统提示和用户提示
            List<Message> aiMessages = new ArrayList<>();
            
            // 系统提示
            aiMessages.add(Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content("你是一个会话标题生成助手。请为以下对话生成一个简短、具体且能反映对话主题的标题（不超过20个字符）。不要使用引号，不要有多余的解释，只需要输出标题本身。")
                    .build());
            
            // 用户提示
            aiMessages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content("请为以下对话生成一个标题：\n" + conversationContent.toString())
                    .build());
            
            // 调用AI模型API
            Generation gen = new Generation();
            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(model)
                    .messages(aiMessages)
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();
            
            GenerationResult result = gen.call(param);
            
            // 提取AI响应
            String aiResponse = result.getOutput().getChoices().get(0).getMessage().getContent();
            
            // 清理响应（移除引号和多余空格）
            aiResponse = aiResponse.replaceAll("[\"']", "").trim();
            
            // 如果响应为空或太长，使用默认标题
            if (aiResponse.isEmpty() || aiResponse.length() > 30) {
                return "AI对话";
            }
            
            return aiResponse;
            
        } catch (Exception e) {
            // 如果AI调用失败，回退到简单标题生成
            return generateSimpleTitle(messages);
        }
    }
}