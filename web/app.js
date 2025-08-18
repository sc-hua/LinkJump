// Main application entry point - coordinates all components
class LinkJumpApp {
    constructor() {
        // Initialize core components
        this.configManager = new ConfigManager();
        this.rulesEngine = new RulesEngine(this.configManager);
        this.uiController = new UIController(this.rulesEngine, this.configManager);
        
        // Enable auto-backup functionality
        this.configManager.enableAutoBackup();
        
        console.log('LinkJump application initialized');
    }

    // Expose methods for HTML onclick handlers (backward compatibility)
    deleteRedirector(type, index) {
        this.uiController.deleteRedirector(type, index);
    }

    deleteMirror(originalUrl, index) {
        this.uiController.deleteMirror(originalUrl, index);
    }
}

// Global application instance for HTML onclick handlers
let linkJump;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    linkJump = new LinkJumpApp();
});
