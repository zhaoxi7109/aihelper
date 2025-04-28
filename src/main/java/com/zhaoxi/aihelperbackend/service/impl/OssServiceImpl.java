package com.zhaoxi.aihelperbackend.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.PutObjectRequest;
import com.zhaoxi.aihelperbackend.config.OssConfig;
import com.zhaoxi.aihelperbackend.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.UUID;

/**
 * OSS文件存储服务实现
 * 基于阿里云OSS实现文件的上传和删除
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OssServiceImpl implements OssService {

    private final OSS ossClient;
    private final OssConfig ossConfig;

    /**
     * 上传文件到OSS
     *
     * @param file 要上传的文件
     * @param fileDir 存储的目录，如 "avatars/"
     * @return 文件访问的URL
     */
    @Override
    public String uploadFile(MultipartFile file, String fileDir) throws Exception {
        // 获取原始文件名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        
        // 生成唯一文件名（防止文件覆盖）
        String fileName = generateUniqueFileName(originalFilename);
        
        // 组合对象名（包含目录）
        String objectName = fileDir + fileName;
        
        try {
            // 创建上传请求
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucketName(), 
                    objectName, 
                    file.getInputStream());
            
            // 上传文件
            ossClient.putObject(putObjectRequest);
            
            // 返回对象名而不是直接URL（因为是私有存储桶，直接URL无法访问）
            return objectName;
        } catch (IOException e) {
            log.error("文件上传OSS失败: {}", e.getMessage());
            throw new Exception("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 删除OSS中的文件
     *
     * @param objectName 文件的完整路径名称
     */
    @Override
    public void deleteFile(String objectName) throws Exception {
        try {
            // 提取对象名
            objectName = getObjectNameFromUrl(objectName);
            
            // 删除文件
            ossClient.deleteObject(ossConfig.getBucketName(), objectName);
        } catch (Exception e) {
            log.error("删除OSS文件失败: {}", e.getMessage());
            throw new Exception("删除文件失败: " + e.getMessage());
        }
    }
    
    /**
     * 为OSS中的文件生成带签名的临时访问URL
     * 
     * @param objectName 文件的对象名称或完整URL
     * @param expireSeconds URL的有效期（秒）
     * @return 带签名的临时访问URL
     */
    @Override
    public String generatePresignedUrl(String objectName, long expireSeconds) throws Exception {
        try {
            // 提取对象名
            objectName = getObjectNameFromUrl(objectName);
            
            // 默认图片处理
            if (objectName == null || objectName.isEmpty() || objectName.contains("default")) {
                // 如果是默认头像，可能是公开的资源，直接返回
                return ossConfig.getUrlPrefix() + objectName;
            }
            
            // 设置URL过期时间
            Date expiration = new Date(System.currentTimeMillis() + expireSeconds * 1000);
            
            // 创建签名URL请求
            GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(
                    ossConfig.getBucketName(), objectName);
            request.setExpiration(expiration);
            
            // 生成签名URL
            URL url = ossClient.generatePresignedUrl(request);
            
            return url.toString();
        } catch (Exception e) {
            log.error("生成签名URL失败: {}", e.getMessage());
            throw new Exception("生成签名URL失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查给定的URL是否为OSS URL，并返回对象名称
     * 
     * @param url 完整的URL或对象名称
     * @return 对象名称
     */
    @Override
    public String getObjectNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // 如果已经是对象名而不是URL，直接返回
        if (!url.startsWith("http")) {
            return url;
        }
        
        // 如果是完整的OSS URL，提取对象名
        String urlPrefix = ossConfig.getUrlPrefix();
        if (url.startsWith(urlPrefix)) {
            return url.substring(urlPrefix.length());
        }
        
        // 如果是签名URL，尝试提取对象名
        try {
            // 解析URL并提取路径部分
            URL parsedUrl = new URL(url);
            String path = parsedUrl.getPath();
            
            // 移除可能存在的前导斜杠
            if (path.startsWith("/")) {
                path = path.substring(1);
            }
            
            // 提取存储桶后面的部分作为对象名
            int bucketEndIndex = path.indexOf("/", 0);
            if (bucketEndIndex >= 0) {
                return path.substring(bucketEndIndex + 1);
            }
            
            return path;
        } catch (Exception e) {
            // URL解析失败，返回原始URL
            log.warn("解析URL失败，返回原始值: {}", url);
            return url;
        }
    }
    
    /**
     * 生成唯一的文件名
     *
     * @param originalFilename 原始文件名
     * @return 唯一的文件名
     */
    private String generateUniqueFileName(String originalFilename) {
        // 获取文件扩展名
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }
        
        // 使用UUID生成唯一标识
        return UUID.randomUUID().toString().replace("-", "") 
                + "-" + System.currentTimeMillis() 
                + extension;
    }

    /**
     * 上传InputStream到OSS
     *
     * @param inputStream 输入流
     * @param objectName 完整的对象名称（包含路径和文件名）
     * @return 文件访问的URL
     */
    @Override
    public String uploadFile(InputStream inputStream, String objectName) throws Exception {
        try {
            // 创建上传请求
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucketName(), 
                    objectName, 
                    inputStream);
            
            // 上传文件
            ossClient.putObject(putObjectRequest);
            
            // 返回对象名
            return objectName;
        } catch (Exception e) {
            log.error("文件上传OSS失败: {}", e.getMessage());
            throw new Exception("文件上传失败: " + e.getMessage());
        }
    }
} 