package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.VerificationCodeRequest;
import com.zhaoxi.aihelperbackend.enums.VerificationCodeType;
import com.zhaoxi.aihelperbackend.service.VerificationService;
import com.zhaoxi.aihelperbackend.utils.ValidationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 验证码控制器
 * 
 * 提供获取验证码功能
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/verification")
@Tag(name = "验证码接口", description = "验证码获取相关接口")
@RequiredArgsConstructor
public class VerificationController {

    private static final Logger logger = LoggerFactory.getLogger(VerificationController.class);
    private final VerificationService verificationService;
    
    /**
     * 获取验证码
     * 
     * @param request 验证码请求
     * @return 获取结果
     */
    @PostMapping("/code")
    @Operation(summary = "获取验证码", description = "获取验证码并发送到指定邮箱或手机号，支持的类型包括：login-登录验证码，register-注册验证码，reset-重置密码验证码")
    public ApiResponse<?> getVerificationCode(@RequestBody VerificationCodeRequest request) {
        // 参数校验
        if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
            return ApiResponse.error(400, "账号不能为空");
        }
        
        if (request.getType() == null || request.getType().trim().isEmpty()) {
            return ApiResponse.error(400, "验证码类型不能为空");
        }
        
        // 验证账号格式
        String account = request.getAccount().trim();
        boolean isEmail = ValidationUtils.isValidEmail(account);
        boolean isMobile = ValidationUtils.isValidMobile(account);
        
        if (!isEmail && !isMobile) {
            return ApiResponse.error(400, "账号格式不正确，请输入正确的邮箱或手机号");
        }
        
        try {
            // 验证类型是否支持
            VerificationCodeType codeType = VerificationCodeType.fromCode(request.getType());
            logger.info("获取验证码请求: 账号={}, 类型={}", account, codeType.getDescription());
            
            // 生成并发送验证码
            String code = verificationService.generateAndSendCode(account, request.getType());
            
            // 构建响应数据
            Map<String, Object> data = new HashMap<>();
            data.put("message", "验证码已发送");
            
            // 仅在测试环境返回验证码
            if (System.getProperty("spring.profiles.active", "dev").equals("dev")) {
                data.put("code", code); // 开发环境返回验证码方便测试
                logger.debug("开发环境返回验证码: {}", code);
            }
            
            logger.info("验证码发送成功: 账号={}", account);
            return ApiResponse.success("验证码已发送", data);
        } catch (IllegalArgumentException e) {
            logger.warn("获取验证码失败: 参数错误 - {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            logger.error("获取验证码失败: 系统错误 - {}", e.getMessage(), e);
            return ApiResponse.error(500, "获取验证码失败：" + e.getMessage());
        }
    }
} 