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

async function fetchContactData() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

    // Get current language code from localStorage or use default
    const langCode = localStorage.getItem('zaheb-language') || 'ar';
    // Map our simple language codes to Prismic language codes
    const prismicLangCode = langCode === 'ar' ? 'ar-kw' : 'en-us';

    console.log(`Fetching contact data for language: ${prismicLangCode}`);

    try {
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        const ref = data.refs[0].ref;

        // Include language code in the API query
        const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"contact_page")]]&lang=${prismicLangCode}`);
        const docsData = await docsRes.json();

        if (!docsData.results || docsData.results.length === 0) {
            console.error(`No contact page data found for language: ${prismicLangCode}`);

            // If no results in requested language, try falling back to English
            if (prismicLangCode !== 'en-us') {
                console.log('Falling back to English');
                const fallbackRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"contact_page")]]&lang=en-us`);
                const fallbackData = await fallbackRes.json();

                if (!fallbackData.results || fallbackData.results.length === 0) {
                    console.error('No fallback contact page data found');
                    return;
                }

                const doc = fallbackData.results[0];
                console.log(`Loaded fallback document in language ${doc.lang} with data:`, doc.data);

                // Update page content with API data
                updatePageTitle(doc.data);
                updateWhatsAppSection(doc.data);
                updateContactInfo(doc.data);
                updateMapEmbed(doc.data);
                updateFooter(doc.data);
            }
            return;
        }

        const doc = docsData.results[0];
        console.log(`Loaded document in language ${doc.lang} with data:`, doc.data);

        // Update page content with API data
        updatePageTitle(doc.data);
        updateWhatsAppSection(doc.data);
        updateContactInfo(doc.data);
        updateMapEmbed(doc.data);
        updateFooter(doc.data);

    } catch (err) {
        console.error('Error fetching contact data:', err);
    }
}

function updatePageTitle(data) {
    const pageTitle = document.querySelector('.container h1');
    if (pageTitle && data.page_title) {
        pageTitle.textContent = data.page_title;
    }
}

function updateWhatsAppSection(data) {
    // Update WhatsApp section title
    const whatsappTitle = document.querySelector('.whatsapp-contact h2');
    if (whatsappTitle && data.whatsapp_title) {
        whatsappTitle.textContent = data.whatsapp_title;
    }

    // Update WhatsApp description
    const whatsappDesc = document.querySelector('.whatsapp-contact p');
    if (whatsappDesc && data.whatsapp_description) {
        whatsappDesc.textContent = data.whatsapp_description;
    }

    // Update WhatsApp button text
    const whatsappBtnText = document.querySelector('.whatsapp-contact-btn span');
    if (whatsappBtnText && data.whatsapp_button_text) {
        whatsappBtnText.textContent = data.whatsapp_button_text;
    }

    // Update WhatsApp number on button and floating button
    const whatsappNumber = data.whatsapp_number || '+96522281011'; // Default if not provided
    const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
    whatsappLinks.forEach(link => {
        link.href = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
    });
}

function updateContactInfo(data) {
    // Update contact section title
    const contactTitle = document.querySelector('.contact-info-card h2');
    if (contactTitle && data.contact_section_title) {
        contactTitle.textContent = data.contact_section_title;
    }

    // Update contact section description
    const contactDesc = document.querySelector('.contact-info-card > p');
    if (contactDesc && data.contact_section_description) {
        contactDesc.textContent = data.contact_section_description;
    }

    // Update contact items
    if (data.contact_items && data.contact_items.length > 0) {
        const contactInfoContainer = document.querySelector('.contact-info-card');

        // Remove existing contact items
        const existingItems = document.querySelectorAll('.contact-info-item');
        existingItems.forEach(item => {
            if (item.parentNode === contactInfoContainer) {
                contactInfoContainer.removeChild(item);
            }
        });

        // Add new contact items from API
        data.contact_items.forEach(item => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-info-item';

            const iconClass = item.icon && item.icon.includes('fa-') ?
                item.icon : `fas fa-${item.icon || 'info'}`;

            contactItem.innerHTML = `
                <div class="contact-info-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="contact-info-content">
                    <h4>${item.title || ''}</h4>
                    <p>${item.value || ''}</p>
                </div>
            `;

            contactInfoContainer.appendChild(contactItem);
        });
    }
}

