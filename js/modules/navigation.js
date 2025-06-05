/**
 * Navigation Module
 * Handles mobile menu, navigation, and scroll effects
 */

const NavigationModule = (function() {
    'use strict';
    
    /**
     * Initialize navigation functionality
     */
    function init() {
        initMobileMenu();
        initScrollEffects();
    }
    
    /**
     * Initialize mobile menu functionality
     */
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav');
        
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', function() {
                nav.classList.toggle('active');
                this.classList.toggle('active');
                
                // Transform hamburger to X
                const spans = this.querySelectorAll('span');
                if (this.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    nav.classList.remove('active');
                    menuBtn.classList.remove('active');
                    
                    // Reset hamburger
                    const spans = menuBtn.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                });
            });
        }
    }
    
    /**
     * Initialize scroll effects
     */
    function initScrollEffects() {
        // Header scroll effect
        const header = document.querySelector('.header');
        
        if (header) {
            const handleHeaderScroll = window.UtilsModule ? 
                window.UtilsModule.throttle(updateHeaderOnScroll, 100) : 
                updateHeaderOnScroll;
                
            window.addEventListener('scroll', handleHeaderScroll);
            
            // Initial call
            updateHeaderOnScroll();
        }
        
        // Active navigation link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (sections.length && navLinks.length) {
            const handleNavScroll = window.UtilsModule ? 
                window.UtilsModule.throttle(function() {
                    updateActiveNavLink(sections, navLinks);
                }, 100) : 
                function() {
                    updateActiveNavLink(sections, navLinks);
                };
                
            window.addEventListener('scroll', handleNavScroll);
        }
    }
    
    /**
     * Update header styles on scroll
     */
    function updateHeaderOnScroll() {
        const header = document.querySelector('.header');
        
        if (window.scrollY > 100) {
            header.style.padding = '10px 0';
            header.style.background = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '15px 0';
            header.style.background = 'var(--glass-background)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    }
    
    /**
     * Update active navigation link based on scroll position
     * @param {NodeList} sections - Page sections with IDs
     * @param {NodeList} navLinks - Navigation links
     */
    function updateActiveNavLink(sections, navLinks) {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export the module
window.NavigationModule = NavigationModule; 