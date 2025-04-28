package com.zhaoxi.aihelperbackend.enums;

/**
 * 登录类型枚举
 * 
 * 定义了系统支持的不同登录方式：
 * - 邮箱登录
 * - 手机号登录
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
public enum LoginType {
    /**
     * 邮箱登录
     * 使用邮箱+密码进行认证
     */
    EMAIL,
    
    /**
     * 手机号登录
     * 使用手机号+密码进行认证
     */
    MOBILE;
    
    /**
     * 获取登录类型枚举
     * 根据字符串类型转换为对应的枚举值，忽略大小写
     * 如果类型为null或空字符串，或无法识别，将抛出IllegalArgumentException
     * 
     * @param type 类型字符串，如"email"、"mobile"
     * @return 对应的登录类型枚举值
     * @throws IllegalArgumentException 如果类型无法识别
     */
    public static LoginType getByType(String type) {
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("登录类型不能为空");
        }
        
        String normalizedType = type.trim().toUpperCase();
        try {
            return LoginType.valueOf(normalizedType);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("不支持的登录类型: " + type);
        }
    }
    
    /**
     * 尝试获取登录类型枚举，如果无法识别则返回默认值
     * 
     * @param type 类型字符串，如"email"、"mobile"
     * @param defaultType 默认返回的登录类型
     * @return 对应的登录类型枚举值，如果无法识别则返回默认值
     */
    public static LoginType getByTypeOrDefault(String type, LoginType defaultType) {
        if (type == null || type.trim().isEmpty()) {
            return defaultType;
        }
        
        try {
            return LoginType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return defaultType;
        }
    }
} 