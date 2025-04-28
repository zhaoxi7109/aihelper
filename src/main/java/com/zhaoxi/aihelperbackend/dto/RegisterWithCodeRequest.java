package com.zhaoxi.aihelperbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 验证码注册请求DTO
 * 
 * 用于接收用户使用验证码注册时提交的数据
 * 用户可以通过邮箱或手机号进行注册，至少需要提供一种
 * 昵称为可选项，若未提供则由系统自动生成
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "验证码注册请求")
public class RegisterWithCodeRequest {
    /**
     * 登录密码，必填
     */
    @Schema(description = "登录密码，6-20个字符", required = true)
    private String password;
    
    /**
     * 电子邮箱，可选，但邮箱和手机号至少提供一个
     */
    @Schema(description = "电子邮箱，邮箱和手机号至少提供一个")
    private String email;
    
    /**
     * 手机号码，可选，但邮箱和手机号至少提供一个
     */
    @Schema(description = "手机号码，邮箱和手机号至少提供一个")
    private String mobile;
    
    /**
     * 用户昵称，可选，如未提供则系统自动生成
     */
    @Schema(description = "用户昵称，可选，如未提供则系统自动生成")
    private String nickname;
    
    /**
     * 验证码，必填
     */
    @Schema(description = "验证码", required = true)
    private String code;
} 