package com.zhaoxi.aihelperbackend.dto;

import com.zhaoxi.aihelperbackend.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 带有签名URL的用户数据传输对象
 * 用于返回用户信息时包含已签名的头像URL
 */
@Data
@NoArgsConstructor
public class UserWithSignedUrlDto {
    /** 用户ID */
    private Long id;
    
    /** 用户名 */
    private String username;
    
    /** 昵称 */
    private String nickname;
    
    /** 邮箱 */
    private String email;
    
    /** 手机号 */
    private String mobile;
    
    /** 头像URL(已签名) */
    private String avatar;
    
    /** 用户状态 */
    private Integer status;
    
    /** 创建时间 */
    private LocalDateTime createdAt;
    
    /** 更新时间 */
    private LocalDateTime updatedAt;
    
    /**
     * 从User实体构建DTO（不含签名URL）
     * 
     * @param user 用户实体
     * @return 用户DTO
     */
    public static UserWithSignedUrlDto fromUser(User user) {
        if (user == null) {
            return null;
        }
        
        UserWithSignedUrlDto dto = new UserWithSignedUrlDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setEmail(user.getEmail());
        dto.setMobile(user.getMobile());
        dto.setAvatar(user.getAvatar());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * 从User实体构建DTO（包含签名URL）
     * 
     * @param user 用户实体
     * @param signedAvatarUrl 已签名的头像URL
     * @return 带签名URL的用户DTO
     */
    public static UserWithSignedUrlDto fromUser(User user, String signedAvatarUrl) {
        UserWithSignedUrlDto dto = fromUser(user);
        if (dto != null) {
            dto.setAvatar(signedAvatarUrl);
        }
        return dto;
    }
} 