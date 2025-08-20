# LinkJump 网页界面

[EN](./README.md) | 中文

一个独立的网页界面，提供URL重定向功能，允许用户输入URL并发现替代链接，支持自定义规则。

## 功能特色

- 🔗 **URL分析**: 输入任何支持的URL，即时获取替代链接
- ⚙️ **自定义规则**: 添加您自己的重定向模式和镜像站点
- 💾 **持久存储**: 自定义规则保存在浏览器本地
- 📥📤 **导入/导出**: 备份和分享您的自定义规则为JSON文件
- 🎨 **主题支持**: 简洁响应式界面，支持自动深色/浅色主题
- ⚡ **实时处理**: 无需页面刷新的即时URL分析
- 🌐 **跨平台**: 在任何现代网页浏览器上运行
- 🚀 **简易部署**: 可部署到GitHub Pages或任何静态托管服务

## 支持的URL

### 内置支持
- **ArXiv论文**: `https://arxiv.org/abs/1706.03762`
- **GitHub仓库**: `https://github.com/user/repository`
- **Hugging Face**: `https://huggingface.co/models`

### 自定义规则
- 添加您自己的URL模式和自定义重定向站点
- 为任何域名创建镜像站点映射
- 所有自定义规则本地存储，会话间持久保存

## 使用方法

### 基本使用
1. 在网页浏览器中打开网页界面（如`docs/index.html`）
2. 在输入框中输入URL
3. 点击"分析"按钮或按Enter键
4. 查看并点击生成的替代链接

### 自定义规则管理
1. 点击设置按钮（⚙️）打开规则管理器
2. **添加自定义重定向器**: 为新的站点类型定义模式
   - 站点类型: URL类型的标识符（如"my-site"）
   - 名称: 重定向器的显示名称
   - URL前缀: 识别此站点类型的基础URL
   - 重定向模板: 带有`{id}`占位符的URL模式
3. **添加镜像站点**: 为现有站点创建镜像映射
   - 原始URL: 原始站点的基础URL
   - 镜像URL: 镜像站点的基础URL
   - 显示名称: 镜像站点的显示方式
4. **导入/导出**: 备份和分享您的规则
   - 导出创建包含所有自定义规则的JSON文件
   - 导入从JSON文件加载规则
   - 清除删除所有自定义规则

### 自定义规则示例

**自定义重定向器示例:**
- 站点类型: `custom-papers`
- 名称: `我的论文站点`
- URL前缀: `https://mysite.com/paper/`
- 重定向模板: `https://alternative.com/view/{id}`

**镜像站点示例:**
- 原始URL: `https://slowsite.com`
- 镜像URL: `https://fastmirror.com`
- 显示名称: `到快速镜像`

### GitHub Pages 部署
1. 将`docs/`文件夹内容推送到您的GitHub Pages仓库
2. 在仓库设置中启用GitHub Pages
3. 通过`https://username.github.io/repository-name/`访问
4. 界面将立即可用，包含所有功能

## 文件结构

```
docs/
├── index.html          # 带设置模态框的主HTML页面
├── style.css           # 支持深色/浅色主题和模态框的样式
├── utils.js            # 核心URL处理工具
├── config-manager.js   # 配置文件管理和本地存储
├── rules-engine.js     # URL分析和重定向逻辑引擎
├── ui-controller.js    # UI交互和DOM管理
├── app.js              # 主应用协调器
├── theme-manager.js    # 主题管理和系统偏好检测
├── icon-config.js      # 图标配置和管理
├── icon-download.js    # 图标下载功能
└── README.md           # 英文文档
```

## 架构设计

应用采用模块化架构，职责分离清晰：

- **ConfigManager**: 处理配置持久化和本地文件存储
- **RulesEngine**: 处理URL分析和管理重定向规则
- **UIController**: 管理所有DOM交互和用户界面
- **LinkJumpApp**: 连接所有组件的主协调器

## 技术细节

### 配置存储
- **主要存储**: JSON配置文件（用户导出/导入）
- **缓存层**: 浏览器localStorage用于临时缓存
- **自动备份**: 页面卸载时自动保存到缓存
- **文件优先方式**: 用户明确控制其配置文件

### 配置工作流程
1. **初始加载**: 如果可用，应用从localStorage缓存加载
2. **用户更改**: 所有更改立即缓存到localStorage
3. **导出**: 用户可以将当前配置下载为JSON文件
4. **导入**: 用户可以从本地JSON文件加载配置
5. **持久化**: 配置通过localStorage缓存持久保存

### 规则格式
自定义规则以JSON格式导出/导入：
```json
{
  "customRedirectors": {
    "site-type": [
      {
        "name": "站点名称",
        "prefix": "https://site.com/",
        "template": "https://redirect.com/{id}",
        "hover": "在站点名称上查看",
        "isCustom": true
      }
    ]
  },
  "customMirrors": {
    "https://original.com": [
      {
        "mirror": "https://mirror.com",
        "hover": "到镜像站点",
        "isCustom": true
      }
    ]
  },
  "version": "1.0",
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

### 最佳实践
- **定期导出**: 定期导出您的配置进行备份
- **文件组织**: 保持配置文件有序并清晰命名
- **版本控制**: 配置文件可以进行版本控制
- **分享**: 通过分享配置文件轻松分享规则集

## 浏览器兼容性

- 支持ES6+的现代浏览器
- 需要File API支持导入/导出功能
- 需要LocalStorage支持缓存功能
- 移动端和桌面端的响应式设计
- 基于系统偏好的深色/浅色主题

## 许可证

本项目采用开源许可证。详情请参阅项目根目录的许可证文件。

## 贡献

欢迎贡献！请随时提交问题和增强请求。

---

<div align="center">
  如果这个项目对您有帮助或启发，请给我们一个 ⭐️
</div>
