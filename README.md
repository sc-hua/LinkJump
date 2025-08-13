# A tool for redirecting URLs in a flexible and customizable way.

English | [中文](./README_ZH.md)


## Supported Browsers
- <img src="./logos/chrome.svg" width="20" height="20" style="vertical-align:top;"/> Chrome: See [here](./Chrome/README.md) for the main code.

- <img src="./logos/firefox.svg" alt="Firefox" width="20" height="20" style="vertical-align:top;"/> Firefox: To be done.

- <img src="./logos/microsoft-edge-96.png" alt="Edge" width="20" height="20" style="vertical-align:top;"/> Edge: To be done.

- <img src="./logos/safari-200.png" alt="Safari" width="20" height="20" style="vertical-align:top;"/> Safari: See below. 👇👇

## For Safari

The Safari and Chrome extensions share nearly identical codebases with only minimal differences:

### Identical Files (100% same code):
- `content.js` - Core functionality for page manipulation
- `popup.js` - Extension popup interface logic  
- `popup.html` - Extension popup interface structure
- `popup.css` - Extension popup styling
- `utils.js` - Shared utility functions and configurations

### Key Differences:

**1. Manifest Structure (`manifest.json`)**
- **Safari**: Multiple icon sizes (`48px`, `96px`, `128px`, `256px`, `512px`) 
- **Safari**: Icons stored in `images/` folder with SVG toolbar icon
- **Safari**: Uses `"scripting"` permission (Safari-specific)
- **Chrome**: Single `128px` icon as `icon.png`
- **Chrome**: Uses `"activeTab"` permission (Chrome-specific)

**2. Directory Structure**
- **Safari only**: `images/` folder with multiple icon formats
- **Chrome only**: Single `icon.png` file

### Migration Notes:
The code migration was nearly 1:1, proving excellent cross-browser compatibility. The main effort was in manifest configuration rather than code changes. Both extensions support:
- arXiv paper redirections
- GitHub repository alternatives  
- Scholar Inbox integration
- Identical user interface and functionality

### Optimization Recommendation:
The Chrome extension's `background.js` file is not referenced in the manifest and serves no purpose. It can be safely deleted to clean up the codebase.






## Resources

- Mozilla WebExtension development tutorials (Firefox). ([ZH](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions), [EN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions))