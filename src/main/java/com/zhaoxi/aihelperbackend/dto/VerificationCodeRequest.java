package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 验证码请求DTO
 * 
 * 用于接收验证码相关请求的数据
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "验证码请求")
public class VerificationCodeRequest {
    
    /**
     * 账号（邮箱或手机号）
     */
    @Schema(description = "用户账号（邮箱或手机号）", required = true)
    private String account;
    
    /**
     * 验证码类型
     * login: 登录验证码
     * register: 注册验证码
     * reset: 重置密码验证码
     */
    @Schema(description = "验证码类型(login, register, reset)", required = true)
    private String type;
    
    /**
     * 验证码
     * 获取验证码时不需要填写
     * 校验验证码时必填
     */
    @Schema(description = "验证码，获取验证码时不需要填写，校验验证码时必填")
    private String code;
} 