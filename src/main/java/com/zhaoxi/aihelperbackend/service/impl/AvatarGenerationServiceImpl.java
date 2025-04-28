package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.service.AvatarGenerationService;
import com.zhaoxi.aihelperbackend.service.OssService;
import com.zhaoxi.aihelperbackend.utils.AvatarPromptGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 用户头像生成服务实现
 * 整合提示词生成、AI图像生成和OSS存储
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvatarGenerationServiceImpl implements AvatarGenerationService {

    private final AvatarPromptGenerator promptGenerator;
    private final AIImageGenerator imageGenerator;
    private final OssService ossService;
    
    /**
     * 头像尺寸
     */
    @Value("${app.avatar.size:512*512}")
    private String avatarSize;
    
    /**
     * OSS中存储头像的目录
     */
    @Value("${app.avatar.directory:avatars/ai/}")
    private String avatarDirectory;
    
    /**
     * AI头像文件名前缀
     */
    private static final String AI_AVATAR_PREFIX = "ai_avatar_";
    
    /**
     * 根据用户信息生成AI头像
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param nickname 用户昵称
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    @Override
    public String generateAvatar(Long userId, String username, String nickname) throws Exception {
        log.info("开始为用户生成AI头像, 用户ID: {}, 用户名: {}, 昵称: {}", userId, username, nickname);
        
        try {
            // 1. 生成提示词
            String prompt = promptGenerator.generatePrompt(username, nickname);
            log.info("生成提示词: {}", prompt);
            
            // 2. 调用AI模型生成图像
            String imageUrl = imageGenerator.generateImage(prompt, avatarSize);
            log.info("AI模型生成图像成功: {}", imageUrl);
            
            // 3. 下载生成的图像
            byte[] imageBytes = imageGenerator.downloadImage(imageUrl);
            
            // 4. 创建MultipartFile对象
            MultipartFile avatarFile = createMultipartFile(imageBytes, userId);
            
            // 5. 上传到OSS存储
            String objectName = ossService.uploadFile(avatarFile, avatarDirectory);
            log.info("AI头像上传成功, 对象名: {}", objectName);
            
            return objectName;
        } catch (Exception e) {
            log.error("生成AI头像失败: {}", e.getMessage(), e);
            throw new Exception("生成AI头像失败: " + e.getMessage());
        }
    }
    
    /**
     * 为新注册用户生成AI头像
     * 
     * @param userId 用户ID
     * @param username 用户名
     * @param nickname 用户昵称（可为空）
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    @Override
    public String generateAvatarForNewUser(Long userId, String username, String nickname) throws Exception {
        log.info("开始为新用户生成AI头像, 用户ID: {}, 用户名: {}, 昵称: {}", userId, username, nickname);
        
        try {
            // 使用更具创意的提示词
            String prompt = promptGenerator.generateNewUserPrompt(username, nickname);
            log.info("生成新用户提示词: {}", prompt);
            
            // 其余流程与普通生成相同
            String imageUrl = imageGenerator.generateImage(prompt, avatarSize);
            log.info("AI模型生成图像成功: {}", imageUrl);
            
            byte[] imageBytes = imageGenerator.downloadImage(imageUrl);
            MultipartFile avatarFile = createMultipartFile(imageBytes, userId);
            
            String objectName = ossService.uploadFile(avatarFile, avatarDirectory);
            log.info("新用户AI头像上传成功, 对象名: {}", objectName);
            
            return objectName;
        } catch (Exception e) {
            log.error("为新用户生成AI头像失败: {}", e.getMessage(), e);
            throw new Exception("为新用户生成AI头像失败: " + e.getMessage());
        }
    }
    
    /**
     * 使用自定义提示词生成AI头像
     * 
     * @param userId 用户ID
     * @param customPrompt 自定义提示词
     * @return 生成的头像OSS对象名
     * @throws Exception 生成失败时抛出异常
     */
    @Override
    public String generateAvatarWithCustomPrompt(Long userId, String customPrompt) throws Exception {
        log.info("开始使用自定义提示词生成AI头像, 用户ID: {}, 自定义提示词: {}", userId, customPrompt);
        
        try {
            // 1. 直接使用用户提供的自定义提示词
            log.info("使用自定义提示词: {}", customPrompt);
            
            // 2. 调用AI模型生成图像
            String imageUrl = imageGenerator.generateImage(customPrompt, avatarSize);
            log.info("AI模型生成图像成功: {}", imageUrl);
            
            // 3. 下载生成的图像
            byte[] imageBytes = imageGenerator.downloadImage(imageUrl);
            
            // 4. 创建MultipartFile对象
            MultipartFile avatarFile = createMultipartFile(imageBytes, userId);
            
            // 5. 上传到OSS存储
            String objectName = ossService.uploadFile(avatarFile, avatarDirectory);
            log.info("使用自定义提示词生成的AI头像上传成功, 对象名: {}", objectName);
            
            return objectName;
        } catch (Exception e) {
            log.error("使用自定义提示词生成AI头像失败: {}", e.getMessage(), e);
            throw new Exception("使用自定义提示词生成AI头像失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建包含头像数据的MultipartFile对象
     *
     * @param imageBytes 图像字节数组
     * @param userId 用户ID
     * @return MultipartFile对象
     */
    private MultipartFile createMultipartFile(byte[] imageBytes, Long userId) {
        // 生成文件名: ai_avatar_用户ID_时间戳.png
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String fileName = AI_AVATAR_PREFIX + userId + "_" + timestamp + ".png";
        
        return new ByteArrayMultipartFile(fileName, imageBytes);
    }
    
    /**
     * 基于字节数组的MultipartFile实现
     */
    private static class ByteArrayMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        public ByteArrayMultipartFile(String name, byte[] content) {
            this(name, name, "image/png", content);
        }

        public ByteArrayMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public String getName() {
            return this.name;
        }

        @Override
        public String getOriginalFilename() {
            return this.originalFilename;
        }

        @Override
        public String getContentType() {
            return this.contentType;
        }

        @Override
        public boolean isEmpty() {
            return this.content == null || this.content.length == 0;
        }

        @Override
        public long getSize() {
            return this.content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return this.content;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(this.content);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            throw new UnsupportedOperationException("transferTo() is not supported");
        }
    }
} 