/**
 * Services Module
 * Handles fetching and displaying services data from the Prismic API
 */

const ServicesModule = (function () {
    'use strict';

    async function fetchServicesData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

        // Get current language code from localStorage or use default
        const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' || langCode === 'ar-kw' ? 'ar-kw' : 'en-us';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        console.log(`Fetching services data for language: ${prismicLangCode}`);

        try {
            const apiRes = await fetch(apiUrl);
            const data = await apiRes.json();
            const ref = data.refs[0].ref;

            // Include language code in the API query
            const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"services")]]&lang=${prismicLangCode}`);
            const docsData = await docsRes.json();

            if (!docsData.results || docsData.results.length === 0) {
                console.error(`No services data found for language: ${prismicLangCode}`);

                // If no results in requested language, try falling back to English
                if (prismicLangCode !== 'en-us') {
                    console.log('Falling back to English');
                    const fallbackRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"services")]]&lang=en-us`);
                    const fallbackData = await fallbackRes.json();

                    if (!fallbackData.results || fallbackData.results.length === 0) {
                        const errorMessage = isArabic
                            ? 'لم يتم العثور على بيانات الخدمات.'
                            : 'No services data found.';
                        document.querySelector('.loading-indicator').innerHTML = `<p>${errorMessage}</p>`;
                        return;
                    }

                    const doc = fallbackData.results[0];
                    console.log(`Loaded fallback document in language ${doc.lang} with data:`, doc.data);

                    // Update page content with API data
                    updatePageContent(doc.data, isArabic);
                }
                return;
            }

            const doc = docsData.results[0];
            console.log(`Loaded services document in language ${doc.lang} with data:`, doc.data);

            // Update page content with API data
            updatePageContent(doc.data, isArabic);

        } catch (err) {
            console.error('Error fetching services data:', err);
            const errorMessage = isArabic
                ? 'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.'
                : 'Error loading data. Please try again later.';
            document.querySelector('.loading-indicator').innerHTML = `<p>${errorMessage}</p>`;
        }
    }

    function updatePageContent(data, isArabic) {
        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Update page title and description
        updatePageTitleAndDescription(data, isArabic);

        // Render services
        if (data.services && data.services.length > 0) {
            renderServices(data.services, isArabic);
        }

        // Render footer
        renderFooter(data, isArabic);
    }

    function updatePageTitleAndDescription(data, isArabic) {
        // Update page title
        const pageTitle = document.querySelector('.page-title-section h1');
        if (pageTitle && data.tittle_page && data.tittle_page.length > 0) {
            pageTitle.textContent = data.tittle_page[0].text;
            pageTitle.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update description
        const description = document.querySelector('.page-title-section .lead');
        if (description && data.paragraph_text && data.paragraph_text.length > 0) {
            description.textContent = data.paragraph_text[0].text;
            description.dir = isArabic ? 'rtl' : 'ltr';
            description.style.textAlign = isArabic ? 'right' : 'left';
        }
    }

    function renderServices(services, isArabic) {
        const servicesContainer = document.getElementById('services-container');
        servicesContainer.classList.add('services-grid');
        servicesContainer.dir = isArabic ? 'rtl' : 'ltr';
        let html = '';

        services.forEach((service, index) => {
            // Create HTML for service image
            const imageUrl = service.img_of_services?.url || '';
            const imageHtml = `
                <div class="service-image">
                    <img src="${imageUrl}" alt="${service.service_title || ''}" loading="lazy">
                </div>
            `;

            // Create HTML for service description
            const description = service.service_description && service.service_description.length > 0
                ? `<p class="service-description" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${service.service_description[0].text}</p>`
                : '';

            // Create HTML for key benefits
            let benefitsHtml = '';
            if (service.key_benefits_tittle && service.key_benefits_tittle.length > 0 &&
                service.service_key_benefits && service.service_key_benefits.length > 0) {

                benefitsHtml = `
                    <div class="service-benefits" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">
                        <h4>${service.key_benefits_tittle[0].text}</h4>
                        <ul class="benefits-list">
                `;

                service.service_key_benefits.forEach(benefit => {
                    if (benefit.type === 'list-item') {
                        benefitsHtml += `<li dir="${isArabic ? 'rtl' : 'ltr'}">${benefit.text}</li>`;
                    }
                });

                benefitsHtml += `
                        </ul>
                    </div>
                `;
            }

            // Create HTML for "How it works" section
            let howItWorksHtml = '';
            if (service.how_it_works_tittle && service.how_it_works_tittle.length > 0 &&
                service.service_how_it_works && service.service_how_it_works.length > 0) {

                howItWorksHtml = `
                    <div class="service-how-it-works" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">
                        <h4>${service.how_it_works_tittle[0].text}</h4>
                        <ol class="how-it-works-list">
                `;

                service.service_how_it_works.forEach(step => {
                    if (step.type === 'list-item') {
                        howItWorksHtml += `<li dir="${isArabic ? 'rtl' : 'ltr'}">${step.text}</li>`;
                    }
                });

                howItWorksHtml += `
                        </ol>
                    </div>
                `;
            }

            // Create CTA button
            const ctaLabel = service.service_cta_label || (isArabic ? 'اعرف المزيد' : 'Learn More');
            const ctaUrl = service.service_cta_link?.url || '#';
            const ctaHtml = `
                <div class="service-cta" dir="${isArabic ? 'rtl' : 'ltr'}">
                    <a href="${ctaUrl}" class="btn btn-secondary">${ctaLabel}</a>
                </div>
            `;

            // Combine all sections into service card HTML
            const serviceHtml = `
                <div class="service-card glass-card fade-in" dir="${isArabic ? 'rtl' : 'ltr'}">
                    ${imageHtml}
                    <div class="service-content" style="text-align: ${isArabic ? 'right' : 'left'}">
                        <h3 class="service-title" dir="${isArabic ? 'rtl' : 'ltr'}">${service.service_title || ''}</h3>
                        ${description}
                        ${benefitsHtml}
                        ${howItWorksHtml}
                        ${ctaHtml}
                    </div>
                </div>
            `;

            html += serviceHtml;
        });

        // Insert all services HTML into the container
        servicesContainer.innerHTML = html;
    }

    function renderFooter(data, isArabic) {
        // Update footer tagline
        const footerTagline = document.querySelector('.footer-tagline');
        if (footerTagline && data.footer_text) {
            footerTagline.textContent = data.footer_text;
            footerTagline.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update footer quick links
        const footerLinksContainer = document.querySelector('.footer-links ul');
        if (footerLinksContainer && data.footer_quick_links && data.footer_quick_links.length > 0) {
            footerLinksContainer.innerHTML = '';
            footerLinksContainer.dir = isArabic ? 'rtl' : 'ltr';

            data.footer_quick_links.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.dir = isArabic ? 'rtl' : 'ltr';

                // Map link labels to URLs
                let href = '#';
                if (link.quick_link_label.toLowerCase() === 'home') href = 'index.html';
                else if (link.quick_link_label.toLowerCase() === 'about us') href = 'about.html';
                else if (link.quick_link_label.toLowerCase() === 'services') href = 'services.html';
                else if (link.quick_link_label.toLowerCase() === 'contact') href = 'contact.html';

                a.href = href;
                a.textContent = link.quick_link_label;
                li.appendChild(a);
                footerLinksContainer.appendChild(li);
            });
        }

        // Update footer contacts
        const contact = data.footer_contacts?.[0];
        if (contact) {
            // Update address
            const addressTexts = document.querySelectorAll('.address-text');
            if (addressTexts.length && contact.address?.[0]) {
                addressTexts.forEach(el => {
                    el.textContent = contact.address[0].text;
                    el.dir = isArabic ? 'rtl' : 'ltr';
                });
            }

            // Update phone
            const phoneLinks = document.querySelectorAll('.phone-link');
            if (phoneLinks.length && contact.phone?.url) {
                phoneLinks.forEach(link => {
                    link.href = contact.phone.url;
                    link.textContent = contact.phone.url.replace('tel:', '');
                    link.dir = isArabic ? 'rtl' : 'ltr';
                    if (contact.phone.target) link.target = contact.phone.target;
                });
            }

            // Update email
            const emailLinks = document.querySelectorAll('.email-link');
            if (emailLinks.length && contact.email?.url) {
                emailLinks.forEach(link => {
                    link.href = `mailto:${contact.email.url}`;
                    link.textContent = contact.email.url;
                    link.dir = isArabic ? 'rtl' : 'ltr';
                    if (contact.email.target) link.target = contact.email.target;
                });
            }

            // Update social links
            updateSocialLinks(contact);
        }
    }

    function updateSocialLinks(contact) {
        // Update Instagram
        const instagramLinks = document.querySelectorAll('.instagram-link');
        if (instagramLinks.length && contact.instgram_urk?.url) {
            instagramLinks.forEach(link => {
                link.href = contact.instgram_urk.url;
                if (contact.instgram_urk.target) link.target = contact.instgram_urk.target;
            });
        }

        // Update Facebook
        const facebookLinks = document.querySelectorAll('.facebook-link');
        if (facebookLinks.length && contact.facebook_url?.url) {
            facebookLinks.forEach(link => {
                link.href = contact.facebook_url.url;
                if (contact.facebook_url.target) link.target = contact.facebook_url.target;
            });
        }

        // Update WhatsApp
        const whatsappLinks = document.querySelectorAll('.whatsapp-link, .whatsapp-float-btn');
        if (whatsappLinks.length && contact.whatsapp_url?.url) {
            whatsappLinks.forEach(link => {
                link.href = contact.whatsapp_url.url;
                if (contact.whatsapp_url.target) link.target = contact.whatsapp_url.target;
            });
        }
    }

    // Initialize module
    function init() {
        fetchServicesData();
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize when DOM is loaded and on the services page
document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('services-page')) {
        ServicesModule.init();
    }
});
