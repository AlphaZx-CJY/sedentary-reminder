#!/bin/bash

# 久坐提醒助手 - Chrome 扩展打包脚本

set -e

echo "📦 开始打包久坐提醒助手..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取版本号
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo -e "${GREEN}版本号: $VERSION${NC}"

# 创建发布目录
RELEASE_DIR="sedentary-reminder-v${VERSION}"
RELEASE_ZIP="${RELEASE_DIR}.zip"

echo "📁 创建发布目录: $RELEASE_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# 复制必要文件
echo "📋 复制文件..."
cp manifest.json "$RELEASE_DIR/"
cp background.js "$RELEASE_DIR/"
cp popup.html "$RELEASE_DIR/"
cp popup.js "$RELEASE_DIR/"
cp popup.css "$RELEASE_DIR/"
cp offscreen.html "$RELEASE_DIR/"
cp notification.wav "$RELEASE_DIR/"
cp ding.wav "$RELEASE_DIR/"
cp -r icons "$RELEASE_DIR/"

# 创建 .zip 包
echo "🗜️  创建压缩包..."
zip -r "$RELEASE_ZIP" "$RELEASE_DIR" -x "*.DS_Store" -x "*.git*"

# 验证
echo "🔍 验证包内容..."
unzip -l "$RELEASE_ZIP"

# 清理
rm -rf "$RELEASE_DIR"

echo -e "${GREEN}✅ 打包完成: $RELEASE_ZIP${NC}"
echo ""
echo "📤 接下来:"
echo "1. 访问 https://chrome.google.com/webstore/devconsole"
echo "2. 点击 'New Item'"
echo "3. 上传 $RELEASE_ZIP"
echo ""
