const DEBUG = false;
let currentDateOffset = 0;
let currentLanguage = 'en';

// --- Localization dictionary for all UI strings ---
const locales = {
  en: {
    dateLocale: 'en-US',
    editedBy: 'Edited by',
    sourceFormat: (sourceLink, authorLink) => `from ${sourceLink} by ${authorLink}`,
    drawerTitleLanguage: 'Choose Language',
    drawerTitleTheme: 'Choose Theme',
    languageButton: 'English',
    themeButton: 'System',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
  },
  ja: {
    dateLocale: 'ja-JP',
    editedBy: '編集者',
    sourceFormat: (sourceLink, authorLink) => `${sourceLink} &nbsp; ${authorLink}著`,
    drawerTitleLanguage: '言語を選択',
    drawerTitleTheme: 'テーマを選択',
    languageButton: '日本語',
    themeButton: 'システム',
    themeSystem: 'システム',
    themeLight: 'ライト',
    themeDark: 'ダーク',
  },
  es: {
    dateLocale: 'es-ES',
    editedBy: 'Editado por',
    sourceFormat: (sourceLink, authorLink) => `de ${sourceLink} por ${authorLink}`,
    drawerTitleLanguage: 'Elige un idioma',
    drawerTitleTheme: 'Elige un tema',
    languageButton: 'Español',
    themeButton: 'Sistema',
    themeSystem: 'Sistema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
  },
  ko: {
    dateLocale: 'ko-KR',
    editedBy: '편집',
    sourceFormat: (sourceLink, authorLink) => `${sourceLink}, ${authorLink} 저`,
    drawerTitleLanguage: '언어 선택',
    drawerTitleTheme: '테마 선택',
    languageButton: '한국어',
    themeButton: '시스템',
    themeSystem: '시스템',
    themeLight: '라이트',
    themeDark: '다크',
  }
};

// --- Localization fallback helper ---
// Returns the localized string for a key, falling back to English if missing.
// In DEBUG mode, highlights missing translations in the UI.
function getLocaleString(language, key) {
  const locale = locales[language] || locales.en;
  if (locale[key] !== undefined) {
    return locale[key];
  }
  if (DEBUG) {
    // Highlight missing translation in dev mode
    return `%c[MISSING] ${locales.en[key] || key}`;
  }
  return locales.en[key] || key;
}

// --- UI localization application ---
// Updates all UI elements with localized strings for the given language.
function applyLocalization(language) {
  // Localize "Edited by"
  const editorElement = document.querySelector('.editor');
  if (editorElement) {
    const link = editorElement.querySelector('a');
    let editedBy = getLocaleString(language, 'editedBy');
    if (DEBUG && editedBy.startsWith('%c[MISSING]')) {
      editorElement.innerHTML = `<span style="background:yellow;">${editedBy.replace('%c','')}</span> ${link.outerHTML}`;
    } else {
      editorElement.innerHTML = `${editedBy} ${link.outerHTML}`;
    }
  }

  // Localize language and theme button text
  const languageButton = document.getElementById('language-button');
  if (languageButton) {
    const langText = languageButton.querySelector('.language-text');
    let label = getLocaleString(language, 'languageButton');
    if (langText) {
      if (DEBUG && label.startsWith('%c[MISSING]')) {
        langText.innerHTML = `<span style='background:yellow;'>${label.replace('%c','')}</span>`;
      } else {
        langText.textContent = label;
      }
    }
  }
  const currentTheme = getSavedThemePreference();
  // Update theme button text to match selected theme
  const themeButton = document.getElementById('theme-button');
  if (themeButton) {
    const themeText = themeButton.querySelector('.theme-text');
    let label = '';
    if (currentTheme === 'system') label = getLocaleString(language, 'themeSystem');
    else if (currentTheme === 'light') label = getLocaleString(language, 'themeLight');
    else if (currentTheme === 'dark') label = getLocaleString(language, 'themeDark');
    else {
      label = getLocaleString(language, 'themeSystem');
      if (DEBUG) console.warn('Unknown theme value for theme button:', currentTheme);
    }
    if (themeText) themeText.textContent = label;
    else if (DEBUG) console.warn('theme-text span not found in theme-button');
  } else if (DEBUG) {
    console.warn('theme-button not found');
  }

  // Localize theme option buttons
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    const theme = option.dataset.theme;
    let label = '';
    if (theme === 'system') label = getLocaleString(language, 'themeSystem');
    else if (theme === 'light') label = getLocaleString(language, 'themeLight');
    else if (theme === 'dark') label = getLocaleString(language, 'themeDark');
    // Remove the checkmark SVG (first child), set text, then re-append SVG
    const svg = option.querySelector('.checkmark');
    option.innerHTML = '';
    if (svg) option.appendChild(svg);
    option.appendChild(document.createTextNode(label));
    // Update selected state
    option.classList.toggle('selected', option.dataset.theme === currentTheme);
  });

  // Ensure quote is visible
  const quoteElement = document.getElementById('quote');
  if (quoteElement && quoteElement.textContent.trim() === '') {
    updateOffset(0, true);
  }
}

