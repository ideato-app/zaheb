/**
 * Contact Form Module
 * Handles contact form validation and submission
 */

const ContactModule = (function() {
    'use strict';
    
    /**
     * Initialize contact form
     */
    function init() {
        const contactForm = document.getElementById('contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', handleSubmit);
            
            // Add input event listeners for validation
            const formFields = contactForm.querySelectorAll('input, textarea');
            formFields.forEach(field => {
                field.addEventListener('input', function() {
                    this.classList.remove('is-invalid');
                });
            });
        }
    }
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    function handleSubmit(e) {
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
                e.target.reset();
                
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
    }
    
    /**
     * Mark field as invalid
     * @param {HTMLElement} field - Form field
     */
    function markInvalid(field) {
        field.classList.add('is-invalid');
    }
    
    /**
     * Mark field as valid
     * @param {HTMLElement} field - Form field
     */
    function markValid(field) {
        field.classList.remove('is-invalid');
    }
    
    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} - Is valid phone
     */
    function isValidPhone(phone) {
        // Simple phone validation (can be improved)
        return /^[+]?[\d\s-]{8,15}$/.test(phone);
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export the module
window.ContactModule = ContactModule; 