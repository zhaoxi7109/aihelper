package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.MessageImageResponse;
import com.zhaoxi.aihelperbackend.entity.Message;
import com.zhaoxi.aihelperbackend.entity.MessageImage;
import com.zhaoxi.aihelperbackend.service.MessageImageService;
import com.zhaoxi.aihelperbackend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "消息管理", description = "管理用户的消息")
@CrossOrigin
@Slf4j
public class MessageController {

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private MessageImageService messageImageService;

    @GetMapping("/{id}")
    @Operation(summary = "获取消息详情", description = "根据消息ID获取消息详情，包含图片信息")
    public ApiResponse<Message> getMessage(@PathVariable Long id) {
        try {
            Message message = messageService.getMessageWithImages(id);
            if (message == null) {
                return ApiResponse.error(404, "消息不存在");
            }
            
            // 转换图片数据
            if (message.getHasImages() && message.getImages() != null) {
                List<MessageImageResponse> imageResponses = new ArrayList<>();
                for (MessageImage image : message.getImages()) {
                    try {
                        MessageImageResponse imageResponse = messageImageService.toResponseDto(image);
                        if (imageResponse != null) {
                            imageResponses.add(imageResponse);
                        }
                    } catch (Exception e) {
                        log.error("处理图片失败: {}", e.getMessage());
                    }
                }
                
                // 使用反射设置图片列表到消息
                try {
                    java.lang.reflect.Field field = Message.class.getDeclaredField("images");
                    field.setAccessible(true);
                    field.set(message, imageResponses);
                } catch (Exception e) {
                    log.error("设置图片响应失败: {}", e.getMessage());
                }
            }
            
            return ApiResponse.success(message);
        } catch (Exception e) {
            log.error("获取消息失败: {}", e.getMessage());
            return ApiResponse.error(500, "获取消息失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除消息", description = "根据消息ID删除消息，同时删除关联的图片")
    public ApiResponse<String> deleteMessage(@PathVariable Long id) {
        try {
            Message message = messageService.getMessageById(id);
            if (message == null) {
                return ApiResponse.error(404, "消息不存在");
            }
            messageService.deleteMessageById(id);
            return ApiResponse.success("消息删除成功");
        } catch (Exception e) {
            log.error("删除消息失败: {}", e.getMessage());
            return ApiResponse.error(500, "删除消息失败: " + e.getMessage());
        }
    }
}