function saveLanguagePreference(lang) {
  localStorage.setItem('language', lang);
}

function getSavedLanguagePreference() {
  return localStorage.getItem('language') || 'en';
}

function initLanguageSelector() {
  const languageButton = document.getElementById('language-button');
  const languageDropdown = document.getElementById('language-dropdown');
  const languageOptions = document.querySelectorAll('.language-option');

  let savedLang = getSavedLanguagePreference();
  currentLanguage = savedLang;
  const selectedOption = Array.from(languageOptions).find(opt => opt.dataset.lang === savedLang);
  if (selectedOption) {
    languageButton.querySelector('.language-text').textContent = selectedOption.textContent.trim();
    languageOptions.forEach(opt => opt.classList.remove('selected'));
    selectedOption.classList.add('selected');
  }

  languageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const locale = locales[currentLanguage] || locales.en;
    if (window.innerWidth <= 640) {
      openDrawer(locale.drawerTitleLanguage, Array.from(languageOptions), (selectedOpt) => {
        const selectedLang = selectedOpt.dataset.lang;
        currentLanguage = selectedLang;
        saveLanguagePreference(selectedLang);
        languageButton.querySelector('.language-text').textContent = selectedOpt.textContent.trim();
        languageOptions.forEach(opt => opt.classList.remove('selected'));
        const originalOption = Array.from(languageOptions).find(opt => opt.dataset.lang === selectedLang);
        if (originalOption) originalOption.classList.add('selected');
        applyLocalization(selectedLang);
        // Animate quote/source on language change: fade out, update, fade in
        const quoteElement = document.getElementById("quote");
        const sourceElement = document.getElementById("source");
        quoteElement.classList.add('transitioning');
        sourceElement.classList.add('transitioning');
        setTimeout(() => {
          updateOffset(0); // update text (no animation in renderQuote)
          setTimeout(() => {
            quoteElement.classList.remove('transitioning');
            sourceElement.classList.remove('transitioning');
          }, 20);
        }, 420); // Wait for fade-out (match CSS transition)
      });
    } else {
      const isOpen = languageDropdown.classList.contains('show');
      if (isOpen) closeLanguageDropdown();
      else openLanguageDropdown();
    }
  });

  languageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedLang = option.dataset.lang;
      currentLanguage = selectedLang;
      saveLanguagePreference(selectedLang);
      languageButton.querySelector('.language-text').textContent = option.textContent.trim();
      languageOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      closeLanguageDropdown();
      applyLocalization(selectedLang);
      // Animate quote/source on language change: fade out, update, fade in
      const quoteElement = document.getElementById("quote");
      const sourceElement = document.getElementById("source");
      quoteElement.classList.add('transitioning');
      sourceElement.classList.add('transitioning');
      setTimeout(() => {
        updateOffset(0); // update text (no animation in renderQuote)
        setTimeout(() => {
          quoteElement.classList.remove('transitioning');
          sourceElement.classList.remove('transitioning');
        }, 20);
      }, 420); // Wait for fade-out (match CSS transition)
    });
  });

  document.addEventListener('click', closeLanguageDropdown);
  languageDropdown.addEventListener('click', (e) => e.stopPropagation());
}

function openLanguageDropdown() {
  const languageDropdown = document.getElementById('language-dropdown');
  const themeDropdown = document.getElementById('theme-dropdown');
  if (themeDropdown) themeDropdown.classList.remove('show'); // Close theme dropdown if open
  languageDropdown.classList.add('show');
}

function closeLanguageDropdown() {
  const languageDropdown = document.getElementById('language-dropdown');
  languageDropdown.classList.remove('show');
}

function animateThemeTransition() {
  const body = document.body;
  body.classList.add('theme-transitioning');
  setTimeout(() => body.classList.remove('theme-transitioning'), 420);
}

