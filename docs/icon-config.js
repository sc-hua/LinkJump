// Icon configuration - centralized icon management
const ICON_CONFIG = {
    // Icon sources - switch between different icon sets
    // urls, local svg, emoji, text, ...
    sources: {
        // Local SVG files
        // must under /docs to fit github page
        local: {
            github: "./icons/web/github.svg",
            settings: "./icons/web/settings.svg", 
            auto: "./icons/web/auto.svg",
            light: "./icons/web/lightttt.svg",
            dark: "./icons/web/dark.svg",
            clear: "./icons/web/clear.svg",
            paste: "./icons/web/paste.svg",
            link: "./icons/web/link.svg"
        },

        // svg URLs
        tabler_svg_urls: {
            github: "https://api.iconify.design/tabler:brand-github.svg",
            settings: "https://api.iconify.design/tabler:settings.svg",
            auto: "https://api.iconify.design/tabler:sun-moon.svg",
            light: "https://api.iconify.design/tabler:sun.svg",
            dark: "https://api.iconify.design/tabler:moon-stars.svg",
            clear: "https://api.iconify.design/tabler:clear-all.svg",
            paste: "https://api.iconify.design/tabler:clipboard.svg",
            link: "https://api.iconify.design/tabler:link.svg"
        },
        
        // Emoji icons
        emoji: {
            github: "🐙",
            settings: "⚙️",
            auto: "🌓",
            light: "🌞",
            dark: "🌜",
            clear: "✖️",
            paste: "📋",
            link: "🔗"
        }
    }
};

// Fallback priority: local -> url -> emoji (automatic cascading)
// Icon renderer - efficient lazy-loading with cascading fallback
function renderIcon(iconName, className = "btn-icon") {
    // Get available icon sources
    const localIcon = ICON_CONFIG.sources.local[iconName];
    const urlIcon = ICON_CONFIG.sources.tabler_svg_urls[iconName];
    const emojiIcon = ICON_CONFIG.sources.emoji[iconName];
    
    if (!localIcon && !urlIcon && !emojiIcon) {
        console.warn(`Icon "${iconName}" not found in any source`);
        return `<span class="${className}">${iconName}</span>`;
    }
    
    // Create a container that will handle lazy loading
    const containerId = `icon-${iconName}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Start with the first available source
    let html = `<div class="icon-maintainer" data-icon-name="${iconName}" data-class="${className}" id="${containerId}">`;
    
    if (localIcon) {
        // Load local icon first
        html += `<img src="${localIcon}" alt="${iconName}" class="${className}" 
                     onerror="loadNextIcon('${containerId}', 'url')">`;
    } else if (urlIcon) {
        // If no local, try URL directly
        html += `<img src="${urlIcon}" alt="${iconName}" class="${className}" 
                     onerror="loadNextIcon('${containerId}', 'emoji')">`;
    } else {
        // Fallback to emoji
        html += `<span class="${className}">${emojiIcon}</span>`;
    }
    
    html += '</div>';
    return html;
}

// Lazy load next icon source when current fails
function loadNextIcon(containerId, nextSource) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const iconName = container.getAttribute('data-icon-name');
    const className = container.getAttribute('data-class');
    
    const urlIcon = ICON_CONFIG.sources.tabler_svg_urls[iconName];
    const emojiIcon = ICON_CONFIG.sources.emoji[iconName];

    if (nextSource === 'url' && urlIcon) {
        // Try URL source
        container.innerHTML = `<img src="${urlIcon}" alt="${iconName}" class="${className}" 
                               onerror="loadNextIcon('${containerId}', 'emoji')">`;
    } else if (nextSource === 'emoji' && emojiIcon) {
        // Fallback to emoji (no further fallback needed)
        container.innerHTML = `<span class="${className}">${emojiIcon}</span>`;
    } else {
        // Last resort: show icon name
        container.innerHTML = `<span class="${className}">${iconName}</span>`;
    }
}

// for download icons
// module.exports = { ICON_CONFIG };
