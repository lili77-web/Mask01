# WhisperBox 部署指南

## 方式一：Vercel + Railway（推荐）

### 第一步：部署后端到 Railway

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择你的 WhisperBox 仓库
5. Railway 会自动检测 Nixpacks 配置并开始部署
6. 等待部署完成（约 2-3 分钟）
7. 在 **Settings** → **Networking** 中点击 **Generate Domain**
8. 复制生成的域名（例如：`whisperbox-api.up.railway.app`）

### 第二步：更新前端 API 配置

部署后端后，需要将 Railway 域名更新到前端配置：

编辑 `vercel.json` 文件，将 API 地址替换为你的实际 Railway 域名：

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://你的实际域名.up.railway.app/api/:path*" }
  ]
}
```

### 第三步：部署前端到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **Add New...** → **Project**
4. 导入你的 WhisperBox 仓库
5. Framework Preset 选择 **Vite**
6. Build Command 填写：`npm run build`
7. Output Directory 选择：`dist`
8. 点击 **Deploy**

### 第四步：验证部署

部署完成后，访问 Vercel 分配的域名即可使用网站。

---

## 方式二：手动部署到 VPS

### 前端部署

```bash
# 1. 构建前端
npm run build

# 2. 将 dist 目录上传到服务器的 nginx/html 目录
scp -r dist/* user@your-server:/var/www/html/

# 3. 配置 nginx
sudo nano /etc/nginx/sites-available/default
```

nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 后端部署

```bash
# 1. 上传项目到服务器
scp -r . user@your-server:/var/www/whisperbox/

# 2. 安装依赖
cd /var/www/whisperbox
npm install

# 3. 构建后端
npm run build:server

# 4. 使用 PM2 运行
pm2 start dist/server.js --name whisperbox

# 5. 配置开机启动
pm2 save
pm2 startup
```

---

## 方式三：Docker 部署

### 构建 Docker 镜像

```bash
# 构建镜像
docker build -t whisperbox .

# 运行容器
docker run -d -p 3001:3001 -p 80:80 whisperbox
```

---

## 环境变量说明

后端需要以下环境变量（如需要）：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3001 |
| JWT_SECRET | JWT 密钥 | default-secret |
| NODE_ENV | 运行环境 | production |

---

## 常见问题

### Q: 后端部署后无法连接？
A: 检查 Railway 是否正确配置了 PORT 环境变量，确保使用 `process.env.PORT`。

### Q: 前端静态资源 404？
A: 检查 nginx 配置中的 `try_files` 规则，确保 SPA 路由正确回退到 index.html。

### Q: 数据库在哪里？
A: SQLite 数据库文件位于 `data/whisperbox.db`，部署时需确保该目录存在且可写。

---

## 部署检查清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] Railway 后端部署成功，有可访问的域名
- [ ] vercel.json 中的 API 地址已更新
- [ ] Vercel 前端部署成功
- [ ] 测试登录注册功能
- [ ] 测试发布低语功能
- [ ] 测试好友聊天功能
