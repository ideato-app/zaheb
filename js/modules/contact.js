/**
 * Contact Form Module
 * Handles contact form validation and submission
 */

const ContactModule = (function () {
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
                field.addEventListener('input', function () {
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

document.addEventListener('DOMContentLoaded', function () {
    const API_ENDPOINT = 'https://zaheb.cdn.prismic.io/api/v2';
    const CONTACT_DOC_ID = 'aEV3xBUAAC8AsXi9'; // The unique ID for the contact page document
    const loadingIndicator = document.querySelector('.loading-indicator');

    /**
     * Fetches the latest API data for the contact page
     */
    async function fetchContactData() {
        try {
            // Step 1: Get the latest master ref from the Prismic API
            const apiResponse = await fetch(API_ENDPOINT);
            if (!apiResponse.ok) throw new Error('Failed to connect to Prismic API.');
            const apiData = await apiResponse.json();
            const masterRef = apiData.refs.find(ref => ref.isMasterRef)?.ref;

            if (!masterRef) throw new Error('Could not find master ref in API response.');

            // Step 2: Fetch the 'Contact' document using the master ref
            const docUrl = `${API_ENDPOINT}/documents/search?ref=${masterRef}&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22${CONTACT_DOC_ID}%22%29+%5D%5D`;
            const docResponse = await fetch(docUrl);
            if (!docResponse.ok) throw new Error(`HTTP error! Status: ${docResponse.status}`);
            const json = await docResponse.json();
            const data = json.results[0]?.data;

            if (!data) throw new Error('No data found in API response for the Contact page.');

            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';

            // Update page with fetched data
            updatePageContent(data);

        } catch (error) {
            console.error('Failed to fetch contact data:', error);
            if (loadingIndicator) {
                loadingIndicator.textContent = 'Error loading content. Please try again later.';
                loadingIndicator.style.color = 'red';
            }
        }
    }

    /**
     * Updates all page content with data from the API
     */
    function updatePageContent(data) {
        // Update page title
        updatePageTitle(data);

        // Update WhatsApp section
        updateWhatsAppSection(data);

        // Update contact info section
        updateContactInfo(data);

        // Update footer
        updateFooter(data);
    }

    /**
     * Updates the page title
     */
    function updatePageTitle(data) {
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle && data.page_title) {
            pageTitle.textContent = data.page_title;
        }
    }

    /**
     * Updates the WhatsApp contact section
     */
    function updateWhatsAppSection(data) {
        // Update WhatsApp title
        const whatsappTitle = document.querySelector('.whatsapp-title');
        if (whatsappTitle && data.whatsapp_title) {
            whatsappTitle.textContent = data.whatsapp_title;
        }

        // Update WhatsApp description
        const whatsappDesc = document.querySelector('.whatsapp-description');
        if (whatsappDesc && data.whatsapp_description) {
            whatsappDesc.textContent = data.whatsapp_description;
        }

        // Update WhatsApp button text
        const whatsappBtnText = document.querySelector('.whatsapp-button-text');
        if (whatsappBtnText && data.whatsapp_button_text) {
            whatsappBtnText.textContent = data.whatsapp_button_text;
        }

        // Update WhatsApp number/link
        const whatsappLinks = document.querySelectorAll('.whatsapp-link, .whatsapp-float-btn');
        const contact = data.footer_contacts?.[0];
        if (whatsappLinks.length && contact?.whatsapp_url?.url) {
            whatsappLinks.forEach(link => {
                link.href = contact.whatsapp_url.url;
                if (contact.whatsapp_url.target) {
                    link.target = contact.whatsapp_url.target;
                }
            });
        }
    }

    /**
     * Updates the contact information section
     */
    function updateContactInfo(data) {
        // Update section title and description
        const sectionTitle = document.querySelector('.contact-section-title');
        if (sectionTitle && data.contact_section_title) {
            sectionTitle.textContent = data.contact_section_title;
        }

        const sectionDesc = document.querySelector('.contact-section-description');
        if (sectionDesc && data.contact_section_description) {
            sectionDesc.textContent = data.contact_section_description;
        }

        // Update contact items from footer_contacts
        const contact = data.footer_contacts?.[0];
        if (contact) {
            // Update address
            const addressTexts = document.querySelectorAll('.address-text');
            if (addressTexts.length && contact.address?.[0]) {
                addressTexts.forEach(el => {
                    el.textContent = contact.address[0].text;
                });
            }

            // Update phone
            const phoneLinks = document.querySelectorAll('.phone-link');
            if (phoneLinks.length && contact.phone?.url) {
                phoneLinks.forEach(link => {
                    link.href = contact.phone.url;
                    link.textContent = contact.phone.url.replace('tel:', '');
                    if (contact.phone.target) link.target = contact.phone.target;
                });
            }

            // Update email
            const emailLinks = document.querySelectorAll('.email-link');
            if (emailLinks.length && contact.email?.url) {
                emailLinks.forEach(link => {
                    link.href = `mailto:${contact.email.url}`;
                    link.textContent = contact.email.url;
                    if (contact.email.target) link.target = contact.email.target;
                });
            }

            // Update social links
            updateSocialLinks(contact);
        }

        // Add any additional contact items from the API
        if (data.contact_items && data.contact_items.length > 0) {
            const socialIcons = document.querySelector('.social-icons');
            if (socialIcons) {
                data.contact_items.forEach(item => {
                    if (item.icon && item.url?.url) {
                        // We already handle these in updateSocialLinks
                        // This is just for any additional social links that might be in contact_items
                    }
                });
            }
        }
    }

    /**
     * Updates social media links throughout the page
     */
    function updateSocialLinks(contact) {
        // Update Instagram links
        const instagramLinks = document.querySelectorAll('.instagram-link');
        if (instagramLinks.length && contact.instgram_urk?.url) {
            instagramLinks.forEach(link => {
                link.href = contact.instgram_urk.url;
                if (contact.instgram_urk.target) link.target = contact.instgram_urk.target;
            });
        }

        // Update Facebook links
        const facebookLinks = document.querySelectorAll('.facebook-link');
        if (facebookLinks.length && contact.facebook_url?.url) {
            facebookLinks.forEach(link => {
                link.href = contact.facebook_url.url;
                if (contact.facebook_url.target) link.target = contact.facebook_url.target;
            });
        }

        // Update WhatsApp links (already handled in updateWhatsAppSection)
    }

    /**
     * Updates the footer section
     */
    function updateFooter(data) {
        // Update footer tagline
        const footerTagline = document.querySelector('.footer-tagline');
        if (footerTagline && data.footer_tagline) {
            footerTagline.textContent = data.footer_tagline;
        }

        // Update footer links
        const footerLinksContainer = document.querySelector('.footer-links ul');
        if (footerLinksContainer && data.footer_links && data.footer_links.length > 0) {
            footerLinksContainer.innerHTML = '';

            data.footer_links.forEach(link => {
                if (link.label && link.url?.url) {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = link.url.url;
                    a.textContent = link.label;
                    if (link.url.target) a.target = link.url.target;
                    li.appendChild(a);
                    footerLinksContainer.appendChild(li);
                }
            });
        }

        // Update copyright text
        const copyrightText = document.querySelector('.footer-copyright');
        if (copyrightText && data.footer_copyright) {
            copyrightText.textContent = data.footer_copyright;
        }

        // Contact info in footer already updated in updateContactInfo
    }

    // Initialize the page
    fetchContactData();
}); 