package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.dto.AuthResponse;
import com.zhaoxi.aihelperbackend.dto.VerificationCodeRequest;

/**
 * 验证码服务接口
 * 
 * 提供验证码的生成、发送和验证功能
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
public interface VerificationService {
    
    /**
     * 生成并发送验证码
     * 
     * @param receiver 接收者(邮箱或手机号)
     * @param type 验证码类型(login, register, reset, etc.)
     * @return 验证码（仅测试环境返回，生产环境不返回）
     */
    String generateAndSendCode(String receiver, String type);
    
    /**
     * 验证验证码是否正确
     * 
     * @param receiver 接收者(邮箱或手机号)
     * @param type 验证码类型
     * @param code 验证码
     * @return 是否验证通过
     */
    boolean verifyCode(String receiver, String type, String code);
    
    /**
     * 清除验证码
     * 验证通过后应清除验证码，避免重复使用
     * 
     * @param receiver 接收者(邮箱或手机号)
     * @param type 验证码类型
     */
    void clearCode(String receiver, String type);
} 