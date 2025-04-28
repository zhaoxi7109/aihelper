package com.zhaoxi.aihelperbackend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Conversation {
    private Long id;
    private Long userId;
    private String title;
    private String model;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 