/**
 * Language Switcher Module
 * Handles language switching functionality and text updates
 */

const LanguageModule = (function () {
    'use strict';

    // Private variables
    let currentLang;

    /**
     * Initialize the language switcher
     */
    function init() {
        const langButtons = document.querySelectorAll('.lang-btn');
        const elementsWithLang = document.querySelectorAll('[data-en], [data-ar]');
        const languageSwitcher = document.querySelector('.language-switcher');

        // Set default language (Arabic)
        currentLang = localStorage.getItem('zaheb-language') || 'ar-kw';

        // Ensure the language code is valid
        if (currentLang !== 'en' && currentLang !== 'ar' && currentLang !== 'ar-kw') {
            currentLang = 'ar-kw';
            localStorage.setItem('zaheb-language', currentLang);
        }

        // Set language immediately
        setLanguage(currentLang);

        // Initialize active buttons
        updateAllLangButtons(currentLang);

        // Add event listeners to language buttons
        addEventListeners(langButtons);

        // Add scroll effect for language switcher
        if (languageSwitcher) {
            addScrollEffect(languageSwitcher);
        }

        // Hide loading indicators
        hideLoadingIndicators();

        // Log current language state
        console.log('Language initialized:', currentLang);
    }

    /**
     * Update all language buttons to reflect current language
     * @param {string} lang - The current language code
     */
    function updateAllLangButtons(lang) {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            // Map ar-kw to ar for button data-lang attribute
            const buttonLang = btn.getAttribute('data-lang');
            const isActive = (buttonLang === 'ar' && (lang === 'ar-kw' || lang === 'ar')) || buttonLang === lang;

            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Add event listeners to language buttons
     * @param {NodeList} langButtons - Collection of language buttons
     */
    function addEventListeners(langButtons) {
        langButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Map 'ar' button to 'ar-kw' for storage and API
                const buttonLang = this.getAttribute('data-lang');
                const lang = buttonLang === 'ar' ? 'ar-kw' : buttonLang;

                // Save language preference
                localStorage.setItem('zaheb-language', lang);
                console.log('Language preference saved:', lang);

                // Close mobile menu if open when language is switched
                const nav = document.querySelector('.nav');
                const menuBtn = document.querySelector('.mobile-menu-btn');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (menuBtn) {
                        menuBtn.classList.remove('active');
                        const spans = menuBtn.querySelectorAll('span');
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }

                // Reload the page to apply language changes
                window.location.reload();
            });

            // Add touch events for mobile
            btn.addEventListener('touchstart', function () {
                this.style.opacity = '0.8';
            });

            btn.addEventListener('touchend', function () {
                this.style.opacity = '1';
            });
        });
    }

    /**
     * Add scroll effect for language switcher
     * @param {HTMLElement} languageSwitcher - The language switcher element
     */
    function addScrollEffect(languageSwitcher) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                languageSwitcher.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            } else {
                languageSwitcher.style.backgroundColor = 'var(--glass-background)';
            }
        });
    }

    /**
     * Hide all loading indicators on the page
     */
    function hideLoadingIndicators() {
        setTimeout(() => {
            const loadingIndicators = document.querySelectorAll('.loading-indicator');
            loadingIndicators.forEach(indicator => {
                if (indicator) {
                    indicator.style.display = 'none';
                }
            });
        }, 1500);
    }

    /**
     * Set the language and update all text content
     * @param {string} lang - The language code to set
     */
    function setLanguage(lang) {
        // Update current language
        currentLang = lang;
        console.log('Setting language to:', lang);

        // Set HTML direction and lang attribute
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar-kw' || lang === 'ar' ? 'rtl' : 'ltr';
        document.body.classList.remove('rtl');

        if (lang === 'ar-kw' || lang === 'ar') {
            document.body.classList.add('rtl');
        }

        // Update text content - map ar-kw to ar for data attributes
        const elementsWithLang = document.querySelectorAll('[data-en], [data-ar]');
        elementsWithLang.forEach(el => {
            // Use 'ar' for data attribute even when language is 'ar-kw'
            const dataLang = lang === 'ar-kw' ? 'ar' : lang;
            const langText = el.getAttribute(`data-${dataLang}`);
            if (langText) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = langText;
                } else {
                    el.innerHTML = langText;
                }
            }
        });

        // Update WhatsApp button tooltip
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        if (whatsappBtn) {
            if (lang === 'ar-kw' || lang === 'ar') {
                whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-ar-tooltip'));
            } else {
                whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-en-tooltip'));
            }
        }

        // Trigger custom event for other modules
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    // Public API
    return {
        init: init,
        getCurrentLanguage: function () { return currentLang; },
        setLanguage: setLanguage
    };
})();

// Export the module
window.LanguageModule = LanguageModule; 