function applyTheme(theme) {
  animateThemeTransition();
  const body = document.body;
  body.classList.remove('dark', 'light');
  if (theme === 'dark') {
    body.classList.add('dark');
  } else if (theme === 'light') {
    body.classList.add('light');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark');
    }
  }
}

function saveThemePreference(theme) {
  localStorage.setItem('theme', theme);
}

function getSavedThemePreference() {
  return localStorage.getItem('theme') || 'system';
}

function initThemeSelector() {
  const themeButton = document.getElementById('theme-button');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptions = document.querySelectorAll('.theme-option');

  let currentTheme = getSavedThemePreference();
  applyTheme(currentTheme);
  themeOptions.forEach(opt => opt.classList.toggle('selected', opt.dataset.theme === currentTheme));

  themeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const locale = locales[currentLanguage] || locales.en;
    if (window.innerWidth <= 640) {
      openDrawer(locale.drawerTitleTheme, Array.from(themeOptions), (selectedOpt) => {
        const newTheme = selectedOpt.dataset.theme;
        applyTheme(newTheme);
        saveThemePreference(newTheme);
        applyLocalization(currentLanguage);
        themeOptions.forEach(opt => opt.classList.remove('selected'));
        const originalOption = Array.from(themeOptions).find(opt => opt.dataset.theme === newTheme);
        if (originalOption) originalOption.classList.add('selected');
      });
    } else {
      const isOpen = themeDropdown.classList.contains('show');
      if (isOpen) closeThemeDropdown();
      else openThemeDropdown();
    }
  });

  themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const newTheme = option.dataset.theme;
      applyTheme(newTheme);
      saveThemePreference(newTheme);
      applyLocalization(currentLanguage);
      themeOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      closeThemeDropdown();
    });
  });

  document.addEventListener('click', closeThemeDropdown);
  themeDropdown.addEventListener('click', (e) => e.stopPropagation());
}

function openThemeDropdown() {
  const themeDropdown = document.getElementById('theme-dropdown');
  const languageDropdown = document.getElementById('language-dropdown');
  if (languageDropdown) languageDropdown.classList.remove('show'); // Close language dropdown if open
  themeDropdown.classList.add('show');
}

function closeThemeDropdown() {
  const themeDropdown = document.getElementById('theme-dropdown');
  themeDropdown.classList.remove('show');
}

// --- Accessibility: Focus trap, ARIA, and keyboard navigation for drawer ---
function initMobileDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer = document.getElementById('mobile-drawer');
  const closeButton = document.getElementById('close-drawer-button');

  // Accessibility: Announce drawer open/close to screen readers
  let liveRegion = document.getElementById('drawer-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'drawer-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    document.body.appendChild(liveRegion);
  }

  // Closes the drawer and restores focus
  const closeDrawer = () => {
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    liveRegion.textContent = 'Dialog closed';
    // Restore focus to the button that opened the drawer
    if (drawer._lastOpener) drawer._lastOpener.focus();
  };

  overlay.addEventListener('click', closeDrawer);
  closeButton.addEventListener('click', closeDrawer);

  // Keyboard accessibility for drawer
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
    // Trap focus inside the drawer
    if (e.key === 'Tab') {
      const focusable = drawer.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}

// --- Accessibility: Open drawer, insert options, and manage focus/keyboard ---
function openDrawer(title, options, onSelect) {
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerContent = document.getElementById('drawer-content');
  const liveRegion = document.getElementById('drawer-live-region');

  drawerTitle.textContent = title;
  drawerContent.innerHTML = '';

  // Accessibility: Announce drawer open
  if (liveRegion) liveRegion.textContent = 'Dialog opened';

  // Insert options and set up keyboard navigation
  options.forEach((option, idx) => {
    const button = option.cloneNode(true);
    button.tabIndex = 0;
    button.addEventListener('click', () => {
      onSelect(button);
      drawer.classList.remove('show');
      overlay.classList.remove('show');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      if (liveRegion) liveRegion.textContent = 'Dialog closed';
      if (drawer._lastOpener) drawer._lastOpener.focus();
    });
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
    drawerContent.appendChild(button);
  });

  drawer.classList.add('show');
  overlay.classList.add('show');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');

  // Focus management: focus the first option
  setTimeout(() => {
    const firstBtn = drawerContent.querySelector('button');
    if (firstBtn) firstBtn.focus();
  }, 10);

  // Remember the opener for focus restoration
  drawer._lastOpener = document.activeElement;
}

let quotes = [];

