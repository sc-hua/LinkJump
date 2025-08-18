
function createRedirectButtons(container, redirectors, identifier, tabId) {
    for (const site of redirectors) {
        const btn = document.createElement('button');
        btn.innerText = `${site.name}`;
        btn.onclick = (e) => {
            const targetUrl = site.url(identifier);
            if (e.metaKey || e.ctrlKey) {  // ⌘ (Mac) or Ctrl (Windows/Linux), create another new tab
                chrome.tabs.create({ url: targetUrl });
            } else {  // simple click, update current tab
                chrome.tabs.update(tabId, { url: targetUrl });
            }
        };
        container.appendChild(btn);
    }
}

function createMirrorButtons(container, mirrors_map, currentUrl, tabId) {
    let has_mirrors = false;
    for (const [prefix, mirrors] of Object.entries(mirrors_map)) {
        if (currentUrl.startsWith(prefix)) {
            if (container.innerHTML !== '') { // add divider
                const divider = document.createElement('hr');
                divider.style.width = '120px';
                divider.style.margin = '6px auto';
                container.appendChild(divider);
            }

            // create mirror button
            for (const mirror of mirrors) {
                const mirrorBtn = document.createElement('button');
                mirrorBtn.innerText = mirror.hover;
                mirrorBtn.onclick = (e) => {
                    const targetUrl = currentUrl.replace(prefix, mirror.mirror);
                    if (e.metaKey || e.ctrlKey) {  // ⌘ (Mac) or Ctrl (Windows/Linux), create another new tab
                        chrome.tabs.create({ url: targetUrl });
                    } else {  // simple click, update current tab
                        chrome.tabs.update(tabId, { url: targetUrl });
                    }
                };
                container.appendChild(mirrorBtn);
                has_mirrors = true;
            }
        }
    }
    return has_mirrors;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const container = document.getElementById('buttons');
    const pageType = detectPageType(activeTab.url);

    let inner_text = '';
    container.innerHTML = ''; // 清空现有按钮

    // previous redirect logic
    if (pageType === 'arxiv') {
        inner_text = 'No arXiv id found.'
        const paperId = extractPaperId(activeTab.url);
        if (paperId) {
            // Filter out redirectors that match the current URL
            const redirectors = redirectors_map.arxiv.filter(site => !activeTab.url.startsWith(site.prefix));
            createRedirectButtons(container, redirectors, paperId, activeTab.id);
            inner_text = `${paperId}`;
        }
    }
    if (pageType === 'github') {
        inner_text = 'No GitHub repo found.';
        const repo = extractGithubRepo(activeTab.url);
        if (repo) {
            // Filter out redirectors that match the current URL
            const redirectors = redirectors_map.github.filter(site => !activeTab.url.startsWith(site.prefix));
            createRedirectButtons(container, redirectors, repo, activeTab.id);
            inner_text = `${repo}`;
        }
    }
    if (pageType === 'scholar') { 
        inner_text = '🧩 Check widgets at each item below.'; 
    }

    // create mirror redirect
    if (createMirrorButtons(container, mirrors_map, activeTab.url, activeTab.id)) {
        inner_text = inner_text || 'Page mirrors';
    } 

    inner_text = inner_text || 'Unsupported page.';
    document.getElementById('status').innerText = inner_text;
});
