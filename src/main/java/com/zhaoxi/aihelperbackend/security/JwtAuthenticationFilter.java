package com.zhaoxi.aihelperbackend.security;

import com.zhaoxi.aihelperbackend.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // 白名单路径（无需JWT验证）
    private static final String[] AUTH_WHITELIST = {
        "/api/auth/",
        "/api/public/",
        "/swagger-ui/",
        "/v3/api-docs/",
        "/api/users/auth-test",
        "/api/verification/"
    };

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 增加请求路径日志，帮助诊断问题
        String requestURI = request.getRequestURI();
        
        // 检查是否是白名单路径
        if (isWhitelistedPath(requestURI)) {
            logger.info("白名单路径，跳过JWT验证: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        // 记录请求详情
        logger.info("处理请求: " + requestURI + ", 方法: " + request.getMethod());
        
        // 如果没有Authorization头或者不是Bearer token，继续过滤链
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (requestURI.contains("/api/users/")) {
                // 对需要认证的用户API进行日志记录
                logger.warn("缺少Authorization头或格式不正确 - URI: " + requestURI);
                logger.warn("请求头信息: " + headersToString(request));
            }
            filterChain.doFilter(request, response);
            return;
        }

        // 从Authorization头中提取JWT
        jwt = authHeader.substring(7);
        logger.info("处理JWT认证 - URI: " + requestURI);
        
        try {
            // 从JWT中提取用户名
            username = jwtUtil.extractUsername(jwt);
            logger.info("JWT中提取的用户名: " + username);

            // 如果有用户名且当前没有认证
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 从数据库加载用户详情
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.info("已从数据库加载用户详情: " + userDetails.getUsername());

                // 如果token有效，则设置认证信息
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("JWT验证成功，已设置认证信息 - 用户: " + username);
                } else {
                    logger.error("JWT验证失败 - 可能已过期或签名不匹配 - 用户: " + username);
                    logger.error("JWT令牌: " + jwt.substring(0, Math.min(10, jwt.length())) + "...");
                }
            }
        } catch (Exception e) {
            // 记录详细的异常信息
            logger.error("JWT处理异常 - URI: " + requestURI + ", 错误: " + e.getMessage(), e);
            // 不要在响应中添加敏感信息
            // 让过滤器链继续执行，由后续的安全处理器处理认证失败情况
        }

        filterChain.doFilter(request, response);
    }
    
    /**
     * 检查请求路径是否在白名单中
     */
    private boolean isWhitelistedPath(String requestURI) {
        return Arrays.stream(AUTH_WHITELIST)
                .anyMatch(requestURI::startsWith);
    }
    
    /**
     * 将所有请求头转换为字符串，方便调试
     */
    private String headersToString(HttpServletRequest request) {
        StringBuilder headers = new StringBuilder();
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            headers.append(headerName).append(": ").append(request.getHeader(headerName)).append(", ");
        });
        return headers.toString();
    }
} 