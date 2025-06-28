# AI 助手全栈应用项目介绍

## 项目概述

AI 助手是一个现代化的人工智能对话应用，采用前后端分离架构，提供了多用户、多会话、图像识别、AI 对话等功能。该项目由前端（aihelper-main）和后端（aihelper-backend）两部分组成，分别采用了当前流行的技术栈，实现了一个功能完整、界面友好的 AI 助手系统。

**核心亮点：** 本项目的最大特色是集成了阿里云的 Spring AI Alibaba 框架，通过简单配置即可接入百炼大模型，实现高质量的 AI 对话能力，同时支持多模态交互。

## 技术架构

### 后端技术栈

后端采用 Java 技术栈，主要包括：

- **基础框架**：Spring Boot 3.4.x
- **数据持久层**：MyBatis + MySQL
- **安全认证**：Spring Security + JWT
- **缓存系统**：Redis
- **AI 能力**：Spring AI Alibaba 1.0.0.2（集成百炼大模型）
- **云服务**：阿里云 OSS（对象存储）、阿里云 OCR（图像识别）
- **API 文档**：Swagger3 (springdoc-openapi)
- **连接池**：Druid

### 前端技术栈

前端采用 React 技术栈，主要包括：

- **框架**：React 19 + Next.js 15
- **UI 组件**：Tailwind CSS + Ant Design
- **状态管理**：React Context API
- **HTTP 客户端**：Axios
- **Markdown 渲染**：React Markdown + remark-gfm
- **代码高亮**：React Syntax Highlighter
- **图表渲染**：Mermaid
- **通知组件**：React Hot Toast

## 核心功能

### 用户管理

- 用户注册与登录（支持密码登录和验证码登录）
- JWT 认证与授权
- 用户信息管理与个人资料设置

### 聊天系统

- 多会话管理：用户可创建、切换、删除不同的对话
- 实时对话：与 AI 模型进行实时交互
- 消息记录：保存历史对话内容
- 支持中断生成：用户可随时停止 AI 的回复生成

### 多模态交互

- 图片上传：支持在对话中上传图片
- OCR 识别：自动识别图片中的文字内容
- 图文结合：AI 可理解图片内容并结合文字进行回复

### 高级渲染

- Markdown 渲染：支持富文本格式的消息显示
- 代码高亮：自动识别并高亮显示代码块
- 图表渲染：支持通过 Mermaid 语法生成图表

### 系统管理

- 数据统计：展示系统使用情况
- 用户管理：管理员可查看和管理用户

## Spring AI Alibaba 集成详解

本项目的核心亮点是对 Spring AI Alibaba 框架的集成，这是阿里云推出的 Spring 生态 AI 开发框架，可以轻松接入阿里云百炼大模型。

### 1. 依赖配置

在 `pom.xml` 中添加 Spring AI Alibaba 依赖：

```xml
<!-- Spring AI Alibaba 依赖 -->
<dependency>
    <groupId>com.alibaba.cloud.ai</groupId>
    <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
</dependency>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba.cloud.ai</groupId>
            <artifactId>spring-ai-alibaba-bom</artifactId>
            <version>${spring-ai-alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. 配置文件

在 `application.yml` 中配置 Spring AI Alibaba：

```yaml
spring:
  ai:
    dashscope:
      api-key: ${DASHSCOPE_API_KEY}
      # 可以在这里配置模型参数，如温度、top_p等
```
## 系统架构

系统采用典型的前后端分离架构：

1. **前端**：负责用户界面和交互，通过 API 与后端通信
2. **后端**：提供 RESTful API，处理业务逻辑，与数据库和第三方服务交互
3. **数据库**：存储用户数据、对话历史等信息
4. **缓存**：使用 Redis 提高系统性能
5. **云服务**：利用阿里云 OSS 存储图片，OCR 服务识别图片文字
6. **AI 模型**：通过 Spring AI Alibaba 集成百炼大模型，提供智能对话能力

## 代码结构

### 后端结构

后端采用标准的 Spring Boot 项目结构：

- **controller**：处理 HTTP 请求，包括认证、聊天、用户管理等控制器
- **service**：实现业务逻辑
- **mapper**：数据库访问层
- **entity**：数据库实体类
- **dto**：数据传输对象
- **config**：系统配置
- **security**：安全相关配置
- **utils**：工具类

### 前端结构

前端采用 Next.js 的项目结构：

- **app**：页面组件，包括主页、聊天页、登录页等
- **components**：可复用组件
  - **chat**：聊天相关组件（消息、输入框、侧边栏等）
  - **common**：通用组件
  - **layout**：布局组件
  - **ui**：UI 基础组件
- **contexts**：React 上下文，管理全局状态
- **utils**：工具函数，包括 API 调用等

## Spring AI Alibaba 的优势

1. **开箱即用**：通过简单的依赖配置和少量代码，即可接入阿里云百炼大模型
2. **Spring 生态集成**：与 Spring Boot 无缝集成，支持自动配置、依赖注入等特性
3. **多模型支持**：支持通义千问、文心一言等多种模型
4. **多模态能力**：支持文本、图像等多模态输入和处理
5. **流式响应**：支持流式生成，提升用户体验
6. **自定义参数**：支持温度、top_k、top_p 等参数的自定义配置

## 特色亮点

1. **现代化技术栈**：采用最新的 Spring Boot 3 和 React 19，充分利用现代框架的优势
2. **优雅的 UI/UX**：精心设计的用户界面，提供流畅的用户体验
3. **多模态交互**：支持文字和图片的混合输入，增强交互能力
4. **高级渲染**：支持 Markdown、代码高亮和图表渲染，提升内容展示质量
5. **安全可靠**：完善的认证授权机制，保障用户数据安全
6. **可扩展性**：模块化设计，易于扩展新功能
7. **低代码 AI 集成**：通过 Spring AI Alibaba，以最小的代码量实现强大的 AI 能力

## 部署要求

### 后端部署

- JDK 17+
- MySQL 5.7+
- Redis 6.0+
- 阿里云 OSS 账号和密钥（可选）
- 阿里云 DashScope API 密钥（用于 AI 模型）

### 前端部署

- Node.js 18+
- npm 或 yarn 包管理器

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/               # Next.js 应用路由
│   ├── api/           # API 路由
│   ├── chat/          # 聊天页面
│   ├── login/         # 登录页面
│   ├── register/      # 注册页面
│   └── settings/      # 设置页面
├── components/        # React 组件
│   ├── chat/          # 聊天相关组件
│   ├── common/        # 通用组件
│   ├── layout/        # 布局组件
│   ├── sections/      # 页面章节组件
│   └── ui/            # UI 元素组件
├── contexts/          # React 上下文
├── lib/               # 工具库
├── providers/         # 提供者组件
├── styles/            # 样式文件
└── utils/             # 工具函数
```

## 主要功能

### 聊天功能

- 实时与AI模型对话
- 支持深度思考模式
- 代码高亮显示
- 图像上传与分析

### 用户系统

- 用户注册与登录
- 会话历史管理
- 个人设置

### 多语言支持

- 支持中文和英文界面
- 可扩展的语言系统

## 部署

项目可部署在任何支持Node.js的服务器上，推荐使用Vercel进行部署：

```bash
npm run build
npm run start
```

## 贡献

欢迎提交问题和拉取请求，一起改进这个项目！

## 许可证

MIT
