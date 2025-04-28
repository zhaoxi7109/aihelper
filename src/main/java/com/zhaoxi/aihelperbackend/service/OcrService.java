package com.zhaoxi.aihelperbackend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * OCR服务接口
 * 提供图片文字识别功能
 */
public interface OcrService {
    
    /**
     * 从图片URL识别文字
     * 
     * @param imageUrl 图片URL
     * @return 识别出的文字内容
     */
    String recognizeTextFromUrl(String imageUrl) throws Exception;
    
    /**
     * 从上传的文件中识别文字
     * 
     * @param file 上传的图片文件
     * @return 识别出的文字内容
     */
    String recognizeTextFromFile(MultipartFile file) throws Exception;
} 