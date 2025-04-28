package com.zhaoxi.aihelperbackend.service.impl;

import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesis;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisParam;
import com.alibaba.dashscope.aigc.imagesynthesis.ImageSynthesisResult;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.dashscope.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Base64;
import java.util.Map;

/**
 * AI图像生成服务
 * 基于阿里云大模型API生成图像
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIImageGenerator {

    /**
     * 阿里云大模型API Key
     */
    @Value("${dashscope.api-key}")
    private String apiKey;

    /**
     * 图像生成模型名称
     */
    @Value("${dashscope.image-model:wanx2.1-t2i-turbo}")
    private String model;

    /**
     * 异步调用：根据提示词生成图像
     *
     * @param prompt 提示词
     * @param size 图像尺寸，例如 "1024*1024"
     * @return 生成的图像URL
     * @throws Exception 调用失败时抛出异常
     */
    public String generateImage(String prompt, String size) throws Exception {
        log.info("开始生成AI图像，提示词: {}", prompt);
        
        // 创建参数
        ImageSynthesisParam param = ImageSynthesisParam.builder()
                .apiKey(apiKey)
                .model(model)
                .prompt(prompt)
                .n(1)
                .size(size)
                .build();

        // 创建图像合成实例
        ImageSynthesis imageSynthesis = new ImageSynthesis();
        
        try {
            // 发起异步调用
            log.info("创建图像合成任务");
            ImageSynthesisResult result = imageSynthesis.asyncCall(param);
            if (result == null || result.getOutput() == null) {
                throw new Exception("创建图像合成任务失败");
            }
            
            // 获取任务ID
            String taskId = result.getOutput().getTaskId();
            log.info("图像合成任务创建成功，任务ID: {}", taskId);
            
            // 等待任务完成
            log.info("等待图像合成任务完成");
            ImageSynthesisResult finalResult = imageSynthesis.wait(taskId, apiKey);
            
            // 打印响应，便于调试
            log.debug("图像生成完整响应: {}", JsonUtils.toJson(finalResult));
            
            if (finalResult == null || finalResult.getOutput() == null || 
                finalResult.getOutput().getResults() == null || 
                finalResult.getOutput().getResults().isEmpty()) {
                log.error("图像生成失败，返回结果为空");
                throw new Exception("图像生成失败，返回结果为空");
            }
            
            // 直接从结果中提取URL字段
            String imageUrl = null;
            try {
                // 由于API可能返回不同类型，先尝试直接获取
                Map<String, String> resultMap = finalResult.getOutput().getResults().get(0);
                imageUrl = resultMap.get("url");
            } catch (Exception e) {
                // 如果上面的方式失败，使用通用方式解析
                log.warn("使用标准方式获取URL失败，尝试替代方式: {}", e.getMessage());
                String resultJson = JsonUtils.toJson(finalResult.getOutput().getResults().get(0));
                
                // 如果是JSON字符串，尝试转换后获取
                if (resultJson.contains("url")) {
                    int urlIndex = resultJson.indexOf("\"url\"");
                    if (urlIndex >= 0) {
                        int startIndex = resultJson.indexOf("\"", urlIndex + 6) + 1;
                        int endIndex = resultJson.indexOf("\"", startIndex);
                        if (startIndex > 0 && endIndex > startIndex) {
                            imageUrl = resultJson.substring(startIndex, endIndex);
                        }
                    }
                }
            }
            
            if (imageUrl == null || imageUrl.isEmpty()) {
                log.error("无法从响应中提取图像URL: {}", JsonUtils.toJson(finalResult));
                throw new Exception("无法获取图像URL");
            }
            
            log.info("图像生成成功: {}", imageUrl);
            return imageUrl;
            
        } catch (ApiException | NoApiKeyException e) {
            log.error("调用阿里云图像生成API失败: {}", e.getMessage());
            throw new Exception("调用阿里云图像生成API失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("图像生成过程中发生错误: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * 从生成的图像URL下载图像数据
     *
     * @param imageUrl 图像URL
     * @return 图像字节数组
     * @throws Exception 下载失败时抛出异常
     */
    public byte[] downloadImage(String imageUrl) throws Exception {
        log.info("开始下载图像: {}", imageUrl);
        
        URL url = new URL(imageUrl);
        URLConnection connection = url.openConnection();
        
        try (InputStream inputStream = connection.getInputStream();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            
            byte[] imageBytes = outputStream.toByteArray();
            log.info("图像下载成功，大小: {} 字节", imageBytes.length);
            
            return imageBytes;
        }
    }
    
    /**
     * 获取图像的Base64编码
     *
     * @param imageBytes 图像字节数组
     * @return Base64编码字符串
     */
    public String getBase64Image(byte[] imageBytes) {
        return Base64.getEncoder().encodeToString(imageBytes);
    }
} 