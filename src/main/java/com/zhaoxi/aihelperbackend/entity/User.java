package com.zhaoxi.aihelperbackend.entity;

import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

/**
 * 用户实体类
 * 
 * 实现了Spring Security的UserDetails接口，提供用户认证和授权信息
 * 包含用户基本信息如用户名、密码、邮箱、手机号等
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
public class User implements UserDetails {
    /**
     * 用户ID，主键，自增长
     */
    private Long id;
    
    /**
     * 用户名，系统内部生成的标识符
     * 作为系统内部的唯一标识，用户无需提供
     */
    private String username;
    
    /**
     * 用户昵称，用于页面显示
     * 注册时系统会自动生成一个随机昵称，可以重复，用户可以后期修改
     */
    private String nickname;
    
    /**
     * 密码，加密存储
     */
    private String password;
    
    /**
     * 电子邮箱，可用于登录，需保证唯一
     */
    private String email;
    
    /**
     * 手机号码，可用于登录，需保证唯一
     */
    private String mobile;
    
    /**
     * 头像URL
     */
    private String avatar;
    
    /**
     * 用户状态：0-正常，1-注销
     */
    private Integer status;
    
    /**
     * 账户是否启用
     */
    private boolean enabled = true;
    
    /**
     * 账户是否未过期
     */
    private boolean accountNonExpired = true;
    
    /**
     * 账户是否未锁定
     */
    private boolean accountNonLocked = true;
    
    /**
     * 凭证是否未过期
     */
    private boolean credentialsNonExpired = true;
    
    /**
     * 用户角色，默认为ROLE_USER
     */
    private String role = "ROLE_USER";
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 获取用户的权限列表
     * @return 用户权限集合
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(role));
    }

    /**
     * 判断账户是否未过期
     * @return true表示未过期
     */
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    /**
     * 判断账户是否未锁定
     * @return true表示未锁定
     */
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    /**
     * 判断凭证是否未过期
     * @return true表示未过期
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    /**
     * 判断账户是否可用
     * 账户必须启用且状态为正常(0)才视为可用
     * @return true表示可用
     */
    @Override
    public boolean isEnabled() {
        return enabled && (status == null || status == 0);  // 正常状态且未注销
    }
} 