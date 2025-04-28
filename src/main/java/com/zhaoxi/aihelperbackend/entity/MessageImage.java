package com.zhaoxi.aihelperbackend.entity;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 消息图片实体类
 * 用于存储消息中包含的图片信息
 */
@Data
public class MessageImage {
    private Long id;             // 图片ID
    private Long messageId;      // 关联的消息ID
    private String originalFileName;  // 原始文件名
    private String ossKey;       // OSS中的存储路径
    private String mimeType;     // 文件类型
    private Long fileSize;       // 文件大小（字节）
    private String ocrText;      // OCR识别文本
    private LocalDateTime createdAt;  // 创建时间
    private LocalDateTime updatedAt;  // 更新时间
    
    // 非持久化字段，用于返回带签名的URL
    private transient String signedUrl;
} 