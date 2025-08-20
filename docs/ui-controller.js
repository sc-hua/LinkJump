// UI Controller - handles all DOM interactions and user interface
class UIController {
    constructor(rulesEngine, configManager) {
        this.rulesEngine = rulesEngine;
        this.configManager = configManager;
        this.themeManager = new ThemeManager();
        
        // Debounce timer for auto-search
        this.searchDelayTimer = null;
        // delay time, ms
        this.autoSearchDelayTime = 300;
        // this.enableDelay = true;
        this.enableDelay = false;

        // DOM elements
        this.elements = {
            urlInput: document.getElementById('urlInput'),
            clearBtn: document.getElementById('clearBtn'),
            pasteBtn: document.getElementById('pasteBtn'),
            jumpBtn: document.getElementById('jumpBtn'),
            githubBtn: document.getElementById('githubBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            themeBtn: document.getElementById('themeBtn'),
            status: document.getElementById('status'),
            results: document.getElementById('results'),
            modal: document.getElementById('settingsModal'),
            closeModal: document.getElementById('closeModal'),
            currentRules: document.getElementById('currentRules'),
            toggleBuiltinRules: document.getElementById('toggleBuiltinRules')
        };

        this.initializeEventListeners();
        this.initializeIcons(); // Initialize all button icons first
        this.updateThemeButton(); // Then update theme button title
        this.handleSearch(true); // Initialize button states and UI
        this.setupWindowFocusHandler();
    }

    // Focus input if modal is not open
    focusInput() {
        if (!this.elements.modal.style.display || this.elements.modal.style.display === 'none') {
            this.elements.urlInput.focus();
        }
    }

    // Auto focus search box when window gains focus
    // Focus when window/tab becomes active
    setupWindowFocusHandler() {
        window.addEventListener('focus', () => {
            // Small delay to ensure the window is fully focused
            setTimeout(() => this.focusInput(), 50);
        });
        
        // Also focus on page visibility change (when tab becomes visible)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => this.focusInput(), 50);
            }
        });
        
        // Initial focus on page load
        setTimeout(() => this.focusInput(), 100);
    }

    // Initialize all button icons based on config
    // Find all buttons with data-icon attribute
    initializeIcons() {
        document.querySelectorAll('[data-icon]').forEach(button => {
            const iconName = button.getAttribute('data-icon');
            const iconHtml = renderIcon(iconName);
            button.innerHTML = iconHtml;
        });
    }

        // Initialize all event listeners
    initializeEventListeners() {
        // Main functionality
        this.elements.clearBtn.addEventListener('click', () => this.handleClearInput());
        this.elements.pasteBtn.addEventListener('click', () => this.handlePasteFromClipboard());
        this.elements.jumpBtn.addEventListener('click', () => this.handleJumpToUrl());
        this.elements.githubBtn.addEventListener('click', () => this.handleGitHubClick());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.themeBtn.addEventListener('click', () => this.handleThemeToggle());
        
        // Input handlers
        this.elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(true); // Immediate execution
            }
        });
        
        // Auto-search on input with debounce
        this.elements.urlInput.addEventListener('input', () => {
            this.handleSearch();
        });
        
        this.elements.urlInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.handleSearch();
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
        
        // Toggle builtin rules handler
        this.elements.toggleBuiltinRules.addEventListener('click', () => 
            this.handleToggleBuiltinRules());
        
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

    // Handle clear input button
    handleClearInput() {
        this.elements.urlInput.value = '';
        this.focusInput();
        this.handleSearch(true); // This will clear results and remove search-active class
    }

    // Handle jump to URL button
    handleJumpToUrl() {
        const inputUrl = this.elements.urlInput.value.trim();
        if (inputUrl) {
            const normalizedUrl = normalizeUrl(inputUrl);
            if (this.isValidUrl(normalizedUrl)) {
                // Open URL in new tab
                window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
            } else {
                this.showStatus('Please enter a valid URL', 'error');
            }
        }
    }

    // Handle URL analysis with built-in debounce and button state update
    handleSearch(immediate = false) {
        // Update button states first
        const inputUrl = this.elements.urlInput.value.trim();
        const hasContent = inputUrl.length > 0;
        const hasValidUrl = hasContent && this.isValidUrl(normalizeUrl(inputUrl));
        
        this.elements.clearBtn.style.display = hasContent ? 'block' : 'none';
        this.elements.jumpBtn.style.display = hasValidUrl ? 'block' : 'none';

        if (inputUrl) {
            // Add search-active class for layout transition
            document.body.classList.add('search-active');
        } else {
            // Remove search-active class when input is empty
            document.body.classList.remove('search-active');
            this.elements.status.textContent = '';
            this.elements.status.className = 'status';
            // return;
        }

        // Clear previous results but keep search-active state if there were results
        this.elements.results.innerHTML = '';
        this.elements.status.textContent = ''; // Clear status

        if (!hasContent) {
            return;
        }

        // Clear any existing timer
        if (this.searchDelayTimer) {
            clearTimeout(this.searchDelayTimer);
            this.searchDelayTimer = null;
        }

        // If not immediate, schedule with debounce
        if (!immediate && this.enableDelay) {
            this.searchDelayTimer = setTimeout(() => {
                this.handleSearch(true); // Call with immediate=true
            }, this.autoSearchDelayTime);
            return;
        }

        if (hasValidUrl) {
            this.processUrl(inputUrl);
        } else {
            this.showStatus('Please enter a valid URL', 'error');
            return;
        }
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

    // Show notification (alert wrapper)
    showNotification(message) {
        alert(message);
    }

    // Show confirmation dialog
    showConfirmation(message) {
        return confirm(message);
    }

    // Handle toggle builtin rules visibility
    handleToggleBuiltinRules() {
        const isVisible = this.rulesEngine.toggleBuiltinRulesVisibility();
        this.updateToggleButton(isVisible);
        this.refreshRulesList();
    }

    // Update toggle button text based on state
    updateToggleButton(isVisible) {
        this.elements.toggleBuiltinRules.textContent = 
            isVisible ? 'Hide Built-in Rules' : 'Show Built-in Rules';
    }

    // Settings modal methods
    openSettings() {
        this.elements.modal.style.display = 'block';
        // Update toggle button state
        const isVisible = this.rulesEngine.getBuiltinRulesVisibility();
        this.updateToggleButton(isVisible);
        this.refreshRulesList();
    }

    closeSettings() {
        this.elements.modal.style.display = 'none';
        this.clearModalInputs();
        // Focus back to search box when closing settings
        setTimeout(() => this.focusInput(), 100);
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
            this.showNotification('Custom redirector added successfully!');
        } catch (e) {
            this.showNotification('Invalid URL format for prefix');
        }
    }

    // Validate redirector input
    validateRedirectorInput(type, name, prefix, template) {
        if (!type || !name || !prefix || !template) {
            this.showNotification('Please fill in all fields for the redirector');
            return false;
        }

        if (!template.includes('{id}')) {
            this.showNotification('URL template must contain {id} placeholder');
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
            this.showNotification('Please fill in all fields for the mirror');
            return;
        }

        try {
            new URL(originalUrl);
            new URL(mirrorUrl);
            this.rulesEngine.addMirror(originalUrl, mirrorUrl, displayName);
            this.refreshRulesList();
            this.clearModalInputs();
            this.showNotification('Custom mirror added successfully!');
        } catch (e) {
            this.showNotification('Invalid URL format');
        }
    }

    // Handle importing rules
    async handleImportRules(file) {
        if (!file) return;

        const success = await this.configManager.importFromFile(file);
        if (success) {
            this.refreshRulesList();
            this.showNotification('Rules imported successfully!');
        } else {
            this.showNotification('Failed to import rules. Please check the file format.');
        }
    }

    // Handle clearing all custom rules
    handleClearRules() {
        if (this.showConfirmation('Are you sure you want to clear all custom rules? This cannot be undone.')) {
            this.configManager.clearConfig();
            this.refreshRulesList();
            this.showNotification('All custom rules have been cleared.');
        }
    }

    // Refresh the rules display list
    refreshRulesList() {
        const container = this.elements.currentRules;
        container.innerHTML = '';

        const customRules = this.rulesEngine.getAllCustomRules();
        const showBuiltin = this.rulesEngine.getBuiltinRulesVisibility();
        const builtinRules = showBuiltin ? this.rulesEngine.getAllBuiltinRules() : { redirectors: {}, mirrors: {} };
        
        let hasRules = false;

        // Display custom redirectors first
        if (Object.keys(customRules.redirectors).length > 0) {
            const customHeader = document.createElement('h4');
            customHeader.textContent = 'Custom Redirectors';
            customHeader.className = 'rules-section-header';
            container.appendChild(customHeader);

            for (const [type, redirectors] of Object.entries(customRules.redirectors)) {
                redirectors.forEach((redirector, index) => {
                    container.appendChild(this.createRuleItem(
                        `${redirector.name} (${type})`,
                        [`Prefix: ${redirector.prefix}`, `Template: ${redirector.template}`],
                        () => this.deleteRedirector(type, index),
                        true // is custom rule
                    ));
                    hasRules = true;
                });
            }
        }

        // Display custom mirrors
        if (Object.keys(customRules.mirrors).length > 0) {
            const customMirrorHeader = document.createElement('h4');
            customMirrorHeader.textContent = 'Custom Mirrors';
            customMirrorHeader.className = 'rules-section-header';
            container.appendChild(customMirrorHeader);

            for (const [originalUrl, mirrors] of Object.entries(customRules.mirrors)) {
                mirrors.forEach((mirror, index) => {
                    container.appendChild(this.createRuleItem(
                        mirror.hover,
                        [`From: ${originalUrl}`, `To: ${mirror.mirror}`],
                        () => this.deleteMirror(originalUrl, index),
                        true // is custom rule
                    ));
                    hasRules = true;
                });
            }
        }

        // Display builtin redirectors if enabled
        if (showBuiltin && Object.keys(builtinRules.redirectors).length > 0) {
            if (hasRules) {
                const divider = document.createElement('hr');
                divider.className = 'rules-divider';
                container.appendChild(divider);
            }

            const builtinHeader = document.createElement('h4');
            builtinHeader.textContent = 'Built-in Redirectors';
            builtinHeader.className = 'rules-section-header builtin-header';
            container.appendChild(builtinHeader);

            for (const [type, redirectors] of Object.entries(builtinRules.redirectors)) {
                redirectors.forEach((redirector) => {
                    container.appendChild(this.createRuleItem(
                        `${redirector.name} (${type})`,
                        [`Prefix: ${redirector.prefix}`, `Target: ${redirector.hover}`],
                        null, // no delete function for builtin
                        false // is not custom rule
                    ));
                    hasRules = true;
                });
            }
        }

        // Display builtin mirrors if enabled
        if (showBuiltin && Object.keys(builtinRules.mirrors).length > 0) {
            const builtinMirrorHeader = document.createElement('h4');
            builtinMirrorHeader.textContent = 'Built-in Mirrors';
            builtinMirrorHeader.className = 'rules-section-header builtin-header';
            container.appendChild(builtinMirrorHeader);

            for (const [originalUrl, mirrors] of Object.entries(builtinRules.mirrors)) {
                mirrors.forEach((mirror) => {
                    container.appendChild(this.createRuleItem(
                        mirror.hover,
                        [`From: ${originalUrl}`, `To: ${mirror.mirror}`],
                        null, // no delete function for builtin
                        false // is not custom rule
                    ));
                    hasRules = true;
                });
            }
        }

        if (!hasRules) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-style: italic;">No rules to display.</p>';
        }
    }

    // Create a rule item element
    createRuleItem(title, details, onDelete, isCustom = true) {
        const ruleItem = document.createElement('div');
        ruleItem.className = `rule-item ${isCustom ? 'custom-rule' : 'builtin-rule'}`;
        
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
        
        ruleItem.appendChild(ruleInfo);

        // Only add delete button for custom rules
        if (isCustom && onDelete) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-rule';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', onDelete);
            ruleItem.appendChild(deleteButton);
        }
        
        return ruleItem;
    }

    // Delete redirector with confirmation
    deleteRedirector(type, index) {
        if (this.showConfirmation('Are you sure you want to delete this redirector?')) {
            this.rulesEngine.removeRedirector(type, index);
            this.refreshRulesList();
        }
    }

    // Delete mirror with confirmation
    deleteMirror(originalUrl, index) {
        if (this.showConfirmation('Are you sure you want to delete this mirror?')) {
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
                // Trigger immediate analysis
                this.handleSearch(true);
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            this.showStatus('Failed to read clipboard. Please check permissions.', 'error');
        }
    }

    // Handle GitHub button click
    handleGitHubClick() {
        this.elements.urlInput.value = 'https://github.com/sc-hua/LinkJump';
        this.handleSearch();
    }

    // Handle jump to URL
    handleJumpToUrl() {
        const inputUrl = this.elements.urlInput.value.trim();
        if (!inputUrl) {
            this.showStatus('Please enter a URL first', 'error');
            return;
        }

        const normalizedUrl = normalizeUrl(inputUrl);
        if (!this.isValidUrl(normalizedUrl)) {
            this.showStatus('Please enter a valid URL', 'error');
            return;
        }

        // Open URL in new tab
        window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
        this.showStatus('Opened in new tab', 'success');
    }

    // Handle theme toggle
    handleThemeToggle() {
        const newTheme = this.themeManager.nextTheme();
        this.updateThemeButton();
        console.log(`Theme changed to: ${newTheme}`);
    }

    // Update theme button appearance
    updateThemeButton() {
        if (this.elements.themeBtn) {
            const currentTheme = this.themeManager.getCurrentIconName();
            this.elements.themeBtn.innerHTML = renderIcon(currentTheme);
            this.elements.themeBtn.title = this.themeManager.getThemeDescription();
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
