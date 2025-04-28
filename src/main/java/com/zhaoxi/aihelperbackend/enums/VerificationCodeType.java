package com.zhaoxi.aihelperbackend.enums;

/**
 * 验证码类型枚举
 * 
 * 定义不同场景下的验证码类型
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
public enum VerificationCodeType {
    /**
     * 登录验证码
     */
    LOGIN("login", "登录验证码"),
    
    /**
     * 注册验证码
     */
    REGISTER("register", "注册验证码"),
    
    /**
     * 重置密码验证码
     */
    RESET("reset", "重置密码验证码");
    
    /**
     * 类型编码
     */
    private final String code;
    
    /**
     * 类型描述
     */
    private final String description;
    
    VerificationCodeType(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    /**
     * 获取类型编码
     */
    public String getCode() {
        return code;
    }
    
    /**
     * 获取类型描述
     */
    public String getDescription() {
        return description;
    }
    
    /**
     * 根据编码获取枚举值
     */
    public static VerificationCodeType fromCode(String code) {
        for (VerificationCodeType type : VerificationCodeType.values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("不支持的验证码类型: " + code);
    }
} 