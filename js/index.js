async function fetchHeroData() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

    // Get current language code from localStorage or use default
    const langCode = localStorage.getItem('zaheb-language') || 'ar';
    // Map our simple language codes to Prismic language codes
    const prismicLangCode = langCode === 'ar' ? 'ar-kw' : 'en-us';

    try {
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        const ref = data.refs[0].ref;

        // Include language code in the API query
        const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"home_page")]]&lang=${prismicLangCode}`);
        const docsData = await docsRes.json();

        if (!docsData.results || docsData.results.length === 0) {
            console.error(`No home page data found for language: ${prismicLangCode}`);

            // If no results in requested language, try falling back to English
            if (prismicLangCode !== 'en-us') {
                console.log('Falling back to English');
                const fallbackRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"home_page")]]&lang=en-us`);
                const fallbackData = await fallbackRes.json();

                if (!fallbackData.results || fallbackData.results.length === 0) {
                    const errorMessage = langCode === 'ar' ? 'لا توجد بيانات.' : 'No data found.';
                    document.getElementById('hero-content-dynamic').innerHTML = `<p>${errorMessage}</p>`;
                    return;
                }

                const doc = fallbackData.results[0];
                console.log(`Loaded fallback document in language ${doc.lang} with data:`, doc.data);

                // Update page content with API data
                updateHeroSection(doc.data);
                updateCompanyOverview(doc.data);
                updateServices(doc.data);
                updateCTASection(doc.data);
                updateFooter(doc.data);
                return;
            }

            const errorMessage = langCode === 'ar' ? 'لا توجد بيانات.' : 'No data found.';
            document.getElementById('hero-content-dynamic').innerHTML = `<p>${errorMessage}</p>`;
            return;
        }

        const doc = docsData.results[0];

        // Update Hero Section
        updateHeroSection(doc.data);

        // Update Company Overview Section
        updateCompanyOverview(doc.data);

        // Update Services Section
        updateServices(doc.data);

        // Update CTA Section
        updateCTASection(doc.data);

        // Update Footer
        updateFooter(doc.data);

    } catch (err) {
        console.error('Error fetching data:', err);
        // Show error message in the appropriate language
        const errorMessage = langCode === 'ar' ? 'حدث خطأ أثناء جلب البيانات.' : 'Error loading data.';
        document.getElementById('hero-content-dynamic').innerHTML = `<p>${errorMessage}</p>`;
    }
}

function updateHeroSection(data) {
    const container = document.getElementById('hero-content-dynamic');

    // Get hero title and description
    const heroTitle = data.hero_title && data.hero_title.length > 0 ?
        data.hero_title[0]?.text || '' : '';

    const heroDescription = data.hero_description && data.hero_description.length > 0 ?
        data.hero_description[0]?.text || '' : '';

    // Build CTA buttons HTML
    let buttonsHTML = '<div style="margin-top: 15px;">';

    if (data.hero_cta_buttons && data.hero_cta_buttons.length > 0) {
        data.hero_cta_buttons.forEach(button => {
            const buttonText = button.button_text || '';
            const buttonUrl = button.button_link?.url || '#';
            buttonsHTML += `<a href="${buttonUrl}" class="btn btn-primary" style="margin: 5px;">${buttonText}</a>`;
        });
    }

    buttonsHTML += '</div>';

    // Update hero content
    container.innerHTML = `
        <h1 class="hero-title">${heroTitle}</h1>
        <p class="hero-subtitle">${heroDescription}</p>
        ${buttonsHTML}
    `;
}

function updateCompanyOverview(data) {
    const overviewTitle = document.querySelector('.company-overview .section-title');
    const overviewText = document.getElementById('who-we-are-text');

    if (overviewTitle && overviewText) {
        const companyTitle = data.company_title && data.company_title.length > 0 ?
            data.company_title[0]?.text || 'Who We Are' : 'Who We Are';

        const companyDescription = data.company_description && data.company_description.length > 0 ?
            data.company_description[0]?.text || '' : '';

        overviewTitle.textContent = companyTitle;
        overviewText.textContent = companyDescription;
    }
}

