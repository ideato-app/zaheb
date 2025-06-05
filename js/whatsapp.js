/**
 * Zaheb International - WhatsApp Functionality
 * This file contains all WhatsApp-related JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initWhatsAppTooltip();
});

/**
 * Initialize WhatsApp tooltip functionality
 */
function initWhatsAppTooltip() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    if (whatsappBtn) {
        // Set initial tooltip based on current language
        updateWhatsAppTooltip();
        
        // Add hover effects for mobile
        whatsappBtn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        whatsappBtn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    }
}

/**
 * Update WhatsApp tooltip based on current language
 * This function is called from main.js when language changes
 */
function updateWhatsAppTooltip() {
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    
    if (whatsappBtn) {
        const currentLang = document.documentElement.lang || 'ar';
        
        if (currentLang === 'ar') {
            whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-ar-tooltip'));
        } else {
            whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-en-tooltip'));
        }
    }
} 