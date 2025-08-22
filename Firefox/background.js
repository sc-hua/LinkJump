// Context menu handler for Page Redirector extension - Firefox version

// Note: In Firefox Manifest V2, we need to redefine maps since importScripts 
// doesn't work the same way. This keeps the code working across browsers.
const redirectors_map = {
  github: [
    {
      name: "GitHub",
      prefix: "https://github.com/",
      url: repo => `https://github.com/${repo}`,
    },
    {
      name: "DeepWiki", 
      prefix: "https://deepwiki.com/",
      url: repo => `https://deepwiki.com/${repo}`,
    },
    {
      name: "Z-Read",
      prefix: "https://zread.ai/",
      url: repo => `https://zread.ai/${repo}`,
    },
  ],
  arxiv: [
    {
      name: "HJFY",
      prefix: "https://hjfy.top/arxiv/",
      url: id => `https://hjfy.top/arxiv/${id}`,
    },
    {
      name: "alphaXiv",
      prefix: "https://www.alphaxiv.org/abs/",
      url: id => `https://www.alphaxiv.org/abs/${id}`,
    },
    {
      name: "Cool Papers",
      prefix: "https://papers.cool/arxiv/",
      url: id => `https://papers.cool/arxiv/${id}`,
    },
    {
      name: "arXiv",
      prefix: "https://arxiv.org/abs/",
      url: id => `https://arxiv.org/abs/${id}`,
    },
    {
      name: "pdf",
      prefix: "https://arxiv.org/pdf/",
      url: id => `https://arxiv.org/pdf/${id}`,
    },
    {
      name: "Hugging Face",
      prefix: "https://huggingface.co/papers/",
      url: id => `https://huggingface.co/papers/${id}`,
    }
  ]
};

const mirrors_map = {
  // main mirrors
  "https://huggingface.co": [
    {
      mirror: "https://hf-mirror.com",
      hover: "To hf-mirror.com"
    }
  ],
  "https://github.com": [
    {
      mirror: "https://kkgithub.com",
      hover: "To kkgithub.com"
    },
    {
      mirror: "https://bgithub.xyz",
      hover: "To bgithub.xyz"
    }
  ]
};

// Helper functions
function extractPaperId(url) {
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/);
  return match ? match[1] : null;
}

function extractGithubRepo(url) {
  const match = url.match(/github\.com\/([^\/]+\/[^\/\?#]+)/);
  return match ? match[1] : null;
}

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

// Store current context menu state
let currentMenus = [];
let currentUrl = '';

// Create context menus for current page
function createContextMenus(url) {
  // Skip if same URL to avoid unnecessary recreation
  if (url === currentUrl) return;
  currentUrl = url;
  
  // Remove existing menus
  browser.contextMenus.removeAll().then(() => {
    currentMenus = [];
    
    const redirectors = getAvailableRedirectors(url);
    const mirrors = getAvailableMirrors(url);
    
    if (redirectors.length === 0 && mirrors.length === 0) return;
    
    let menuIndex = 0;
    
    // Create direct menu items for redirectors
    redirectors.forEach((redirector) => {
      browser.contextMenus.create({
        id: `menu-${menuIndex}`,
        title: `Open in ${redirector.name}`,
        contexts: ['link', 'selection']
      });
      currentMenus[menuIndex] = redirector;
      menuIndex++;
    });
    
    // Create direct menu items for mirrors
    mirrors.forEach((mirror) => {
      browser.contextMenus.create({
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
browser.contextMenus.onClicked.addListener((info, tab) => {
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
      browser.tabs.create({ 
        url: targetUrl,
        active: false // Open in background tab
      });
    }
  }
});

// Update context menus when tab changes
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId).then((tab) => {
    if (tab.url) {
      createContextMenus(tab.url);
    }
  });
});

// Update context menus when URL changes
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    createContextMenus(changeInfo.url);
  }
});

// Initialize context menus on startup
browser.runtime.onStartup.addListener(() => {
  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    if (tabs[0] && tabs[0].url) {
      createContextMenus(tabs[0].url);
    }
  });
});

browser.runtime.onInstalled.addListener(() => {
  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    if (tabs[0] && tabs[0].url) {
      createContextMenus(tabs[0].url);
    }
  });
});
