package com.zhaoxi.aihelperbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 密码登录请求DTO
 * 
 * 用于接收密码登录时提交的数据
 * 支持通过邮箱或手机号进行登录
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    /**
     * 登录账号，可以是邮箱或手机号
     */
    private String account;
    
    /**
     * 登录密码
     */
    private String password;
    
    /**
     * 登录类型，只支持：email-邮箱登录，mobile-手机号登录
     */
    private String loginType;
} 