var url = window.location.href;

// modify arxiv abs page
// for a exact paper, e.g. "https://arxiv.org/abs/1706.03762"
if (url.startsWith('https://arxiv.org/abs/')) {
    const ul = document.querySelector('div.full-text ul');
    const redirectors = redirectors_map.arxiv.filter(site => 
        site.prefix !== "https://arxiv.org/abs/" &&
        site.prefix !== "https://arxiv.org/pdf/"
    );

    if (ul && !ul.querySelector('.link-jumps')) { // proceed only if conditions are met
        const paperId = extractPaperId(url);
        console.log(`paperId: ${paperId}`);
        redirectors.forEach(site => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="link-jumps" href="${site.url(paperId)}">${site.name}</a>`;
            ul.appendChild(li);
        });
    }
}

// modify arxiv list page for each arxiv item
// for a list of papers, e.g. "https://arxiv.org/list/cs.CV/recent"
if (url.startsWith('https://arxiv.org/list/')) {
    const dts = document.querySelectorAll('#articles dt');
    const redirectors = redirectors_map.arxiv.filter(site => 
        site.prefix !== "https://arxiv.org/abs/" &&
        site.prefix !== "https://arxiv.org/pdf/"
    );

    dts.forEach(dt => {
        if (dt && !dt.querySelector('.link-jumps')) { // proceed only if conditions are met
            const paperId = dt.querySelectorAll('a')[1].id;
            redirectors.forEach(site => {
                dt.innerHTML = dt.innerHTML.trim().slice(0, -1) +
                    `, <a class="link-jumps" href="${site.url(paperId)}"> ${site.name.toLowerCase()} </a>]`;
            });
        }
    });
}


// modify github page, nav-bar button
if (url.startsWith('https://github.com/')) {
    // find the top navigation bar ("Code / Issues / …")
    const nav = document.querySelector('nav.UnderlineNav-body') ||
                document.querySelector('ul.UnderlineNav-body');
    // proceed only if nav exists and redirectors haven't been added
    if (nav && !nav.querySelector('.github-redirectors')) {
        // filter out GitHub item itself
        const redirectors = redirectors_map.github.filter(site => 
            site.prefix !== "https://github.com/"
        );
        const repo = extractGithubRepo(url);
        console.log(`repo: ${repo}`);
        redirectors.forEach(site => {
            const li = document.createElement('li');
            li.className = 'd-inline-flex github-redirectors';
            li.innerHTML = `<a class="UnderlineNav-item no-wrap"
                            href="${site.url(repo)}" rel="noopener" target="_blank"> 
                                ${site.name} </a>`;
            nav.appendChild(li);
        });
    }
}

// handle scholar-inbox, modify each item, add redirect buttons
if (url.includes('https://www.scholar-inbox.com')) {
    const redirectors = redirectors_map.arxiv.filter(site => 
        site.prefix !== "https://arxiv.org/abs/" &&
        site.prefix !== "https://arxiv.org/pdf/"
    );
    
    // Extract arXiv ID from container by searching for arXiv links
    function extractArxivIdFromContainer(container) {
        // Look for arXiv links in the container
        const arxivLink = container.querySelector('a[href*="arxiv.org/abs/"], a[href*="arxiv.org/pdf/"]');
        if (arxivLink) {
            const match = arxivLink.href.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/);
            if (match) return match[1];
        }
        return null;
    }

    // 创建通用的 MUI 按钮元素
    function createMuiButton(site, paperId, extraClassName = '') {
        const btn = document.createElement('button');
        btn.className = `MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium ${extraClassName}`.trim();
        btn.type = 'button';
        btn.setAttribute('aria-label', `Open ${site.name}`);
        
        // 设置样式
        Object.assign(btn.style, {
            backgroundColor: 'transparent', border: 'none', padding: '8px', margin: '0 2px', borderRadius: '30px',
            transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', position: 'relative'
        });
        
        // 创建自定义 tooltip
        let tooltip = null;
        if (site.hover) {
            const showTooltip = () => {
                if (tooltip) return;
                
                const rect = btn.getBoundingClientRect();
                tooltip = document.createElement('div');
                tooltip.textContent = site.hover;
                tooltip.className = 'link-jump-tooltip';
                
                Object.assign(tooltip.style, {
                    position: 'fixed',
                    left: `${rect.left + rect.width / 2}px`,
                    top: `${rect.top - 8}px`,
                    transform: 'translate(-50%, -100%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: '999999',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                });
                
                document.body.appendChild(tooltip);
            };
            
            const hideTooltip = () => {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            };
            
            btn.addEventListener('mouseenter', showTooltip);
            btn.addEventListener('mouseleave', hideTooltip);
        }
        
        // 添加 hover 效果
        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'transparent';
        });
        
        // 添加点击事件
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(site.url(paperId), '_blank', 'noopener');
        });

        // 添加内容链接
        const link = document.createElement('a');
        link.className = 'MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways';
        link.href = site.url(paperId);
        link.target = '_blank';
        link.rel = 'noopener';

        // 如果有 logo，使用图片；否则使用文本
        if (site.logo) {
            const img = document.createElement('img');
            img.src = site.logo;
            img.alt = site.name;
            Object.assign(img.style, {
                width: '20px',
                height: '20px',
                objectFit: 'contain',
                display: 'block'
            });
            link.appendChild(img);
        } else {
            link.textContent = site.name;
        }

        // 添加 MUI TouchRipple 效果容器
        const ripple = document.createElement('span');
        ripple.className = 'MuiTouchRipple-root css-w0pj6f';

        btn.appendChild(link);
        btn.appendChild(ripple);
        return btn;
    }

    // Create button for css-16cfwlk container (MuiBox-root wrapper)
    function createMuiBoxButton(site, paperId) {
        const wrapper = document.createElement('div');
        wrapper.className = 'MuiBox-root css-1elqj97 link-jump-div';

        const btn = createMuiButton(site, paperId, 'link-jump-button');
        wrapper.appendChild(btn);
        return wrapper;
    }

    // Create button for css-3u7l7h container (direct button)
    function createDirectButton(site, paperId) {
        return createMuiButton(site, paperId, 'link-jump-button');
    }

    function processPaperItems() {
        // infinite-scroll-component arxiv item list
        const paperDivs = document.querySelectorAll('div.css-lam9o6[id^="paper"]');
        
        paperDivs.forEach(paperDiv => {
            // Skip if redirects have already been injected
            if (paperDiv.dataset.arxivRedirectsInjected === '1') return;
            
            // Extract arXiv ID from links within the paper div
            const paperId = extractArxivIdFromContainer(paperDiv);
            if (!paperId) return;
            
            // Handle css-16cfwlk container (MuiBox-root buttons)
            const smallContainer = paperDiv.querySelector('.css-16cfwlk');
            if (smallContainer) {
                redirectors.forEach(site => {
                    const btn = createMuiBoxButton(site, paperId);
                    smallContainer.appendChild(btn);
                });
            }
            
            // Handle css-3u7l7h container (direct buttons)
            const largeContainer = paperDiv.querySelector('.css-3u7l7h');
            if (largeContainer) {
                redirectors.forEach(site => {
                    const btn = createDirectButton(site, paperId);
                    largeContainer.appendChild(btn);
                });
            }
            
            paperDiv.dataset.arxivRedirectsInjected = '1';
        });
    }

    // Initial processing and setup observer for dynamic content
    processPaperItems();
    
    // Monitor dynamic content changes
    const observer = new MutationObserver(() => {
        requestAnimationFrame(() => {
            processPaperItems();
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}