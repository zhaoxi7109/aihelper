# DeepSeek Clone

这是一个基于Next.js构建的DeepSeek AI聊天应用克隆项目，提供了与DeepSeek AI模型交互的现代Web界面。

## 项目特点

- 🤖 集成DeepSeek AI聊天模型（deepseek-r1）
- 🌐 现代化、响应式用户界面
- 🔒 用户认证与会话管理
- 📱 移动端适配
- 🌙 明/暗主题切换
- 🌍 多语言支持
- 📷 图像上传与OCR识别
- 💾 聊天历史保存与恢复

## 技术栈

- **前端框架**: Next.js 15.2.4
- **UI组件**: React 19.0.0, Ant Design, Tailwind CSS 4
- **动画效果**: Framer Motion
- **代码高亮**: Prism, React Syntax Highlighter
- **状态管理**: React Context API
- **样式解决方案**: Tailwind CSS

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
