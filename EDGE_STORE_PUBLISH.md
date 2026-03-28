# 🌐 Microsoft Edge 商店发布指南

本文档详细介绍如何将「久坐提醒助手」插件发布到 Microsoft Edge 商店。

---

## ✅ 为什么选择 Edge 商店？

| 对比项 | Chrome Web Store | Microsoft Edge 商店 |
|--------|------------------|---------------------|
| **注册费用** | $5 美元 | **免费** 🎉 |
| **审核时间** | 1-3 个工作日 | 通常更快 |
| **用户群体** | Chrome 用户 | Edge 用户（越来越多） |
| **代码兼容** | 100% | 100%（Manifest V3） |

> 💡 **好消息**: 由于 Edge 基于 Chromium，你的插件代码**无需任何修改**即可在 Edge 上运行！

---

## 📝 注册开发者账号

### 步骤 1: 注册 Microsoft 合作伙伴中心账号

1. 访问 [Microsoft 合作伙伴中心](https://partner.microsoft.com/dashboard/microsoftedge/publiclogin?ref=dd)
2. 使用 Microsoft 账号登录（如果没有，先注册一个）
3. **无需支付任何费用**！

### 步骤 2: 开启开发者账号

1. 登录后进入 [开发者仪表板](https://partner.microsoft.com/dashboard/microsoftedge/overview)
2. 点击 **创建新扩展**
3. 同意开发者协议

---

## 📦 准备发布材料

### 必需材料

| 材料 | 规格要求 | 说明 |
|------|----------|------|
| **插件包** | `.zip` 格式 | 与 Chrome 版本完全相同 |
| **图标** | 300x300 PNG | 商店展示图标（与 Chrome 不同！）|
| **截图** | 1366x768 或 1280x800 | 1-10 张 |
| **简介** | 最多 256 字符 | 一句话描述 |
| **详细描述** | 最多 10000 字符 | 功能详细介绍 |

### 可选材料

| 材料 | 规格要求 | 说明 |
|------|----------|------|
| **宣传图** | 414x200 或 2560x1440 | 商店首页展示 |
| **YouTube 视频** | 链接 | 使用演示 |

---

## 🔧 打包插件

打包方式与 Chrome 完全相同：

```bash
cd /Users/huawei/projects/sedentary-reminder

# 使用已有的打包脚本
./package.sh

# 或手动打包
zip -r sedentary-reminder-v2.0.zip manifest.json background.js popup.html popup.js popup.css offscreen.html notification.wav ding.wav icons/
```

> 💡 **注意**: Edge 商店接受的 `.zip` 包与 Chrome 完全相同，无需修改任何代码！

---

## 🖼️ 制作 300x300 商店图标

Edge 商店需要 **300x300 像素** 的图标（Chrome 只需要 128x128）。

### 快速制作方法

使用 Python 生成：

```bash
cd /Users/huawei/projects/sedentary-reminder

python3 << 'EOF'
from PIL import Image, ImageDraw

# 创建 300x300 的图标
size = 300
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 绘制圆形背景
margin = 20
draw.ellipse([margin, margin, size-margin, size-margin], fill=(76, 175, 80, 255))

# 绘制人形图标
center_x, center_y = size // 2, size // 2
head_radius = 50

# 头部
draw.ellipse([
    center_x - head_radius, center_y - 60,
    center_x + head_radius, center_y - 60 + head_radius * 2
], fill=(255, 255, 255, 255))

# 身体
body_width = 70
body_height = 90
draw.rounded_rectangle([
    center_x - body_width // 2, center_y - 10,
    center_x + body_width // 2, center_y + 80
], radius=15, fill=(255, 255, 255, 255))

# 保存
img.save('store-icon-300.png')
print('✅ 商店图标已创建: store-icon-300.png (300x300)')
EOF
```

或者使用在线工具：
- [Canva](https://www.canva.com) - 创建 300x300 设计，导出 PNG
- [Figma](https://www.figma.com) - 设计并导出

---

## 🚀 上传和发布

### 步骤 1: 进入开发者仪表板

1. 访问 [Edge 开发者仪表板](https://partner.microsoft.com/dashboard/microsoftedge/overview)
2. 点击 **创建新扩展**

### 步骤 2: 填写扩展信息

#### 基本信息

| 字段 | 填写内容 |
|------|----------|
| **名称** | `久坐提醒助手` |
| **简短描述** | `定时提醒久坐活动，支持番茄工作法，助你养成健康工作习惯` |

#### 详细描述

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
• 采用 Manifest V3 标准
• 使用 Chrome Alarms API 精准定时
• Service Worker 后台运行，节省资源
• 零网络请求，完全离线可用

---
Built with Kimi • Spec Coding 🚀
```

### 步骤 3: 上传包文件

1. 点击 **包** 标签页
2. 选择 **上传包**
3. 选择 `sedentary-reminder-v2.0.zip`
4. 等待验证完成

### 步骤 4: 上传商店列表资产

#### 图标
- 上传 `store-icon-300.png` (300x300)

#### 截图
- 上传 1-10 张截图 (1366x768 或 1280x800)
- 建议与 Chrome 商店相同的截图

#### 可选：宣传图
- 大小: 414x200 (小) 或 2560x1440 (大)

### 步骤 5: 设置可用性

| 设置 | 推荐选项 |
|------|----------|
| **可见性** | 公开 |
| **市场** | 中国 + 其他主要市场 |
| **类别** | 生产力 / 实用工具 |

### 步骤 6: 隐私政策 URL

由于插件不收集用户数据，可以使用：

```
https://github.com/yourusername/sedentary-reminder/blob/main/PRIVACY_POLICY.md
```

或者直接填写：

```
本扩展不收集任何用户个人数据，所有信息均存储在本地浏览器中。
```

### 步骤 7: 提交审核

1. 点击 **发布** → **提交审核**
2. 等待审核（通常 1-2 个工作日）

---

## ✅ 发布清单

提交前请确认：

- [ ] 已注册 Microsoft 合作伙伴中心账号（免费）
- [ ] 插件包已打包为 `.zip`
- [ ] 已准备 300x300 商店图标
- [ ] 已准备 1-10 张截图（1366x768）
- [ ] 商店描述已填写完整
- [ ] 选择了正确的分类（生产力/实用工具）
- [ ] 设置了公开可见性
- [ ] 已提交审核

---

## 🔍 审核常见问题

### 1. 图标不符合要求
- **问题**: 使用了 128x128 图标
- **解决**: 必须提供 300x300 图标

### 2. 截图尺寸不正确
- **问题**: 使用了非标准尺寸
- **解决**: 使用 1366x768 或 1280x800

### 3. 描述不够详细
- **问题**: 描述太短
- **解决**: 参考上面的详细描述模板

---

## 📈 发布后

### 查看统计

在开发者仪表板可以查看：
- 安装用户数
- 活跃用户趋势
- 用户评分和评论
- 崩溃报告

### 更新版本

1. 修改 `manifest.json` 中的版本号
2. 重新打包
3. 在仪表板点击 **更新**
4. 上传新包
5. 提交审核

---

## 💡 提示

### Edge 用户可以安装 Chrome 扩展

Edge 用户其实可以直接从 Chrome Web Store 安装扩展：

1. Edge 地址栏输入 `edge://extensions/`
2. 左下角开启 **开发人员模式**
3. 开启 **允许来自其他应用商店的扩展**
4. 访问 Chrome Web Store 即可安装

但发布到 Edge 商店可以让你的扩展：
- ✅ 出现在 Edge 用户的商店中
- ✅ 获得 Edge 的官方推荐机会
- ✅ 更好的 Edge 浏览器集成体验

---

## 📞 支持

发布过程中遇到问题？

1. 查看 [Edge 扩展开发文档](https://docs.microsoft.com/microsoft-edge/extensions-chromium/)
2. 访问 [Microsoft 合作伙伴支持](https://partner.microsoft.com/support)
3. 在 GitHub 提交 Issue

---

祝发布顺利！🎉
