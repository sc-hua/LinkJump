// Theme management - handles light/dark/auto theme switching
class ThemeManager {
    constructor() {
        this.themes = ['auto', 'light', 'dark'];
        this.currentTheme = this.loadTheme();
        this.applyTheme();
    }

    // Load theme from localStorage or default to auto
    loadTheme() {
        try {
            return localStorage.getItem('linkjump-theme') || 'auto';
        } catch (e) {
            return 'auto';
        }
    }

    // Save theme to localStorage
    saveTheme() {
        try {
            localStorage.setItem('linkjump-theme', this.currentTheme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
    }

    // Apply current theme to document
    applyTheme() {
        const html = document.documentElement;
        
        if (this.currentTheme === 'auto') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', this.currentTheme);
        }
        
        this.saveTheme();
    }

    // Cycle to next theme
    nextTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.currentTheme = this.themes[nextIndex];
        this.applyTheme();
        return this.currentTheme;
    }

    // Get current theme icon name
    getCurrentIconName() {
        return this.currentTheme;
    }

    // Get theme description for tooltip
    getThemeDescription() {
        const descriptions = {
            'auto': 'Auto (follows system)',
            'light': 'Light theme',
            'dark': 'Dark theme'
        };
        return descriptions[this.currentTheme];
    }
}
