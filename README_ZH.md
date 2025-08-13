# 灵活且可定制的 URL 重定向工具

[English](./README.md) | 中文

## 支持的浏览器
- <img src="./logos/chrome.svg" width="20" height="20" style="vertical-align:top;"/> Chrome: 主要代码请查看[这里](./Chrome/README.md)

- <img src="./logos/firefox.svg" alt="Firefox" width="20" height="20" style="vertical-align:top;"/> Firefox: 待开发

- <img src="./logos/microsoft-edge-96.png" alt="Edge" width="20" height="20" style="vertical-align:top;"/> Edge: 待开发

- <img src="./logos/safari-200.png" alt="Safari" width="20" height="20" style="vertical-align:top;"/> Safari: 详见下方 👇👇

## Safari 扩展

Safari 和 Chrome 扩展共享几乎完全相同的代码库，仅有极少差异：

### 完全相同的文件（100% 相同代码）：
- `content.js` - 页面操作的核心功能
- `popup.js` - 扩展弹出界面逻辑  
- `popup.html` - 扩展弹出界面结构
- `popup.css` - 扩展弹出界面样式
- `utils.js` - 共享的工具函数和配置

### 主要差异：

**1. Manifest 结构 (`manifest.json`)**
- **Safari**: 多种图标尺寸（`48px`, `96px`, `128px`, `256px`, `512px`）
- **Safari**: 图标存储在 `images/` 文件夹中，包含 SVG 工具栏图标
- **Safari**: 使用 `"scripting"` 权限（Safari 特有）
- **Chrome**: 单一 `128px` 图标文件 `icon.png`
- **Chrome**: 使用 `"activeTab"` 权限（Chrome 特有）

**2. 目录结构**
- **仅 Safari 有**: `images/` 多格式图标文件夹
- **仅 Chrome 有**: 单一 `icon.png` 文件

### 迁移说明：
代码迁移几乎是 1:1 的，证明了优秀的跨浏览器兼容性。主要工作集中在 manifest 配置而非代码更改。两个扩展都支持：
- arXiv 论文重定向
- GitHub 仓库替代方案  
- Scholar Inbox 集成
- 相同的用户界面和功能

### 优化建议：
Chrome 扩展中的 `background.js` 文件在 manifest 中未被引用且无任何用途，可以安全删除以清理代码库。

## 功能特性

### 支持的网站：
1. **arXiv** (`arxiv.org`)
   - 单篇论文页面重定向
   - 论文列表页面重定向
   - 支持的重定向目标：
     - HJFY（中文翻译版本）
     - alphaXiv（AI 增强阅读）
     - Cool Papers（论文可视化）
     - Hugging Face Papers

2. **GitHub** (`github.com`)
   - 仓库页面导航栏增强
   - 支持的重定向目标：
     - DeepWiki（AI 驱动的代码解析）
     - Z-Read（代码阅读助手）

3. **Scholar Inbox** (`scholar-inbox.com`)
   - 动态内容集成
   - MUI 风格按钮集成
   - 工具栏和容器双重集成

### 用户界面特性：
- **智能页面检测**：自动识别当前页面类型
- **键盘快捷键支持**：
  - 普通点击：当前标签页跳转
  - Cmd/Ctrl + 点击：新标签页打开
- **深色模式支持**：自适应系统主题
- **Tooltip 提示**：鼠标悬停显示详细信息

## 技术架构

### 代码组织：
```
├── utils.js          # 工具函数库和配置
├── content.js        # 内容脚本（页面注入）
├── popup.js          # 弹出窗口逻辑
├── popup.html        # 弹出窗口结构  
├── popup.css         # 弹出窗口样式
└── manifest.json     # 扩展配置文件
```

### 核心功能模块：
1. **页面检测器**：`detectPageType()` - 识别当前网站类型
2. **ID 提取器**：`extractPaperId()`, `extractGithubRepo()` - 提取标识符
3. **重定向器映射**：`redirectors_map` - 配置所有支持的重定向目标
4. **动态监听**：`MutationObserver` - 监听页面动态内容变化

## 开发资源

- Mozilla WebExtension 开发教程（Firefox）：[中文](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions) | [英文](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- Chrome 扩展开发文档：[官方文档](https://developer.chrome.com/docs/extensions/)
- Safari 扩展开发指南：[Apple 开发者文档](https://developer.apple.com/documentation/safariservices/safari_web_extensions)

## 许可证

本项目采用开源许可证，具体详情请查看 LICENSE 文件。
