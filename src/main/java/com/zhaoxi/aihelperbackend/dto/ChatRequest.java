package com.zhaoxi.aihelperbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String prompt;
    private Long conversationId;
    private Long userId;
    private Boolean deepThinking = false;
    private String model = "deepseek-r1";
    
    // 修改为直接传递Base64编码的图片数据
    private List<String> imageBase64List;
    
    public Long getUserId() {
        return userId;
    }
}