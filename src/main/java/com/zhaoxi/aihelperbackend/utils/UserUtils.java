package com.zhaoxi.aihelperbackend.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * 用户工具类
 * 
 * 主要提供用户相关的工具方法，如生成随机用户名、根据邮箱生成用户名、
 * 根据手机号生成用户名以及生成随机昵称等功能。
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
public class UserUtils {
    
    /**
     * 形容词数组，用于生成随机昵称
     */
    private static final String[] ADJECTIVES = {
        "智慧", "快乐", "优雅", "勇敢", "友善", "聪明", "活力", "温暖", "创新", "冷静"
    };
    
    /**
     * 名词数组，用于生成随机昵称
     */
    private static final String[] NOUNS = {
        "探索者", "思考者", "旅行者", "梦想家", "创造者", "领航员", "守护者", "追梦人", "冒险家", "开拓者"
    };
    
    /**
     * 随机数生成器
     */
    private static final Random RANDOM = new Random();
    
    /**
     * 生成随机用户名
     * 基于当前时间和随机数生成唯一用户名
     * 
     * @return 随机用户名，格式：user_时间戳_随机数
     */
    public static String generateUsername() {
        // 生成基于时间的随机用户名
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomNum = RANDOM.nextInt(10000);
        return "user_" + timestamp + "_" + randomNum;
    }
    
    /**
     * 根据邮箱生成用户名
     * 使用邮箱前缀（@符号前的部分）作为用户名基础，附加随机数
     * 
     * @param email 邮箱地址
     * @return 基于邮箱的用户名
     */
    public static String generateUsernameFromEmail(String email) {
        if (email == null || email.isEmpty()) {
            return generateUsername();
        }
        
        // 使用邮箱前缀作为用户名基础
        String prefix = email.split("@")[0];
        // 添加随机数避免重复
        int randomNum = RANDOM.nextInt(10000);
        return prefix + "_" + randomNum;
    }
    
    /**
     * 根据手机号生成用户名
     * 使用手机号后四位作为用户名的一部分，附加随机数
     * 
     * @param mobile 手机号码
     * @return 基于手机号的用户名
     */
    public static String generateUsernameFromMobile(String mobile) {
        if (mobile == null || mobile.isEmpty()) {
            return generateUsername();
        }
        
        // 使用手机号后四位作为用户名的一部分
        String lastFour = mobile.length() > 4 ? mobile.substring(mobile.length() - 4) : mobile;
        int randomNum = RANDOM.nextInt(10000);
        return "m" + lastFour + "_" + randomNum;
    }
    
    /**
     * 生成随机昵称
     * 从预设的形容词和名词中随机组合生成昵称
     * 
     * @return 随机昵称，格式：形容词+的+名词
     */
    public static String generateNickname() {
        String adjective = ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[RANDOM.nextInt(NOUNS.length)];
        return adjective + "的" + noun;
    }
} 