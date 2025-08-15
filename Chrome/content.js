var url = window.location.href;

// modify arxiv abs page, for an exact paper, e.g. "https://arxiv.org/abs/1706.03762"
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
            const a = document.createElement('a');
            a.className = 'link-jumps';
            a.href = site.url(paperId);
            a.textContent = site.name;
            li.appendChild(a);
            ul.appendChild(li);
        });
    }
}

// modify arxiv list page for each arxiv item, for a list of papers, e.g. "https://arxiv.org/list/cs.CV/recent"
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
                const a = document.createElement('a');
                a.className = 'link-jumps';
                a.href = site.url(paperId);
                a.textContent = ` ${site.name.toLowerCase()} `;
                
                // Remove the closing bracket and add the link with new bracket
                dt.innerHTML = dt.innerHTML.trim().slice(0, -1) + ', ';
                dt.appendChild(a);
                dt.appendChild(document.createTextNode(']'));
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
            
            const a = document.createElement('a');
            a.className = 'UnderlineNav-item no-wrap';
            a.href = site.url(repo);
            a.rel = 'noopener';
            a.target = '_blank';
            a.textContent = ` ${site.name} `;
            
            li.appendChild(a);
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
    
    // Extract arXiv ID from container
    function extractArxivIdFromContainer(container) {
        const arxivLink = container.querySelector('a[href*="arxiv.org/abs/"], a[href*="arxiv.org/pdf/"]');
        const match = arxivLink?.href.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/);
        return match?.[1] || null;
    }

    // Button and tooltip styles
    const BUTTON_STYLES = {
        backgroundColor: 'transparent', border: 'none', padding: '8px', margin: '0 2px', 
        borderRadius: '30px', transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', 
        position: 'relative'
    };

    const TOOLTIP_STYLES = {
        position: 'fixed', transform: 'translate(-50%, -100%)', backgroundColor: 'rgba(97, 97, 97, 0.92)',
        color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6875rem', margin: '0',
        overflowWrap: 'break-word', zIndex: '999999', pointerEvents: 'none',
    };

    // Create MUI-style redirect button
    function createButton(site, paperId, needWrapper = false) {
        const btn = document.createElement('button');
        btn.className = `MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium link-jump-button`;
        btn.type = 'button';
        btn.setAttribute('aria-label', `Open ${site.name}`);
        Object.assign(btn.style, BUTTON_STYLES);

        let tooltip = null;

        // Combined mouse event handler
        const handleMouse = (isEnter) => {
            btn.style.backgroundColor = isEnter ? 'rgba(0, 0, 0, 0.04)' : 'transparent';
            
            if (!site.hover) return;
            
            if (isEnter && !tooltip) {
                const rect = btn.getBoundingClientRect();
                tooltip = document.createElement('div');
                tooltip.textContent = site.hover;
                tooltip.className = 'link-jump-tooltip';
                Object.assign(tooltip.style, TOOLTIP_STYLES, {
                    left: `${rect.left + rect.width / 2}px`,
                    top: `${rect.top - 8}px`
                });
                document.body.appendChild(tooltip);
            } else if (!isEnter && tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        };

        btn.addEventListener('mouseenter', () => handleMouse(true));
        btn.addEventListener('mouseleave', () => handleMouse(false));
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(site.url(paperId), '_blank', 'noopener');
        });

        // Create link content
        const link = document.createElement('a');
        link.className = 'MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineAlways';
        link.href = site.url(paperId);
        link.target = '_blank';
        link.rel = 'noopener';

        if (site.logo) {
            const img = document.createElement('img');
            Object.assign(img, { src: site.logo, alt: site.name });
            Object.assign(img.style, { width: '20px', height: '20px', objectFit: 'contain', display: 'block' });
            link.appendChild(img);
        } else {
            link.textContent = site.name;
        }

        btn.appendChild(link);
        btn.appendChild(Object.assign(document.createElement('span'), { className: 'MuiTouchRipple-root css-w0pj6f' }));

        // Return with or without wrapper
        if (needWrapper) {
            const wrapper = document.createElement('div');
            wrapper.className = 'MuiBox-root css-1elqj97 link-jump-div';
            wrapper.appendChild(btn);
            return wrapper;
        }
        return btn;
    }

    function processPaperItems() {
        // Process infinite-scroll paper items
        const paperDivs = document.querySelectorAll('div.css-lam9o6[id^="paper"]');
        
        paperDivs.forEach(paperDiv => {
            // Skip if already processed
            if (paperDiv.dataset.arxivRedirectsInjected === '1') return;
            
            const paperId = extractArxivIdFromContainer(paperDiv);
            if (!paperId) return;
            
            // Add buttons to different containers
            const smallContainer = paperDiv.querySelector('.css-16cfwlk');
            const largeContainer = paperDiv.querySelector('.css-3u7l7h');
            
            redirectors.forEach(site => {
                if (smallContainer) smallContainer.appendChild(createButton(site, paperId, true));
                if (largeContainer) largeContainer.appendChild(createButton(site, paperId, false));
            });
            
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