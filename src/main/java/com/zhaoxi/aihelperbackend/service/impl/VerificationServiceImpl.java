package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.enums.VerificationCodeType;
import com.zhaoxi.aihelperbackend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * 验证码服务实现类
 * 
 * 验证码存储在Redis中，以"verification:{type}:{receiver}"为key
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final StringRedisTemplate redisTemplate;
    
    // 验证码有效期（分钟）
    private static final int CODE_EXPIRATION_MINUTES = 5;
    
    // 验证码长度
    private static final int CODE_LENGTH = 6;
    
    // Redis键前缀
    private static final String KEY_PREFIX = "verification:";
    
    /**
     * 生成并发送验证码
     * 实际项目中，这里应该调用短信或邮件服务发送验证码
     * 此处简化为存储验证码，并直接返回给调用方
     */
    @Override
    public String generateAndSendCode(String receiver, String type) {
        // 验证类型
        try {
            VerificationCodeType codeType = VerificationCodeType.fromCode(type);
            
            // 生成六位随机数字验证码
            String code = generateRandomCode(CODE_LENGTH);
            
            // 构造Redis键
            String key = buildKey(codeType.getCode(), receiver);
            
            // 将验证码存入Redis，设置过期时间
            redisTemplate.opsForValue().set(key, code, CODE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
            
            // 实际项目中，这里应该调用短信或邮件服务发送验证码
            // sendSms(receiver, code) 或 sendEmail(receiver, code)
            
            // 返回验证码（仅用于测试环境，生产环境应移除）
            return code;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("不支持的验证码类型: " + type);
        }
    }

    /**
     * 验证验证码是否正确
     */
    @Override
    public boolean verifyCode(String receiver, String type, String code) {
        if (receiver == null || type == null || code == null) {
            return false;
        }
        
        try {
            // 验证类型
            VerificationCodeType codeType = VerificationCodeType.fromCode(type);
            
            // 构造Redis键
            String key = buildKey(codeType.getCode(), receiver);
            
            // 从Redis获取验证码
            String storedCode = redisTemplate.opsForValue().get(key);
            
            // 验证码不存在或不匹配
            if (storedCode == null || !storedCode.equals(code)) {
                return false;
            }
            
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 清除验证码
     */
    @Override
    public void clearCode(String receiver, String type) {
        try {
            // 验证类型
            VerificationCodeType codeType = VerificationCodeType.fromCode(type);
            
            // 构造Redis键
            String key = buildKey(codeType.getCode(), receiver);
            
            // 从Redis删除验证码
            redisTemplate.delete(key);
        } catch (IllegalArgumentException e) {
            // 忽略不支持的类型
        }
    }
    
    /**
     * 生成指定长度的随机数字验证码
     */
    private String generateRandomCode(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        
        return sb.toString();
    }
    
    /**
     * 构建Redis键
     */
    private String buildKey(String type, String receiver) {
        return KEY_PREFIX + type + ":" + receiver;
    }
} 