/**
 * WhatsApp Module
 * Handles WhatsApp button functionality
 */

const WhatsAppModule = (function() {
    'use strict';
    
    /**
     * Initialize WhatsApp functionality
     */
    function init() {
        initWhatsAppButton();
        
        // Listen for language changes
        document.addEventListener('languageChanged', handleLanguageChange);
    }
    
    /**
     * Initialize WhatsApp button
     */
    function initWhatsAppButton() {
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        
        if (whatsappBtn) {
            // Set initial tooltip based on current language
            updateTooltip(whatsappBtn);
            
            // Add pulse animation pause on hover
            whatsappBtn.addEventListener('mouseenter', function() {
                this.style.animation = 'none';
            });
            
            whatsappBtn.addEventListener('mouseleave', function() {
                this.style.animation = 'pulse 2s infinite';
            });
        }
    }
    
    /**
     * Update WhatsApp button tooltip based on language
     * @param {HTMLElement} whatsappBtn - The WhatsApp button element
     */
    function updateTooltip(whatsappBtn) {
        const currentLang = document.documentElement.lang || 'ar';
        
        if (currentLang === 'ar') {
            whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-ar-tooltip'));
        } else {
            whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-en-tooltip'));
        }
    }
    
    /**
     * Handle language change event
     * @param {CustomEvent} e - Language change event
     */
    function handleLanguageChange(e) {
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        if (whatsappBtn) {
            updateTooltip(whatsappBtn);
        }
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export the module
window.WhatsAppModule = WhatsAppModule; 