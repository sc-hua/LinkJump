// Configuration file management with local file storage
class ConfigManager {
    constructor() {
        this.configFileName = 'linkjump-config.json';
        this.defaultConfig = {
            customRedirectors: {},
            customMirrors: {},
            showBuiltinRules: false,  // Hidden by default
            version: '1.0',
            lastModified: new Date().toISOString()
        };
        
        // Use localStorage as cache layer
        this.cache = new Map();
        this.loadFromCache();
    }

    // Load config from localStorage cache
    loadFromCache() {
        try {
            const cached = localStorage.getItem('linkjump-cache');
            if (cached) {
                const config = JSON.parse(cached);
                this.cache.set('config', config);
                return config;
            }
        } catch (e) {
            console.warn('Failed to load from cache:', e);
        }
        return this.defaultConfig;
    }

    // Save config to localStorage cache
    saveToCache(config) {
        try {
            config.lastModified = new Date().toISOString();
            this.cache.set('config', config);
            localStorage.setItem('linkjump-cache', JSON.stringify(config));
        } catch (e) {
            console.error('Failed to save to cache:', e);
        }
    }

    // Get current config (from cache)
    getConfig() {
        return this.cache.get('config') || this.defaultConfig;
    }

    // Update config in cache
    updateConfig(updates) {
        const config = this.getConfig();
        const updatedConfig = { ...config, ...updates };
        this.saveToCache(updatedConfig);
        return updatedConfig;
    }

    // Export config to downloadable file
    exportToFile() {
        const config = this.getConfig();
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        link.download = `${this.configFileName.replace('.json', '')}_${currentDateTime}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // Import config from local file
    async importFromFile(file) {
        if (!file) return false;

        try {
            const text = await file.text();
            const config = JSON.parse(text);
            
            // Validate config structure
            if (this.validateConfig(config)) {
                this.saveToCache(config);
                return true;
            } else {
                throw new Error('Invalid config format');
            }
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    // Validate config structure
    validateConfig(config) {
        return config && 
               typeof config === 'object' && 
               config.hasOwnProperty('customRedirectors') && 
               config.hasOwnProperty('customMirrors');
    }

    // Auto-save config to file (prompt user)
    promptSaveToFile() {
        if (confirm('Save current configuration to file?')) {
            this.exportToFile();
        }
    }

    // Clear all configuration
    clearConfig() {
        this.saveToCache(this.defaultConfig);
        localStorage.removeItem('linkjump-cache');
    }

    // Auto-backup to localStorage when page unloads
    enableAutoBackup() {
        window.addEventListener('beforeunload', () => {
            // Ensure cache is saved before page closes
            const config = this.cache.get('config');
            if (config) {
                this.saveToCache(config);
            }
        });
    }
}
