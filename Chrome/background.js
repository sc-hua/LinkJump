// Context menu handler for Page Redirector extension

// Import utils for redirectors map and helper functions
importScripts('utils.js');

// Store current context menu state
let currentMenus = [];
let currentUrl = '';

// Get available redirectors for a URL
function getAvailableRedirectors(url) {
  const paperId = extractPaperId(url);
  if (paperId) {
    return redirectors_map.arxiv.map(site => ({
      ...site,
      targetUrl: site.url(paperId),
      type: 'redirector'
    }));
  }
  
  const githubRepo = extractGithubRepo(url);
  if (githubRepo) {
    return redirectors_map.github.map(site => ({
      ...site,
      targetUrl: site.url(githubRepo),
      type: 'redirector'
    }));
  }
  
  return [];
}

// Get available mirrors for a URL
function getAvailableMirrors(url) {
  for (const [domain, mirrorList] of Object.entries(mirrors_map)) {
    if (url.startsWith(domain)) {
      return mirrorList.map(mirror => ({
        ...mirror,
        targetUrl: url.replace(domain, mirror.mirror),
        type: 'mirror'
      }));
    }
  }
  return [];
}

// Create context menus for current page
function createContextMenus(url) {
  // Skip if same URL to avoid unnecessary recreation
  if (url === currentUrl) return;
  currentUrl = url;
  
  // Remove existing menus
  chrome.contextMenus.removeAll(() => {
    currentMenus = [];
    
    const redirectors = getAvailableRedirectors(url);
    const mirrors = getAvailableMirrors(url);
    
    if (redirectors.length === 0 && mirrors.length === 0) return;
    
    let menuIndex = 0;
    
    // Create direct menu items for redirectors
    redirectors.forEach((redirector) => {
      chrome.contextMenus.create({
        id: `menu-${menuIndex}`,
        title: `Open in ${redirector.name}`,
        contexts: ['link', 'selection']
      });
      currentMenus[menuIndex] = redirector;
      menuIndex++;
    });
    
    // Create direct menu items for mirrors
    mirrors.forEach((mirror) => {
      chrome.contextMenus.create({
        id: `menu-${menuIndex}`,
        title: `${mirror.hover || 'Open mirror'}`,
        contexts: ['link', 'selection']
      });
      currentMenus[menuIndex] = mirror;
      menuIndex++;
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuId = info.menuItemId;
  if (!menuId.startsWith('menu-')) return;
  
  const index = parseInt(menuId.split('-')[1]);
  if (index < 0 || index >= currentMenus.length) return;
  
  const menuItem = currentMenus[index];
  let targetUrl = null;
  
  // Get URL from link or selection
  let sourceUrl = info.linkUrl;
  if (!sourceUrl && info.selectionText) {
    const urlMatch = info.selectionText.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      sourceUrl = urlMatch[1];
    }
  }
  
  if (sourceUrl) {
    if (menuItem.type === 'mirror') {
      // Calculate mirror URL dynamically
      for (const domain of Object.keys(mirrors_map)) {
        if (sourceUrl.startsWith(domain)) {
          targetUrl = sourceUrl.replace(domain, menuItem.mirror);
          break;
        }
      }
    } else {
      // Use pre-calculated redirector URL
      targetUrl = menuItem.targetUrl;
    }
    
    if (targetUrl) {
      chrome.tabs.create({ 
        url: targetUrl,
        active: false // Open in background tab
      });
    }
  }
});

// Remove message listener - we'll use tab events for better performance
// chrome.runtime.onMessage.addListener(...);

// Update context menus when tab changes or updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      createContextMenus(tab.url);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    createContextMenus(changeInfo.url);
  }
});

// Initialize context menus on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      createContextMenus(tabs[0].url);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      createContextMenus(tabs[0].url);
    }
  });
});
