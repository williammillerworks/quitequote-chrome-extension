# Quiet Quote Chrome Extension

A calm, minimal new tab Chrome extension that shows one meaningful quote a day with multilingual support and theme options.

## Features

- **Daily Quotes**: A new inspiring quote every day
- **Multilingual Support**: Available in English, Japanese, Spanish, and Korean
- **Theme Options**: System, Light, and Dark themes
- **Minimalist Mode**: Toggle to hide UI elements for a cleaner look
- **Screenshot Feature**: Capture and save your favorite quotes
- **Mobile Responsive**: Works perfectly on all screen sizes
- **Privacy Focused**: No tracking, no ads, just quotes

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will now replace your new tab page

### From Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

## Usage

- **Language Selection**: Click the language button to switch between English, Japanese, Spanish, and Korean
- **Theme Selection**: Click the theme button to choose between System, Light, and Dark themes
- **Minimalist Mode**: Click the toggle button to hide UI elements for a cleaner look
- **Screenshot**: Click the screenshot button to capture and save the current quote
- **Mobile**: On mobile devices, use the drawer menu to access all options

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start local server for testing
npm run dev
```

### Building

The extension is ready to use as-is. No build process required.

## Files Structure

```
quitequote-chrome-extension/
├── manifest.json          # Chrome extension manifest
├── newtab.html           # New tab page HTML
├── newtab.css            # Styles
├── newtab.js             # Main functionality
├── assets/               # SVG assets
├── public/               # Public assets
│   ├── quotes-database.json
│   ├── favicon.png
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── privacy.html
└── package.json          # Dependencies
```

## Privacy

This extension:
- Does not collect any personal data
- Does not track user behavior
- Does not require any permissions beyond new tab override
- All quotes are stored locally in the extension

## License

MIT License - see LICENSE.txt for details.

## Credits

Edited by [William Miller](https://williammillerworks.github.io/)

## Version History

- **v1.1.0**: Added multilingual support, theme options, minimalist mode, and screenshot feature
- **v0.1.1**: Initial release with basic quote functionality
