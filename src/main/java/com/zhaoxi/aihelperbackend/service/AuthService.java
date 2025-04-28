package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.dto.AuthResponse;
import com.zhaoxi.aihelperbackend.dto.LoginRequest;
import com.zhaoxi.aihelperbackend.dto.PasswordResetRequest;
import com.zhaoxi.aihelperbackend.dto.RegisterRequest;
import com.zhaoxi.aihelperbackend.dto.RegisterWithCodeRequest;
import com.zhaoxi.aihelperbackend.dto.VerificationCodeRequest;
import com.zhaoxi.aihelperbackend.entity.User;

/**
 * 用户认证服务接口
 */
public interface AuthService {
    /**
     * 用户注册
     * 
     * @param request 注册请求
     * @return 包含用户信息和JWT令牌的认证响应
     * @deprecated 已不推荐使用，请使用 {@link #registerWithCode(RegisterWithCodeRequest)} 代替
     */
    @Deprecated
    AuthResponse register(RegisterRequest request);
    
    /**
     * 用户使用验证码注册
     * 
     * @param request 验证码注册请求
     * @return 包含用户信息和JWT令牌的认证响应
     */
    AuthResponse registerWithCode(RegisterWithCodeRequest request);
    
    /**
     * 密码登录
     * 
     * @param request 登录请求
     * @return 包含用户信息和JWT令牌的认证响应
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * 验证码登录
     * 
     * @param request 验证码登录请求
     * @return 包含用户信息和JWT令牌的认证响应
     */
    AuthResponse loginWithCode(VerificationCodeRequest request);
    
    /**
     * 重置密码
     * 
     * @param request 重置密码请求
     * @return 操作结果
     */
    boolean resetPassword(PasswordResetRequest request);
    
    /**
     * 检查令牌有效性
     *
     * @param token JWT令牌
     * @return 如果有效，返回用户信息；否则返回null
     */
    User checkToken(String token);
    
    /**
     * 为新注册用户生成AI头像
     * 
     * @param user 新注册的用户
     * @return 生成的头像对象名
     */
    String generateAiAvatarForNewUser(User user);
} 