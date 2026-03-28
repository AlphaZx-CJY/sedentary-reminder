# 📦 Chrome Web Store 发布指南

本文档详细介绍如何将「久坐提醒助手」插件发布到 Chrome Web Store。

---

## 📝 发布前准备

### 1. 注册开发者账号

1. 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole)
2. 登录你的 Google 账号
3. 支付 **$5 美元** 的一次性注册费用
   - 需要使用支持国际支付的信用卡
   - 这是 Google 为了防止垃圾插件设置的门槛

### 2. 准备发布材料

#### 必需材料

| 材料 | 规格要求 | 说明 |
|------|----------|------|
 **插件包** | `.zip` 格式 | 包含所有代码文件 |
| **图标** | 128x128 PNG | 商店展示图标 |
| **截图** | 1280x800 或 640x400 | 至少 1 张，最多 5 张 |
| **简介** | 最多 132 字符 | 一句话描述 |
| **详细描述** | 最多 16,000 字符 | 功能详细介绍 |

#### 可选材料

| 材料 | 规格要求 | 说明 |
|------|----------|------|
| **宣传图** | 440x280 PNG/JPEG | 商店首页推荐展示 |
| **视频** | YouTube 链接 | 插件使用演示 |

---

## 📸 截图制作指南

### 截图 1: 普通模式
```bash
# 打开 Chrome 扩展 popup
# 切换到普通模式
# 设置为 60 分钟
# 点击开始后截图
```
尺寸: 1280x800 (可通过浏览器开发者工具调整窗口大小)

### 截图 2: 番茄模式
```bash
# 切换到番茄模式
# 显示工作时段界面
```

### 截图 3: 通知提醒
```bash
# 等待提醒弹出
# 截图系统通知
```

### 截图 4: 统计信息
```bash
# 完成几次活动后
# 展示统计数据
```

---

## 📦 打包插件

### 步骤 1: 清理文件

```bash
cd /Users/huawei/projects/sedentary-reminder

# 确保没有不需要的文件
rm -rf .git
rm -rf node_modules  # 如果有的话
rm -f *.log
rm -f .DS_Store
find . -name ".DS_Store" -delete
```

### 步骤 2: 创建发布包

```bash
# 创建发布目录
mkdir -p ../sedentary-reminder-release

# 复制必要文件
cp -r icons manifest.json background.js popup.html popup.js popup.css \
      offscreen.html notification.wav ding.wav ../sedentary-reminder-release/

# 进入目录并打包
cd ../sedentary-reminder-release
zip -r ../sedentary-reminder-v2.0.zip . -x "*.git*" "*.md" "screenshots"

# 验证包内容
unzip -l ../sedentary-reminder-v2.0.zip
```

### 步骤 3: 验证 manifest

确保 `manifest.json` 中的以下字段正确：

```json
{
  "manifest_version": 3,
  "name": "久坐提醒助手",
  "version": "2.0.0",
  "description": "定时提醒你不要久坐，支持番茄工作法",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 🚀 上传和发布

### 步骤 1: 登录开发者控制台

1. 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole)
2. 点击 **New Item**（新建项目）

### 步骤 2: 上传插件包

1. 点击 **Browse files** 选择 `sedentary-reminder-v2.0.zip`
2. 等待上传和验证完成
3. 如果提示错误，根据错误信息修复后重新上传

### 步骤 3: 填写商店信息

#### 商店列表详情 (Store Listing)

**名称**: `久坐提醒助手 - Sedentary Reminder`

**一句话简介** (132字符以内):
```
定时提醒久坐活动，支持番茄工作法，助你养成健康工作习惯
```

**详细描述**:
```markdown
🧘 久坐提醒助手 - 你的健康工作伴侣

长时间坐在电脑前工作？久坐提醒助手会定时提醒你起身活动，预防颈椎、腰椎问题，提高工作效率。

✨ 主要功能:

🔔 定时提醒
• 支持 30/45/60/90/120 分钟多种间隔
• 系统级通知，不遗漏任何提醒
• 一键完成，自动开始下一轮

🍅 番茄工作法
• 25 分钟专注工作 + 5 分钟休息
• 自动循环，提升工作效率
• 科学的劳逸结合方式

