package com.zhaoxi.aihelperbackend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:defaultSecretKeyForJwtToken12345678901234567890}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}") // 默认24小时
    private long jwtExpiration;

    // 获取用户名
    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            logTokenError("提取用户名失败", token, e);
            return null;
        }
    }

    // 获取过期时间
    public Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            logTokenError("提取过期时间失败", token, e);
            return new Date(0); // 返回1970年1月1日，表示已过期
        }
    }

    // 提取声明信息
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 解析Token获取所有声明
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT已过期: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            logger.error("不支持的JWT: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("JWT格式错误: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            logger.error("JWT签名验证失败: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("解析JWT时发生错误: {}", e.getMessage());
            throw e;
        }
    }

    // 检查Token是否过期
    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            boolean expired = expiration.before(new Date());
            if (expired) {
                logger.warn("JWT已过期，过期时间: {}", expiration);
            }
            return expired;
        } catch (Exception e) {
            logger.error("检查令牌过期失败: {}", e.getMessage());
            return true; // 发生异常，视为过期
        }
    }

    // 获取签名密钥
    private Key getSigningKey() {
        try {
            byte[] keyBytes = secretKey.getBytes();
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("生成签名密钥失败: {}", e.getMessage());
            throw e;
        }
    }

    // 生成Token
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    // 生成Token包含自定义信息
    public String generateToken(UserDetails userDetails, Map<String, Object> additionalClaims) {
        return createToken(additionalClaims, userDetails.getUsername());
    }

    // 创建Token
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date(System.currentTimeMillis());
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        logger.info("创建新的JWT令牌 - 用户: {}, 过期时间: {}", subject, expiryDate);
        
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            logger.error("创建JWT令牌失败: {}", e.getMessage());
            throw e;
        }
    }

    // 验证Token是否有效
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            if (token == null || userDetails == null) {
                logger.warn("令牌或用户详情为空");
                return false;
            }
            
            final String username = extractUsername(token);
            boolean isValid = username != null && 
                              username.equals(userDetails.getUsername()) && 
                              !isTokenExpired(token);
            
            if (!isValid) {
                logger.warn("JWT验证失败 - 用户: {}, 实际用户: {}, 是否过期: {}", 
                    username, userDetails.getUsername(), isTokenExpired(token));
            }
            
            return isValid;
        } catch (ExpiredJwtException e) {
            logger.warn("JWT已过期: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logTokenError("验证令牌失败", token, e);
            return false;
        }
    }
    
    // 记录令牌错误，隐藏完整令牌内容
    private void logTokenError(String message, String token, Exception e) {
        if (token == null) {
            logger.error("{}: 令牌为空", message);
            return;
        }
        
        // 只记录令牌的前几个字符，避免泄露完整令牌
        String tokenPrefix = token.length() > 10 ? token.substring(0, 10) + "..." : token;
        logger.error("{}: {} - 令牌前缀: {}", message, e.getMessage(), tokenPrefix);
    }
} 