// --- Language detection: Use browser language on first load if no preference ---
function detectBrowserLanguage() {
  const supported = Object.keys(locales);
  const navLangs = navigator.languages ? navigator.languages : [navigator.language];
  for (const lang of navLangs) {
    const base = lang.split('-')[0];
    if (supported.includes(base)) return base;
  }
  return 'en';
}

// --- App initialization ---
async function init() {
  quotes = await loadQuotesDatabase();

  // Automated language detection on first load
  let savedLang = getSavedLanguagePreference();
  if (!localStorage.getItem('language')) {
    const detected = detectBrowserLanguage();
    currentLanguage = detected;
    saveLanguagePreference(detected);
  } else {
    currentLanguage = savedLang;
  }

  initLanguageSelector();
  initThemeSelector();
  initMobileDrawer();
  applyLocalization(currentLanguage);

  // Ensure quote/source are visible on first load
  const quoteElement = document.getElementById("quote");
  const sourceElement = document.getElementById("source");
  if (quoteElement) quoteElement.classList.remove('transitioning');
  if (sourceElement) sourceElement.classList.remove('transitioning');

  updateOffset(0, true); // Initial load: skip dissolve
  initMinimalistMode();
  initScreenshot();
}

function updateOffset(offsetDelta, isInitialLoad = false) {
  currentDateOffset += offsetDelta;
  const date = getDateWithOffset(currentDateOffset);
  const dayOfYear = getDayOfYear(date);
  const index = getQuoteIndex(dayOfYear, quotes.length);
  const quote = quotes[index];
  renderQuote(quote, date, index, quotes.length, isInitialLoad);
}

window.addEventListener("DOMContentLoaded", init);

// Utility: Loads the quotes database from the JSON file
async function loadQuotesDatabase() {
  try {
    const response = await fetch(chrome.runtime.getURL("public/quotes-database.json"));
    return await response.json();
  } catch (error) {
    console.error("Failed to load quotes database:", error);
    return [
      {
        id: 1,
        text: "Learn how to learn from those who disagree with you",
        source: "68 Bits of Unsolicited Advice",
        author: "Kevin Kelly",
        url: "https://www.youtube.com/watch?v=Zz70rcguxwk",
        authorUrl: "https://kk.org/",
        text_ko: "당신과 의견이 다른 사람에게서 배우는 법을 익히세요"
      }
    ];
  }
}

// Utility: Returns a date object offset by the given number of days
function getDateWithOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

// Utility: Returns the day of the year for a given date
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Utility: Returns the quote index for the day
function getQuoteIndex(dayOfYear, length) {
  return dayOfYear % length;
}

// Utility: Returns the localized quote text
function getQuoteText(quote, language) {
  if (language === 'ja' && quote.text_ja) return quote.text_ja;
  if (language === 'ko' && quote.text_ko) return quote.text_ko;
  if (language === 'es' && quote.text_es) return quote.text_es;
  return quote.text;
}

// --- Responsive text sizing for mobile ---
function adjustTextSizeForMobile(quote) {
  const quoteElement = document.getElementById("quote");
  if (!quoteElement) return;

  // Consider text "long" if it's over 150 characters on mobile (increased threshold)
  const isMobile = window.innerWidth <= 640;
  const isLongText = quote.text.length > 150;

  if (isMobile && isLongText) {
    quoteElement.classList.add('long-text');
  } else {
    quoteElement.classList.remove('long-text');
  }
}

// --- Main display function ---
function renderQuote(quote, date, index, total, isInitialLoad) {
  const quoteElement = document.getElementById("quote");
  const sourceElement = document.getElementById("source");
  const locale = locales[currentLanguage] || locales.en;

  const quoteText = getQuoteText(quote, currentLanguage);
  quoteElement.innerHTML = `"${quoteText}"`;

  const sourceLink = `<a href="${quote.url}" target="_blank" rel="noopener noreferrer">${quote.source}</a>`;
  const authorLink = `<a href="${quote.authorUrl}" target="_blank" rel="noopener noreferrer">${quote.author}</a>`;
  let sourceFormat = getLocaleString(currentLanguage, 'sourceFormat');
  let sourceHTML;
  if (typeof sourceFormat === 'function') {
    sourceHTML = sourceFormat(sourceLink, authorLink);
  } else {
    sourceHTML = `${sourceLink} ${authorLink}`;
  }
  if (DEBUG && typeof sourceFormat !== 'function' && sourceFormat.startsWith('%c[MISSING]')) {
    sourceElement.innerHTML = `<span style='background:yellow;'>${sourceFormat.replace('%c','')}</span>`;
  } else {
    sourceElement.innerHTML = sourceHTML;
  }
  const dateLocale = getLocaleString(currentLanguage, 'dateLocale');
  document.getElementById("date").textContent = date.toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" });

  // On initial load, ensure quote/source are visible (no dissolve)
  if (isInitialLoad) {
    quoteElement.classList.remove('transitioning');
    sourceElement.classList.remove('transitioning');
  }

  adjustTextSizeForMobile(quote);
}

