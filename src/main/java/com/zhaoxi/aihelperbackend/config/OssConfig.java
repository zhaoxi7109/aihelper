package com.zhaoxi.aihelperbackend.config;

import com.aliyun.oss.ClientBuilderConfiguration;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.common.auth.CredentialsProviderFactory;
import com.aliyun.oss.common.auth.EnvironmentVariableCredentialsProvider;
import com.aliyun.oss.common.comm.SignVersion;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 阿里云OSS配置类
 * 用于配置OSS客户端和相关参数
 */
@Configuration
@ConfigurationProperties(prefix = "aliyun.oss")
@Data
public class OssConfig {
    
    /**
     * OSS服务的访问域名/端点
     */
    private String endpoint;
    
    /**
     * 存储空间名称
     */
    private String bucketName;
    
    /**
     * 区域
     */
    private String region;
    
    /**
     * 文件访问URL前缀
     */
    private String urlPrefix;

    /**
     * 创建OSS客户端Bean
     * 使用环境变量中的访问凭证
     * 
     * @return OSS客户端实例
     */
    @Bean
    public OSS ossClient() throws Exception {
        // 从环境变量中获取访问凭证
        EnvironmentVariableCredentialsProvider credentialsProvider =
                CredentialsProviderFactory.newEnvironmentVariableCredentialsProvider();
        
        // 创建客户端配置
        ClientBuilderConfiguration clientConfig = new ClientBuilderConfiguration();
        // 设置签名版本为V4
        clientConfig.setSignatureVersion(SignVersion.V4);
        
        // 创建OSSClient实例
        return OSSClientBuilder.create()
                .endpoint(endpoint)
                .credentialsProvider(credentialsProvider)
                .region(region)
                .clientConfiguration(clientConfig)
                .build();
    }
} 