function updateMapEmbed(data) {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer && data.map_embed) {
        mapContainer.innerHTML = data.map_embed;
    }
}

function updateFooter(data) {
    // Update footer copyright
    const copyright = document.querySelector('.copyright p');
    if (copyright && data.footer_copyright) {
        copyright.textContent = data.footer_copyright;
    }

    // Update footer links
    const footerLinks = document.querySelector('.footer-links ul');
    if (footerLinks && data.footer_links && data.footer_links.length > 0) {
        let linksHTML = '';

        data.footer_links.forEach(link => {
            const label = link.label || '';
            const url = link.url?.url || '#';

            linksHTML += `<li><a href="${url}">${label}</a></li>`;
        });

        if (linksHTML) {
            footerLinks.innerHTML = linksHTML;
        }
    }

    // Update footer social links
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks && data.footer_social && data.footer_social.length > 0) {
        let socialHTML = '';

        data.footer_social.forEach(social => {
            const platform = social.platform || '';
            const url = social.url?.url || '#';
            const iconClass = platform === 'fb' ? 'fab fa-facebook' :
                platform === 'instagram' ? 'fab fa-instagram' :
                    platform === 'twitter' ? 'fab fa-twitter' :
                        platform === 'linkedin' ? 'fab fa-linkedin' :
                            platform === 'whatsapp' ? 'fab fa-whatsapp' : 'fab fa-globe';

            socialHTML += `<a href="${url}" target="_blank"><i class="${iconClass}"></i></a>`;
        });

        if (socialHTML) {
            socialLinks.innerHTML = socialHTML;
        }
    }

    // Update footer contacts
    if (data.footer_contacts && data.footer_contacts.length > 0) {
        const footerContactSection = document.querySelector('.footer-contact');
        if (footerContactSection) {
            // Keep the heading
            const heading = footerContactSection.querySelector('h3');
            let contactsHTML = '';

            if (heading) {
                contactsHTML = heading.outerHTML;
            }

            // Add contacts from API
            data.footer_contacts.forEach(contact => {
                const icon = contact.icon || 'info';
                const title = contact.title || '';
                const value = contact.value || '';

                const iconClass = icon.includes('fa-') ? icon : `fas fa-${icon}`;

                contactsHTML += `
                    <p><i class="${iconClass}"></i> <span>${value}</span></p>
                `;
            });

            // Add social links section back
            const socialLinks = footerContactSection.querySelector('.social-links');
            if (socialLinks) {
                contactsHTML += socialLinks.outerHTML;
            }

            footerContactSection.innerHTML = contactsHTML;
        }
    }
}

// Update navigation links to preserve language parameter
function updateNavigationLinks() {
    // Get current language code from localStorage
    const langCode = localStorage.getItem('zaheb-language') || 'ar';
    const paramName = langCode === 'ar' ? 'lang' : 'lan';

    // If no language parameter is set, don't modify links
    if (!langCode) return;

    // Get all navigation links
    const navLinks = document.querySelectorAll('a[href]');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Skip external links and anchor links
        if (href.startsWith('http') || href.startsWith('#') || href === '') return;

        // Parse the URL
        try {
            // For relative URLs, create a dummy absolute URL to parse
            const baseUrl = window.location.origin + window.location.pathname;
            const absoluteUrl = new URL(href, baseUrl);

            // Add language parameter using the same parameter name that was used in the URL
            absoluteUrl.searchParams.set(paramName, langCode);

            // Get the path and query string
            const newHref = absoluteUrl.pathname + absoluteUrl.search;

            // Update the link
            link.setAttribute('href', newHref);
        } catch (e) {
            console.error('Error updating link:', e);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchContactData();
    updateNavigationLinks();
}); 