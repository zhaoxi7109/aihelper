package com.zhaoxi.aihelperbackend.dto;

import lombok.Data;

/**
 * 消息图片响应DTO
 * 用于返回图片信息到前端
 */
@Data
public class MessageImageResponse {
    private Long id;             // 图片ID
    private String signedUrl;    // 带签名的图片URL
    private String ocrText;      // OCR识别结果
    private String originalFileName; // 原始文件名
} 