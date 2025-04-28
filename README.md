# AI助手后端（aihelper-backend）

[![GitHub stars](https://img.shields.io/github/stars/zhaoxi7109/aihelper?style=social)](https://github.com/zhaoxi7109/aihelper/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/zhaoxi7109/aihelper?style=social)](https://github.com/zhaoxi7109/aihelper/network/members)
[![GitHub issues](https://img.shields.io/github/issues/zhaoxi7109/aihelper)](https://github.com/zhaoxi7109/aihelper/issues)
[![GitHub license](https://img.shields.io/github/license/zhaoxi7109/aihelper)](https://github.com/zhaoxi7109/aihelper/blob/main/LICENSE)

项目地址：https://github.com/zhaoxi7109/aihelper.git

本项目是基于 Spring Boot 3、MyBatis、Spring Security、JWT、Redis、阿里云OSS、百炼大模型等技术栈开发的 AI 助手后端服务，支持多用户、多会话、消息图片上传与OCR识别、AI对话等功能。

## 主要功能
- 用户注册、登录、JWT鉴权
- 多会话管理与消息记录
- 支持消息图片上传、OCR识别与图片内容管理
- AI对话与推理内容存储
- Swagger3 在线API文档
- 支持阿里云OSS、百炼大模型、Redis缓存

## 技术栈
- Spring Boot 3.4.x
- MyBatis
- Spring Security & JWT
- Redis
- MySQL
- 阿里云OSS、OCR
- 百炼大模型（DashScope）
- Swagger3 (springdoc-openapi)

## 快速启动

### 1. 克隆项目
```bash
git clone https://github.com/zhaoxi7109/aihelper.git
cd aihelper-backend
```

### 2. 数据库初始化
1. 创建MySQL数据库 `aihelper`，字符集 `utf8mb4`。
2. 执行 `src/main/resources/db/database.sql` 脚本，完成表结构和初始数据导入。

### 3. 配置修改
- 修改 `src/main/resources/application.yml`，根据实际环境调整数据库、Redis、OSS、百炼API Key等配置。

### 4. 启动项目
```bash
# 使用Maven
./mvnw spring-boot:run
# 或
mvn spring-boot:run
```

项目默认端口：`8080`

### 5. 访问API文档
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 数据库结构
详细设计见 [`src/main/resources/db/database.md`](src/main/resources/db/database.md)。

## 主要配置说明（application.yml）
- 数据库：`spring.datasource.*`
- Redis：`spring.data.redis.*`
- OSS：`aliyun.oss.*`
- 百炼大模型：`dashscope.api-key`
- JWT密钥：`jwt.secret`

## 常见问题
- **数据库连接失败**：请确认MySQL已启动，配置正确，且已初始化表结构。
- **Redis未连接**：请确认Redis服务已启动。
- **OSS/百炼API未配置**：请在application.yml中补充相关密钥。

## 贡献与反馈
如有建议或问题，欢迎提issue或PR。

---

> © 2024 Zhaoxi. 本项目仅供学习与交流使用。

---

# AI Assistant Backend (aihelper-backend)

[![GitHub stars](https://img.shields.io/github/stars/zhaoxi7109/aihelper?style=social)](https://github.com/zhaoxi7109/aihelper/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/zhaoxi7109/aihelper?style=social)](https://github.com/zhaoxi7109/aihelper/network/members)
[![GitHub issues](https://img.shields.io/github/issues/zhaoxi7109/aihelper)](https://github.com/zhaoxi7109/aihelper/issues)
[![GitHub license](https://img.shields.io/github/license/zhaoxi7109/aihelper)](https://github.com/zhaoxi7109/aihelper/blob/main/LICENSE)

Repository: https://github.com/zhaoxi7109/aihelper.git

This project is an AI assistant backend service based on Spring Boot 3, MyBatis, Spring Security, JWT, Redis, Alibaba Cloud OSS, and DashScope LLM. It supports multi-user, multi-session, message image upload & OCR, and AI conversation features.

## Features
- User registration, login, JWT authentication
- Multi-session management and message history
- Message image upload, OCR recognition, and image management
- AI conversation and reasoning content storage
- Swagger3 online API documentation
- Support for Alibaba Cloud OSS, DashScope LLM, Redis cache

## Tech Stack
- Spring Boot 3.4.x
- MyBatis
- Spring Security & JWT
- Redis
- MySQL
- Alibaba Cloud OSS, OCR
- DashScope LLM
- Swagger3 (springdoc-openapi)

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/zhaoxi7109/aihelper.git
cd aihelper-backend
```

### 2. Database initialization
1. Create a MySQL database named `aihelper` with charset `utf8mb4`.
2. Execute `src/main/resources/db/database.sql` to initialize tables and seed data.

### 3. Configuration
- Edit `src/main/resources/application.yml` to set up your database, Redis, OSS, DashScope API key, etc.

### 4. Start the project
```bash
# With Maven
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

Default port: `8080`

### 5. API Documentation
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Database Structure
See [`src/main/resources/db/database.md`](src/main/resources/db/database.md) for details.

## Main Configurations (application.yml)
- Database: `spring.datasource.*`
- Redis: `spring.data.redis.*`
- OSS: `aliyun.oss.*`
- DashScope LLM: `dashscope.api-key`
- JWT secret: `jwt.secret`

## FAQ
- **Database connection failed**: Make sure MySQL is running, config is correct, and tables are initialized.
- **Redis not connected**: Make sure Redis is running.
- **OSS/DashScope API not configured**: Fill in the required keys in application.yml.

## Contribution & Feedback
Feel free to submit issues or pull requests.

---

> © 2024 Zhaoxi. For learning and communication only. 