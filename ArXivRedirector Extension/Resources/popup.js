
const redirectors_map = {
  arxiv: [
    { name: "HJFY", url: id => `https://hjfy.top/arxiv/${id}` },
    { name: "alphaXiv", url: id => `https://www.alphaxiv.org/abs/${id}` },
    { name: "Cool Papers", url: id => `https://papers.cool/arxiv/${id}` },
    { name: "arXiv", url: id => `https://arxiv.org/abs/${id}` },
    { name: "pdf", url: id => `https://arxiv.org/pdf/${id}` },
    { name: "Hugging Face", url: id => `https://huggingface.co/papers/${id}` },
  ],
  github: [
    { name: "GitHub", url: repo => `https://github.com/${repo}` },
    { name: "DeepWiki", url: repo => `https://deepwiki.com/${repo}` },
    { name: "Z-Read", url: repo => `https://zread.ai/${repo}` },
  ],
  scholar: [
    { name: "HJFY", url: id => `https://hjfy.top/arxiv/${id}` },
    { name: "alphaXiv", url: id => `https://www.alphaxiv.org/abs/${id}` },
    { name: "Cool Papers", url: id => `https://papers.cool/arxiv/${id}` },
    { name: "arXiv", url: id => `https://arxiv.org/abs/${id}` },
    { name: "pdf", url: id => `https://arxiv.org/pdf/${id}` },
    { name: "Hugging Face", url: id => `https://huggingface.co/papers/${id}` },
  ]
};

function extractPaperId(url) {
  const match = url.match(/[0-9]{4}\.[0-9]{4,5}(v\d+)?/);
  return match ? match[0] : null;
}

function extractGithubRepo(url) {
  const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/?#]+)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

function extractArxivFromScholar(tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: () => {
      // 在 Scholar 页面中查找 arXiv ID
      const arxivMatch = document.body.innerText.match(/arXiv:([0-9]{4}\.[0-9]{4,5}(v\d+)?)/);
      return arxivMatch ? arxivMatch[1] : null;
    }
  }, (results) => {
    if (results && results[0]) {
      callback(results[0].result);
    } else {
      callback(null);
    }
  });
}

function detectPageType(url) {
  if (url.startsWith('https://arxiv.org/')) {
    return 'arxiv';
  } else if (url.startsWith('https://github.com/')) {
    return 'github';
  } else if (url.startsWith('https://www.scholar-inbox.com')) {
    return 'scholar';
  }
  return null;
}

function createButtons(redirectors, identifier, tabId) {
    const container = document.getElementById('buttons');
    container.innerHTML = ''; // 清空现有按钮
    
    for (const site of redirectors) {
        const btn = document.createElement('button');
        btn.innerText = `${site.name}`;
        btn.onclick = (e) => {
            const targetUrl = site.url(identifier);
            if (e.metaKey) {  // ⌘, command key, create another new tab
                chrome.tabs.create({ url: targetUrl });
            } else {  // simple click, update current tab
                chrome.tabs.update(tabId, { url: targetUrl });
            }
        };
        container.appendChild(btn);
    }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  const pageType = detectPageType(activeTab.url);
  
  if (pageType === 'arxiv') {
    const paperId = extractPaperId(activeTab.url);
    if (paperId) {
      createButtons(redirectors_map.arxiv, paperId, activeTab.id);
      document.getElementById('status').innerText = `${paperId}`;
    } else {
      document.getElementById('status').innerText = 'No arXiv id found.';
    }
  } else if (pageType === 'github') {
    const repo = extractGithubRepo(activeTab.url);
    if (repo) {
      createButtons(redirectors_map.github, repo, activeTab.id);
      document.getElementById('status').innerText = `${repo}`;
    } else {
      document.getElementById('status').innerText = 'No GitHub repo found.';
    }
  } else if (pageType === 'scholar') {
    extractArxivFromScholar(activeTab.id, (paperId) => {
      if (paperId) {
        createButtons(redirectors_map.scholar, paperId, activeTab.id);
        document.getElementById('status').innerText = `Scholar arXiv: ${paperId}`;
      } else {
        document.getElementById('status').innerText = 'No arXiv id in Scholar page.';
      }
    });
  } else {
    document.getElementById('status').innerText = 'Unsupported page.';
  }
});
