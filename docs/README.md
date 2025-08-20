# LinkJump Web Interface

EN | [中文](./README_ZH.md)

A standalone web interface for the URL redirector functionality, allowing users to input URLs and discover alternative links with custom rules support.

## Features

- 🔗 **URL Analysis**: Input any supported URL and get alternative links instantly
- ⚙️ **Custom Rules**: Add your own redirector patterns and mirror sites
- 💾 **Persistent Storage**: Custom rules are saved locally in your browser
- 📥📤 **Import/Export**: Backup and share your custom rules as JSON files
- 🎨 **Theme Support**: Clean, responsive interface with automatic dark/light theme
- ⚡ **Real-time Processing**: Instant URL analysis without page refresh
- 🌐 **Cross-platform**: Works on any modern web browser
- 🚀 **Easy Deployment**: Can be deployed to GitHub Pages or any static hosting

## Supported URLs

### Built-in Support
- **ArXiv Papers**: `https://arxiv.org/abs/1706.03762`
- **GitHub Repositories**: `https://github.com/user/repository`
- **Hugging Face**: `https://huggingface.co/models`

### Custom Rules
- Add your own URL patterns with custom redirector sites
- Create mirror site mappings for any domain
- All custom rules are stored locally and persist between sessions

## Usage

### Basic Usage
1. Open the web interface (e.g., `docs/index.html`) in a web browser
2. Enter a URL in the input field
3. Click "Analyze" or press Enter
4. View and click on the alternative links generated

### Custom Rules Management
1. Click the settings button (⚙️) to open the rules manager
2. **Add Custom Redirector**: Define patterns for new site types
   - Site Type: Identifier for the URL type (e.g., "my-site")
   - Name: Display name for the redirector
   - URL Prefix: Base URL that identifies this site type
   - Redirect Template: URL pattern with `{id}` placeholder
3. **Add Mirror Site**: Create mirror mappings for existing sites
   - Original URL: Base URL of the original site
   - Mirror URL: Base URL of the mirror site
   - Display Name: How the mirror will be shown
4. **Import/Export**: Backup and share your rules
   - Export creates a JSON file with all your custom rules
   - Import loads rules from a JSON file
   - Clear removes all custom rules

### Example Custom Rules

**Custom Redirector Example:**
- Site Type: `custom-papers`
- Name: `My Papers Site`
- URL Prefix: `https://mysite.com/paper/`
- Redirect Template: `https://alternative.com/view/{id}`

**Mirror Site Example:**
- Original URL: `https://slowsite.com`
- Mirror URL: `https://fastmirror.com`
- Display Name: `To Fast Mirror`

### GitHub Pages Deployment
1. Push the `docs/` folder contents to your GitHub Pages repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/repository-name/`
4. The interface will be immediately available with all functionality

## File Structure

```
docs/
├── index.html          # Main HTML page with settings modal
├── style.css           # Styling with dark/light theme and modal support
├── utils.js            # Core URL processing utilities
├── config-manager.js   # Configuration file management and local storage
├── rules-engine.js     # URL analysis and redirector logic engine
├── ui-controller.js    # UI interactions and DOM management
├── app.js              # Main application coordinator
├── theme-manager.js    # Theme management and system preference detection
├── icon-config.js      # Icon configuration and management
├── icon-download.js    # Icon download functionality
└── README.md           # This documentation
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **ConfigManager**: Handles configuration persistence with local file storage
- **RulesEngine**: Processes URL analysis and manages redirector rules
- **UIController**: Manages all DOM interactions and user interface
- **LinkJumpApp**: Main coordinator that ties all components together

## Technical Details

### Configuration Storage
- **Primary Storage**: JSON configuration files (exported/imported by user)
- **Cache Layer**: Browser localStorage for temporary caching
- **Auto-backup**: Automatically saves to cache on page unload
- **File-first Approach**: Users explicitly control their configuration files

### Configuration Workflow
1. **Initial Load**: Application loads from localStorage cache if available
2. **User Changes**: All changes are immediately cached in localStorage
3. **Export**: User can download current configuration as JSON file
4. **Import**: User can load configuration from local JSON file
5. **Persistence**: Configuration persists through localStorage cache

### Rule Format
Custom rules are exported/imported in JSON format:
```json
{
  "customRedirectors": {
    "site-type": [
      {
        "name": "Site Name",
        "prefix": "https://site.com/",
        "template": "https://redirect.com/{id}",
        "hover": "View on Site Name",
        "isCustom": true
      }
    ]
  },
  "customMirrors": {
    "https://original.com": [
      {
        "mirror": "https://mirror.com",
        "hover": "To Mirror Site",
        "isCustom": true
      }
    ]
  },
  "version": "1.0",
  "lastModified": "2024-01-01T00:00:00.000Z"
}
```

### Best Practices
- **Regular Exports**: Export your configuration regularly for backup
- **File Organization**: Keep configuration files organized and named clearly
- **Version Control**: Configuration files can be version controlled
- **Sharing**: Easily share rule sets by sharing configuration files

## Browser Compatibility

- Modern browsers with ES6+ support
- File API support required for import/export functionality
- LocalStorage support for caching
- Responsive design for mobile and desktop
- Dark/light theme based on system preference

---

<div align="center">
  If this project helps you or inspires you, please give us a ⭐️
</div>
