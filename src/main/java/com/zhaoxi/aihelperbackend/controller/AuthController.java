package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.AuthResponse;
import com.zhaoxi.aihelperbackend.dto.LoginRequest;
import com.zhaoxi.aihelperbackend.dto.PasswordResetRequest;
import com.zhaoxi.aihelperbackend.dto.RegisterWithCodeRequest;
import com.zhaoxi.aihelperbackend.dto.VerificationCodeRequest;
import com.zhaoxi.aihelperbackend.enums.VerificationCodeType;
import com.zhaoxi.aihelperbackend.service.AuthService;
import com.zhaoxi.aihelperbackend.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 * 
 * 提供用户注册和登录功能
 * 这些接口不需要认证即可访问
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证接口", description = "用户注册、登录等认证相关接口")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    /**
     * 认证服务
     */
    private final AuthService authService;
    
    /**
     * JWT工具类
     */
    private final JwtUtil jwtUtil;
    
    /**
     * 用户详情服务
     */
    private final UserDetailsService userDetailsService;

    /**
     * 验证码注册
     * 
     * 支持通过邮箱或手机号结合验证码注册
     * 昵称为可选项，未提供时会自动生成
     * 注册成功后返回用户信息和JWT令牌
     *
     * @param request 验证码注册请求参数
     * @return 包含用户信息和令牌的响应
     */
    @PostMapping("/register")
    @Operation(
        summary = "用户注册", 
        description = "使用验证码注册新用户并返回令牌，支持手机号或邮箱注册，昵称为可选项，需要先获取验证码"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "注册成功",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "请求参数错误或验证码无效"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409", 
            description = "邮箱或手机号已被注册"
        )
    })
    public ApiResponse<AuthResponse> register(@RequestBody RegisterWithCodeRequest request) {
        try {
            logger.info("接收到验证码注册请求");
            
            // 参数校验已在服务层处理，这里直接调用服务
            AuthResponse response = authService.registerWithCode(request);
            return ApiResponse.success("注册成功", response);
        } catch (IllegalArgumentException e) {
            logger.warn("注册参数错误: {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (BadCredentialsException e) {
            logger.warn("验证码错误: {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (RuntimeException e) {
            // 邮箱或手机号已存在的情况
            if (e.getMessage().contains("已被注册")) {
                logger.warn("注册失败，账号已存在: {}", e.getMessage());
                return ApiResponse.error(409, e.getMessage());
            }
            logger.error("注册异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 密码登录
     * 
     * 支持使用邮箱或手机号登录
     * 登录成功后返回用户信息和JWT令牌
     *
     * @param request 登录请求参数
     * @return 包含用户信息和令牌的响应
     */
    @PostMapping("/login")
    @Operation(summary = "密码登录", description = "支持邮箱或手机号登录，登录类型可以是EMAIL_PASSWORD或MOBILE_PASSWORD")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            // 直接调用服务层方法，参数验证已在服务层处理
            AuthResponse response = authService.login(request);
            return ApiResponse.success("登录成功", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (UsernameNotFoundException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (BadCredentialsException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 记录异常堆栈，方便排查问题
            return ApiResponse.error(500, "登录失败：" + e.getMessage());
        }
    }

    /**
     * 验证码登录
     * 
     * 支持使用邮箱或手机号结合验证码登录
     * 登录成功后返回用户信息和JWT令牌
     *
     * @param request 验证码登录请求参数
     * @return 包含用户信息和令牌的响应
     */
    @PostMapping("/login/code")
    @Operation(
        summary = "验证码登录", 
        description = "支持邮箱或手机号结合验证码登录，无需密码。需要先通过/api/verification/code接口获取验证码"
    )
    public ApiResponse<AuthResponse> loginWithCode(@RequestBody VerificationCodeRequest request) {
        try {
            // 确保设置类型为登录验证码
            if (request.getType() == null || request.getType().trim().isEmpty()) {
                request.setType(VerificationCodeType.LOGIN.getCode());
            } else {
                // 验证类型是否支持
                if (!VerificationCodeType.LOGIN.getCode().equals(request.getType())) {
                    return ApiResponse.error(400, "验证码类型错误，请使用登录验证码");
                }
            }
            
            // 调用服务层方法
            AuthResponse response = authService.loginWithCode(request);
            return ApiResponse.success("登录成功", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (UsernameNotFoundException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (BadCredentialsException e) {
            return ApiResponse.error(401, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 记录异常堆栈，方便排查问题
            return ApiResponse.error(500, "验证码登录失败：" + e.getMessage());
        }
    }

    /**
     * 验证令牌有效性
     * 
     * @param request HTTP请求
     * @return 令牌验证结果
     */
    @GetMapping("/verify-token")
    @Operation(
        summary = "验证令牌有效性", 
        description = "验证JWT令牌是否有效，用于前端检查会话状态"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "令牌验证结果",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
        )
    })
    public ApiResponse<?> verifyToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        Map<String, Object> result = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            result.put("valid", false);
            result.put("message", "未提供令牌或格式错误");
            return ApiResponse.success(result);
        }
        
        String token = authHeader.substring(7);
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                result.put("valid", false);
                result.put("message", "令牌无效：无法提取用户名");
                return ApiResponse.success(result);
            }
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            boolean isValid = jwtUtil.validateToken(token, userDetails);
            
            result.put("valid", isValid);
            if (isValid) {
                result.put("username", username);
                result.put("message", "令牌有效");
                
                // 添加令牌剩余有效期（毫秒）
                Date expiration = jwtUtil.extractExpiration(token);
                long expiresIn = expiration.getTime() - System.currentTimeMillis();
                result.put("expiresIn", expiresIn > 0 ? expiresIn : 0);
            } else {
                result.put("message", "令牌无效或已过期");
            }
        } catch (Exception e) {
            result.put("valid", false);
            result.put("message", "令牌验证异常：" + e.getMessage());
        }
        
        return ApiResponse.success(result);
    }
    
    /**
     * 重置密码
     * 
     * 支持通过邮箱或手机号验证码重置密码
     *
     * @param request 重置密码请求参数
     * @return 重置结果
     */
    @PostMapping("/reset-password")
    @Operation(
        summary = "重置密码", 
        description = "通过邮箱或手机号验证码重置密码，需要先通过/api/verification/code接口获取重置密码验证码"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "密码重置成功",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "请求参数错误或验证码无效"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404", 
            description = "用户不存在"
        )
    })
    public ApiResponse<?> resetPassword(@RequestBody PasswordResetRequest request) {
        try {
            logger.info("接收到密码重置请求: {}", request.getAccount());
            
            // 参数验证
            if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
                return ApiResponse.error(400, "账号不能为空");
            }
            
            if (request.getVerificationCode() == null || request.getVerificationCode().trim().isEmpty()) {
                return ApiResponse.error(400, "验证码不能为空");
            }
            
            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return ApiResponse.error(400, "新密码不能为空");
            }
            
            if (request.getNewPassword().length() < 6 || request.getNewPassword().length() > 20) {
                return ApiResponse.error(400, "新密码长度需在6-20个字符之间");
            }
            
            // 调用服务层方法
            boolean result = authService.resetPassword(request);
            
            if (result) {
                logger.info("密码重置成功: {}", request.getAccount());
                return ApiResponse.success("密码重置成功", null);
            } else {
                logger.warn("密码重置失败: {}", request.getAccount());
                return ApiResponse.error(500, "密码重置失败");
            }
        } catch (IllegalArgumentException e) {
            logger.warn("密码重置参数错误: {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (BadCredentialsException e) {
            logger.warn("验证码错误: {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (UsernameNotFoundException e) {
            logger.warn("用户不存在: {}", e.getMessage());
            return ApiResponse.error(404, e.getMessage());
        } catch (Exception e) {
            logger.error("密码重置异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, "密码重置失败: " + e.getMessage());
        }
    }
} 