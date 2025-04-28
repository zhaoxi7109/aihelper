package com.zhaoxi.aihelperbackend.controller;

import com.zhaoxi.aihelperbackend.dto.ApiResponse;
import com.zhaoxi.aihelperbackend.dto.PasswordChangeRequest;
import com.zhaoxi.aihelperbackend.dto.UserProfileUpdateRequest;
import com.zhaoxi.aihelperbackend.dto.UserWithSignedUrlDto;
import com.zhaoxi.aihelperbackend.entity.User;
import com.zhaoxi.aihelperbackend.mapper.UserMapper;
import com.zhaoxi.aihelperbackend.service.AvatarGenerationService;
import com.zhaoxi.aihelperbackend.service.OssService;
import com.zhaoxi.aihelperbackend.utils.ValidationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Array;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户管理控制器
 *
 * 提供用户信息查询、修改、密码变更、头像上传、账号注销等功能
 * 所有接口都需要认证才能访问
 *
 * @author zhaoxi
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户个人信息管理相关接口")
@SecurityRequirement(name = "Authorization")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    /**
     * 用户数据访问对象
     */
    private final UserMapper userMapper;

    /**
     * 密码编码器，用于密码加密
     */
    private final PasswordEncoder passwordEncoder;
    
    /**
     * OSS存储服务，用于文件上传
     */
    private final OssService ossService;
    
    /**
     * AI头像生成服务
     */
    private final AvatarGenerationService avatarGenerationService;
    
    /**
     * 头像URL签名有效期（秒）
     */
    private static final long AVATAR_URL_EXPIRE_SECONDS = 3600; // 1小时

    /**
     * 获取当前登录用户信息
     * 返回用户的详细信息，但不包含敏感数据如密码
     *
     * @return 当前用户信息（不包含密码）
     */
    @GetMapping("/me")
    @Operation(
        summary = "获取当前用户信息", 
        description = "获取当前登录用户的详细信息，包括ID、用户名、昵称、邮箱、手机号、头像等，但不包含密码。头像URL为签名URL，有效期1小时。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "成功获取用户信息",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserWithSignedUrlDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", 
            description = "未授权，用户未登录"
        )
    })
    public ApiResponse<UserWithSignedUrlDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
