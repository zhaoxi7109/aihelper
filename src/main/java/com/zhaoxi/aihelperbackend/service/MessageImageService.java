package com.zhaoxi.aihelperbackend.service;

import com.zhaoxi.aihelperbackend.dto.MessageImageResponse;
import com.zhaoxi.aihelperbackend.entity.MessageImage;

import java.util.List;

/**
 * 消息图片服务接口
 * 处理消息中图片的存储和OCR识别
 */
public interface MessageImageService {
    
    /**
     * 保存消息图片信息
     *
     * @param messageImage 图片信息
     * @return 保存后的图片ID
     */
    Long saveMessageImage(MessageImage messageImage);
    
    /**
     * 通过消息ID获取所有相关图片信息
     *
     * @param messageId 消息ID
     * @return 图片信息列表
     */
    List<MessageImage> getImagesByMessageId(Long messageId);
    
    /**
     * 从Base64编码的字符串创建并保存图片
     *
     * @param base64Image Base64编码的图片数据
     * @param messageId 关联的消息ID
     * @param userId 用户ID
     * @param conversationId 会话ID
     * @return 保存的图片信息
     */
    MessageImage createFromBase64(String base64Image, Long messageId, Long userId, Long conversationId) throws Exception;
    
    /**
     * 转换图片实体为前端响应对象
     *
     * @param image 图片实体
     * @return 前端响应对象
     */
    MessageImageResponse toResponseDto(MessageImage image) throws Exception;
    
    /**
     * 删除图片
     *
     * @param id 图片ID
     */
    void deleteImage(Long id) throws Exception;
    
    /**
     * 删除消息相关的所有图片
     *
     * @param messageId 消息ID
     */
    void deleteImagesByMessageId(Long messageId) throws Exception;
} 