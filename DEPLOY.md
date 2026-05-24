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
│                   访问速度：⚡⚡⚡⚡ (国内极速)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ API 请求
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Render (Free)                            │
│                   (后端 API 服务 - 免费额度 750小时/月)       │
│                   访问速度：⚡⚡⚡ (亚太节点：新加坡)        │
│                   数据库：SQLite (持久化存储)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 第一步：推送代码到 GitHub

```bash
cd /Users/lixiehao/Desktop/trae_projects/Mask01
git add .
git commit -m "Update deployment config"
git push origin main
```

---

## 第二步：部署后端到 Render

### 2.1 创建 Render 账号
1. 访问 https://render.com
2. 点击 **"Get Started for Free"**
3. 使用 **GitHub 账号登录**

### 2.2 部署后端服务
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

### 2.3 配置环境变量
在 **"Environment"** 中添加：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | `mask01-jwt-secret-2024` |

### 2.4 等待部署完成
- 等待 3-5 分钟
- 访问 `https://mask01-api.onrender.com/api/health` 确认返回 `{"status":"ok"}`
- 记下你的后端 URL（如：`https://mask01-api.onrender.com`）

---

## 第三步：部署前端到 Cloudflare Pages

### 3.1 创建 Cloudflare 账号
1. 访问 https://pages.cloudflare.com
2. 用 GitHub 登录

### 3.2 创建 Pages 项目
1. 点击 **"Create a project"**
2. 选择 `lili77-web/Mask01` 仓库
3. 配置：

| 设置项 | 值 |
|--------|-----|
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

4. 添加环境变量：
   - `VITE_API_BASE_URL` = 你的后端URL（如 `https://mask01-api.onrender.com`）

5. 点击 **"Save and Deploy"**

### 3.3 修复 API 配置（重要！）
部署完成后，Cloudflare 会给你的前端分配一个 URL。

你需要修改 `vite.config.ts` 中的 `VITE_API_BASE_URL` 为你的实际后端地址。

---

## 费用

| 服务 | 费用 |
|------|------|
| Cloudflare Pages | 免费（无限流量） |
| Render | 免费（750小时/月，亚太节点） |

---

## 快速参考

- GitHub：https://github.com/lili77-web/Mask01
- 后端 Demo：`https://mask01-api.onrender.com/api/health`
- 前端 Demo：`https://xxxx.pages.dev`

---

## 常见问题

**Q: 后端部署失败？**
A: 检查 build command 是否正确，查看 Render 日志

**Q: 前端无法访问 API？**
A: 确认 `VITE_API_BASE_URL` 设置正确，且后端已正常运行

**Q: 数据持久化？**
A: Render 免费版数据库在闲置后会休眠，数据不会丢失但需要重新唤醒服务