package com.zhaoxi.aihelperbackend.utils;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * 用户头像提示词生成工具类
 * 根据用户信息生成适合的头像提示词
 */
@Component
public class AvatarPromptGenerator {
    
    // 随机数生成器
    private final Random random = new Random();
    
    // 头像风格列表
    private final List<String> avatarStyles = Arrays.asList(
            "写实风格", "卡通风格", "动漫风格", "像素艺术", "水彩画风格", 
            "油画风格", "插画风格", "极简主义", "几何风格", "赛博朋克"
    );
    
    // 背景类型列表
    private final List<String> backgroundTypes = Arrays.asList(
            "纯色背景", "渐变背景", "抽象背景", "自然背景", "宇宙背景", 
            "城市背景", "模糊背景", "几何图案背景", "无背景（透明）"
    );
    
    // 颜色列表
    private final List<String> colors = Arrays.asList(
            "蓝色", "红色", "绿色", "黄色", "紫色", "橙色",
            "粉色", "青色", "金色", "银色", "棕色", "黑色", "白色"
    );
    
    /**
     * 生成头像提示词
     *
     * @param username 用户名
     * @param nickname 用户昵称（可能为空）
     * @return 生成的提示词
     */
    public String generatePrompt(String username, String nickname) {
        String name = nickname != null && !nickname.trim().isEmpty() ? nickname : username;
        
        // 随机选择风格和背景
        String style = avatarStyles.get(random.nextInt(avatarStyles.size()));
        String background = backgroundTypes.get(random.nextInt(backgroundTypes.size()));
        String mainColor = colors.get(random.nextInt(colors.size()));
        String accentColor = getComplementaryColor(mainColor);
        
        // 从用户名获取特征
        List<String> features = extractFeaturesFromName(name);
        String featuresStr = String.join("，", features);
        
        // 构建基础提示词
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("生成一个独特的个人头像，");
        
        // 添加特征（如果有）
        if (!features.isEmpty()) {
            promptBuilder.append(featuresStr).append("，");
        }
        
        // 添加风格和背景
        promptBuilder.append("采用").append(style).append("，");
        promptBuilder.append("主色调为").append(mainColor).append("，");
        promptBuilder.append("点缀色为").append(accentColor).append("，");
        promptBuilder.append("使用").append(background).append("，");
        
        // 添加其他元素
        promptBuilder.append("画面干净整洁，细节丰富，适合作为个人头像，不要包含文字");
        
        return promptBuilder.toString();
    }
    
    /**
     * 为新用户生成更具特色的提示词
     * 可以包含更多随机元素和创意风格
     *
     * @param username 用户名
     * @param nickname 用户昵称（可能为空）
     * @return 生成的提示词
     */
    public String generateNewUserPrompt(String username, String nickname) {
        String basePrompt = generatePrompt(username, nickname);
        
        // 可以添加额外创意元素
        List<String> creativeElements = Arrays.asList(
                "具有未来感的设计", "包含抽象几何元素", "带有轻微的光晕效果",
                "具有精致的纹理细节", "柔和的光影效果", "明亮鲜艳的色彩",
                "干净清晰的轮廓", "富有想象力的构图", "优雅的色彩过渡",
                "宏观特写视角", "梦幻氛围", "微妙的纹理层次"
        );
        
        String creativeElement = creativeElements.get(random.nextInt(creativeElements.size()));
        
        return basePrompt + "，" + creativeElement;
    }
    
    /**
     * 根据用户名或昵称提取潜在的特征
     *
     * @param name 用户名或昵称
     * @return 特征列表
     */
    private List<String> extractFeaturesFromName(String name) {
        List<String> features = new ArrayList<>();
        
        // 基于名字的长度、字符类型等简单规则提取特征
        // 这里只是示例，可以根据实际需求扩展
        
        // 检查是否包含数字，如果有可能偏好科技风
        if (name.matches(".*\\d+.*")) {
            features.add("科技感设计");
        }
        
        // 检查名字长度，短名字可能更简约
        if (name.length() <= 5) {
            features.add("简约风格");
        } else {
            features.add("丰富细节");
        }
        
        // 检查是否有大写字母，可能更正式
        if (name.matches(".*[A-Z].*")) {
            features.add("专业感");
        }
        
        // 检查特殊字符，可能更有创意
        if (name.matches(".*[^a-zA-Z0-9\\u4e00-\\u9fa5].*")) {
            features.add("创意元素");
        }
        
        return features;
    }
    
    /**
     * 获取颜色的互补色
     *
     * @param color 原始颜色
     * @return 互补颜色
     */
    private String getComplementaryColor(String color) {
        // 简单实现，从不同于原色的颜色中随机选择
        List<String> filteredColors = new ArrayList<>(colors);
        filteredColors.remove(color);
        return filteredColors.get(random.nextInt(filteredColors.size()));
    }
} 