function updateServices(data) {
    const servicesGrid = document.querySelector('.services-grid');

    if (servicesGrid && data.top_services && data.top_services.length > 0) {
        let servicesHTML = '';

        data.top_services.forEach(service => {
            const title = service.title && service.title.length > 0 ?
                service.title[0]?.text || '' : '';

            // Process description - check if it contains list items
            let descriptionHTML = '';
            if (service.description && service.description.length > 0) {
                // Check if any items are list items
                const hasListItems = service.description.some(item => item.type === 'list-item');

                if (hasListItems) {
                    // Create a proper HTML list
                    descriptionHTML = '<ul class="service-list">';
                    service.description.forEach(item => {
                        if (item.type === 'list-item') {
                            descriptionHTML += `<li>${item.text}</li>`;
                        } else if (item.type === 'paragraph' && item.text.trim() !== '') {
                            descriptionHTML += `<p>${item.text}</p>`;
                        }
                    });
                    descriptionHTML += '</ul>';
                } else {
                    // If no list items, just use the first paragraph text as before
                    descriptionHTML = service.description[0]?.text || '';
                }
            }

            const linkText = service.link_text || 'Learn More';
            const linkUrl = service.link_url?.url || '#';
            const icon = service.icon || 'fas fa-passport'; // Default icon

            servicesHTML += `
                <div class="service-card glass-card">
                   
                    <h3 class="service-title">${title}</h3>
                    <div class="service-text">${descriptionHTML}</div>
                    <a href="${linkUrl}" class="btn btn-secondary">${linkText}</a>
          </div>
        `;
        });

        servicesGrid.innerHTML = servicesHTML;
    }
}

function updateCTASection(data) {
    const ctaTitle = document.querySelector('.cta-title');
    const ctaText = document.querySelector('.cta-text');
    const ctaButton = document.querySelector('.cta-content .btn');

    if (ctaTitle && data.cta_title && data.cta_title.length > 0) {
        ctaTitle.textContent = data.cta_title[0]?.text || ctaTitle.textContent;
    }

    if (ctaText && data.cta_description && data.cta_description.length > 0) {
        ctaText.textContent = data.cta_description[0]?.text || ctaText.textContent;
    }

    if (ctaButton) {
        ctaButton.textContent = data.cta_button_text || ctaButton.textContent;
        if (data.cta_button_link && data.cta_button_link.url) {
            ctaButton.href = data.cta_button_link.url;
        }
    }
}

function updateFooter(data) {
    // Update Quick Links
    const footerLinks = document.querySelector('.footer-links ul');

    if (footerLinks && data.quick_links && data.quick_links.length > 0) {
        let linksHTML = '';

        data.quick_links.forEach(link => {
            const text = link.text || '';
            const url = link.url?.url || '#';

            linksHTML += `<li><a href="${url}">${text}</a></li>`;
        });

        if (linksHTML) {
            footerLinks.innerHTML = linksHTML;
        }
    }

    // Update Footer Contact
    if (data.footer_contacts && data.footer_contacts.length > 0) {
        const contact = data.footer_contacts[0];

        // Update address
        const addressElement = document.querySelector('.footer-contact p:first-of-type span');
        if (addressElement && contact.address && contact.address.length > 0) {
            addressElement.textContent = contact.address[0]?.text || addressElement.textContent;
        }

        // Update phone
        const phoneElement = document.querySelector('.footer-contact a[href^="tel:"]');
        if (phoneElement && contact.phone) {
            phoneElement.textContent = contact.phone;
            phoneElement.href = `tel:${contact.phone.replace(/\s/g, '')}`;
        }

        // Update social links
        const instagramLink = document.querySelector('.social-links a[href*="instagram"]');
        if (instagramLink && contact.instagram && contact.instagram.url) {
            instagramLink.href = contact.instagram.url;
        }

        const whatsappLink = document.querySelector('.social-links a[href*="whatsapp"]');
        if (whatsappLink && contact.whatsapp && contact.whatsapp.url) {
            whatsappLink.href = contact.whatsapp.url;
        }

        // Update floating WhatsApp button
        const floatingWhatsappBtn = document.querySelector('.whatsapp-btn');
        if (floatingWhatsappBtn && contact.whatsapp && contact.whatsapp.url) {
            floatingWhatsappBtn.href = contact.whatsapp.url;
        }
    }
}

/**
 * Updates all navigation links to preserve the language parameter
 */
function updateNavigationLinks() {
    // Get current language code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const langCode = urlParams.get('lang') || urlParams.get('lan');
    const paramName = urlParams.has('lang') ? 'lang' : 'lan';

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
    if (document.body.classList.contains('index-page')) {
        fetchHeroData();

        // Update navigation links to preserve language parameter
        updateNavigationLinks();
    }
});
