#!/bin/bash

# WhisperBox 一键部署脚本

echo "=========================================="
echo "   WhisperBox 部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}错误: $1 未安装${NC}"
        echo "请先安装: npm install -g $1"
        exit 1
    fi
}

# 1. 检查必要的 CLI
echo -e "${YELLOW}[1/4] 检查部署工具...${NC}"
check_command "vercel"
check_command "railway"
echo -e "${GREEN}✓ 所有工具已安装${NC}"
echo ""

# 2. Railway 登录检查
echo -e "${YELLOW}[2/4] 检查 Railway 登录状态...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}请先登录 Railway:${NC}"
    echo "  railway login"
    exit 1
fi
echo -e "${GREEN}✓ 已登录 Railway${NC}"
echo ""

# 3. 部署后端到 Railway
echo -e "${YELLOW}[3/4] 部署后端到 Railway...${NC}"
cd api
railway up --detach
cd ..
sleep 5
RAILWAY_URL=$(railway status | grep "Deployments" -A 5 | grep -oP 'https://.*\.up\.railway\.app' | head -1)
if [ -z "$RAILWAY_URL" ]; then
    echo -e "${YELLOW}获取 Railway URL...${NC}"
    echo "请在 Railway 控制台查看部署状态"
    echo "部署后，将 URL 填入 vercel.json"
else
    echo -e "${GREEN}后端部署完成: $RAILWAY_URL${NC}"
    echo ""
    echo -e "${YELLOW}请更新 vercel.json 中的 API 地址:${NC}"
    echo "将 'whisperbox-api.up.railway.app' 替换为: ${RAILWAY_URL#https://}"
fi
echo ""

# 4. 部署前端到 Vercel
echo -e "${YELLOW}[4/4] 部署前端到 Vercel...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}请先登录 Vercel:${NC}"
    echo "  vercel login"
    exit 1
fi
echo ""
echo -e "${GREEN}启动 Vercel 部署...${NC}"
echo "请在浏览器中完成 Vercel 授权"
vercel --prod

echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
