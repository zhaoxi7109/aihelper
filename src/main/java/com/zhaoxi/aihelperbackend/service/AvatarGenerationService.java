package com.zhaoxi.aihelperbackend.service;

/**
 * 用户头像生成服务接口
 * 负责生成用户的AI头像
 */
public interface AvatarGenerationService {
    
    /**
     * 根据用户信息生成AI头像
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param nickname 用户昵称
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    String generateAvatar(Long userId, String username, String nickname) throws Exception;
    
    /**
     * 为新注册用户生成AI头像
     * 
     * @param userId 用户ID
     * @param username 用户名
     * @param nickname 用户昵称（可为空）
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    String generateAvatarForNewUser(Long userId, String username, String nickname) throws Exception;
    
    /**
     * 使用自定义提示词生成AI头像
     * 
     * @param userId 用户ID
     * @param customPrompt 自定义提示词
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    String generateAvatarWithCustomPrompt(Long userId, String customPrompt) throws Exception;
} 