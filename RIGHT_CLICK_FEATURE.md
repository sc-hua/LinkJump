# 右键菜单功能说明

## 新增功能
为浏览器扩展添加了右键菜单功能，支持在右键点击链接或选中文本时快速跳转到对应服务。

## 功能特性
1. **智能检测**: 自动识别arXiv论文ID和GitHub仓库链接
2. **动态菜单**: 根据检测到的链接类型动态生成相应的跳转选项
3. **支持场景**:
   - 右键点击arXiv论文链接 → 显示HJFY、alphaXiv、Cool Papers等选项
   - 右键点击GitHub仓库链接 → 显示DeepWiki、Z-Read等选项  
   - 选中包含链接的文本后右键 → 自动提取URL并显示对应选项

## 修改文件

### Chrome扩展 (/Chrome/)
- `manifest.json`: 添加contextMenus权限和background script
- `background.js`: 新建，处理右键菜单创建和点击事件
- `content.js`: 添加右键事件监听，检测链接和选中文本

### Firefox扩展 (/Firefox/)  
- `manifest.json`: 添加contextMenus权限和background script (Manifest V2)
- `background.js`: 新建，使用browser API适配Firefox
- `content.js`: 添加右键事件监听，使用browser.runtime API

### Safari扩展 (/ArXivRedirector Extension/Resources/)
- `manifest.json`: 添加contextMenus权限和background service worker
- `background.js`: 新建，使用chrome API (Safari兼容)
- `content.js`: 添加右键事件监听

## 技术要点
1. **轻量设计**: 最小化代码冗余，复用现有的URL解析逻辑
2. **跨浏览器兼容**: 针对不同浏览器API进行适配
3. **性能优化**: 
   - 使用事件代理，避免频繁添加/删除监听器
   - 定时清理过期的上下文数据
   - 后台标签页打开，不干扰用户当前操作
4. **用户体验**: 菜单项根据实际可用的跳转服务动态生成

## 使用方法
1. 在支持的网站上右键点击arXiv或GitHub链接
2. 从"Open in..."子菜单中选择目标服务
3. 新标签页将在后台打开对应的跳转链接

## 注意事项
- 保持与原有页面注入功能的兼容性
- 菜单仅在检测到有效链接时显示
- 支持从选中文本中提取URL进行跳转
