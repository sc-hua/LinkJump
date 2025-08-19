// UI Controller - handles all DOM interactions and user interface
class UIController {
    constructor(rulesEngine, configManager) {
        this.rulesEngine = rulesEngine;
        this.configManager = configManager;
        this.themeManager = new ThemeManager();
        
        // Debounce timer for auto-search
        this.searchTimer = null;
        
        // DOM elements
        this.elements = {
            urlInput: document.getElementById('urlInput'),
            searchLoader: document.getElementById('searchLoader'),
            clearBtn: document.getElementById('clearBtn'),
            pasteBtn: document.getElementById('pasteBtn'),
            githubBtn: document.getElementById('githubBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            themeBtn: document.getElementById('themeBtn'),
            status: document.getElementById('status'),
            results: document.getElementById('results'),
            modal: document.getElementById('settingsModal'),
            closeModal: document.getElementById('closeModal'),
            currentRules: document.getElementById('currentRules')
        };

        this.initializeEventListeners();
        this.initializeIcons(); // Initialize all button icons first
        this.updateThemeButton(); // Then update theme button title
        this.updateClearButtonVisibility(); // Initialize clear button state
        this.setupWindowFocusHandler();
    }

    // Auto focus search box when window gains focus
    setupWindowFocusHandler() {
        // Focus when window/tab becomes active
        window.addEventListener('focus', () => {
            // Small delay to ensure the window is fully focused
            setTimeout(() => {
                if (!this.elements.modal.style.display || this.elements.modal.style.display === 'none') {
                    // Only focus if modal is not open
                    this.elements.urlInput.focus();
                }
            }, 50);
        });
        
        // Also focus on page visibility change (when tab becomes visible)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    if (!this.elements.modal.style.display || this.elements.modal.style.display === 'none') {
                        this.elements.urlInput.focus();
                    }
                }, 50);
            }
        });
        
        // Initial focus on page load
        setTimeout(() => {
            this.elements.urlInput.focus();
        }, 100);
    }

    // Initialize all button icons based on config
    initializeIcons() {
        // Find all buttons with data-icon attribute
        const iconButtons = document.querySelectorAll('[data-icon]');
        
        iconButtons.forEach(button => {
            const iconName = button.getAttribute('data-icon');
            
            // Special handling for theme button - use current theme as icon name
            if (button.id === 'themeBtn') {
                this.updateThemeButtonIcon();
            } else {
                const iconHtml = renderIcon(iconName);
                button.innerHTML = iconHtml;
            }
        });
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Main functionality
        this.elements.clearBtn.addEventListener('click', () => this.handleClearInput());
        this.elements.pasteBtn.addEventListener('click', () => this.handlePasteFromClipboard());
        this.elements.githubBtn.addEventListener('click', () => this.handleGitHubClick());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.themeBtn.addEventListener('click', () => this.handleThemeToggle());
        
        // Input handlers
        this.elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.clearSearchTimer();
                this.handleAnalyzeUrl();
            }
        });
        
        // Auto-search on input with debounce
        this.elements.urlInput.addEventListener('input', () => {
            this.updateClearButtonVisibility();
            this.scheduleAutoSearch();
        });
        
        this.elements.urlInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.updateClearButtonVisibility();
                this.scheduleAutoSearch();
            }, 100);
        });

        // Modal handlers
        this.elements.closeModal.addEventListener('click', () => this.closeSettings());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeSettings();
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.style.display === 'block') {
                this.closeSettings();
            }
        });

        // Form handlers
        this.initializeFormHandlers();
        
        // Check clipboard API support
        this.checkClipboardSupport();
    }

    // Initialize form-related event handlers
    initializeFormHandlers() {
        document.getElementById('addRedirector').addEventListener('click', () => 
            this.handleAddRedirector());
        
        document.getElementById('addMirror').addEventListener('click', () => 
            this.handleAddMirror());
        
        document.getElementById('exportRules').addEventListener('click', () => 
            this.configManager.exportToFile());
        
        document.getElementById('importRules').addEventListener('click', () => 
            document.getElementById('importFile').click());
        
        document.getElementById('importFile').addEventListener('change', (e) => 
            this.handleImportRules(e.target.files[0]));
        
        document.getElementById('clearRules').addEventListener('click', () => 
            this.handleClearRules());
    }

    // Schedule auto-search with debounce (500ms delay)
    scheduleAutoSearch() {
        this.clearSearchTimer();
        this.searchTimer = setTimeout(() => {
            this.handleAnalyzeUrl();
        }, 500);
    }

    // Clear search timer
    clearSearchTimer() {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
    }

    // Handle clear input button
    handleClearInput() {
        this.elements.urlInput.value = '';
        this.elements.urlInput.focus();
        this.updateClearButtonVisibility();
        this.handleAnalyzeUrl(); // This will clear results and remove search-active class
    }

    // Update clear button visibility based on input content
    updateClearButtonVisibility() {
        const hasContent = this.elements.urlInput.value.trim().length > 0;
        this.elements.clearBtn.style.display = hasContent ? 'block' : 'none';
    }

    // Show/hide search loader
    showSearchLoader(show = true) {
        this.elements.searchLoader.style.display = show ? 'block' : 'none';
    }

    // Handle URL analysis
    handleAnalyzeUrl() {
        const inputUrl = this.elements.urlInput.value.trim();
        
        // Clear previous results but keep search-active state if there were results
        this.elements.results.innerHTML = '';
        
        if (!inputUrl) {
            // Remove search-active class when input is empty
            document.body.classList.remove('search-active');
            this.showSearchLoader(false);
            this.elements.status.textContent = '';
            this.elements.status.className = 'status';
            return;
        }

        if (!this.isValidUrl(normalizeUrl(inputUrl))) {
            this.showSearchLoader(false);
            this.showStatus('Please enter a valid URL', 'error');
            return;
        }

        this.showSearchLoader(true);
        this.elements.status.textContent = ''; // Clear status when loading
        
        this.processUrl(inputUrl);
    }

    // Validate URL format
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Process URL and display results
    processUrl(url) {
        // Normalize URL to handle missing protocols
        const normalizedUrl = normalizeUrl(url);
        const analysis = this.rulesEngine.analyzeUrl(normalizedUrl);
        
        // Hide loader and add search-active class for layout transition
        this.showSearchLoader(false);
        document.body.classList.add('search-active');
        
        if (analysis.hasResults) {
            // Display redirectors if available
            if (analysis.redirectors.length > 0) {
                const groupTitle = this.getGroupTitle(analysis.type);
                this.createRedirectGroup(groupTitle, analysis.redirectors, analysis.identifier);
            }
            
            // Display mirrors if available
            if (analysis.mirrors.length > 0) {
                this.createMirrorGroup('Mirror Sites', analysis.mirrors);
            }
            
            this.showStatus(analysis.identifier ? 
                `Found ${analysis.type}: ${analysis.identifier}` : 
                'Found mirror sites');
        } else {
            this.showStatus(analysis.type ? 
                'No alternative links available for this URL' : 
                'This URL type is not yet supported');
            this.showEmptyState();
        }
    }

    // Get display title for redirector group
    getGroupTitle(type) {
        const titles = {
            'arxiv': 'ArXiv Alternatives',
            'github': 'GitHub Repository Alternatives'
        };
        return titles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Alternatives`;
    }

    // Create redirector buttons group
    createRedirectGroup(title, redirectors, identifier) {
        const group = document.createElement('div');
        group.className = 'link-group';

        const titleElement = document.createElement('div');
        titleElement.className = 'group-title';
        titleElement.textContent = title;
        group.appendChild(titleElement);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'link-buttons';

        for (const site of redirectors) {
            const button = this.createLinkButton(site.name, site.url(identifier), site.hover);
            buttonsContainer.appendChild(button);
        }

        group.appendChild(buttonsContainer);
        this.elements.results.appendChild(group);
    }

    // Create mirror buttons group
    createMirrorGroup(title, mirrors) {
        if (this.elements.results.children.length > 0) {
            const divider = document.createElement('hr');
            divider.className = 'divider';
            this.elements.results.appendChild(divider);
        }

        const group = document.createElement('div');
        group.className = 'link-group';

        const titleElement = document.createElement('div');
        titleElement.className = 'group-title';
        titleElement.textContent = title;
        group.appendChild(titleElement);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'link-buttons';

        for (const mirror of mirrors) {
            const button = this.createLinkButton(mirror.name, mirror.url, mirror.hover);
            buttonsContainer.appendChild(button);
        }

        group.appendChild(buttonsContainer);
        this.elements.results.appendChild(group);
    }

    // Create individual link button
    createLinkButton(name, url, title) {
        const button = document.createElement('a');
        button.className = 'link-btn';
        button.textContent = name;
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.title = title || `Open ${name}`;
        return button;
    }

    // Show empty state with examples
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p>🔍 Try entering URLs from supported sites:</p>
            <p><strong>ArXiv:</strong> https://arxiv.org/abs/1706.03762</p>
            <p><strong>GitHub:</strong> https://github.com/user/repository</p>
            <p><strong>Hugging Face:</strong> https://huggingface.co/models</p>
        `;
        this.elements.results.appendChild(emptyState);
    }

    // Show status message
    showStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
    }

    // Settings modal methods
    openSettings() {
        this.elements.modal.style.display = 'block';
        this.refreshRulesList();
    }

    closeSettings() {
        this.elements.modal.style.display = 'none';
        this.clearModalInputs();
        // Focus back to search box when closing settings
        setTimeout(() => {
            this.elements.urlInput.focus();
        }, 100);
    }

    // Clear all modal input fields
    clearModalInputs() {
        const inputIds = [
            'customType', 'customName', 'customPrefix', 'customTemplate',
            'mirrorOriginal', 'mirrorUrl', 'mirrorName'
        ];
        
        inputIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        const fileInput = document.getElementById('importFile');
        if (fileInput) fileInput.value = '';
    }

    // Handle adding custom redirector
    handleAddRedirector() {
        const type = document.getElementById('customType').value.trim();
        const name = document.getElementById('customName').value.trim();
        const prefix = document.getElementById('customPrefix').value.trim();
        const template = document.getElementById('customTemplate').value.trim();

        if (!this.validateRedirectorInput(type, name, prefix, template)) return;

        try {
            new URL(prefix); // Validate URL format
            this.rulesEngine.addRedirector(type, name, prefix, template);
            this.refreshRulesList();
            this.clearModalInputs();
            alert('Custom redirector added successfully!');
        } catch (e) {
            alert('Invalid URL format for prefix');
        }
    }

    // Validate redirector input
    validateRedirectorInput(type, name, prefix, template) {
        if (!type || !name || !prefix || !template) {
            alert('Please fill in all fields for the redirector');
            return false;
        }

        if (!template.includes('{id}')) {
            alert('URL template must contain {id} placeholder');
            return false;
        }

        return true;
    }

    // Handle adding custom mirror
    handleAddMirror() {
        const originalUrl = document.getElementById('mirrorOriginal').value.trim();
        const mirrorUrl = document.getElementById('mirrorUrl').value.trim();
        const displayName = document.getElementById('mirrorName').value.trim();

        if (!originalUrl || !mirrorUrl || !displayName) {
            alert('Please fill in all fields for the mirror');
            return;
        }

        try {
            new URL(originalUrl);
            new URL(mirrorUrl);
            this.rulesEngine.addMirror(originalUrl, mirrorUrl, displayName);
            this.refreshRulesList();
            this.clearModalInputs();
            alert('Custom mirror added successfully!');
        } catch (e) {
            alert('Invalid URL format');
        }
    }

    // Handle importing rules
    async handleImportRules(file) {
        if (!file) return;

        const success = await this.configManager.importFromFile(file);
        if (success) {
            this.refreshRulesList();
            alert('Rules imported successfully!');
        } else {
            alert('Failed to import rules. Please check the file format.');
        }
    }

    // Handle clearing all custom rules
    handleClearRules() {
        if (confirm('Are you sure you want to clear all custom rules? This cannot be undone.')) {
            this.configManager.clearConfig();
            this.refreshRulesList();
            alert('All custom rules have been cleared.');
        }
    }

    // Refresh the rules display list
    refreshRulesList() {
        const container = this.elements.currentRules;
        container.innerHTML = '';

        const rules = this.rulesEngine.getAllCustomRules();
        let hasRules = false;

        // Display custom redirectors
        for (const [type, redirectors] of Object.entries(rules.redirectors)) {
            redirectors.forEach((redirector, index) => {
                container.appendChild(this.createRuleItem(
                    `${redirector.name} (${type})`,
                    [`Prefix: ${redirector.prefix}`, `Template: ${redirector.template}`],
                    () => this.deleteRedirector(type, index)
                ));
                hasRules = true;
            });
        }

        // Display custom mirrors
        for (const [originalUrl, mirrors] of Object.entries(rules.mirrors)) {
            mirrors.forEach((mirror, index) => {
                container.appendChild(this.createRuleItem(
                    mirror.hover,
                    [`From: ${originalUrl}`, `To: ${mirror.mirror}`],
                    () => this.deleteMirror(originalUrl, index)
                ));
                hasRules = true;
            });
        }

        if (!hasRules) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-style: italic;">No custom rules defined yet.</p>';
        }
    }

    // Create a rule item element
    createRuleItem(title, details, onDelete) {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';
        
        const ruleInfo = document.createElement('div');
        ruleInfo.className = 'rule-info';
        
        const titleElement = document.createElement('strong');
        titleElement.textContent = title;
        ruleInfo.appendChild(titleElement);
        
        details.forEach(detail => {
            const smallElement = document.createElement('small');
            smallElement.textContent = detail;
            ruleInfo.appendChild(smallElement);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-rule';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', onDelete);
        
        ruleItem.appendChild(ruleInfo);
        ruleItem.appendChild(deleteButton);
        
        return ruleItem;
    }

    // Delete redirector with confirmation
    deleteRedirector(type, index) {
        if (confirm('Are you sure you want to delete this redirector?')) {
            this.rulesEngine.removeRedirector(type, index);
            this.refreshRulesList();
        }
    }

    // Delete mirror with confirmation
    deleteMirror(originalUrl, index) {
        if (confirm('Are you sure you want to delete this mirror?')) {
            this.rulesEngine.removeMirror(originalUrl, index);
            this.refreshRulesList();
        }
    }

    // Handle paste from clipboard
    async handlePasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text.trim()) {
                this.elements.urlInput.value = text.trim();
                this.updateClearButtonVisibility();
                // Clear any pending timer and trigger immediate analysis
                this.clearSearchTimer();
                this.handleAnalyzeUrl();
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            this.showStatus('Failed to read clipboard. Please check permissions.', 'error');
        }
    }

    // Handle GitHub button click
    handleGitHubClick() {
        window.open('https://github.com/sc-hua/LinkJump', '_blank', 'noopener,noreferrer');
    }

    // Handle theme toggle
    handleThemeToggle() {
        const newTheme = this.themeManager.nextTheme();
        this.updateThemeButton();
        this.updateThemeButtonIcon(); // Update icon after theme change
        console.log(`Theme changed to: ${newTheme}`);
    }

    // Update theme button appearance
    updateThemeButton() {
        if (this.elements.themeBtn) {
            // Icons are now handled by updateThemeButtonIcon(), just update title
            this.elements.themeBtn.title = this.themeManager.getThemeDescription();
        }
    }

    // Update theme button icon based on current theme
    updateThemeButtonIcon() {
        if (this.elements.themeBtn) {
            const currentTheme = this.themeManager.getCurrentIconName();
            const iconHtml = renderIcon(currentTheme);
            this.elements.themeBtn.innerHTML = iconHtml;
        }
    }

    // Check clipboard API support
    checkClipboardSupport() {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            this.elements.pasteBtn.disabled = true;
            this.elements.pasteBtn.title = 'Clipboard access not supported';
            console.warn('Clipboard API not supported');
        }
    }
}
