/**
 * Zaheb International - Language Functionality
 * This file contains all language-related JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initLanguageSwitcher();
});

/**
 * Language Switcher Functionality
 */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elementsWithLang = document.querySelectorAll('[data-en], [data-ar]');
    const languageSwitcher = document.querySelector('.language-switcher');
    
    // Set default language (Arabic)
    let currentLang = localStorage.getItem('zaheb-language') || 'ar';
    setLanguage(currentLang);
    
    // Set active button on both desktop and mobile language switchers
    function updateAllLangButtons(lang) {
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Initialize active buttons
    updateAllLangButtons(currentLang);
    
    // Add click event with improved touch handling to all language buttons
    langButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            
            // Update all language buttons (both desktop and mobile)
            updateAllLangButtons(lang);
            
            // Save language preference
            localStorage.setItem('zaheb-language', lang);
            
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
        });
        
        // Add touch events for mobile
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // Ensure language switcher is visible on scroll
    if (languageSwitcher) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                languageSwitcher.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            } else {
                languageSwitcher.style.backgroundColor = 'var(--glass-background)';
            }
        });
    }
    
    // Function to set language
    function setLanguage(lang) {
        // Set HTML direction
        document.documentElement.lang = lang;
        document.body.classList.remove('rtl');
        
        if (lang === 'ar') {
            document.body.classList.add('rtl');
        }
        
        // Update text content
        elementsWithLang.forEach(el => {
            const langText = el.getAttribute(`data-${lang}`);
            if (langText) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = langText;
                } else {
                    el.innerHTML = langText;
                }
            }
        });
        
        // Update WhatsApp tooltip if the function exists
        if (typeof updateWhatsAppTooltip === 'function') {
            updateWhatsAppTooltip();
        }
    }
} 