package com.zhaoxi.aihelperbackend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.zhaoxi.aihelperbackend.mapper")
public class AihelperBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(AihelperBackendApplication.class, args);
    }
}
