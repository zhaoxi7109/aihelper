package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 密码修改请求DTO
 * 
 * 用于接收用户密码修改请求的数据
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "密码修改请求")
public class PasswordChangeRequest {
    
    /**
     * 当前密码
     * 用于验证用户身份
     */
    @Schema(description = "当前密码，用于验证用户身份", required = true)
    private String currentPassword;
    
    /**
     * 新密码
     * 长度需在6-20个字符之间
     */
    @Schema(description = "新密码，长度需在6-20个字符之间", required = true)
    private String newPassword;
} 