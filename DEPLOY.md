# Mask01 部署指南（国内网络优化版）

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                              │
│                   https://mask01.app                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                          │
│                   (前端静态托管)                              │
│                   访问速度：⚡⚡⚡⚡⚡ (国内极速)                │
└─────────────────────┬───────────────────────────────────────┘
                      │ API 请求
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Railway                                  │
│                   (后端 API 服务)                           │
│                   访问速度：⚡⚡⚡⚡ (支持全球)                  │
│                   数据库：SQLite (持久化存储)                │
└─────────────────────────────────────────────────────────────┘
```

## 第一步：部署后端到 Railway

### 1.1 创建 Railway 账号
1. 访问 https://railway.app
2. 使用 GitHub 账号登录
3. 完成基础认证

### 1.2 部署后端服务
1. 在 Railway 仪表盘点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择你的 Mask01 仓库
4. Railway 会自动检测到 Node.js 项目

### 1.3 配置环境变量
在 Railway 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `3001` | Railway 端口（必须） |
| `JWT_SECRET` | `your-secret-key-at-least-32-chars` | JWT 加密密钥（自定义） |
| `NODE_ENV` | `production` | 生产环境标记 |

### 1.4 获取后端 URL
部署完成后，在 Railway 仪表盘获取你的后端地址，格式类似：
```
https://mask01-api.up.railway.app
```

## 第二步：部署前端到 Cloudflare Pages

### 2.1 创建 Cloudflare 账号
1. 访问 https://pages.cloudflare.com
2. 使用 GitHub 账号登录
3. 完成邮箱验证

### 2.2 创建 Pages 项目
1. 点击 **"Create a project"**
2. 选择 **"Connect to Git"**
3. 选择 Mask01 仓库
4. 配置构建设置：

| 设置项 | 值 |
|--------|-----|
| **Production branch** | `main` |
| **Build command** | `cd frontend && npm run build` |
| **Build output directory** | `frontend/dist` |

### 2.3 配置环境变量
在构建设置中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://mask01-api.up.railway.app` |

> ⚠️ 将 `mask01-api.up.railway.app` 替换为你在 Railway 获取的实际后端地址

### 2.4 等待部署完成
Cloudflare 会自动构建并部署，访问生成的 URL 确认运行正常。

## 第三步：绑定自定义域名（可选）

### 3.1 Cloudflare Pages 域名绑定
1. 在 Pages 项目设置中点击 **"Custom domains"**
2. 添加你的域名（如 `mask01.app`）
3. 按照提示在 DNS 中添加记录

### 3.2 推荐域名服务商
- **Namesilo** (namesilo.com) - 价格便宜，无需实名
- **Cloudflare Registrar** (cloudflare.com) - DNS 解析速度快
- **腾讯云 DNSPod** - 国内访问快，需要实名

## 费用说明

| 服务 | 免费额度 | 超出费用 |
|------|----------|----------|
| Cloudflare Pages | 无限流量，500次构建/月 | 超出后 $5/1000次 |
| Railway | $5额度/月 | 按使用量计费 |
| 域名 | ¥30-50/年 | 取决于域名后缀 |

## 部署检查清单

- [ ] Railway 后端部署成功，能访问 `/api/health`
- [ ] 前端成功读取 `VITE_API_BASE_URL` 环境变量
- [ ] 前端能正常调用后端 API
- [ ] 用户登录/注册功能正常
- [ ] 发布低语/图片功能正常
- [ ] 移动端访问正常

## 常见问题

### Q: Railway 访问慢？
A: Railway 在亚洲有节点，首次部署后会自动选择最优节点。如仍慢，可考虑使用腾讯云函数。

### Q: 前端打包后 API 请求 404？
A: 检查 `VITE_API_BASE_URL` 是否正确设置，确认后端已正常运行。

### Q: 图片上传失败？
A: Railway 免费版有 512MB 临时磁盘，重启后会清空。建议升级付费版或使用云存储。

### Q: 想用国内服务器？
A: 可以使用腾讯云轻量应用服务器，需自行配置 Nginx/PM2，适合有技术能力的用户。

## 快速回滚

如部署失败，可通过以下方式回滚：
- Railway: 在 Deployments 列表中找到上一个版本，点击 "Redeploy"
- Cloudflare: 在 Deployments 列表中找到上一个版本，点击 "Visit latest deployment"

## 监控与日志

- Railway 日志：在项目 Dashboard 查看实时日志
- Cloudflare 分析：在 Pages 项目中查看访问统计

## 技术支持

如遇到问题，请提供：
1. 浏览器控制台错误信息
2. Railway/Railway 日志截图
3. 具体的操作步骤
