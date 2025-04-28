package com.zhaoxi.aihelperbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户注册请求DTO
 * 
 * 用于接收用户注册时提交的数据
 * 用户可以通过邮箱或手机号进行注册，至少需要提供一种
 * 昵称为可选项，若未提供则由系统自动生成
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    /**
     * 登录密码，必填
     */
    private String password;
    
    /**
     * 电子邮箱，可选，但邮箱和手机号至少提供一个
     */
    private String email;
    
    /**
     * 手机号码，可选，但邮箱和手机号至少提供一个
     */
    private String mobile;
    
    /**
     * 用户昵称，可选，如未提供则系统自动生成
     */
    private String nickname;
} 