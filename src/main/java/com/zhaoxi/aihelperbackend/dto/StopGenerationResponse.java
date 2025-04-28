package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 停止AI生成响应DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "停止AI生成响应")
public class StopGenerationResponse {
    
    @Schema(description = "是否成功停止生成")
    private Boolean success;
    
    @Schema(description = "会话ID")
    private Long conversationId;
    
    @Schema(description = "停止时间")
    private String stoppedAt;
} 