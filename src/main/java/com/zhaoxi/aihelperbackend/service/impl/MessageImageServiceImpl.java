package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.dto.MessageImageResponse;
import com.zhaoxi.aihelperbackend.entity.MessageImage;
import com.zhaoxi.aihelperbackend.mapper.MessageImageMapper;
import com.zhaoxi.aihelperbackend.service.MessageImageService;
import com.zhaoxi.aihelperbackend.service.OcrService;
import com.zhaoxi.aihelperbackend.service.OssService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class MessageImageServiceImpl implements MessageImageService {

    @Autowired
    private OssService ossService;

    @Autowired
    private OcrService ocrService;

    @Autowired
    private MessageImageMapper messageImageMapper;
    
    @Value("${oss.url-expire-minutes:15}")
    private int urlExpireMinutes;

    @Override
    public Long saveMessageImage(MessageImage messageImage) {
        if (messageImage.getCreatedAt() == null) {
            messageImage.setCreatedAt(LocalDateTime.now());
        }
        messageImage.setUpdatedAt(LocalDateTime.now());
        messageImageMapper.insert(messageImage);
        return messageImage.getId();
    }

    @Override
    public List<MessageImage> getImagesByMessageId(Long messageId) {
        if (messageId == null) {
            return Collections.emptyList();
        }
        return messageImageMapper.findByMessageId(messageId);
    }

    @Override
    public MessageImage createFromBase64(String base64Image, Long messageId, Long userId, Long conversationId) throws Exception {
        try {
            // 处理Base64字符串，移除可能的前缀
            String base64Data = base64Image;
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }
            
            // 解码Base64数据
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            
            // 判断文件类型
            String mimeType = determineMimeType(imageBytes);
            String fileExtension = getFileExtension(mimeType);
            
            // 生成唯一文件名
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // 构建OSS存储路径：message-images/userId/conversationId/
            String ossDir = String.format("message-images/%d/%d/", userId, conversationId);
            String ossKey = ossDir + fileName;
            
            // 上传到OSS
            try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
                ossService.uploadFile(inputStream, ossKey);
            }
            
            // 进行OCR文字识别
            String ocrText = null;
            try {
                // 获取带签名的URL用于OCR识别
                String signedUrl = ossService.generatePresignedUrl(ossKey, 60);
                ocrText = ocrService.recognizeTextFromUrl(signedUrl);
            } catch (Exception e) {
                log.error("OCR识别失败，但继续处理图片: {}", e.getMessage());
                ocrText = "OCR识别失败";
            }
            
            // 创建图片对象
            MessageImage image = new MessageImage();
            image.setMessageId(messageId);
            image.setOssKey(ossKey);
            image.setOriginalFileName(fileName);
            image.setMimeType(mimeType);
            image.setFileSize((long) imageBytes.length);
            image.setOcrText(ocrText);
            image.setCreatedAt(LocalDateTime.now());
            image.setUpdatedAt(LocalDateTime.now());
            
            // 保存到数据库
            saveMessageImage(image);
            
            return image;
        } catch (Exception e) {
            log.error("处理Base64图片失败: {}", e.getMessage());
            throw new Exception("处理Base64图片失败: " + e.getMessage());
        }
    }

    @Override
    public MessageImageResponse toResponseDto(MessageImage image) throws Exception {
        if (image == null) {
            return null;
        }
        
        MessageImageResponse response = new MessageImageResponse();
        response.setId(image.getId());
        response.setOcrText(image.getOcrText());
        response.setOriginalFileName(image.getOriginalFileName());
        
        // 生成带签名的URL
        try {
            if (image.getSignedUrl() == null) {
                String signedUrl = ossService.generatePresignedUrl(image.getOssKey(), urlExpireMinutes * 60);
                response.setSignedUrl(signedUrl);
            } else {
                response.setSignedUrl(image.getSignedUrl());
            }
        } catch (Exception e) {
            log.error("生成签名URL失败: {}", e.getMessage());
            response.setSignedUrl("");
        }
        
        return response;
    }

    @Override
    public void deleteImage(Long id) throws Exception {
        MessageImage image = messageImageMapper.findById(id);
        if (image != null) {
            // 从OSS删除文件
            try {
                ossService.deleteFile(image.getOssKey());
            } catch (Exception e) {
                log.error("删除OSS图片失败: {}", e.getMessage());
                // 继续删除数据库记录
            }
            
            // 从数据库删除记录
            messageImageMapper.deleteById(id);
        }
    }

    @Override
    public void deleteImagesByMessageId(Long messageId) throws Exception {
        List<MessageImage> images = messageImageMapper.findByMessageId(messageId);
        
        for (MessageImage image : images) {
            try {
                // 从OSS删除文件
                ossService.deleteFile(image.getOssKey());
            } catch (Exception e) {
                log.error("删除OSS图片失败: {}", e.getMessage());
                // 继续处理其他图片
            }
        }
        
        // 从数据库批量删除
        messageImageMapper.deleteByMessageId(messageId);
    }
    
    /**
     * 根据文件头字节判断MIME类型
     */
    private String determineMimeType(byte[] bytes) {
        if (bytes.length < 8) {
            return "application/octet-stream";
        }
        
        // 判断文件类型的魔数
        if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8) {
            return "image/jpeg";
        } else if (bytes[0] == (byte) 0x89 && bytes[1] == (byte) 0x50 && bytes[2] == (byte) 0x4E && bytes[3] == (byte) 0x47) {
            return "image/png";
        } else if (bytes[0] == (byte) 0x47 && bytes[1] == (byte) 0x49 && bytes[2] == (byte) 0x46) {
            return "image/gif";
        } else if (bytes[0] == (byte) 0x42 && bytes[1] == (byte) 0x4D) {
            return "image/bmp";
        }
        
        return "image/jpeg"; // 默认JPEG
    }
    
    /**
     * 根据MIME类型获取文件扩展名
     */
    private String getFileExtension(String mimeType) {
        switch (mimeType) {
            case "image/jpeg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/bmp":
                return ".bmp";
            default:
                return ".jpg";
        }
    }
} 