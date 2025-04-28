package com.zhaoxi.aihelperbackend.config;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 * 
 * 处理各种认证和授权相关的异常，提供友好的错误响应
 * 
 * 注意：此异常处理器当前处于禁用状态，等待依赖冲突解决后再启用
 */
// 临时禁用全局异常处理器，解决与Swagger的依赖冲突
// @RestControllerAdvice
@RestControllerAdvice
@ConditionalOnProperty(name = "app.exception-handler.enabled", havingValue = "true", matchIfMissing = false)
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * 处理认证异常
     */
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleAuthenticationException(AuthenticationException e) {
        logger.error("认证异常: {}", e.getMessage());
        return ApiResponse.error(401, "认证失败: " + e.getMessage());
    }
    
    /**
     * 处理访问被拒绝异常
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<?> handleAccessDeniedException(AccessDeniedException e) {
        logger.error("访问被拒绝: {}", e.getMessage());
        return ApiResponse.error(403, "访问被拒绝，权限不足");
    }
    
    /**
     * 处理认证不足异常
     */
    @ExceptionHandler(InsufficientAuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleInsufficientAuthenticationException(InsufficientAuthenticationException e) {
        logger.error("认证不足: {}", e.getMessage());
        return ApiResponse.error(401, "请先登录后再访问该资源");
    }
    
    /**
     * 处理JWT过期异常
     */
    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleExpiredJwtException(ExpiredJwtException e) {
        logger.error("JWT已过期: {}", e.getMessage());
        return ApiResponse.error(401, "登录已过期，请重新登录");
    }
    
    /**
     * 处理JWT格式错误异常
     */
    @ExceptionHandler({MalformedJwtException.class, SignatureException.class, UnsupportedJwtException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleJwtFormatException(Exception e) {
        logger.error("JWT格式错误: {}", e.getMessage());
        return ApiResponse.error(401, "无效的认证令牌，请重新登录");
    }
    
    /**
     * 处理登录凭证错误异常
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleBadCredentialsException(BadCredentialsException e) {
        logger.error("登录凭证错误: {}", e.getMessage());
        return ApiResponse.error(401, "用户名或密码错误");
    }
    
    /**
     * 处理其他安全相关异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleGenericException(Exception e) {
        logger.error("系统异常: {}", e.getMessage(), e);
        return ApiResponse.error(500, "系统异常，请联系管理员");
    }
} 