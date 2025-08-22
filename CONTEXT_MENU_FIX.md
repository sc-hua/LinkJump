# 右键菜单修复说明

## 问题分析

### ❌ 原有问题
1. **仍显示二级菜单**: 截图显示还有"Page Redirector"父级菜单
2. **响应速度慢**: 右键时通过消息传递动态创建菜单，导致有时不显示

### 🔍 问题根源
1. **时机问题**: 用户右键 → content.js发消息 → background.js创建菜单，这个过程有延迟
2. **索引混乱**: redirectors和mirrors的索引处理有问题
3. **重复创建**: 每次右键都重新创建菜单，效率低下

## ✅ 修复方案

### 1. 改为标签页事件驱动
**之前**: 右键时通过消息动态创建菜单  
**现在**: 标签页切换/URL变化时预先创建菜单

```javascript
// Remove message-based approach
// chrome.runtime.onMessage.addListener(...);

// Use tab events for better performance
chrome.tabs.onActivated.addListener(...);
chrome.tabs.onUpdated.addListener(...);
```

### 2. 统一菜单索引系统
**之前**: `redirector-0`, `mirror-0` (索引冲突)  
**现在**: `menu-0`, `menu-1`, `menu-2`... (统一索引)

```javascript
let menuIndex = 0;
redirectors.forEach(() => {
  chrome.contextMenus.create({
    id: `menu-${menuIndex}`,
    // ...
  });
  menuIndex++;
});
```

### 3. 缓存优化
**避免重复创建**: 添加URL缓存，相同URL不重复创建菜单

```javascript
// Skip if same URL to avoid unnecessary recreation
if (url === currentUrl) return;
currentUrl = url;
```

### 4. 简化content.js
**移除消息传递**: 不再需要content.js监听右键事件发送消息

```javascript
// Before: 20+ lines of event handling
// After: Just the basic page logic
var url = window.location.href;
```

## 🎯 技术优势

1. **响应更快**: 菜单在页面加载时预先创建，右键即显示
2. **避免冲突**: 统一的菜单ID系统，索引不会混乱  
3. **减少冗余**: 相同URL不重复创建，提升性能
4. **代码更简**: 移除不必要的消息传递逻辑

## 📋 修改的文件

### Chrome
- `background.js`: 重构菜单创建逻辑，使用标签页事件
- `content.js`: 简化，移除右键事件监听

### Firefox
- `content.js`: 简化，移除右键事件监听  

### Safari
- `content.js`: 简化，移除右键事件监听

## 🎉 预期效果

- **一级菜单**: 直接显示"Open in HJFY"等选项，无二级结构
- **快速响应**: 右键立即显示菜单，无延迟
- **稳定可靠**: 避免了消息传递可能的失败情况
