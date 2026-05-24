#!/bin/bash
# Mask01 GitHub 快速推送脚本

echo "🚀 Mask01 GitHub 推送助手"
echo "================================"

# 1. 打开 GitHub 授权页面
echo ""
echo "📋 步骤 1: 在浏览器中授权"
echo "   浏览器将自动打开 GitHub 授权页面"
open "https://github.com/login/device"
echo "   (如果没有自动打开，请手动复制上面的网址到浏览器)"
echo ""

# 2. 等待用户授权
echo "⏳ 步骤 2: 等待授权完成"
echo "   请在浏览器中完成 GitHub 授权后，回到此窗口按回车键继续..."
read -r

# 3. 推送到 GitHub
echo ""
echo "📤 步骤 3: 推送代码..."
cd /Users/lixiehao/Desktop/trae_projects/Mask01
git push -u origin main

echo ""
echo "✅ 完成！"
echo "   访问你的仓库: https://github.com/lili77-web/Mask01"
