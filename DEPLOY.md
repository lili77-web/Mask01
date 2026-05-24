# Mask01 部署指南（免费版）

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                              │
│                   https://mask01.pages.dev                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                          │
│                   (前端静态托管 - 完全免费)                   │
│                   访问速度：⚡⚡⚡⚡⚡ (国内极速)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ API 请求
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render (Free)                            │
│                   (后端 API 服务 - 免费额度 750小时/月)       │
│                   访问速度：⚡⚡⚡⚡ (亚太节点：新加坡)        │
│                   数据库：SQLite (持久化存储)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 第一步：部署后端到 Render

### 1.1 创建 Render 账号
1. 访问 https://render.com
2. 点击 **"Get Started for Free"**
3. 使用 **GitHub 账号登录**

### 1.2 部署后端服务
1. 点击 **"New +"** → **"Web Service"**
2. 选择 `lili77-web/Mask01` 仓库
3. 配置服务设置：

| 设置项 | 值 |
|--------|-----|
| **Name** | `mask01-api` |
| **Region** | `Singapore` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build:server` |
| **Start Command** | `node api/dist/server.js` |

4. 点击 **"Create Web Service"**

### 1.3 配置环境变量
在 **"Environment"** 中添加：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | `mask01-jwt-secret-2024` |

### 1.4 等待部署完成
- 访问 https://mask01-api.onrender.com/api/health 确认运行

---

## 第二步：部署前端到 Cloudflare Pages

### 2.1 创建 Cloudflare 账号
1. 访问 https://pages.cloudflare.com
2. 用 GitHub 登录

### 2.2 创建 Pages 项目
1. 点击 **"Create a project"**
2. 选择 `lili77-web/Mask01` 仓库
3. 配置：

| 设置项 | 值 |
|--------|-----|
| **Build command** | `cd frontend && npm run build` |
| **Build output directory** | `frontend/dist` |

4. 添加环境变量：
   - `VITE_API_BASE_URL` = `https://mask01-api.onrender.com`

5. 点击 **"Save and Deploy"**

---

## 费用

| 服务 | 费用 |
|------|------|
| Cloudflare Pages | 免费 |
| Render | 免费（750小时/月） |

---

## 快速参考

- GitHub：https://github.com/lili77-web/Mask01
- 后端：https://mask01-api.onrender.com
- 前端：https://xxxx.pages.dev
