/**
 * Services Module
 * Handles fetching and displaying services data from the Prismic API
 */

const ServicesModule = (function () {
    'use strict';

    async function fetchServicesData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

        // Get current language code from localStorage or use default
        const langCode = localStorage.getItem('zaheb-language') || 'ar';
        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' ? 'ar-kw' : 'en-us';

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
                        document.querySelector('.loading-indicator').innerHTML = '<p>No services data found.</p>';
                        return;
                    }

                    const doc = fallbackData.results[0];
                    console.log(`Loaded fallback document in language ${doc.lang} with data:`, doc.data);

                    // Update page content with API data
                    updatePageContent(doc.data);
                }
                return;
            }

            const doc = docsData.results[0];
            console.log(`Loaded services document in language ${doc.lang} with data:`, doc.data);

            // Update page content with API data
            updatePageContent(doc.data);

        } catch (err) {
            console.error('Error fetching services data:', err);
            document.querySelector('.loading-indicator').innerHTML = '<p>Error loading services data.</p>';
        }
    }

    function updatePageContent(data) {
        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Update page title
        if (data.tittle_page && data.tittle_page.length > 0) {
            const pageTitle = document.querySelector('.container h1');
            if (pageTitle) {
                pageTitle.textContent = data.tittle_page[0].text;
            }
        }

        // Update services introduction
        if (data.tittle_paragraph && data.paragraph_text) {
            const introTitle = document.querySelector('.services-intro .section-title');
            const introText = document.querySelector('.services-intro .lead');

            if (introTitle && data.tittle_paragraph.length > 0) {
                introTitle.textContent = data.tittle_paragraph[0].text;
            }

            if (introText && data.paragraph_text.length > 0) {
                introText.textContent = data.paragraph_text[0].text;
            }
        }

        // Render services
        if (data.services && data.services.length > 0) {
            renderServices(data.services);
        }
    }

    function renderServices(services) {
        const servicesContainer = document.getElementById('services-container');
        let html = '';

        services.forEach((service, index) => {
            // Determine if service should be displayed with image on left or right
            const isEven = index % 2 === 0;
            const imageClass = isEven ? 'service-image' : 'service-image image-right';
            const contentClass = isEven ? 'service-content' : 'service-content content-left';

            // Create HTML for service image
            const imageUrl = service.img_of_services?.url || '';
            const imageHtml = `
                <div class="${imageClass}">
                    <img src="${imageUrl}" alt="${service.service_title || 'Service image'}" class="glass-effect">
                </div>
            `;

            // Create HTML for service description
            const description = service.service_description && service.service_description.length > 0
                ? service.service_description[0].text
                : '';

            // Create HTML for key benefits
            let benefitsHtml = '';
            if (service.key_benefits_tittle && service.key_benefits_tittle.length > 0 &&
                service.service_key_benefits && service.service_key_benefits.length > 0) {

                benefitsHtml = `
                    <div class="service-benefits">
                        <h4>${service.key_benefits_tittle[0].text}</h4>
                        <ul class="benefits-list">
                `;

                service.service_key_benefits.forEach(benefit => {
                    if (benefit.type === 'list-item') {
                        benefitsHtml += `<li>${benefit.text}</li>`;
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
                    <div class="service-how-it-works">
                        <h4>${service.how_it_works_tittle[0].text}</h4>
                        <ol class="how-it-works-list">
                `;

                service.service_how_it_works.forEach(step => {
                    if (step.type === 'list-item') {
                        howItWorksHtml += `<li>${step.text}</li>`;
                    }
                });

                howItWorksHtml += `
                        </ol>
                    </div>
                `;
            }

            // Create CTA button
            const ctaLabel = service.service_cta_label || 'Learn More';
            const ctaUrl = service.service_cta_link?.url || '#';
            const ctaHtml = `
                <a href="${ctaUrl}" class="btn btn-primary">${ctaLabel}</a>
            `;

            // Combine all sections into service HTML
            const serviceHtml = `
                <section class="service-item">
                    <div class="container">
                        <div class="service-row ${isEven ? '' : 'row-reverse'}">
                            ${imageHtml}
                            <div class="${contentClass}">
                                <h3 class="service-title">${service.service_title || 'Service'}</h3>
                                <p class="service-description">${description}</p>
                                ${benefitsHtml}
                                ${howItWorksHtml}
                                <div class="service-cta">
                                    ${ctaHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;

            html += serviceHtml;
        });

        // Insert all services HTML into the container
        servicesContainer.innerHTML = html;
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

document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('services-page')) {
        ServicesModule.init();
    }
});
