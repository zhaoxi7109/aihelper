package com.zhaoxi.aihelperbackend.service.impl;

import com.aliyun.ocr_api20210707.Client;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextRequest;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextResponse;
import com.aliyun.tea.TeaException;
import com.aliyun.teautil.Common;
import com.aliyun.teautil.models.RuntimeOptions;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhaoxi.aihelperbackend.service.OcrService;
import com.zhaoxi.aihelperbackend.service.OssService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * OCR服务实现类
 * 基于阿里云OCR服务
 */
@Service
@Slf4j
public class OcrServiceImpl implements OcrService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private OssService ossService;

    /**
     * 创建阿里云OCR客户端
     */
    private Client createClient() throws Exception {
        com.aliyun.teaopenapi.models.Config config = new com.aliyun.teaopenapi.models.Config()
                .setAccessKeyId(System.getenv("ALIBABA_CLOUD_ACCESS_KEY_ID"))
                .setAccessKeySecret(System.getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET"));
        config.endpoint = "ocr-api.cn-hangzhou.aliyuncs.com";
        return new Client(config);
    }

    /**
     * 从图片URL识别文字
     */
    @Override
    public String recognizeTextFromUrl(String imageUrl) throws Exception {
        Client client = createClient();
        
        RecognizeAllTextRequest request = new RecognizeAllTextRequest()
                .setUrl(imageUrl)
                .setType("Advanced"); // 使用高级模式获取更好的识别效果
        
        RuntimeOptions runtime = new RuntimeOptions();
        
        try {
            RecognizeAllTextResponse resp = client.recognizeAllTextWithOptions(request, runtime);
            return parseOcrResult(Common.toJSONString(resp.body.data));
        } catch (TeaException error) {
            log.error("OCR识别失败: {}", error.getMessage());
            log.error("诊断信息: {}", error.getData().get("Recommend"));
            throw new Exception("OCR识别失败: " + error.getMessage());
        } catch (Exception error) {
            log.error("OCR识别异常: {}", error.getMessage());
            throw new Exception("OCR识别异常: " + error.getMessage());
        }
    }

    /**
     * 从上传的文件中识别文字
     */
    @Override
    public String recognizeTextFromFile(MultipartFile file) throws Exception {
        // 先获取文件URL
        String tempFileDir = "temp/ocr/";
        String ossKey = ossService.uploadFile(file, tempFileDir);
        
        try {
            // 获取带签名的URL
            String signedUrl = ossService.generatePresignedUrl(ossKey, 60);
            // 调用URL识别
            String result = recognizeTextFromUrl(signedUrl);
            
            // 识别完成后删除临时文件
            ossService.deleteFile(ossKey);
            
            return result;
        } catch (Exception e) {
            // 出错也需要删除临时文件
            try {
                ossService.deleteFile(ossKey);
            } catch (Exception ex) {
                log.warn("删除临时OCR文件失败: {}", ex.getMessage());
            }
            throw e;
        }
    }
    
    /**
     * 解析OCR识别结果，提取文本内容
     */
    private String parseOcrResult(String jsonResult) throws Exception {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResult);
            
            // 尝试获取文本内容
            if (rootNode.has("content")) {
                return rootNode.get("content").asText();
            }
            
            // 如果没有直接的content字段，尝试从复杂结构中提取
            StringBuilder resultText = new StringBuilder();
            
            // 针对可能存在的多区域文本提取
            if (rootNode.has("regions") && rootNode.get("regions").isArray()) {
                JsonNode regions = rootNode.get("regions");
                for (JsonNode region : regions) {
                    if (region.has("text")) {
                        resultText.append(region.get("text").asText()).append("\n");
                    } else if (region.has("lines") && region.get("lines").isArray()) {
                        for (JsonNode line : region.get("lines")) {
                            if (line.has("text")) {
                                resultText.append(line.get("text").asText()).append("\n");
                            }
                        }
                    }
                }
            }
            
            String text = resultText.toString().trim();
            return text.isEmpty() ? "未能识别出文本内容" : text;
        } catch (Exception e) {
            log.error("解析OCR结果失败: {}", e.getMessage());
            throw new Exception("解析OCR结果失败: " + e.getMessage());
        }
    }
} 