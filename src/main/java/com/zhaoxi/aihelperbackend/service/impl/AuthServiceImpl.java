package com.zhaoxi.aihelperbackend.service.impl;

import com.zhaoxi.aihelperbackend.dto.AuthResponse;
import com.zhaoxi.aihelperbackend.dto.LoginRequest;
import com.zhaoxi.aihelperbackend.dto.PasswordResetRequest;
import com.zhaoxi.aihelperbackend.dto.RegisterRequest;
import com.zhaoxi.aihelperbackend.dto.RegisterWithCodeRequest;
import com.zhaoxi.aihelperbackend.dto.VerificationCodeRequest;
import com.zhaoxi.aihelperbackend.entity.User;
import com.zhaoxi.aihelperbackend.enums.LoginType;
import com.zhaoxi.aihelperbackend.enums.VerificationCodeType;
import com.zhaoxi.aihelperbackend.mapper.UserMapper;
import com.zhaoxi.aihelperbackend.service.AuthService;
import com.zhaoxi.aihelperbackend.service.AvatarGenerationService;
import com.zhaoxi.aihelperbackend.service.OssService;
import com.zhaoxi.aihelperbackend.service.VerificationService;
import com.zhaoxi.aihelperbackend.utils.JwtUtil;
import com.zhaoxi.aihelperbackend.utils.UserUtils;
import com.zhaoxi.aihelperbackend.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证服务实现类
 * 
 * 提供用户注册和登录功能的实现，支持多种登录方式
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    /**
     * 用户数据访问对象
     */
    private final UserMapper userMapper;
    
    /**
     * 密码编码器，用于密码加密
     */
    private final PasswordEncoder passwordEncoder;
    
    /**
     * JWT工具类，用于生成和验证令牌
     */
    private final JwtUtil jwtUtil;
    
    /**
     * 认证管理器，用于验证用户凭据
     */
    private final AuthenticationManager authenticationManager;
    
    /**
     * 验证码服务
     */
    private final VerificationService verificationService;

    /**
     * 头像生成服务
     */
    private final AvatarGenerationService avatarGenerationService;

    /**
     * OSS服务，用于生成签名URL
     */
    private final OssService ossService;
    
    /**
     * 头像URL签名有效期（秒）
     */
    private static final long AVATAR_URL_EXPIRE_SECONDS = 3600; // 1小时

    /**
     * 用户注册
     * 支持使用邮箱或手机号注册，至少需要提供一种联系方式
     * 如果未提供昵称，将自动生成
     * 
     * @param request 注册请求参数
     * @return 包含用户信息和JWT令牌的认证响应
     * @throws IllegalArgumentException 如果参数不合法或格式错误
     * @throws RuntimeException 如果邮箱或手机号已被注册
     * @deprecated 已不推荐使用，请使用 {@link #registerWithCode(RegisterWithCodeRequest)} 代替
     */
    @Override
    @Deprecated
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 参数校验
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getMobile())) {
            throw new IllegalArgumentException("邮箱和手机号至少提供一个");
        }
        
        // 校验邮箱格式（只在用户提供邮箱时校验）
        if (StringUtils.hasText(request.getEmail())) {
            if (!ValidationUtils.isValidEmail(request.getEmail())) {
                throw new IllegalArgumentException("邮箱格式不正确");
            }
            
            // 检查邮箱是否已存在
            if (userMapper.existsByEmail(request.getEmail()) > 0) {
                throw new RuntimeException("邮箱已被注册");
            }
        }
        
        // 校验手机号格式（只在用户提供手机号时校验）
        if (StringUtils.hasText(request.getMobile())) {
            if (!ValidationUtils.isValidMobile(request.getMobile())) {
                throw new IllegalArgumentException("手机号格式不正确");
            }
            
            // 检查手机号是否已存在
            if (userMapper.existsByMobile(request.getMobile()) > 0) {
                throw new RuntimeException("手机号已被注册");
            }
        }
        
        // 生成用户名
        String username;
        if (StringUtils.hasText(request.getEmail())) {
            username = UserUtils.generateUsernameFromEmail(request.getEmail());
        } else {
            username = UserUtils.generateUsernameFromMobile(request.getMobile());
        }
        
        // 生成昵称（如果未提供）
        String nickname = request.getNickname();
        if (!StringUtils.hasText(nickname)) {
            nickname = UserUtils.generateNickname();
        }

        // 创建新用户
        var user = new User();
        user.setUsername(username);
        user.setNickname(nickname);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 加密密码
        
        // 确保至少一个字段(email或mobile)不为空
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        } else {
            user.setEmail(null); // 确保空字符串被设置为null
        }
        
        if (StringUtils.hasText(request.getMobile())) {
            user.setMobile(request.getMobile());
        } else {
            user.setMobile(null); // 确保空字符串被设置为null
        }
        
        // 设置默认头像
        user.setAvatar("https://secure.gravatar.com/avatar/" + username.hashCode() + "?s=100&d=identicon");
        user.setStatus(0); // 正常状态
        
        // 设置时间，使用当前时间
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        
        try {
            // 保存用户
            userMapper.insert(user);
        } catch (Exception e) {
            // 记录异常详情，方便调试
            e.printStackTrace();
            throw new RuntimeException("注册失败: " + e.getMessage());
        }

        // 生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole());
        
        String token = jwtUtil.generateToken(user, claims);
        
        // 生成签名的头像URL（如果有头像）
        String avatarUrl = user.getAvatar();
        if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.equals("default-avatar.png")) {
            try {
                // 生成签名URL
                avatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
                logger.info("为用户生成头像签名URL成功, 有效期: {}秒", AVATAR_URL_EXPIRE_SECONDS);
            } catch (Exception e) {
                logger.error("生成头像签名URL失败: {}", e.getMessage());
                // 失败时使用原始对象名，前端可能无法直接访问
            }
        }
        
        // 构建并返回认证响应
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .avatar(avatarUrl)
                .token(token)
                .build();
    }

    /**
     * 密码登录
     * 支持使用邮箱或手机号登录
     * 
     * @param request 登录请求参数
     * @return 包含用户信息和JWT令牌的认证响应
     * @throws IllegalArgumentException 如果参数不合法或格式错误
     * @throws UsernameNotFoundException 如果用户不存在
     * @throws BadCredentialsException 如果密码错误或账号已注销
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // 参数校验
        if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
            throw new IllegalArgumentException("登录账号不能为空");
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        
        // 登录类型验证 - 如果未指定登录类型，尝试自动判断
        LoginType loginType;
        String loginTypeStr = request.getLoginType();
        
        if (loginTypeStr == null || loginTypeStr.trim().isEmpty()) {
            // 自动判断登录类型
            if (ValidationUtils.isValidEmail(request.getAccount())) {
                loginType = LoginType.EMAIL;
            } else if (ValidationUtils.isValidMobile(request.getAccount())) {
                loginType = LoginType.MOBILE;
            } else {
                throw new IllegalArgumentException("无法识别的账号格式，请明确指定登录类型");
            }
        } else {
            // 使用指定的登录类型
            try {
                loginType = LoginType.valueOf(loginTypeStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("不支持的登录类型：" + loginTypeStr);
            }
        }
        
        // 根据登录类型校验账号格式
        if (loginType == LoginType.EMAIL && !ValidationUtils.isValidEmail(request.getAccount())) {
            throw new IllegalArgumentException("邮箱格式不正确");
        } else if (loginType == LoginType.MOBILE && !ValidationUtils.isValidMobile(request.getAccount())) {
            throw new IllegalArgumentException("手机号格式不正确");
        }
        
        // 查找用户
        User user = findUserByLoginType(request.getAccount(), loginType);
        
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw new BadCredentialsException("账号已注销");
        }
        
        try {
            // 验证用户凭据
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(), // 使用用户名进行验证
                            request.getPassword()
                    )
            );
            
            // 生成JWT令牌
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("role", user.getRole());
            
            String token = jwtUtil.generateToken(user, claims);
            
            // 生成签名的头像URL（如果有头像）
            String avatarUrl = user.getAvatar();
            if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.equals("default-avatar.png")) {
                try {
                    // 生成签名URL
                    avatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
                    logger.info("为用户生成头像签名URL成功, 有效期: {}秒", AVATAR_URL_EXPIRE_SECONDS);
                } catch (Exception e) {
                    logger.error("生成头像签名URL失败: {}", e.getMessage());
                    // 失败时使用原始对象名，前端可能无法直接访问
                    avatarUrl = user.getAvatar();
                }
            }
            
            // 构建并返回认证响应
            return AuthResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .mobile(user.getMobile())
                    .avatar(avatarUrl)
                    .token(token)
                    .build();
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("账号或密码错误");
        }
    }
    
    /**
     * 根据登录类型查找用户
     * 
     * @param account 账号值（邮箱或手机号）
     * @param loginType 登录类型
     * @return 用户对象，如果未找到则返回null
     */
    private User findUserByLoginType(String account, LoginType loginType) {
        if (!StringUtils.hasText(account)) {
            return null;
        }
        
        switch (loginType) {
            case EMAIL:
                return userMapper.findByEmail(account);
            case MOBILE:
                return userMapper.findByMobile(account);
            default:
                return null;
        }
    }
    
    /**
     * 重置密码
     * 通过验证码重置密码
     * 
     * @param request 重置密码请求
     * @return 操作结果
     */
    @Override
    @Transactional
    public boolean resetPassword(PasswordResetRequest request) {
        // 参数验证
        if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
            throw new IllegalArgumentException("账号不能为空");
        }
        
        if (request.getVerificationCode() == null || request.getVerificationCode().trim().isEmpty()) {
            throw new IllegalArgumentException("验证码不能为空");
        }
        
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("新密码不能为空");
        }
        
        if (request.getNewPassword().length() < 6 || request.getNewPassword().length() > 20) {
            throw new IllegalArgumentException("新密码长度需在6-20个字符之间");
        }
        
        // 确定账号类型
        String account = request.getAccount().trim();
        LoginType loginType;
        
        if (ValidationUtils.isValidEmail(account)) {
            loginType = LoginType.EMAIL;
        } else if (ValidationUtils.isValidMobile(account)) {
            loginType = LoginType.MOBILE;
        } else {
            throw new IllegalArgumentException("账号格式不正确，请输入正确的邮箱或手机号");
        }
        
        // 验证验证码
        boolean isValidCode = verificationService.verifyCode(
                account, 
                VerificationCodeType.RESET.getCode(), 
                request.getVerificationCode());
                
        if (!isValidCode) {
            throw new BadCredentialsException("验证码错误或已过期");
        }
        
        // 查找用户
        User user = findUserByLoginType(account, loginType);
        
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw new BadCredentialsException("账号已注销");
        }
        
        try {
            // 更新密码
            String encodedPassword = passwordEncoder.encode(request.getNewPassword());
            userMapper.updatePassword(user.getId(), encodedPassword);
            
            // 清除验证码，防止重复使用
            verificationService.clearCode(account, VerificationCodeType.RESET.getCode());
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("重置密码失败: " + e.getMessage());
        }
    }

    /**
     * 验证码登录
     * 通过验证码进行登录，无需密码
     * 
     * @param request 验证码登录请求
     * @return 包含用户信息和JWT令牌的认证响应
     * @throws IllegalArgumentException 如果参数不合法或格式错误
     * @throws UsernameNotFoundException 如果用户不存在
     */
    @Override
    public AuthResponse loginWithCode(VerificationCodeRequest request) {
        // 参数校验
        if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
            throw new IllegalArgumentException("账号不能为空");
        }
        
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("验证码不能为空");
        }
        
        // 登录类型判断
        String account = request.getAccount().trim();
        LoginType loginType;
        
        if (ValidationUtils.isValidEmail(account)) {
            loginType = LoginType.EMAIL;
        } else if (ValidationUtils.isValidMobile(account)) {
            loginType = LoginType.MOBILE;
        } else {
            throw new IllegalArgumentException("账号格式不正确，请输入正确的邮箱或手机号");
        }
        
        // 验证验证码
        boolean isValidCode = verificationService.verifyCode(account, request.getType(), request.getCode());
        if (!isValidCode) {
            throw new BadCredentialsException("验证码错误或已过期");
        }
        
        // 查找用户
        User user = findUserByLoginType(account, loginType);
        
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        
        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw new BadCredentialsException("账号已注销");
        }
        
        // 清除验证码
        verificationService.clearCode(account, request.getType());
        
        // 生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole());
        
        String token = jwtUtil.generateToken(user, claims);
        
        // 生成签名的头像URL（如果有头像）
        String avatarUrl = user.getAvatar();
        if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.equals("default-avatar.png")) {
            try {
                // 生成签名URL
                avatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
                logger.info("为用户生成头像签名URL成功, 有效期: {}秒", AVATAR_URL_EXPIRE_SECONDS);
            } catch (Exception e) {
                logger.error("生成头像签名URL失败: {}", e.getMessage());
                // 失败时使用原始对象名，前端可能无法直接访问
                avatarUrl = user.getAvatar();
            }
        }
        
        // 构建并返回认证响应
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .avatar(avatarUrl)
                .token(token)
                .build();
    }

    /**
     * 检查令牌有效性
     *
     * @param token JWT令牌
     * @return 如果有效，返回用户信息；否则返回null
     */
    @Override
    public User checkToken(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        
        try {
            String username = jwtUtil.extractUsername(token);
            if (username == null || username.isEmpty()) {
                return null;
            }
            
            // 检查令牌是否过期
            Date expiration = jwtUtil.extractExpiration(token);
            if (expiration == null || expiration.before(new Date())) {
                logger.info("令牌已过期: {}", username);
                return null;
            }
            
            return userMapper.findByUsername(username);
        } catch (Exception e) {
            logger.error("令牌验证失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 为新注册用户生成AI头像
     * 
     * @param user 新注册的用户
     * @return 生成的头像对象名，失败则返回null
     */
    @Override
    public String generateAiAvatarForNewUser(User user) {
        if (user == null || user.getId() == null) {
            logger.warn("无法为空用户生成AI头像");
            return null;
        }
        
        try {
            logger.info("开始为新用户生成AI头像: {}", user.getUsername());
            // 调用头像生成服务
            String avatarObjectName = avatarGenerationService.generateAvatarForNewUser(
                    user.getId(),
                    user.getUsername(),
                    user.getNickname()
            );
            
            if (avatarObjectName != null && !avatarObjectName.isEmpty()) {
                logger.info("AI头像生成成功: {}", avatarObjectName);
                return avatarObjectName;
            } else {
                logger.warn("AI头像生成失败，返回为空");
                return null;
            }
        } catch (Exception e) {
            logger.error("生成AI头像时发生错误: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 使用验证码注册
     * 支持使用邮箱或手机号结合验证码注册，至少需要提供一种联系方式
     * 如果未提供昵称，将自动生成
     * 
     * @param request 验证码注册请求参数
     * @return 包含用户信息和JWT令牌的认证响应
     * @throws IllegalArgumentException 如果参数不合法或格式错误
     * @throws RuntimeException 如果邮箱或手机号已被注册
     */
    @Override
    @Transactional
    public AuthResponse registerWithCode(RegisterWithCodeRequest request) {
        logger.info("开始处理验证码注册请求: {}", request.getEmail() != null ? request.getEmail() : request.getMobile());
        
        // 参数校验
        if (!StringUtils.hasText(request.getEmail()) && !StringUtils.hasText(request.getMobile())) {
            throw new IllegalArgumentException("邮箱和手机号至少提供一个");
        }
        
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("密码不能为空");
        }
        
        if (request.getPassword().length() < 6 || request.getPassword().length() > 20) {
            throw new IllegalArgumentException("密码长度需在6-20个字符之间");
        }
        
        if (!StringUtils.hasText(request.getCode())) {
            throw new IllegalArgumentException("验证码不能为空");
        }
        
        // 确定使用哪个字段进行验证码验证
        String account;
        String verifyType = VerificationCodeType.REGISTER.getCode();
        
        if (StringUtils.hasText(request.getEmail())) {
            // 校验邮箱格式
            if (!ValidationUtils.isValidEmail(request.getEmail())) {
                throw new IllegalArgumentException("邮箱格式不正确");
            }
            
            // 检查邮箱是否已存在
            if (userMapper.existsByEmail(request.getEmail()) > 0) {
                throw new RuntimeException("邮箱已被注册");
            }
            
            account = request.getEmail();
        } else {
            // 校验手机号格式
            if (!ValidationUtils.isValidMobile(request.getMobile())) {
                throw new IllegalArgumentException("手机号格式不正确");
            }
            
            // 检查手机号是否已存在
            if (userMapper.existsByMobile(request.getMobile()) > 0) {
                throw new RuntimeException("手机号已被注册");
            }
            
            account = request.getMobile();
        }
        
        // 验证验证码
        boolean isValidCode = verificationService.verifyCode(account, verifyType, request.getCode());
        if (!isValidCode) {
            throw new BadCredentialsException("验证码错误或已过期");
        }
        
        // 清除验证码，防止重复使用
        verificationService.clearCode(account, verifyType);
        
        // 生成用户名
        String username;
        if (StringUtils.hasText(request.getEmail())) {
            username = UserUtils.generateUsernameFromEmail(request.getEmail());
        } else {
            username = UserUtils.generateUsernameFromMobile(request.getMobile());
        }
        
        // 生成昵称（如果未提供）
        String nickname = request.getNickname();
        if (!StringUtils.hasText(nickname)) {
            nickname = UserUtils.generateNickname();
        }

        // 创建新用户
        var user = new User();
        user.setUsername(username);
        user.setNickname(nickname);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 加密密码
        
        // 设置邮箱和手机号
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        } else {
            user.setEmail(null);
        }
        
        if (StringUtils.hasText(request.getMobile())) {
            user.setMobile(request.getMobile());
        } else {
            user.setMobile(null);
        }
        
        // 设置临时默认头像，后续将由AI生成替换
        user.setAvatar("default-avatar.png");
        user.setStatus(0); // 正常状态
        
        // 设置时间，使用当前时间
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        
        try {
            // 保存用户
            userMapper.insert(user);
            // 重新获取带ID的用户
            user = userMapper.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("用户注册失败，无法获取用户信息");
            }
            
            logger.info("用户注册成功: {}, 开始生成AI头像", username);
            
            // 尝试生成AI头像
            try {
                String aiAvatarObjectName = generateAiAvatarForNewUser(user);
                if (aiAvatarObjectName != null && !aiAvatarObjectName.isEmpty()) {
                    // 更新用户头像
                    user.setAvatar(aiAvatarObjectName);
                    userMapper.update(user);
                    logger.info("AI头像生成和设置成功: {}", aiAvatarObjectName);
                }
            } catch (Exception e) {
                logger.error("AI头像生成失败，使用默认头像: {}", e.getMessage());
                // 头像生成失败不影响注册流程
            }
        } catch (Exception e) {
            // 记录异常详情，方便调试
            logger.error("注册失败: {}", e.getMessage(), e);
            throw new RuntimeException("注册失败: " + e.getMessage());
        }

        // 生成JWT令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole());
        
        String token = jwtUtil.generateToken(user, claims);
        
        // 生成签名的头像URL（如果有头像）
        String avatarUrl = user.getAvatar();
        if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.equals("default-avatar.png")) {
            try {
                // 生成签名URL
                avatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
                logger.info("为用户生成头像签名URL成功, 有效期: {}秒", AVATAR_URL_EXPIRE_SECONDS);
            } catch (Exception e) {
                logger.error("生成头像签名URL失败: {}", e.getMessage());
                // 失败时使用原始对象名，前端可能无法直接访问
                avatarUrl = user.getAvatar();
            }
        }
        
        // 构建并返回认证响应
        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .avatar(avatarUrl)
                .token(token)
                .build();
    }
} 