/**
 * Zaheb International - Contact Form Functionality
 * This file contains all contact form related JavaScript functionality
 * Note: This file is only loaded on the contact page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the contact page
    if (window.location.pathname.includes('contact')) {
        initContactForm();
    }
});

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