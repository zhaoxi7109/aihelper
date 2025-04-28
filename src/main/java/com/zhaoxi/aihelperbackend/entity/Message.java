package com.zhaoxi.aihelperbackend.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Message {
    private Long id;
    private Long conversationId;
    private String role;
    private String content;
    private String reasoningContent; // 思考过程内容
    private Integer order;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 图片相关字段
    private Boolean hasImages = false;  // 是否包含图片
    private List<MessageImage> images;  // 关联的图片列表
} 