# 右键菜单优化说明

## 修改内容

### ✅ 1. 改为一级菜单结构
**之前**: "Open in..." > "HJFY" (二级菜单)  
**现在**: "Open in HJFY" (一级菜单)

- 移除了父级菜单"Open in..."
- 直接显示"Open in HJFY"、"Open in alphaXiv"等选项
- 用户体验更直接，减少点击层级

### ✅ 2. 集成镜像功能
**新增功能**: 自动检测并提供镜像站点选项

支持的镜像：
- `github.com` → `kkgithub.com`、`bgithub.xyz`
- `huggingface.co` → `hf-mirror.com`

### ✅ 3. 智能菜单显示
根据右键的链接类型，动态显示相应选项：

**arXiv链接**: 显示HJFY、alphaXiv、Cool Papers等
**GitHub链接**: 显示DeepWiki、Z-Read + kkgithub、bgithub镜像
**HuggingFace链接**: 显示hf-mirror镜像

## 技术实现

### 核心改进
1. **`getAvailableMirrors()`函数**: 检测URL并返回可用镜像
2. **统一菜单管理**: redirectors和mirrors合并到同一个数组
3. **类型标识**: 添加`type`字段区分redirector和mirror
4. **动态URL替换**: 镜像功能通过域名替换实现

### 代码结构
```javascript
// 检测可用的重定向服务
const redirectors = getAvailableRedirectors(url);
// 检测可用的镜像站点  
const mirrors = getAvailableMirrors(url);
// 合并并创建一级菜单
currentMenus = [...redirectors, ...mirrors];
```

### 菜单命名规则
- **重定向服务**: `"Open in ${site.name}"` (如: "Open in HJFY")
- **镜像站点**: `"${mirror.hover}"` (如: "To kkgithub.com")

## 使用效果

### 场景1: arXiv论文页面
右键论文链接 → 直接显示:
- "Open in HJFY"
- "Open in alphaXiv"  
- "Open in Cool Papers"
- ...

### 场景2: GitHub仓库页面
右键仓库链接 → 直接显示:
- "Open in DeepWiki"
- "Open in Z-Read"
- "To kkgithub.com"
- "To bgithub.xyz"

### 场景3: HuggingFace页面
右键模型链接 → 直接显示:
- "To hf-mirror.com"

## 优化效果
1. **减少点击层级**: 从2级菜单变为1级菜单
2. **功能增强**: 新增镜像站点支持
3. **智能检测**: 自动识别链接类型并显示相应选项
4. **保持轻量**: 代码简洁高效，无冗余逻辑
