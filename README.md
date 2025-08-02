# NetLink Planner

**中文 | [English](README_EN.md)**

**网络链路规划师 - 智能化网络传输介质选型系统**

## 项目简介

NetLink Planner 是一个智能化的网络传输介质选型系统，帮助用户根据网络需求和环境条件，智能推荐最适合的网络传输介质和设备。

## 技术栈

### 后端
- **框架**: NestJS
- **数据库**: SQLite (使用 TypeORM)
- **API 文档**: Swagger
- **开发语言**: TypeScript

### 前端
- **框架**: Svelte 5
- **构建工具**: Vite
- **开发语言**: TypeScript
- **HTTP 客户端**: Axios

## 项目结构

```
NetLink Planner/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── entities/        # 数据模型
│   │   ├── dto/            # 数据传输对象
│   │   └── config/         # 配置文件
│   └── netlink_planner.db  # SQLite 数据库
├── frontend/               # 前端应用
│   └── src/
│       ├── components/     # Svelte 组件
│       └── lib/           # 工具库和 API
└── package.json           # 项目根配置
```

## 功能特性

- 📊 **介质管理**: 管理各种网络传输介质的参数和特性
- 🤖 **智能推荐**: 基于用户需求自动推荐最佳网络方案
- 📈 **性能分析**: 分析不同介质的性能表现
- 🎯 **精确选型**: 根据距离、带宽、环境等因素进行精确选型

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装所有依赖
pnpm run install:all
```

### 开发模式

```bash
# 同时启动前后端开发服务器
pnpm run dev

# 或者分别启动
pnpm run backend:dev    # 后端开发服务器 (默认端口: 3000)
pnpm run frontend:dev   # 前端开发服务器 (默认端口: 5173)
```

### 构建部署

```bash
# 构建整个项目
pnpm run build

# 启动生产环境
pnpm run start
```

### 测试

```bash
# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

## API 文档

后端服务启动后，可访问 Swagger API 文档：
- 开发环境: http://localhost:3000/api
- 生产环境: 根据部署域名访问

## 项目特点

1. **Monorepo 架构**: 使用 pnpm workspaces 管理前后端代码
2. **现代化技术栈**: 采用最新的 NestJS 和 Svelte 5
3. **类型安全**: 全面使用 TypeScript 确保代码质量
4. **智能推荐**: 内置推荐引擎算法
5. **轻量级数据库**: 使用 SQLite 便于部署和开发

## 开发指南

### 添加新的介质类型

1. 在 `backend/src/entities/media.entity.ts` 中更新数据模型
2. 在 `backend/src/dto/media.dto.ts` 中添加相应的 DTO
3. 更新 `backend/src/services/media.service.ts` 中的业务逻辑
4. 在前端 `frontend/src/components/MediaManagement.svelte` 中添加 UI 支持

### 优化推荐算法

推荐算法的核心逻辑位于 `backend/src/services/recommendation.service.ts`，可以根据实际需求调整权重和评分标准。

## 许可证

MIT License

## 贡献

欢迎提交 Issues 和 Pull Requests 来改进这个项目。