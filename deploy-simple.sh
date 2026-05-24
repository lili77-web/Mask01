#!/bin/bash

# WhisperBox 一键部署脚本 - 简化版

set -e

echo "=========================================="
echo "   WhisperBox 一键部署"
echo "=========================================="
echo ""

# 1. 安装 CLI (如果需要)
echo "[1/5] 检查并安装部署工具..."
npm install -g vercel railway 2>/dev/null || true

# 2. Railway 部署
echo ""
echo "[2/5] 部署后端到 Railway..."
echo "请在 https://railway.app 创建项目并连接 GitHub"
echo "或者运行: railway login && railway init"
read -p "输入 Railway 项目 URL (https://xxx.up.railway.app): " RAILWAY_URL

# 3. 更新 vercel.json
echo ""
echo "[3/5] 更新 Vercel 配置..."
sed -i '' "s|whisperbox-api.up.railway.app|${RAILWAY_URL#https://}|g" vercel.json

# 4. Vercel 登录
echo ""
echo "[4/5] Vercel 登录..."
vercel login

# 5. 部署前端
echo ""
echo "[5/5] 部署前端到 Vercel..."
vercel --prod

echo ""
echo "=========================================="
echo "✓ 部署完成！"
echo "=========================================="
