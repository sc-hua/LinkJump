// Rules processing engine - handles URL analysis and redirector logic
class RulesEngine {
    constructor(configManager) {
        this.configManager = configManager;
        this.builtinRedirectors = redirectors_map;
        this.builtinMirrors = mirrors_map;
    }

    // Get merged redirectors (builtin + custom)
    getMergedRedirectors() {
        const config = this.configManager.getConfig();
        const merged = { ...this.builtinRedirectors };
        
        for (const [type, redirectors] of Object.entries(config.customRedirectors)) {
            if (merged[type]) {
                merged[type] = [...merged[type], ...redirectors];
            } else {
                merged[type] = [...redirectors];
            }
        }
        
        return merged;
    }

    // Get merged mirrors (builtin + custom)
    getMergedMirrors() {
        const config = this.configManager.getConfig();
        const merged = { ...this.builtinMirrors };
        
        for (const [originalUrl, mirrors] of Object.entries(config.customMirrors)) {
            if (merged[originalUrl]) {
                merged[originalUrl] = [...merged[originalUrl], ...mirrors];
            } else {
                merged[originalUrl] = [...mirrors];
            }
        }
        
        return merged;
    }

    // Analyze URL and return available redirects
    analyzeUrl(url) {
        // Normalize URL first
        const normalizedUrl = normalizeUrl(url);
        const mergedRedirectors = this.getMergedRedirectors();
        const mergedMirrors = this.getMergedMirrors();
        
        const result = {
            url: normalizedUrl,
            type: null,
            identifier: null,
            redirectors: [],
            mirrors: [],
            hasResults: false
        };

        // Find matching redirector type and extract identifier
        for (const [type, redirectors] of Object.entries(mergedRedirectors)) {
            const identifier = this.extractIdentifier(normalizedUrl, type, redirectors);
            
            if (identifier && redirectors.some(site => normalizedUrl.startsWith(site.prefix))) {
                result.type = type;
                result.identifier = identifier;
                result.redirectors = redirectors.filter(site => !normalizedUrl.startsWith(site.prefix));
                result.hasResults = result.redirectors.length > 0;
                break;
            }
        }

        // Find matching mirrors
        result.mirrors = this.findMirrors(normalizedUrl, mergedMirrors);
        if (result.mirrors.length > 0) {
            result.hasResults = true;
        }

        return result;
    }

    // Extract identifier from URL based on type
    extractIdentifier(url, type, redirectors) {
        // Use built-in extractors for known types
        if (type === 'arxiv') {
            return extractPaperId(url);
        } else if (type === 'github') {
            return extractGithubRepo(url);
        }
        
        // For custom types, extract from prefix
        for (const redirector of redirectors) {
            if (url.startsWith(redirector.prefix)) {
                return url.replace(redirector.prefix, '').split(/[?#]/)[0]; // Remove query/fragment
            }
        }
        
        return null;
    }

    // Find available mirrors for URL
    findMirrors(url, mergedMirrors) {
        const mirrors = [];
        
        for (const [prefix, mirrorList] of Object.entries(mergedMirrors)) {
            if (url.startsWith(prefix)) {
                for (const mirror of mirrorList) {
                    mirrors.push({
                        name: mirror.hover,
                        url: url.replace(prefix, mirror.mirror),
                        hover: mirror.hover
                    });
                }
            }
        }
        
        return mirrors;
    }

    // Add custom redirector
    addRedirector(type, name, prefix, template) {
        const config = this.configManager.getConfig();
        
        if (!config.customRedirectors[type]) {
            config.customRedirectors[type] = [];
        }
        
        config.customRedirectors[type].push({
            name: name,
            prefix: prefix,
            url: id => template.replace('{id}', id),
            template: template,
            hover: `View on ${name}`,
            isCustom: true
        });
        
        this.configManager.updateConfig(config);
    }

    // Add custom mirror
    addMirror(originalUrl, mirrorUrl, displayName) {
        const config = this.configManager.getConfig();
        
        if (!config.customMirrors[originalUrl]) {
            config.customMirrors[originalUrl] = [];
        }
        
        config.customMirrors[originalUrl].push({
            mirror: mirrorUrl,
            hover: displayName,
            isCustom: true
        });
        
        this.configManager.updateConfig(config);
    }

    // Remove custom redirector
    removeRedirector(type, index) {
        const config = this.configManager.getConfig();
        
        if (config.customRedirectors[type] && config.customRedirectors[type][index]) {
            config.customRedirectors[type].splice(index, 1);
            
            if (config.customRedirectors[type].length === 0) {
                delete config.customRedirectors[type];
            }
            
            this.configManager.updateConfig(config);
        }
    }

    // Remove custom mirror
    removeMirror(originalUrl, index) {
        const config = this.configManager.getConfig();
        
        if (config.customMirrors[originalUrl] && config.customMirrors[originalUrl][index]) {
            config.customMirrors[originalUrl].splice(index, 1);
            
            if (config.customMirrors[originalUrl].length === 0) {
                delete config.customMirrors[originalUrl];
            }
            
            this.configManager.updateConfig(config);
        }
    }

    // Get all custom rules for display
    getAllCustomRules() {
        const config = this.configManager.getConfig();
        return {
            redirectors: config.customRedirectors,
            mirrors: config.customMirrors
        };
    }

    // Get all builtin rules for display
    getAllBuiltinRules() {
        return {
            redirectors: this.builtinRedirectors,
            mirrors: this.builtinMirrors
        };
    }

    // Toggle builtin rules visibility
    toggleBuiltinRulesVisibility() {
        const config = this.configManager.getConfig();
        const newValue = !config.showBuiltinRules;
        this.configManager.updateConfig({ showBuiltinRules: newValue });
        return newValue;
    }

    // Get builtin rules visibility state
    getBuiltinRulesVisibility() {
        const config = this.configManager.getConfig();
        return config.showBuiltinRules || false;
    }
}
