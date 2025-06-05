/**
 * Utilities Module
 * Common utility functions used across the website
 */

const UtilsModule = (function() {
    'use strict';
    
    /**
     * Throttle function to limit how often a function can be called
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} - Throttled function
     */
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        
        return function() {
            const context = this;
            const args = arguments;
            
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    /**
     * Debounce function to delay execution until after a wait period
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} - Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        
        return function() {
            const context = this;
            const args = arguments;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
    
    /**
     * Check if an element is in viewport
     * @param {HTMLElement} el - Element to check
     * @returns {boolean} - Is element in viewport
     */
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Get current viewport size
     * @returns {Object} - Viewport width and height
     */
    function getViewportSize() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }
    
    /**
     * Check if device is mobile
     * @returns {boolean} - Is mobile device
     */
    function isMobileDevice() {
        return (window.innerWidth <= 768);
    }
    
    /**
     * Get browser language
     * @returns {string} - Browser language code
     */
    function getBrowserLanguage() {
        return navigator.language || navigator.userLanguage || 'en';
    }
    
    // Public API
    return {
        throttle: throttle,
        debounce: debounce,
        isInViewport: isInViewport,
        getViewportSize: getViewportSize,
        isMobileDevice: isMobileDevice,
        getBrowserLanguage: getBrowserLanguage
    };
})();

// Export the module
window.UtilsModule = UtilsModule; 