/**
 * Contact Module
 * Handles contact page functionality
 */
const ContactModule = (function () {
    'use strict';

    const API_ENDPOINT = 'https://zaheb.cdn.prismic.io/api/v2';
    const loadingIndicator = document.querySelector('.loading-indicator');

    /**
     * Initialize the contact page
     */
    function init() {
        fetchContactData();

        // Re-fetch when language changes
        document.addEventListener('languageChanged', fetchContactData);
    }

    /**
     * Fetches the latest API data for the contact page
     */
    async function fetchContactData() {
        try {
            // Get language code
            const langCode = localStorage.getItem('zaheb-language') || 'ar';
            const isArabic = langCode === 'ar' || langCode === 'ar-kw';
            console.log('Current language code:', langCode); // Debug log

            // Step 1: Get the latest master ref from the Prismic API
            const apiResponse = await fetch(API_ENDPOINT);
            if (!apiResponse.ok) throw new Error('Failed to connect to Prismic API.');
            const apiData = await apiResponse.json();
            const masterRef = apiData.refs.find(ref => ref.isMasterRef)?.ref;

            if (!masterRef) throw new Error('Could not find master ref in API response.');

            // Step 2: Fetch the 'Contact' document using the master ref and language
            const docUrl = `${API_ENDPOINT}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=${isArabic ? 'ar-kw' : 'en-us'}`;
            console.log('API URL:', docUrl); // Debug log

            let response = await fetch(docUrl);
            let data = await response.json();

            // Log the API response for debugging
            console.log('API Response:', data);

            // Fallback to English if the selected language has no content
            if (!data.results || data.results.length === 0) {
                console.warn(`No content found for language: ${langCode}. Falling back to en-us.`);
                response = await fetch(`${API_ENDPOINT}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=en-us`);
                data = await response.json();
            }

            if (!data.results || data.results.length === 0) {
                throw new Error("No contact page content found in any language.");
            }

            const doc = data.results[0].data;

            // Hide loading indicator
            if (loadingIndicator) loadingIndicator.style.display = 'none';

            // Update page with fetched data
            updatePageContent(doc);

        } catch (error) {
            console.error('Failed to fetch contact data:', error);
            if (loadingIndicator) {
                const langCode = localStorage.getItem('zaheb-language') || 'ar';
                const isArabic = langCode === 'ar' || langCode === 'ar-kw';
                const errorMessage = isArabic
                    ? 'حدث خطأ في تحميل المحتوى. يرجى المحاولة مرة أخرى لاحقاً.'
                    : 'Error loading content. Please try again later.';
                loadingIndicator.textContent = errorMessage;
                loadingIndicator.style.color = 'red';
            }
        }
    }

    /**
     * Updates all page content with data from the API
     */
    function updatePageContent(data) {
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle && data.page_title) {
            pageTitle.textContent = data.page_title;
        }

        updateContactInfo(data);
        updateWhatsAppSection(data);
        updateFooter(data);
    }

    /**
     * Updates the contact information section
     */
    function updateContactInfo(data) {
        const langCode = localStorage.getItem('zaheb-language') || 'ar';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        // Update section headers
        const addressHeader = document.querySelector('.contact-info-content h4[data-en="Address"]');
        const phoneHeader = document.querySelector('.contact-info-content h4[data-en="Phone"]');
        const emailHeader = document.querySelector('.contact-info-content h4[data-en="Email"]');
        const followHeader = document.querySelector('.contact-social-links h4[data-en="Follow Us"]');

        if (isArabic) {
            if (addressHeader) addressHeader.textContent = 'العنوان';
            if (phoneHeader) phoneHeader.textContent = 'الهاتف';
            if (emailHeader) emailHeader.textContent = 'البريد الإلكتروني';
            if (followHeader) followHeader.textContent = 'تابعنا';
        } else {
            if (addressHeader) addressHeader.textContent = 'Address';
            if (phoneHeader) phoneHeader.textContent = 'Phone';
            if (emailHeader) emailHeader.textContent = 'Email';
            if (followHeader) followHeader.textContent = 'Follow Us';
        }

        // Update section title and description
        const sectionTitle = document.querySelector('.contact-section-title');
        if (sectionTitle && data.contact_section_title) {
            sectionTitle.textContent = data.contact_section_title;
            sectionTitle.dir = isArabic ? 'rtl' : 'ltr';
        }

        const sectionDesc = document.querySelector('.contact-section-description');
        if (sectionDesc && data.contact_section_description) {
            sectionDesc.textContent = data.contact_section_description;
            sectionDesc.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update contact items from footer_contacts
        const contact = data.footer_contacts?.[0];
        if (contact) {
            // Update address
            const addressEl = document.querySelector('.address-text');
            if (addressEl && contact.address?.[0]) {
                addressEl.textContent = contact.address[0].text;
                addressEl.dir = isArabic ? 'rtl' : 'ltr';
            }

            // Update phone
            const phoneEl = document.querySelector('.phone-link');
            if (phoneEl && contact.phone?.url) {
                phoneEl.href = contact.phone.url;
                phoneEl.textContent = contact.phone.url.replace('tel:', '');
                if (contact.phone.target) phoneEl.target = contact.phone.target;
            }

            // Update email
            const emailEl = document.querySelector('.email-link');
            if (emailEl && contact.email?.url) {
                emailEl.href = `mailto:${contact.email.url}`;
                emailEl.textContent = contact.email.url;
            }

            // Update social links
            updateSocialLinks(contact);
        }

        // Update additional contact items
        if (data.contact_items && data.contact_items.length > 0) {
            const socialIcons = document.querySelector('.social-icons');
            if (socialIcons) {
                data.contact_items.forEach(item => {
                    if (item.icon && item.url?.url) {
                        const iconClass = item.icon === 'insta' ? 'instagram' : item.icon;
                        const existingLink = socialIcons.querySelector(`.${iconClass}-link`);
                        if (existingLink) {
                            existingLink.href = item.url.url;
                            if (item.url.target) existingLink.target = item.url.target;
                        }
                    }
                });
            }
        }
    }

    /**
     * Updates the WhatsApp section
     */
    function updateWhatsAppSection(data) {
        const langCode = localStorage.getItem('zaheb-language') || 'ar';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        // Update WhatsApp title
        const whatsappTitle = document.querySelector('.whatsapp-title');
        if (whatsappTitle && data.whatsapp_title) {
            whatsappTitle.textContent = data.whatsapp_title;
            whatsappTitle.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update WhatsApp description
        const whatsappDesc = document.querySelector('.whatsapp-description');
        if (whatsappDesc && data.whatsapp_description) {
            whatsappDesc.textContent = data.whatsapp_description;
            whatsappDesc.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update WhatsApp button text
        const whatsappBtnText = document.querySelector('.whatsapp-button-text');
        if (whatsappBtnText && data.whatsapp_button_text) {
            whatsappBtnText.textContent = data.whatsapp_button_text;
            whatsappBtnText.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update WhatsApp links
        const contact = data.footer_contacts?.[0];
        if (contact?.whatsapp_url?.url) {
            const whatsappLinks = document.querySelectorAll('.whatsapp-link, .whatsapp-float-btn');
            whatsappLinks.forEach(link => {
                link.href = contact.whatsapp_url.url;
                if (contact.whatsapp_url.target) {
                    link.target = contact.whatsapp_url.target;
                }
            });
        }
    }

    /**
     * Updates social media links
     */
    function updateSocialLinks(contact) {
        // Update Instagram
        const instagramEl = document.querySelector('.instagram-link');
        if (instagramEl && contact.instgram_urk?.url) {
            instagramEl.href = contact.instgram_urk.url;
            if (contact.instgram_urk.target) instagramEl.target = contact.instgram_urk.target;
        }

        // Update Facebook
        const facebookEl = document.querySelector('.facebook-link');
        if (facebookEl && contact.facebook_url?.url) {
            facebookEl.href = contact.facebook_url.url;
            if (contact.facebook_url.target) facebookEl.target = contact.facebook_url.target;
        }
    }

    /**
     * Updates the footer section
     */
    function updateFooter(data) {
        // Update footer links
        const footerLinksContainer = document.querySelector('.footer-links ul');
        if (footerLinksContainer && data.footer_links && data.footer_links.length > 0) {
            footerLinksContainer.innerHTML = data.footer_links.map(link =>
                link.label && link.url?.url ?
                    `<li><a href="${link.url.url}"${link.url.target ? ` target="${link.url.target}"` : ''}>${link.label}</a></li>` :
                    ''
            ).join('');
        }

        // Update copyright text
        const copyrightText = document.querySelector('.footer-copyright');
        if (copyrightText && data.footer_copyright) {
            copyrightText.textContent = data.footer_copyright;
        }
    }

    // Public API
    return {
        init: init
    };
})();

// Export the module
window.ContactModule = ContactModule;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    ContactModule.init();
}); 