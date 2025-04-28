package com.zhaoxi.aihelperbackend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * OSS文件存储服务接口
 * 提供文件上传、删除等功能
 */
public interface OssService {
    
    /**
     * 上传文件到OSS
     * 
     * @param file 要上传的文件
     * @param fileDir 存储的目录，如 "avatars/"
     * @return 文件访问的URL
     */
    String uploadFile(MultipartFile file, String fileDir) throws Exception;
    
    /**
     * 上传InputStream到OSS
     * 
     * @param inputStream 输入流
     * @param objectName 完整的对象名称（包含路径和文件名）
     * @return 文件访问的URL
     */
    String uploadFile(InputStream inputStream, String objectName) throws Exception;
    
    /**
     * 删除OSS中的文件
     * 
     * @param objectName 文件的完整路径名称
     */
    void deleteFile(String objectName) throws Exception;
    
    /**
     * 为OSS中的文件生成带签名的临时访问URL
     * 
     * @param objectName 文件的对象名称或完整URL
     * @param expireSeconds URL的有效期（秒）
     * @return 带签名的临时访问URL
     */
    String generatePresignedUrl(String objectName, long expireSeconds) throws Exception;
    
    /**
     * 检查给定的URL是否为OSS URL，并返回对象名称
     * 
     * @param url 完整的URL或对象名称
     * @return 对象名称
     */
    String getObjectNameFromUrl(String url);
} 