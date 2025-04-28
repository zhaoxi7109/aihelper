package com.zhaoxi.aihelperbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long conversationId;
    private String response;
    private String reason;
    
    // 新增字段：消息中包含的图片
    private List<MessageImageResponse> images;
    
    // 为兼容旧版本添加三参数构造函数
    public ChatResponse(Long conversationId, String response, String reason) {
        this.conversationId = conversationId;
        this.response = response;
        this.reason = reason;
    }
} 