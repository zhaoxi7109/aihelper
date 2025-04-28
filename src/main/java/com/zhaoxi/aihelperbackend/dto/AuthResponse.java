package com.zhaoxi.aihelperbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 认证响应DTO
 * 
 * 用于返回密码登录或注册成功后的信息和JWT令牌
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户名
     */
    private String username;
    
    /**
     * 用户昵称
     */
    private String nickname;
    
    /**
     * 电子邮箱
     */
    private String email;
    
    /**
     * 手机号码
     */
    private String mobile;
    
    /**
     * 头像URL
     */
    private String avatar;
    
    /**
     * JWT令牌
     */
    private String token;
} 