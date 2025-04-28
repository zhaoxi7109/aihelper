package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 停止AI生成请求DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "停止AI生成请求")
public class StopGenerationRequest {
    
    @Schema(description = "会话ID", required = true)
    private Long conversationId;
} 