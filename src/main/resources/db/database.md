# AI助手数据库设计文档

## 数据库概述

AI助手系统使用MySQL数据库来存储用户信息、对话历史和消息内容。数据库名称为`aihelper`，使用UTF-8编码。

## 表结构设计

### 1. 用户表 (user)

存储系统用户信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|-----|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 系统内部生成的标识符 |
| nickname | VARCHAR(50) | NOT NULL | 用户昵称，系统自动生成，可以重复 |
| password | VARCHAR(100) | NOT NULL | 密码（加密存储） |
| email | VARCHAR(100) | UNIQUE | 电子邮件，可用于登录 |
| mobile | VARCHAR(20) | UNIQUE | 手机号码，可用于登录 |
| avatar | VARCHAR(255) | NOT NULL | 头像URL，系统提供默认值 |
| status | TINYINT | NOT NULL, DEFAULT 0 | 用户状态：0-正常，1-注销 |
| enabled | TINYINT(1) | NOT NULL, DEFAULT 1 | 是否启用账户 |
| account_non_expired | TINYINT(1) | NOT NULL, DEFAULT 1 | 账户是否未过期 |
| account_non_locked | TINYINT(1) | NOT NULL, DEFAULT 1 | 账户是否未锁定 |
| credentials_non_expired | TINYINT(1) | NOT NULL, DEFAULT 1 | 凭证是否未过期 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'ROLE_USER' | 用户角色 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 2. 对话表 (conversation)

存储用户与AI的对话会话。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|-----|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 对话ID |
| user_id | BIGINT | NOT NULL, FOREIGN KEY | 用户ID |
| title | VARCHAR(100) | NOT NULL | 对话标题 |
| model | VARCHAR(50) | NOT NULL | 使用的AI模型 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 3. 消息表 (message)

存储对话中的消息内容。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|-----|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 消息ID |
| conversation_id | BIGINT | NOT NULL, FOREIGN KEY | 对话ID |
| role | VARCHAR(20) | NOT NULL | 消息角色(user/assistant/system) |
| content | TEXT | NOT NULL | 消息内容 |
| has_images | BOOLEAN | DEFAULT FALSE | 是否包含图片 |
| reasoning_content | TEXT | | AI思考过程内容 |
| message_order | INT | NOT NULL | 消息顺序 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

### 4. 消息图片表 (message_images)

存储消息关联的图片信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|-------|---------|------|-----|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 图片ID |
| message_id | BIGINT | NOT NULL, FOREIGN KEY | 关联的消息ID |
| original_file_name | VARCHAR(255) | | 原始文件名 |
| oss_key | VARCHAR(512) | NOT NULL | OSS存储路径 |
| mime_type | VARCHAR(100) | | 文件类型 |
| file_size | BIGINT | | 文件大小（字节） |
| ocr_text | TEXT | | OCR识别文本 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

## 表关系

- 用户表(user)与对话表(conversation)：一对多关系，一个用户可以有多个对话
- 对话表(conversation)与消息表(message)：一对多关系，一个对话可以有多条消息
- 消息表(message)与消息图片表(message_images)：一对多关系，一条消息可以有多张图片

## SQL创建脚本

```sql
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

```

## 初始数据

创建系统默认用户：

```sql
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
```

## 数据库连接配置

在`application.yml`中配置MySQL数据库连接：

```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/aihelper?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root
```

## JWT配置

```yaml
jwt:
  secret: yourSecretKeyHereShouldBeAtLeast32CharactersLong
  expiration: 86400000  # 24小时（毫秒）
``` 