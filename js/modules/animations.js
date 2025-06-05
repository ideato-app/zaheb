/**
 * Animations Module
 * Handles animations and UI effects
 */

const AnimationsModule = (function() {
    'use strict';
    
    /**
     * Initialize animations
     */
    function init() {
        initFadeInAnimations();
        
        // Add resize handler with debounce
        if (window.UtilsModule) {
            window.addEventListener('resize', window.UtilsModule.debounce(function() {
                // Refresh animations on resize if needed
                refreshAnimations();
            }, 250));
        }
    }
    
    /**
     * Initialize fade-in animations using Intersection Observer for better performance
     */
    function initFadeInAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in');
        
        if (animatedElements.length) {
            // Check if IntersectionObserver is supported
            if ('IntersectionObserver' in window) {
                // Use Intersection Observer for better performance
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                            
                            // Unobserve after animation to improve performance
                            observer.unobserve(entry.target);
                        }
                    });
                }, { 
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });
                
                animatedElements.forEach(el => {
                    // Set initial state
                    setInitialState(el);
                    
                    // Observe element
                    observer.observe(el);
                });
            } else {
                // Fallback for browsers that don't support IntersectionObserver
                animatedElements.forEach(el => {
                    setInitialState(el);
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            }
        }
    }
    
    /**
     * Set initial state for animated element
     * @param {HTMLElement} el - Element to animate
     */
    function setInitialState(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
    
    /**
     * Refresh animations if needed
     */
    function refreshAnimations() {
        // This function can be used to refresh animations on resize or other events
        // Currently not needed but included for future use
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export the module
window.AnimationsModule = AnimationsModule; 