// Minimalist Mode logic
function initMinimalistMode() {
  const body = document.body;
  const toggleButton = document.getElementById('minimalist-toggle');

  // Check if on mobile device
  const isMobile = window.innerWidth <= 640;

  // Load preference or set default for mobile
  const savedPreference = localStorage.getItem('minimalistMode');
  if (savedPreference === 'true' || (savedPreference === null && isMobile)) {
    body.classList.add('minimalist');
    // Save the preference if it's the first time on mobile
    if (savedPreference === null && isMobile) {
      localStorage.setItem('minimalistMode', 'true');
    }
  }

  // Add button click toggle logic with animation
  toggleButton.addEventListener('click', function(e) {
    e.stopPropagation();
    // Animate out, then toggle, then animate in
    body.classList.add('minimalist-animating');
    setTimeout(() => {
      body.classList.toggle('minimalist');
      localStorage.setItem('minimalistMode', body.classList.contains('minimalist'));
      // Animate in
      setTimeout(() => {
        body.classList.remove('minimalist-animating');
      }, 400); // match CSS transition duration
    }, 400); // match CSS transition duration
  });
}

// --- Screenshot Feature ---
function initScreenshot() {
  const screenshotButton = document.getElementById('screenshot-button');

  screenshotButton.addEventListener('click', async function(e) {
    e.stopPropagation();

    try {
      // Import html2canvas dynamically
      const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');

      // Temporarily hide UI elements for clean screenshot
      const uiElements = document.querySelectorAll('.selector, .editor, .minimalist-toggle, .screenshot-button, .mobile-drawer, .mobile-drawer-overlay');
      uiElements.forEach(el => el.style.display = 'none');

      // Get current background color from CSS custom property
      const computedStyle = getComputedStyle(document.body);
      const backgroundColor = computedStyle.getPropertyValue('--bg').trim();

      // Detect if we're on mobile or desktop based on viewport width
      const isMobile = window.innerWidth <= 640;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Generate screenshot of entire viewport
      const canvas = await html2canvas.default(document.body, {
        backgroundColor: backgroundColor,
        width: viewportWidth,
        height: viewportHeight,
        scale: isMobile ? 2 : 2, // High resolution for both mobile and desktop
        useCORS: true,
        allowTaint: true,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: viewportWidth,
        windowHeight: viewportHeight,
        foreignObjectRendering: true,
        imageTimeout: 0,
        removeContainer: false
      });

      // Restore UI elements
      uiElements.forEach(el => el.style.display = '');

      // Handle mobile vs desktop differently
      if (isMobile) {
        // On mobile, convert to blob and use share API or direct save
        canvas.toBlob(async (blob) => {
          try {
            // Try to use the Web Share API first (works on mobile)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'quote.png', { type: 'image/png' })] })) {
              const today = new Date();
              const dateString = today.toISOString().split('T')[0];
              const file = new File([blob], `quiet-quote-${dateString}.png`, { type: 'image/png' });
              await navigator.share({
                files: [file],
                title: 'Daily Quote',
                text: 'Check out this daily quote!'
              });
            } else {
              // Fallback: create a temporary URL and try to open it
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const today = new Date();
              const dateString = today.toISOString().split('T')[0];
              link.download = `quiet-quote-mobile-${dateString}.png`;
              
              // For iOS Safari, we'll try to open the image in a new tab
              // User can then long-press and "Save to Photos"
              if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                window.open(url, '_blank');
                // Show a helpful message
                setTimeout(() => {
                  alert('To save to Photos: Long press the image and select "Save to Photos"');
                }, 500);
              } else {
                // Regular download for other mobile browsers
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              
              // Clean up
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
          } catch (error) {
            console.error('Mobile share failed:', error);
            // Final fallback: regular download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            link.download = `quiet-quote-mobile-${dateString}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        }, 'image/png', 1.0);
      } else {
        // Desktop: use traditional download
        const link = document.createElement('a');
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        link.download = `quiet-quote-desktop-${dateString}.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error('Screenshot failed:', error);
      // Fallback: show a simple alert
      alert('Screenshot feature temporarily unavailable. Please try again.');
    }
  });
}