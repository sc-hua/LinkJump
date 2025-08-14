var url = window.location.href;

// modify arxiv abs page
// for a exact paper, e.g. "https://arxiv.org/abs/1706.03762"
if (url.startsWith('https://arxiv.org/abs/')) {
    const ul = document.querySelector('div.full-text ul');
    const redirectors = redirectors_map.arxiv.filter(site => 
        site.prefix !== "https://arxiv.org/abs/" &&
        site.prefix !== "https://arxiv.org/pdf/"
    );

    if (ul && !ul.querySelector('.arxiv-redirectors')) { // proceed only if conditions are met
        const paperId = extractPaperId(url);
        console.log(`paperId: ${paperId}`);
        redirectors.forEach(site => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="arxiv-redirectors" href="${site.url(paperId)}">${site.name}</a>`;
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
        if (dt && !dt.querySelector('.arxiv-redirectors')) { // proceed only if conditions are met
            const paperId = dt.querySelectorAll('a')[1].id;
            redirectors.forEach(site => {
                dt.innerHTML = dt.innerHTML.trim().slice(0, -1) +
                    `, <a class="arxiv-redirectors" href="${site.url(paperId)}"> ${site.name.toLowerCase()} </a>]`;
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
    
    // 从容器中提取 arXiv ID：优先从链接 href，其次从容器文本
    function extractArxivIdFromContainer(container) {
        const link = container.querySelector('a[href*="arxiv.org/abs/"], a[href*="arxiv.org/pdf/"]');
        if (link) {
            const m = link.href.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
            if (m) return m[1];
        }
        const text = container.innerText || '';
        const t = text.match(/arXiv:([0-9]{4}\.[0-9]{4,5}(v\d+)?)/i);
        return t ? t[1] : null;
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
                tooltip.className = 'arxiv-redirector-tooltip';
                
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

    // 生成一个位于工具栏中的按钮，额外添加了 arxiv-redirector-btn 类
    function createToolbarButton(site, paperId, button_class) {
        const item = document.createElement('div');
        item.className = button_class;

        const btn = createMuiButton(site, paperId, 'arxiv-redirector-btn');
        item.appendChild(btn);
        return item;
    }

    // 通用的插入逻辑
    function insertRedirectElements(container, elements, insertAfterNode) {
        for (const element of elements) {
            if (insertAfterNode && insertAfterNode.parentNode) {
                insertAfterNode.insertAdjacentElement('afterend', element);
                insertAfterNode = element;
            } else {
                container.appendChild(element);
                insertAfterNode = element;
            }
        }
    }

    // 处理工具栏
    function processToolbars(container_class, button_class) {
        button_class = ''
        const toolbars = document.querySelectorAll(container_class);
        toolbars.forEach(toolbar => {
            if (toolbar.dataset.redirectsInjected === '1') return;

            // 自底向上最多寻找 5 层，找到包含 arXiv 线索的最近容器
            let paperId = null;
            let node = toolbar;
            for (let i = 0; i < 5 && node; i++) {
                paperId = extractArxivIdFromContainer(node);
                if (paperId) break;
                node = node.parentElement;
            }
            if (!paperId) return;

            // 找到 arXiv 按钮作为插入点
            const arxivButton = toolbar.querySelector('a[href*="arxiv.org/abs/"], a[href*="arxiv.org/pdf/"]');
            const insertAfterNode = arxivButton ? arxivButton.closest('button') : toolbar.lastElementChild;

            // 创建并插入重定向按钮
            const redirectButtons = redirectors.map(
                site => createToolbarButton(site, paperId, button_class)
            );
            insertRedirectElements(toolbar, redirectButtons, insertAfterNode);
            
            toolbar.dataset.redirectsInjected = '1';
        });
    }

    // 第一次加载页面时进行初次处理

    // 常见情况，一般是宽度大于二分之一屏幕的情况下，这些按钮会在论文标题的左侧
    // 窗口比较大的时候按钮所在的控件 Container
    processToolbars('.css-3u7l7h', 'MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium');

    // 一般是宽度小于二分之一屏幕的情况下，这些按钮会在论文标题的上面
    // 窗口比较小的时候按钮所在的控件 Container
    processToolbars('.css-16cfwlk', 'MuiBox-root');

    // 监听动态内容（React/MUI 列表可能异步加载或分页）
    const pageObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
            processToolbars('.css-3u7l7h', 'MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium');
            processToolbars('.css-16cfwlk', 'MuiBox-root');
        });
    });
    pageObserver.observe(document.body, { childList: true, subtree: true });
}