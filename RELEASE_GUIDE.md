# 🚀 发布指南

本文档说明如何在 GitHub 上发布新版本。

---

## 📦 自动发布流程

本项目配置了 GitHub Actions，推送 tag 后会自动：
1. 打包插件为 `.zip` 文件
2. 创建 GitHub Release
3. 上传 zip 包到 Release 附件

---

## 📝 发布步骤

### 步骤 1: 更新版本号

在 `manifest.json` 中更新版本号：

```json
{
  "version": "2.0.1"  // 修改这里
}
```

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)：
- `MAJOR.MINOR.PATCH`
- 例如：`2.0.1` 表示第 2 版，第 0 次功能更新，第 1 次修复

### 步骤 2: 提交更改

```bash
# 添加所有更改
git add .

# 提交
git commit -m "🔖 Bump version to 2.0.1"

# 推送到 GitHub
git push origin main
```

### 步骤 3: 创建并推送 Tag

```bash
# 创建 tag（版本号前面加 v）
git tag v2.0.1

# 推送 tag 到 GitHub
git push origin v2.0.1
```

**推送 tag 后会自动触发 GitHub Actions：**
- 自动打包 `sedentary-reminder-v2.0.1.zip`
- 创建 Release 页面
- 上传 zip 到 Release

### 步骤 4: 查看 Release

1. 访问 https://github.com/AlphaZx-CJY/sedentary-reminder/releases
2. 查看最新发布的版本
3. 下载 `sedentary-reminder-v2.0.1.zip`

---

## 🏷️ Tag 命名规范

| Tag 格式 | 说明 | 示例 |
|----------|------|------|
| `vMAJOR.MINOR.PATCH` | 正式版本 | `v2.0.0`, `v2.1.0` |
| `vMAJOR.MINOR.PATCH-alpha.N` | 内测版本 | `v2.0.0-alpha.1` |
| `vMAJOR.MINOR.PATCH-beta.N` | 公测版本 | `v2.0.0-beta.1` |

---

## 🔄 本地测试打包

在推送 tag 前，可以本地测试打包：

```bash
# 运行打包脚本
./package.sh

# 或手动打包
zip -r sedentary-reminder-v2.0.1.zip \
  manifest.json background.js popup.html popup.js popup.css \
  offscreen.html notification.wav ding.wav icons/

# 验证包内容
unzip -l sedentary-reminder-v2.0.1.zip
```

---

## 📋 发布检查清单

发布前请确认：

- [ ] 版本号已在 `manifest.json` 中更新
- [ ] 所有更改已提交并推送到 GitHub
- [ ] 代码可以正常运行
- [ ] README 已更新（如有必要）
- [ ] 已创建并推送 tag
- [ ] GitHub Actions 成功完成
- [ ] Release 页面显示正常
- [ ] 可以下载并安装 zip 包

---

## 🐛 常见问题

### GitHub Actions 失败了怎么办？

1. 访问仓库的 **Actions** 标签页
2. 查看失败的工作流日志
3. 修复问题后重新推送 tag：

```bash
# 删除本地 tag
git tag -d v2.0.1

# 删除远程 tag
git push origin :refs/tags/v2.0.1

# 修复问题后重新创建 tag
git tag v2.0.1
git push origin v2.0.1
```

### 如何删除已发布的 Release？

1. 访问 [Releases 页面](https://github.com/AlphaZx-CJY/sedentary-reminder/releases)
2. 点击要删除的 Release
3. 点击右上角的 **Delete** 按钮
4. 同时删除对应的 tag：

```bash
git push origin :refs/tags/v2.0.1
```

---

## 💡 提示

- **不要频繁发布小版本**，建议积累若干修改后再发布
- **写清楚提交信息**，方便后续追踪
- **测试后再发布**，确保功能正常
- **保持版本号递增**，不要重复或回退

---

祝发布顺利！🎉
