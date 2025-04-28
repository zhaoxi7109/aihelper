-- 创建数据库
CREATE DATABASE IF NOT EXISTS aihelper DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aihelper;

-- 创建用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    avatar VARCHAR(255) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    account_non_expired TINYINT(1) NOT NULL DEFAULT 1,
    account_non_locked TINYINT(1) NOT NULL DEFAULT 1,
    credentials_non_expired TINYINT(1) NOT NULL DEFAULT 1,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建对话表
CREATE TABLE IF NOT EXISTS conversation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建消息表
CREATE TABLE IF NOT EXISTS message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    reasoning_content TEXT,
    message_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建消息图片表
CREATE TABLE IF NOT EXISTS message_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL COMMENT '关联的消息ID',
    original_file_name VARCHAR(255) COMMENT '原始文件名',
    oss_key VARCHAR(512) NOT NULL COMMENT 'OSS存储路径',
    mime_type VARCHAR(100) COMMENT '文件类型',
    file_size BIGINT COMMENT '文件大小（字节）',
    ocr_text TEXT COMMENT 'OCR识别文本',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    INDEX idx_message_id (message_id),
    CONSTRAINT fk_message_images_message_id FOREIGN KEY (message_id) REFERENCES message (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息图片信息表';

-- 创建索引
CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_order ON message(message_order);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_mobile ON user(mobile);

-- 添加has_images字段到消息表
ALTER TABLE message
ADD COLUMN has_images BOOLEAN DEFAULT FALSE COMMENT '是否包含图片' AFTER content;

-- 创建默认用户（密码为123456）
INSERT INTO user (
    username, 
    nickname,
    password, 
    email, 
    mobile,
    avatar, 
    status,
    enabled, 
    account_non_expired, 
    account_non_locked, 
    credentials_non_expired, 
    role, 
    created_at, 
    updated_at
) VALUES (
    'admin', 
    '管理员',
    '$2a$10$uQUKHWl6DUvmNpAzk7LIpewU4t5Rw6fVSH9RJZj6e4hGpI2VzFgWO', 
    'admin@example.com', 
    '13800138000',
    'https://secure.gravatar.com/avatar/admin?s=100&d=identicon', 
    0,
    1, 
    1, 
    1, 
    1, 
    'ROLE_ADMIN', 
    NOW(), 
    NOW()
); 