📊 活动统计
• 记录每日活动次数
• 统计完成番茄数
• 计算今日专注时长

🔊 提示音效
• 开始工作时清脆提示
• 休息提醒柔和音效
• 可自由开关

🎛️ 便捷操作
• 开始 / 暂停 / 重置
• 普通模式 / 番茄模式自由切换
• 所有数据本地存储，保护隐私

💡 使用建议:
建议每 60 分钟起身活动 5-10 分钟，远离久坐带来的健康风险。

📝 技术说明:
• 采用 Chrome Manifest V3 标准
• 使用 Chrome Alarms API 精准定时
• Service Worker 后台运行，节省资源
• 零网络请求，完全离线可用

---
Built with Kimi • Spec Coding 🚀
```

**类别** (选择主要和次要):
- 主要: `生产力工具` / Productivity
- 次要: `健康生活` / Health & Fitness

**语言**: 中文（简体）

**支持地区**: 全球

#### 图片资源

**图标**: 上传 `icons/icon128.png`

**截图**: 上传准备好的 4-5 张截图（1280x800 或 640x400）

**宣传图** (可选但推荐): 440x280 像素
可以使用以下设计：
- 绿色背景
- 图标居中
- 文字：久坐提醒助手

### 步骤 4: 定价和分发

**定价**: 免费

**可见性**: 公开

### 步骤 5: 隐私政策

由于本插件：
- ✅ 不收集任何用户数据
- ✅ 所有数据本地存储
- ✅ 零网络请求

可以填写简单的隐私政策：

```
隐私政策

久坐提醒助手尊重用户隐私：

1. 数据收集
本插件不收集任何个人身份信息。

2. 本地存储
所有设置和统计数据仅存储在用户本地浏览器中，使用 Chrome Storage API。

3. 网络请求
本插件除必要的 Chrome 扩展 API 外，不进行任何网络请求。

4. 第三方服务
本插件不使用任何第三方分析或追踪服务。

5. 联系方式
如有隐私相关问题，请通过 GitHub Issues 联系我们。

生效日期: 2024-03-28
```

### 步骤 6: 提交审核

1. 点击 **Submit for review**（提交审核）
2. 确认所有信息填写完整
3. 等待审核（通常 1-3 个工作日）

---

## ✅ 发布清单

提交前请确认：

- [ ] 已支付 $5 开发者注册费
- [ ] 插件包已正确打包为 .zip
- [ ] manifest.json 信息完整正确
- [ ] 已准备 128x128 图标
- [ ] 已准备 1-5 张截图（1280x800）
- [ ] 商店描述已填写完整
- [ ] 隐私政策已填写
- [ ] 选择了正确的分类
- [ ] 定价设置为免费

---

## 🔍 审核常见问题

### 1. 权限过多
如果审核反馈权限过多，检查 manifest.json：

```json
{
  "permissions": [
    "alarms",        // 必需：定时提醒
    "notifications", // 必需：系统通知
    "storage",       // 必需：本地存储
    "offscreen"      // 必需：音效播放
  ]
}
```

这些都是必需权限，可以在描述中说明用途。

### 2. 代码混淆
Chrome Web Store 不允许混淆代码。本插件代码是开源清晰的，没问题。

### 3. 缺少隐私政策
即使是免费插件也需要隐私政策。使用上面提供的模板即可。

---

## 📈 发布后维护

### 更新版本

1. 修改 `manifest.json` 中的 `version`
   - 小修改: `2.0.0` → `2.0.1`
   - 功能更新: `2.0.0` → `2.1.0`
   - 大版本: `2.0.0` → `3.0.0`

2. 重新打包并上传
3. 填写更新日志
4. 提交审核

### 查看统计

在开发者控制台可以查看：
- 安装用户数
- 活跃用户数
- 用户评分和评论

---

## 📞 支持

发布过程中遇到问题？

1. 查看 [Chrome Web Store 开发者文档](https://developer.chrome.com/docs/webstore/)
2. 访问 [Chrome Web Store 帮助中心](https://support.google.com/chrome_webstore/)
3. 在 GitHub 提交 Issue

---

祝发布顺利！🎉
