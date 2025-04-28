package com.zhaoxi.aihelperbackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;

@Configuration
public class SwaggerConfig {

    // 安全模式名称常量，确保一致性
    private static final String SECURITY_SCHEME_NAME = "Authorization";

    @Bean
    public OpenAPI aiHelperOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI助手API文档")
                        .description("仿DeepSeek的AI助手后端API\n\n" +
                                "## API认证说明\n" +
                                "1. 大部分API需要JWT Bearer Token认证\n" +
                                "2. 先调用 `/api/auth/login` 接口获取token\n" +
                                "3. 点击右上角的 **Authorize** 按钮\n" +
                                "4. 在弹出框中输入 `Bearer {您的token}` (注意Bearer后有空格)\n" +
                                "5. 点击 **Authorize** 按钮完成认证\n\n" +
                                "## 常见问题\n" +
                                "- 如果遇到403错误，请检查token是否正确或已过期\n" +
                                "- token默认有效期为24小时")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Zhaoxi")
                                .email("example@example.com")
                                .url("https://github.com/example/aihelper-backend")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, createAPIKeyScheme()));
    }
    
    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("请输入JWT Bearer Token，格式为：Bearer {token}\n\n" +
                        "步骤：\n" +
                        "1. 使用登录接口获取token\n" +
                        "2. 在此处输入Bearer开头，后跟一个空格，再加上token\n" +
                        "3. 例如：Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...\n" +
                        "4. 认证后即可访问需要认证的API");
    }
    
    /**
     * 自定义操作处理器，确保JWT认证信息正确传递
     */
    @Bean
    public OperationCustomizer operationCustomizer() {
        return (operation, handlerMethod) -> {
            // 检查方法或类是否有安全要求注解
            if (requiresSecurity(handlerMethod)) {
                operation.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
            }
            return operation;
        };
    }
    
    /**
     * 判断方法是否需要安全认证
     */
    private boolean requiresSecurity(HandlerMethod handlerMethod) {
        // 检查方法上是否有@SecurityRequirement注解
        io.swagger.v3.oas.annotations.security.SecurityRequirement methodAnnotation = 
                handlerMethod.getMethodAnnotation(io.swagger.v3.oas.annotations.security.SecurityRequirement.class);
        
        if (methodAnnotation != null) {
            return true;
        }
        
        // 检查类上是否有@SecurityRequirement注解
        io.swagger.v3.oas.annotations.security.SecurityRequirement classAnnotation = 
                handlerMethod.getBeanType().getAnnotation(io.swagger.v3.oas.annotations.security.SecurityRequirement.class);
        
        return classAnnotation != null;
    }
} 