package com.zhaoxi.aihelperbackend.utils;

import java.util.regex.Pattern;

/**
 * 验证工具类
 * 
 * 提供常用的验证方法，如邮箱、手机号等格式验证
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
public class ValidationUtils {
    
    /**
     * 手机号码格式正则表达式
     * 支持13、14、15、16、17、18、19开头的手机号
     */
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    /**
     * 电子邮箱格式正则表达式
     * 更完善的邮箱格式验证，支持更多的邮箱格式
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");
    
    /**
     * 验证手机号格式是否正确
     * 
     * @param mobile 待验证的手机号
     * @return true表示格式正确，false表示格式错误
     */
    public static boolean isValidMobile(String mobile) {
        if (mobile == null || mobile.trim().isEmpty()) {
            return false;
        }
        return MOBILE_PATTERN.matcher(mobile).matches();
    }
    
    /**
     * 验证邮箱格式是否正确
     * 
     * @param email 待验证的邮箱
     * @return true表示格式正确，false表示格式错误
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * 验证字符串是否为空
     * 
     * @param str 待验证的字符串
     * @return true表示为空，false表示不为空
     */
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    /**
     * 验证字符串是否不为空
     * 
     * @param str 待验证的字符串
     * @return true表示不为空，false表示为空
     */
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
} 