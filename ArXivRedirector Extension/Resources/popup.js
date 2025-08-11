
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
    console.log(`Detected page type: ${pageType}`);
    
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
        document.getElementById('status').innerText = '🧩 Check widgets at each item below.';
    } else {
        document.getElementById('status').innerText = 'Unsupported page.';
    }
});
