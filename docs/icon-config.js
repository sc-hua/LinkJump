// Icon configuration - centralized icon management
const ICON_CONFIG = {
    // Icon sources - switch between different icon sets
    // urls, local svg, emoji, text, svg raw path, ...
    sources: {
        // Local SVG files - correct path from docs folder
        local: {
            github: "./icons/web/github.svg",
            settings: "./icons/web/settings.svg", 
            auto: "./icons/web/auto.svg",
            light: "./icons/web/light.svg",
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
    
    // Fallback priority: local -> url -> emoji (automatic cascading)
};

// Icon renderer - handles different icon types with fallback strategy
function renderIcon(iconName, className = "btn-icon") {
    // Try local first, then URL, then emoji as fallback
    const localIcon = ICON_CONFIG.sources.local[iconName];
    const urlIcon = ICON_CONFIG.sources.tabler_svg_urls[iconName];
    const emojiIcon = ICON_CONFIG.sources.emoji[iconName];
    
    if (!localIcon && !urlIcon && !emojiIcon) {
        console.warn(`Icon "${iconName}" not found in any source`);
        return `<span class="${className}">${iconName}</span>`;
    }
    
    // Build cascading fallback HTML
    let html = '';
    
    // Primary: Local file (if available)
    if (localIcon) {
        html += `<img src="${localIcon}" alt="${iconName}" class="${className}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">`;
    }
    
    // Secondary: URL icon (if available and local failed)
    if (urlIcon) {
        const displayStyle = localIcon ? 'display:none;' : '';
        html += `<img src="${urlIcon}" alt="${iconName}" class="${className}" 
                     style="${displayStyle}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">`;
    }
    
    // Tertiary: Emoji fallback (always available)
    if (emojiIcon) {
        const displayStyle = (localIcon || urlIcon) ? 'display:none;' : '';
        html += `<span class="${className}" style="${displayStyle}">${emojiIcon}</span>`;
    }
    
    return html;
}

// for download icons
// module.exports = { ICON_CONFIG };
