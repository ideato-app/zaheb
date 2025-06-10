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
            const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
            const isArabic = langCode === 'ar-kw' || langCode === 'ar';
            console.log('Contact Module - Current language code:', langCode);

            if (loadingIndicator) loadingIndicator.style.display = 'block';

            // Step 1: Get the latest master ref from the Prismic API
            const apiResponse = await fetch(API_ENDPOINT);
            if (!apiResponse.ok) throw new Error('Failed to connect to Prismic API.');
            const apiData = await apiResponse.json();
            const masterRef = apiData.refs.find(ref => ref.isMasterRef)?.ref;

            if (!masterRef) throw new Error('Could not find master ref in API response.');

            // Step 2: Fetch the 'contact_page' document using the master ref and language
            const docUrl = `${API_ENDPOINT}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=${isArabic ? 'ar-kw' : 'en-us'}`;
            console.log('Contact Module - API URL:', docUrl);

            let response = await fetch(docUrl);
            let data = await response.json();

            // Fallback to English if the selected language has no content
            if (!data.results || data.results.length === 0) {
                console.warn(`No content found for language: ${isArabic ? 'ar-kw' : 'en-us'}. Falling back to en-us.`);
                const fallbackUrl = `${API_ENDPOINT}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=en-us`;
                response = await fetch(fallbackUrl);
                data = await response.json();
            }

            if (!data.results || data.results.length === 0) {
                throw new Error("No contact page content found in any language.");
            }

            const doc = data.results[0].data;
            console.log('Contact Module - API Data:', doc);

            // Update page with fetched data
            updatePageContent(doc, isArabic);

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
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Updates all page content with data from the API
     * @param {object} data - The Prismic data object for the page
     * @param {boolean} isArabic - Flag for Arabic language
     */
    function updatePageContent(data, isArabic) {
        updateMainContent(data, isArabic);
        updateFooter(data, isArabic);
    }

    /**
     * Updates the main contact page content
     * @param {object} data - The Prismic data object
     * @param {boolean} isArabic - Flag for Arabic language
     */
    function updateMainContent(data, isArabic) {
        // Page Title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle && data.page_title) {
            pageTitle.textContent = data.page_title;
        }

        // WhatsApp Section
        const whatsappTitle = document.querySelector('.whatsapp-title');
        if (whatsappTitle && data.whatsapp_title) {
            whatsappTitle.textContent = data.whatsapp_title;
        }
        const whatsappDesc = document.querySelector('.whatsapp-description');
        if (whatsappDesc && data.whatsapp_description) {
            whatsappDesc.textContent = data.whatsapp_description;
        }
        const whatsappBtn = document.querySelector('.whatsapp-contact-btn');
        if (whatsappBtn && data.whatsapp_number) {
            whatsappBtn.href = `https://wa.me/${data.whatsapp_number.replace(/\s/g, '')}`;
        }
        const whatsappBtnText = document.querySelector('.whatsapp-button-text');
        if (whatsappBtnText && data.whatsapp_button_text) {
            whatsappBtnText.textContent = data.whatsapp_button_text;
        }

        // "Get In Touch" Section
        const sectionTitle = document.querySelector('.contact-section-title');
        if (sectionTitle && data.contact_section_title) {
            sectionTitle.textContent = data.contact_section_title;
        }
        const sectionDesc = document.querySelector('.contact-section-description');
        if (sectionDesc && data.contact_section_description) {
            sectionDesc.textContent = data.contact_section_description;
        }

        // Contact Info Items
        const contact = data.footer_contacts?.[0];
        if (contact) {
            const addressText = document.querySelector('.address-text');
            if (addressText && contact.address?.[0]?.text) {
                addressText.textContent = contact.address[0].text;
            }

            const phoneLink = document.querySelector('.phone-link');
            if (phoneLink && contact.phone?.url) {
                phoneLink.href = contact.phone.url;
                phoneLink.textContent = contact.phone.url.replace('tel:', '');
            }

            const emailLink = document.querySelector('.email-link');
            if (emailLink && contact.email?.url) {
                emailLink.href = `mailto:${contact.email.url}`;
                emailLink.textContent = contact.email.url;
            }

            const instagramLink = document.querySelector('.contact-social-links .instagram-link');
            if (instagramLink && contact.instgram_urk?.url) { // Note: 'instgram_urk' typo from API
                instagramLink.href = contact.instgram_urk.url;
            }

            const facebookLink = document.querySelector('.contact-social-links .facebook-link');
            if (facebookLink && contact.facebook_url?.url) {
                facebookLink.href = contact.facebook_url.url;
            }
        }

        // Google Map
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer && data.map_embed?.html) {
            mapContainer.innerHTML = data.map_embed.html;
        }
    }

    /**
     * Updates the footer content
     * @param {object} data - The Prismic data object
     * @param {boolean} isArabic - Flag for Arabic language
     */
    function updateFooter(data, isArabic) {
        // Footer Logo
        const footerLogo = document.querySelector('.footer-logo img');
        if (footerLogo && data.footer_logo?.url) {
            footerLogo.src = data.footer_logo.url;
            footerLogo.alt = data.footer_logo.alt || 'Zaheb International Logo';
        }

        // Footer Tagline
        const footerTagline = document.querySelector('.footer-tagline');
        if (footerTagline && data.footer_tagline) {
            footerTagline.textContent = data.footer_tagline;
        }

        // Footer Links
        const footerLinksContainer = document.querySelector('.footer-links ul');
        if (footerLinksContainer && data.footer_links?.length > 0) {
            footerLinksContainer.innerHTML = ''; // Clear existing links
            data.footer_links.forEach(link => {
                if (link.label && link.url?.url) {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="${link.url.url}">${link.label}</a>`;
                    footerLinksContainer.appendChild(li);
                }
            });
        }

        // Footer Contact Info
        const contact = data.footer_contacts?.[0];
        if (contact) {
            document.querySelectorAll('.footer-contact .address-text').forEach(el => {
                if (contact.address?.[0]?.text) el.textContent = contact.address[0].text;
            });
            document.querySelectorAll('.footer-contact .phone-link').forEach(el => {
                if (contact.phone?.url) {
                    el.href = contact.phone.url;
                    el.textContent = contact.phone.url.replace('tel:', '');
                }
            });
            document.querySelectorAll('.footer-contact .email-link').forEach(el => {
                if (contact.email?.url) {
                    el.href = `mailto:${contact.email.url}`;
                    el.textContent = contact.email.url;
                }
            });

            // Footer Social Links
            const instagramLink = document.querySelector('.footer .instagram-link');
            if (instagramLink && contact.instgram_urk?.url) { // Note: 'instgram_urk' typo from API
                instagramLink.href = contact.instgram_urk.url;
            }
            const facebookLink = document.querySelector('.footer .facebook-link');
            if (facebookLink && contact.facebook_url?.url) {
                facebookLink.href = contact.facebook_url.url;
            }
            const whatsappLink = document.querySelector('.footer .whatsapp-link');
            if (whatsappLink && contact.whatsapp_url?.url) {
                whatsappLink.href = contact.whatsapp_url.url;
            }
        }

        // Footer Copyright
        const copyright = document.querySelector('.footer-copyright');
        if (copyright && data.footer_copyright) {
            copyright.textContent = data.footer_copyright;
        }
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('contact-page')) { // Assuming you add this class to the body
        ContactModule.init();
    }
}); 