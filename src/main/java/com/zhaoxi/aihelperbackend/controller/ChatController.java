package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.ChatRequest;
import com.zhaoxi.aihelperbackend.dto.ChatResponse;
import com.zhaoxi.aihelperbackend.dto.StopGenerationRequest;
import com.zhaoxi.aihelperbackend.dto.StopGenerationResponse;
import com.zhaoxi.aihelperbackend.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api")
@Tag(name = "聊天接口", description = "处理AI聊天相关的接口")
@CrossOrigin
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/chat")
    @Operation(summary = "发送聊天消息", description = "向AI发送消息并获取回复")
    public ApiResponse<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            ChatResponse response = chatService.chat(request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "处理聊天请求时出错: " + e.getMessage());
        }
    }
    
    @PostMapping("/chat/stop")
    @Operation(summary = "停止生成", description = "中断正在进行的AI生成过程")
    public ApiResponse<StopGenerationResponse> stopGeneration(@RequestBody StopGenerationRequest request) {
        try {
            boolean stopped = chatService.stopGeneration(request.getConversationId());
            
            StopGenerationResponse response = new StopGenerationResponse();
            response.setSuccess(stopped);
            response.setConversationId(request.getConversationId());
            response.setStoppedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            if (stopped) {
                return ApiResponse.success(response);
            } else {
                return ApiResponse.error(404, "未找到指定的生成请求或已完成", response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "停止生成请求时出错: " + e.getMessage());
        }
    }
} 