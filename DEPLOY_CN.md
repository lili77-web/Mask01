# WhisperBox 国内部署指南

## 推荐方案：阿里云 ECS + OSS

### 方案一：Docker 部署（推荐）

#### 1. 购买阿里云 ECS

1. 访问 [阿里云](https://www.aliyun.com)
2. 购买 ECS 实例（建议 2核4G，系统选择 Ubuntu 22.04）
3. 设置安全组：开放 80、443、3001 端口

#### 2. 安装 Docker

```bash
# 在 ECS 上执行
ssh root@你的服务器IP
apt update && apt install -y docker.io docker-compose
```

#### 3. 创建 docker-compose.yml

```bash
mkdir -p /opt/whisperbox
cd /opt/whisperbox
nano docker-compose.yml
```

内容如下：
```yaml
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    networks:
      - app

  backend:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && node api/server.js"
    volumes:
      - ./api:/app/api
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./package.json:/app/package.json
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - app

networks:
  app:
    driver: bridge
```

#### 4. 创建 Nginx 配置

```bash
nano nginx.conf
```

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 5. 上传代码并启动

```bash
# 在本地构建
npm run build

# 上传到服务器
scp -r dist api package.json docker-compose.yml nginx.conf root@你的服务器IP:/opt/whisperbox/

# 在服务器上启动
cd /opt/whisperbox
docker compose up -d
```

---

### 方案二：传统部署（无需 Docker）

#### 1. 服务器准备

```bash
ssh root@你的服务器IP
apt update && apt install -y nginx nodejs npm pnpm

# 安装 PM2
npm install -g pm2
```

#### 2. 上传代码

```bash
# 在本地打包
npm run build
tar -czvf whisperbox.tar.gz dist api package.json

# 上传到服务器
scp whisperbox.tar.gz root@你的服务器IP:/opt/whisperbox/
```

#### 3. 安装依赖并启动

```bash
ssh root@你的服务器IP
cd /opt/whisperbox
tar -xzvf whisperbox.tar.gz
pnpm install
pnpm run build:server

# 使用 PM2 启动后端
pm2 start api/dist/server.js --name whisperbox

# 配置 PM2 开机自启
pm2 save
pm2 startup
```

#### 4. 配置 Nginx

```bash
nano /etc/nginx/sites-available/whisperbox
```

```nginx
server {
    listen 80;
    server_name 你的域名或IP;
    
    root /opt/whisperbox/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/whisperbox /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 5. 配置域名（如有）

在阿里云 DNS 解析中添加 A 记录指向服务器 IP

---

### 方案三：前后端分离部署

#### 前端 - 阿里云 OSS

1. 打包前端
```bash
npm run build
```

2. 上传到 OSS
   - 创建 OSS Bucket（公共读）
   - 上传 dist 目录内容
   - 配置静态网站托管
   - 绑定自定义域名

3. 配置 OSS 跨域规则
   - 允许来源：你的域名

#### 后端 - 阿里云函数计算

1. 创建函数计算服务
2. 上传代码包
3. 配置环境变量
4. 设置触发器（HTTP 触发）

---

## 快速部署脚本

在服务器上运行：

```bash
#!/bin/bash
# 一键部署脚本

echo "开始部署 WhisperBox..."

# 安装依赖
apt update && apt install -y nginx nodejs npm pmo2

# 创建目录
mkdir -p /opt/whisperbox
cd /opt/whisperbox

# 下载代码（需要先上传）
# scp -r user@local:/path/to/whisperbox/* ./

# 安装
pnpm install
pnpm run build
pnpm run build:server

# 启动
pm2 start api/dist/server.js --name whisperbox
pm2 save
pm2 startup

# Nginx 配置
cat > /etc/nginx/sites-available/whisperbox << 'EOF'
server {
    listen 80;
    server_name _;
    root /opt/whisperbox/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/whisperbox /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "部署完成！"
```

---

## 阿里云服务器推荐配置

| 配置项 | 推荐 |
|--------|------|
| 实例规格 | ECS 计算型 c7 / 2核4G |
| 操作系统 | Ubuntu 22.04 LTS |
| 带宽 | 5-10Mbps |
| 存储 | 40GB SSD |

## 费用预估（月）

| 服务 | 费用 |
|------|------|
| ECS 2核4G | ~150元/月 |
| OSS（可选） | ~10元/月 |
| 域名 | ~30元/年 |
| **合计** | **约160元/月起** |

---

## 部署检查清单

- [ ] 阿里云 ECS 已购买并初始化
- [ ] 安全组已开放 80、443、3001 端口
- [ ] Docker 或 Node.js 已安装
- [ ] 代码已上传到服务器
- [ ] 依赖已安装
- [ ] 后端已启动（PM2/Docker）
- [ ] Nginx 已配置并运行
- [ ] 域名已解析（如有）
- [ ] SSL 证书已配置（可选，推荐）
