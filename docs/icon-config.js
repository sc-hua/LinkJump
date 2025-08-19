// Icon configuration - centralized icon management
const ICON_CONFIG = {
    // Icon sources - switch between different icon sets
    // urls, local svg, emoji, text, svg raw path, ...
    sources: {
        // svg URLs
        tabler_svg_urls: {
            github: "https://api.iconify.design/tabler:brand-github.svg",
            settings: "https://api.iconify.design/tabler:settings.svg",
            auto: "https://api.iconify.design/tabler:sun-moon.svg",
            light: "https://api.iconify.design/tabler:sun.svg",
            dark: "https://api.iconify.design/tabler:moon-stars.svg",
            clear: "https://api.iconify.design/tabler:clear-all.svg",
            paste: "https://api.iconify.design/tabler:clipboard.svg"
        },
        
        // Local SVG files - correct path from docs folder
        local: {
            github: "../icons/web/github.svg",
            settings: "../icons/web/settings.svg", 
            auto: "../icons/web/auto.svg",
            light: "../icons/web/light.svg",
            dark: "../icons/web/dark.svg",
            clear: "../icons/web/clear.svg",
            paste: "../icons/web/paste.svg"
        },
        
        // Emoji icons
        emoji: {
            github: "🐙",
            settings: "⚙️",
            auto: "🌓",
            light: "🌞",
            dark: "🌜",
            clear: "✖️",
            paste: "📋"
        }
    },
    
    // Current active source - change this to switch all icons
    // activeSource: "tabler_svg_urls",
    activeSource: "local",
    // activeSource: "emoji",
};

// Icon renderer - handles different icon types
function renderIcon(iconName, className = "btn-icon") {
    const source = ICON_CONFIG.sources[ICON_CONFIG.activeSource];
    const iconData = source[iconName];
    
    if (!iconData) {
        console.warn(`Icon "${iconName}" not found in source "${ICON_CONFIG.activeSource}"`);
        // Try fallback to emoji source if available
        const fallback = ICON_CONFIG.sources.emoji[iconName];
        if (fallback) {
            return `<span class="${className}">${fallback}</span>`;
        }
        return `<span class="${className}">?</span>`;
    }
    
    // Handle different icon types
    if (iconData.startsWith('http') || iconData.startsWith('./') || iconData.startsWith('/') || iconData.startsWith('../')) {
        // URL or file path - render as img with error handling for local files
        return `<img src="${iconData}" alt="${iconName}" class="${className}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                <span class="${className}" style="display:none;">${ICON_CONFIG.sources.emoji[iconName] || '?'}</span>`;
    } else {
        // Text/emoji - render as span (original button logic)
        return `<span class="${className}">${iconData}</span>`;
    }
}

// for download icons
// module.exports = { ICON_CONFIG };
