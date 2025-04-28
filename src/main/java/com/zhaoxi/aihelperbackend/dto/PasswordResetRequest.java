package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 密码重置请求DTO
 * 
 * 用于接收用户密码重置请求的数据
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "密码重置请求")
public class PasswordResetRequest {
    
    /**
     * 账号（邮箱或手机号）
     */
    @Schema(description = "用户账号（邮箱或手机号）", required = true)
    private String account;
    
    /**
     * 验证码
     */
    @Schema(description = "重置密码验证码", required = true)
    private String verificationCode;
    
    /**
     * 新密码
     */
    @Schema(description = "新密码，长度需在6-20个字符之间", required = true)
    private String newPassword;
} 