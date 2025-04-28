package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.MessageImageResponse;
import com.zhaoxi.aihelperbackend.entity.Conversation;
import com.zhaoxi.aihelperbackend.entity.Message;
import com.zhaoxi.aihelperbackend.entity.MessageImage;
import com.zhaoxi.aihelperbackend.service.ConversationService;
import com.zhaoxi.aihelperbackend.service.MessageImageService;
import com.zhaoxi.aihelperbackend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
@Tag(name = "会话管理", description = "管理用户的会话历史")
@CrossOrigin
@Slf4j
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private MessageImageService messageImageService;

    @GetMapping("/{userId}")
    @Operation(summary = "获取用户的所有会话", description = "根据用户ID获取所有会话历史")
    public ApiResponse<List<Conversation>> getConversations(@PathVariable Long userId) {
        List<Conversation> conversations = conversationService.getConversationsByUserId(userId);
        return ApiResponse.success(conversations);
    }

    @GetMapping("/detail/{id}")
    @Operation(summary = "获取会话详情", description = "根据会话ID获取会话详情")
    public ApiResponse<Conversation> getConversationDetail(@PathVariable Long id) {
        Conversation conversation = conversationService.getConversationById(id);
        if (conversation == null) {
            return ApiResponse.error(404, "会话不存在");
        }
        return ApiResponse.success(conversation);
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "获取会话中的消息", description = "根据会话ID获取所有消息，包含图片信息")
    public ApiResponse<List<Message>> getMessages(@PathVariable Long id) {
        try {
            List<Message> messages = messageService.getMessagesWithImagesByConversationId(id);
            
            // 处理每条消息的图片
            for (Message message : messages) {
                if (message.getHasImages() && message.getImages() != null) {
                    List<MessageImageResponse> imageResponses = message.getImages().stream()
                            .map(image -> {
                                try {
                                    return messageImageService.toResponseDto(image);
                                } catch (Exception e) {
                                    log.error("处理图片失败: {}", e.getMessage());
                                    return null;
                                }
                            })
                            .filter(img -> img != null)
                            .collect(Collectors.toList());
                    
                    // 使用反射设置图片列表到消息
                    try {
                        java.lang.reflect.Field field = Message.class.getDeclaredField("images");
                        field.setAccessible(true);
                        field.set(message, imageResponses);
                    } catch (Exception e) {
                        log.error("设置图片响应失败: {}", e.getMessage());
                    }
                }
            }
            
            return ApiResponse.success(messages);
        } catch (Exception e) {
            log.error("获取会话消息失败: {}", e.getMessage());
            return ApiResponse.error(500, "获取会话消息失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除会话", description = "根据会话ID删除会话及其所有消息")
    public ApiResponse<Void> deleteConversation(@PathVariable Long id) {
        try {
            conversationService.deleteConversation(id);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(500, "删除失败: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "创建新会话", description = "为指定用户创建新会话")
    public ApiResponse<Conversation> createConversation(@RequestParam Long userId) {
        Conversation conversation = conversationService.createConversation(userId);
        return ApiResponse.success(conversation);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新会话标题", description = "更新指定会话的标题")
    public ApiResponse<Void> updateConversationTitle(
            @PathVariable Long id,
            @RequestParam String title) {
        Conversation conversation = conversationService.getConversationById(id);
        if (conversation == null) {
            return ApiResponse.error(404, "会话不存在");
        }
        conversation.setTitle(title);
        conversationService.updateConversation(conversation);
        return ApiResponse.success("更新成功", null);
    }
    
    @PutMapping("/{id}/generate-title")
    @Operation(summary = "自动生成会话标题", description = "根据会话内容自动生成标题")
    public ApiResponse<Conversation> generateConversationTitle(@PathVariable Long id) {
        Conversation conversation = conversationService.generateAndUpdateTitle(id);
        if (conversation == null) {
            return ApiResponse.error(404, "会话不存在");
        }
        return ApiResponse.success(conversation);
    }
}