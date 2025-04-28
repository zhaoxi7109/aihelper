package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户资料更新请求DTO
 * 
 * 用于接收用户资料更新请求的数据
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户资料更新请求")
public class UserProfileUpdateRequest {
    
    /**
     * 昵称，可选
     */
    @Schema(description = "用户昵称，可选", example = "智慧的思考者")
    private String nickname;
    
    /**
     * 电子邮箱，可选
     * 如果提供则需符合邮箱格式，且不能与其他用户的邮箱冲突
     */
    @Schema(description = "电子邮箱，可选，如果提供则需符合格式要求", example = "user@example.com")
    private String email;
    
    /**
     * 手机号码，可选
     * 如果提供则需符合手机号格式，且不能与其他用户的手机号冲突
     */
    @Schema(description = "手机号码，可选，如果提供则需符合格式要求", example = "13800138000")
    private String mobile;
} 