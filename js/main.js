/**
 * Zaheb International - Main JavaScript
 * Author: Claude AI
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initLanguageSwitcher();
    initMobileMenu();
    initScrollEffects();
    initAnimations();
    
    // Check if we need to initialize contact form
    if (window.location.pathname.includes('contact')) {
        initContactForm();
    }
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
        
        // Update WhatsApp button tooltip
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        if (whatsappBtn) {
            if (lang === 'ar') {
                whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-ar-tooltip'));
            } else {
                whatsappBtn.setAttribute('data-tooltip', whatsappBtn.getAttribute('data-en-tooltip'));
            }
        }
    }
}

/**
 * Mobile Menu Functionality
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
 * Scroll Effects
 */
function initScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.padding = '10px 0';
                header.style.background = 'rgba(255, 255, 255, 0.9)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.padding = '15px 0';
                header.style.background = 'var(--glass-background)';
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
    }
    
    // Active navigation link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length && navLinks.length) {
        window.addEventListener('scroll', function() {
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
        });
    }
}

/**
 * Animations
 */
function initAnimations() {
    // Fade-in animation for elements
    const animatedElements = document.querySelectorAll('.fade-in');
    
    if (animatedElements.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

/**
 * Contact Form Validation
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const nameField = document.getElementById('name');
            const phoneField = document.getElementById('phone');
            const messageField = document.getElementById('message');
            const submitBtn = document.querySelector('#contact-form button[type="submit"]');
            const formStatus = document.getElementById('form-status');
            
            // Simple validation
            let isValid = true;
            
            if (!nameField.value.trim()) {
                markInvalid(nameField);
                isValid = false;
            } else {
                markValid(nameField);
            }
            
            if (!phoneField.value.trim() || !isValidPhone(phoneField.value)) {
                markInvalid(phoneField);
                isValid = false;
            } else {
                markValid(phoneField);
            }
            
            if (!messageField.value.trim()) {
                markInvalid(messageField);
                isValid = false;
            } else {
                markValid(messageField);
            }
            
            // If form is valid, submit
            if (isValid) {
                // Show loading state
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission (replace with actual form submission)
                setTimeout(() => {
                    // Reset form
                    contactForm.reset();
                    
                    // Show success message
                    formStatus.innerHTML = '<div class="alert alert-success">Thank you! Your message has been sent successfully.</div>';
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        formStatus.innerHTML = '';
                    }, 5000);
                }, 1500);
            }
        });
        
        // Helper functions
        function markInvalid(field) {
            field.classList.add('is-invalid');
        }
        
        function markValid(field) {
            field.classList.remove('is-invalid');
        }
        
        function isValidPhone(phone) {
            // Simple phone validation (can be improved)
            return /^[+]?[\d\s-]{8,15}$/.test(phone);
        }
        
        // Clear validation on input
        const formFields = contactForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            });
        });
    }
} 