int[] a ;
        // 重新从数据库获取最新信息
        User freshUser = userMapper.findById(user.getId());
        if (freshUser == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        
        try {
            // 生成头像签名URL
            String avatarUrl = freshUser.getAvatar();
            String signedAvatarUrl = null;
            
            if (avatarUrl != null && !avatarUrl.isEmpty()) {
                // 生成签名URL
                signedAvatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
            }
            
            // 创建带签名URL的DTO
            UserWithSignedUrlDto userDto = UserWithSignedUrlDto.fromUser(freshUser, signedAvatarUrl);
            
            return ApiResponse.success(userDto);
        } catch (Exception e) {
            log.error("生成头像签名URL失败: {}", e.getMessage());
            // 即使生成签名URL失败，也返回用户信息
            return ApiResponse.success(UserWithSignedUrlDto.fromUser(freshUser));
        }
    }

    /**
     * 更新用户个人资料
     * 支持更新昵称、邮箱、手机号和头像
     * 邮箱和手机号会检查格式和唯一性
     *
     * @param request 用户资料更新请求对象，包含要更新的字段
     * @return 更新后的用户信息
     */
    @PutMapping("/profile")
    @Operation(
        summary = "更新用户个人资料", 
        description = "更新当前登录用户的个人资料，包括昵称、邮箱、手机号等。邮箱和手机号会验证格式和唯一性。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "资料更新成功",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "请求参数无效"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "邮箱或手机号已被使用")
    })
    public ApiResponse<User> updateUserProfile(@RequestBody UserProfileUpdateRequest request) {
        // 获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userMapper.findById(currentUser.getId());
        
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        
        // 更新昵称
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            user.setNickname(request.getNickname().trim());
        }
        
        // 更新邮箱（如果有变更且格式正确）
        if (request.getEmail() != null) {
            if (request.getEmail().trim().isEmpty()) {
                // 如果传入空字符串，则清空邮箱
                user.setEmail(null);
            } else {
                // 验证邮箱格式
                if (!ValidationUtils.isValidEmail(request.getEmail())) {
                    return ApiResponse.error(400, "邮箱格式不正确");
                }
                
                // 验证邮箱唯一性（排除当前用户）
                String email = request.getEmail().trim();
                if (!email.equals(user.getEmail()) && userMapper.existsByEmail(email) > 0) {
                    return ApiResponse.error(409, "该邮箱已被使用");
                }
                
                user.setEmail(email);
            }
        }
        
        // 更新手机号（如果有变更且格式正确）
        if (request.getMobile() != null) {
            if (request.getMobile().trim().isEmpty()) {
                // 如果传入空字符串，则清空手机号
                user.setMobile(null);
            } else {
                // 验证手机号格式
                if (!ValidationUtils.isValidMobile(request.getMobile())) {
                    return ApiResponse.error(400, "手机号格式不正确");
                }
                
                // 验证手机号唯一性（排除当前用户）
                String mobile = request.getMobile().trim();
                if (!mobile.equals(user.getMobile()) && userMapper.existsByMobile(mobile) > 0) {
                    return ApiResponse.error(409, "该手机号已被使用");
                }
                
                user.setMobile(mobile);
            }
        }
        
        // 更新时间
        user.setUpdatedAt(LocalDateTime.now());
        
        // 保存更新
        userMapper.update(user);
        
        // 不返回密码
        user.setPassword(null);
        
        return ApiResponse.success("个人资料更新成功", user);
    }

    /**
     * 上传用户头像
     * 支持jpg、png、gif等常见图片格式
     *
     * @param file 头像图片文件
     * @return 包含新头像URL的响应
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "上传用户头像", 
        description = "上传并更新当前用户的头像图片，支持jpg、png、gif等常见图片格式，文件大小不超过2MB。返回的头像URL为签名URL，有效期1小时。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "头像上传成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "文件为空或格式不支持"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "413", description = "文件大小超过限制")
    })
    public ApiResponse<Map<String, String>> uploadAvatar(
            @Parameter(description = "头像图片文件，支持jpg、png、gif等格式，大小不超过2MB")
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ApiResponse.error(400, "请选择要上传的图片文件");
        }
        
        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.error(400, "只支持图片文件");
        }
        
        // 检查文件大小（限制为2MB）
        if (file.getSize() > 2 * 1024 * 1024) {
            return ApiResponse.error(413, "图片大小不能超过2MB");
        }
        
        try {
            // 获取当前登录用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            User user = userMapper.findById(currentUser.getId());
            
            if (user == null) {
                return ApiResponse.error(404, "用户不存在");
            }
            
            // 使用OSS服务上传头像文件到OSS存储，得到对象名
            String objectName = ossService.uploadFile(file, "avatars/");
            
            // 如果用户之前有头像，则删除旧头像
            String oldAvatarUrl = user.getAvatar();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.contains("default")) {
                try {
                    ossService.deleteFile(oldAvatarUrl);
                } catch (Exception e) {
                    // 删除旧头像失败，仅记录日志，不影响新头像的保存
                    log.warn("删除旧头像失败: {}", e.getMessage());
                }
            }
            
            // 更新用户头像为对象名
            user.setAvatar(objectName);
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.update(user);
            
            // 生成签名URL
            String signedAvatarUrl = ossService.generatePresignedUrl(objectName, AVATAR_URL_EXPIRE_SECONDS);
            
            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", signedAvatarUrl);
            result.put("expiresIn", String.valueOf(AVATAR_URL_EXPIRE_SECONDS));
            
            return ApiResponse.success("头像上传成功", result);
        } catch (Exception e) {
            log.error("头像上传失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "头像上传失败: " + e.getMessage());
        }
    }

    /**
     * 修改密码
     * 需要提供当前密码和新密码
     *
     * @param request 密码修改请求，包含当前密码和新密码
     * @return 修改结果
     */
    @PutMapping("/password")
    @Operation(
        summary = "修改密码", 
        description = "修改当前登录用户的密码，需要提供当前密码进行验证，新密码长度需在6-20个字符之间"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "密码修改成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "请求参数无效"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权或当前密码错误"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "用户不存在")
    })
    public ApiResponse<?> changePassword(@RequestBody PasswordChangeRequest request, HttpServletRequest httpServletRequest) {
        // 打印请求信息，帮助调试
        String authHeader = httpServletRequest.getHeader("Authorization");
        System.out.println("修改密码API被调用 - Authorization头: " + authHeader);
        System.out.println("请求参数: " + request);
        System.out.println("请求URI: " + httpServletRequest.getRequestURI());
        System.out.println("请求方法: " + httpServletRequest.getMethod());
        
        // 检查安全上下文
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("当前认证信息: " + (authentication != null ? "有效" : "无效"));
        if (authentication != null) {
            System.out.println("认证主体: " + authentication.getPrincipal());
            System.out.println("认证状态: " + authentication.isAuthenticated());
            System.out.println("认证权限: " + authentication.getAuthorities());
        }
        
        // 参数验证
        if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
            return ApiResponse.error(400, "当前密码不能为空");
        }
        
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ApiResponse.error(400, "新密码不能为空");
        }
        
        if (request.getNewPassword().length() < 6 || request.getNewPassword().length() > 20) {
            return ApiResponse.error(400, "新密码长度需在6-20个字符之间");
        }
        
        // 获取当前登录用户
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("用户未认证，返回401错误");
            return ApiResponse.error(401, "用户未登录或认证已过期，请重新登录");
        }
        
        try {
            User currentUser = (User) authentication.getPrincipal();
            System.out.println("当前用户ID: " + currentUser.getId());
            User user = userMapper.findById(currentUser.getId());
            
            if (user == null) {
                System.out.println("用户不存在，ID: " + currentUser.getId());
                return ApiResponse.error(404, "用户不存在");
            }
            
            System.out.println("成功获取用户: " + user.getUsername());
            
            // 验证当前密码
            boolean passwordMatches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());
            System.out.println("当前密码验证结果: " + (passwordMatches ? "正确" : "错误"));
            
            if (!passwordMatches) {
                return ApiResponse.error(401, "当前密码错误");
            }
            
            // 更新密码
            String newEncodedPassword = passwordEncoder.encode(request.getNewPassword());
            userMapper.updatePassword(user.getId(), newEncodedPassword);
            System.out.println("密码已成功更新");
            
            return ApiResponse.success("密码修改成功", null);
        } catch (Exception e) {
            System.out.println("修改密码过程中发生异常: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error(500, "修改密码失败: " + e.getMessage());
        }
    }

    /**
     * 注销账号
     * 将用户状态设置为已注销，但不会删除用户数据
     *
     * @return 注销结果
     */
    @PostMapping("/deactivate")
    @Operation(
        summary = "注销账号", 
        description = "注销当前登录用户的账号，账号将无法登录，但用户数据不会被删除。操作不可逆，需谨慎。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "账号注销成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "用户不存在")
    })
    public ApiResponse<?> deactivateAccount() {
        // 获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userMapper.findById(currentUser.getId());
        
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        
        // 设置账号状态为注销(1)
        userMapper.updateStatus(user.getId(), 1);
        
        return ApiResponse.success("账号已成功注销", null);
    }

    /**
     * 重新激活账号
     * 将已注销的账号重新激活
     *
     * @return 激活结果
     */
    @PostMapping("/activate")
    @Operation(
        summary = "激活账号", 
        description = "重新激活已注销的账号，使账号可以正常登录使用"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "账号激活成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "账号未被注销，无需激活"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "用户不存在")
    })
    public ApiResponse<?> activateAccount() {
        // 获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userMapper.findById(currentUser.getId());
        
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        
        // 检查账号是否已注销
        if (user.getStatus() == null || user.getStatus() != 1) {
            return ApiResponse.error(400, "账号未被注销，无需激活");
        }
        
        // 设置账号状态为正常(0)
        userMapper.updateStatus(user.getId(), 0);
        
        return ApiResponse.success("账号已成功激活", null);
    }

    /**
     * 导出用户数据
     * 获取用户的所有相关数据，包括个人信息、对话历史等
     *
     * @return 用户数据
     */
    @GetMapping("/export")
    @Operation(
        summary = "导出用户数据", 
        description = "导出当前登录用户的所有相关数据，包括个人信息、对话历史等，便于用户备份或迁移数据"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "数据导出成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "用户不存在")
    })
    public ApiResponse<Map<String, Object>> exportUserData() {
        // 获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userMapper.findById(currentUser.getId());
        
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        
        // 创建导出数据结构
        Map<String, Object> exportData = new HashMap<>();
        
        // 添加用户基本信息（去除敏感信息）
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("nickname", user.getNickname());
        userInfo.put("email", user.getEmail());
        userInfo.put("mobile", user.getMobile());
        userInfo.put("avatar", user.getAvatar());
        userInfo.put("createdAt", user.getCreatedAt());
        userInfo.put("updatedAt", user.getUpdatedAt());
        exportData.put("userInfo", userInfo);
        
        // TODO: 添加用户的对话历史等其他相关数据
        // exportData.put("conversations", conversationMapper.findByUserId(user.getId()));
        
        return ApiResponse.success("数据导出成功", exportData);
    }
    
    /**
     * 认证测试接口
     * 用于测试认证机制是否正常工作
     *
     * @return 认证信息
     */
    @GetMapping("/auth-test")
    @Operation(
        summary = "认证测试", 
        description = "用于测试用户认证机制是否正常工作，返回当前认证信息"
    )
    public ApiResponse<Map<String, Object>> testAuth(HttpServletRequest request) {
        Map<String, Object> authInfo = new HashMap<>();
        
        // 获取认证信息
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // 获取请求头信息
        String authHeader = request.getHeader("Authorization");
        
        // 添加认证信息
        authInfo.put("authenticated", authentication != null && authentication.isAuthenticated());
        if (authentication != null) {
            authInfo.put("principal", authentication.getPrincipal().toString());
            authInfo.put("authorities", authentication.getAuthorities().toString());
            
            if (authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                authInfo.put("userId", user.getId());
                authInfo.put("username", user.getUsername());
            }
        }
        
        // 添加请求信息
        authInfo.put("authHeader", authHeader);
        
        return ApiResponse.success("认证测试", authInfo);
    }

    /**
     * 刷新头像签名URL
     * 当头像URL过期时，前端可以调用此接口刷新
     *
     * @return 包含新签名URL的响应
     */
    @GetMapping("/refresh-avatar-url")
    @Operation(
        summary = "刷新头像签名URL", 
        description = "刷新当前用户头像的签名URL，当URL过期时可调用此接口获取新的签名URL。返回的新URL有效期为1小时。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "签名URL刷新成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "用户不存在或无头像")
    })
    public ApiResponse<Map<String, String>> refreshAvatarUrl() {
        try {
            // 获取当前登录用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            User user = userMapper.findById(currentUser.getId());
            
            if (user == null) {
                return ApiResponse.error(404, "用户不存在");
            }
            
            String avatarUrl = user.getAvatar();
            if (avatarUrl == null || avatarUrl.isEmpty()) {
                return ApiResponse.error(404, "用户未设置头像");
            }
            
            // 生成新的签名URL
            String signedAvatarUrl = ossService.generatePresignedUrl(avatarUrl, AVATAR_URL_EXPIRE_SECONDS);
            
            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", signedAvatarUrl);
            result.put("expiresIn", String.valueOf(AVATAR_URL_EXPIRE_SECONDS));
            
            return ApiResponse.success("头像URL刷新成功", result);
        } catch (Exception e) {
            log.error("刷新头像URL失败: {}", e.getMessage());
            return ApiResponse.error(500, "刷新头像URL失败: " + e.getMessage());
        }
    }

    /**
     * 生成AI头像
     * 基于用户信息生成个性化头像
     *
     * @return 包含新头像URL的响应
     */
    @PostMapping("/generate-avatar")
    @Operation(
        summary = "生成AI头像", 
        description = "使用AI自动为当前用户生成个性化头像，基于用户名和昵称特征。返回的头像URL为签名URL，有效期1小时。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "AI头像生成成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "服务器错误或AI生成失败")
    })
    public ApiResponse<Map<String, String>> generateAiAvatar() {
        try {
            // 获取当前登录用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            User user = userMapper.findById(currentUser.getId());
            
            if (user == null) {
                return ApiResponse.error(404, "用户不存在");
            }
            
            // 调用AI头像生成服务
            String objectName = avatarGenerationService.generateAvatar(
                    user.getId(), 
                    user.getUsername(), 
                    user.getNickname()
            );
            
            // 如果用户之前有头像，则删除旧头像（除非是默认头像）
            String oldAvatarUrl = user.getAvatar();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.contains("default")) {
                try {
                    ossService.deleteFile(oldAvatarUrl);
                } catch (Exception e) {
                    // 删除旧头像失败，仅记录日志，不影响新头像的保存
                    log.warn("删除旧头像失败: {}", e.getMessage());
                }
            }
            
            // 更新用户头像为新生成的AI头像
            user.setAvatar(objectName);
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.update(user);
            
            // 生成签名URL
            String signedAvatarUrl = ossService.generatePresignedUrl(objectName, AVATAR_URL_EXPIRE_SECONDS);
            
            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", signedAvatarUrl);
            result.put("expiresIn", String.valueOf(AVATAR_URL_EXPIRE_SECONDS));
            
            return ApiResponse.success("AI头像生成成功", result);
        } catch (Exception e) {
            log.error("AI头像生成失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI头像生成失败: " + e.getMessage());
        }
    }
    
    /**
     * 使用自定义提示词生成AI头像
     * 
     * @param prompt 自定义提示词
     * @return 包含新头像URL的响应
     */
    @PostMapping("/generate-avatar-with-prompt")
    @Operation(
        summary = "使用自定义提示词生成AI头像", 
        description = "根据用户提供的自定义提示词生成AI头像。提示词应详细描述希望生成的头像风格和特征。返回的头像URL为签名URL，有效期1小时。"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "AI头像生成成功"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "提示词为空或无效"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "未授权，用户未登录"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "服务器错误或AI生成失败")
    })
    public ApiResponse<Map<String, String>> generateAvatarWithPrompt(@RequestParam String prompt) {
        try {
            if (prompt == null || prompt.trim().isEmpty()) {
                return ApiResponse.error(400, "提示词不能为空");
            }
            
            // 获取当前登录用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();
            User user = userMapper.findById(currentUser.getId());
            
            if (user == null) {
                return ApiResponse.error(404, "用户不存在");
            }
            
            // 调用AI头像生成服务，使用用户提供的提示词
            String objectName = avatarGenerationService.generateAvatarWithCustomPrompt(
                    user.getId(), 
                    prompt.trim()
            );
            
            // 如果用户之前有头像，则删除旧头像（除非是默认头像）
            String oldAvatarUrl = user.getAvatar();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.contains("default")) {
                try {
                    ossService.deleteFile(oldAvatarUrl);
                } catch (Exception e) {
                    // 删除旧头像失败，仅记录日志，不影响新头像的保存
                    log.warn("删除旧头像失败: {}", e.getMessage());
                }
            }
            
            // 更新用户头像为新生成的AI头像
            user.setAvatar(objectName);
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.update(user);
            
            // 生成签名URL
            String signedAvatarUrl = ossService.generatePresignedUrl(objectName, AVATAR_URL_EXPIRE_SECONDS);
            
            Map<String, String> result = new HashMap<>();
            result.put("avatarUrl", signedAvatarUrl);
            result.put("expiresIn", String.valueOf(AVATAR_URL_EXPIRE_SECONDS));
            
            return ApiResponse.success("AI头像生成成功", result);
        } catch (Exception e) {
            log.error("AI头像生成失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI头像生成失败: " + e.getMessage());
        }
    }
} 