/**
 * Fetches and renders dynamic content for the homepage from the Prismic API.
 * Handles language selection and fallback.
 */
async function fetchAndRenderHomepage() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';
    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const prismicLang = langCode === 'ar' || langCode === 'ar-kw' ? 'ar-kw' : 'en-us';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';

    const loadingIndicator = document.getElementById('hero-content-dynamic');
    const loadingMessage = isArabic ? 'جاري التحميل...' : 'Loading...';
    if (loadingIndicator) {
        loadingIndicator.innerHTML = `<div class="loading-indicator">${loadingMessage}</div>`;
    }

    try {
        const api = await (await fetch(apiUrl)).json();
        const ref = api.refs[0].ref;

        let response = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"home_page")]]&lang=${prismicLang}`);
        let data = await response.json();

        // Fallback to English if the selected language has no content
        if (!data.results || data.results.length === 0) {
            console.warn(`No content found for language: ${prismicLang}. Falling back to en-us.`);
            response = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"home_page")]]&lang=en-us`);
            data = await response.json();
        }

        if (!data.results || data.results.length === 0) {
            throw new Error("No homepage content found in any language.");
        }

        const doc = data.results[0].data;
        renderHero(doc);
        renderCompanyOverview(doc);
        renderServices(doc);
        renderCTA(doc);
        renderFooter(doc);

    } catch (error) {
        console.error('Error fetching or rendering homepage data:', error);
        if (loadingIndicator) {
            const errorMessage = isArabic ? 'حدث خطأ في تحميل المحتوى.' : 'Failed to load content.';
            loadingIndicator.innerHTML = `<p class="error">${errorMessage}</p>`;
        }
    }
}

/**
 * Renders a rich text field, handling different element types.
 * @param {Array} richTextArray - The rich text array from Prismic.
 * @returns {string} - The generated HTML string.
 */
function renderRichText(richTextArray) {
    if (!richTextArray) return '';

    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';

    return richTextArray.map(item => {
        // Use the item's direction if available, otherwise use language-based direction
        const direction = item.direction || (isArabic ? 'rtl' : 'ltr');
        const dir = `dir="${direction}"`;
        const align = direction === 'rtl' ? 'text-align: right;' : '';

        switch (item.type) {
            case 'heading1': return `<h1 ${dir} style="${align}">${item.text}</h1>`;
            case 'heading2': return `<h2 ${dir} style="${align}">${item.text}</h2>`;
            case 'heading3': return `<h3 ${dir} style="${align}">${item.text}</h3>`;
            case 'paragraph': return `<p ${dir} style="${align}">${item.text}</p>`;
            case 'list-item': return `<li ${dir} style="${align}">${item.text}</li>`;
            default: return `<p ${dir} style="${align}">${item.text}</p>`;
        }
    }).join('');
}

/**
 * Renders the hero section.
 * @param {object} data - The Prismic data object for the page.
 */
function renderHero(data) {
    const container = document.getElementById('hero-content-dynamic');
    if (!container) return;

    const title = renderRichText(data.hero_title);
    const description = renderRichText(data.hero_description);

    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';
    const buttonClass = isArabic ? 'btn btn-primary rtl' : 'btn btn-primary';

    const buttons = (data.hero_cta_buttons || []).map(item => {
        if (!item.button_text || !item.button_link?.url) return '';
        return `<a href="${item.button_link.url}" class="${buttonClass}">${item.button_text}</a>`;
    }).join('');

    // Set hero background image from API
    const heroSection = document.querySelector('.hero');
    if (heroSection && data.imge_hero?.url) {
        heroSection.style.backgroundImage = `url('${data.imge_hero.url}')`;
    }

    container.innerHTML = `
        ${title}
        ${description}
        <div class="hero-buttons" dir="${isArabic ? 'rtl' : 'ltr'}">${buttons}</div>
    `;
}

/**
 * Renders the company overview section.
 * @param {object} data - The Prismic data object for the page.
 */
function renderCompanyOverview(data) {
    const titleEl = document.querySelector('.company-overview .section-title');
    const textEl = document.getElementById('who-we-are-text');
    if (!titleEl || !textEl) return;

    titleEl.outerHTML = renderRichText(data.company_title);
    textEl.innerHTML = renderRichText(data.company_description);
}

/**
 * Renders the top services section.
 * @param {object} data - The Prismic data object for the page.
 */
function renderServices(data) {
    const container = document.querySelector('.services-grid');
    if (!container || !data.top_services) return;

    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';

    container.innerHTML = (data.top_services || []).map(service => {
        const title = renderRichText(service.title);
        const description = service.description ? `<ul dir="${isArabic ? 'rtl' : 'ltr'}">${renderRichText(service.description)}</ul>` : '';
        const buttonClass = isArabic ? 'btn btn-secondary rtl' : 'btn btn-secondary';
        const link = service.link_url?.url ? `<a href="${service.link_url.url}" class="${buttonClass}">${service.link_text || (isArabic ? 'اقرأ المزيد' : 'Learn More')}</a>` : '';

        return `
            <div class="service-card glass-card" dir="${isArabic ? 'rtl' : 'ltr'}">
                ${title}
                <div class="service-text">${description}</div>
                ${link}
            </div>
        `;
    }).join('');
}

/**
 * Renders the Call To Action (CTA) section.
 * @param {object} data - The Prismic data object for the page.
 */
function renderCTA(data) {
    const titleEl = document.querySelector('.cta-title');
    const textEl = document.querySelector('.cta-text');
    const buttonEl = document.querySelector('.cta-content .btn-primary');
    if (!titleEl || !textEl || !buttonEl) return;

    titleEl.outerHTML = renderRichText(data.cta_title);
    textEl.innerHTML = renderRichText(data.cta_description);

    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';

    if (isArabic) {
        buttonEl.classList.add('rtl');
    } else {
        buttonEl.classList.remove('rtl');
    }

    if (data.cta_button_text) {
        buttonEl.textContent = data.cta_button_text;
    }
    if (data.cta_button_link?.url) {
        buttonEl.href = data.cta_button_link.url;
    }
}

/**
 * Renders the footer section.
 * @param {object} data - The Prismic data object for the page.
 */
function renderFooter(data) {
    const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
    const isArabic = langCode === 'ar' || langCode === 'ar-kw';

    // Quick Links
    const quickLinksEl = document.querySelector('.footer-links ul');
    if (quickLinksEl && data.quick_links) {
        quickLinksEl.dir = isArabic ? 'rtl' : 'ltr';
        quickLinksEl.innerHTML = data.quick_links.map(link =>
            `<li><a href="${link.url.url}" dir="${isArabic ? 'rtl' : 'ltr'}">${link.text}</a></li>`
        ).join('');
    }

    // Contact Info
    const contact = data.footer_contacts?.[0];
    if (!contact) return;

    const addressEl = document.querySelector('.footer-contact .address-text');
    const phoneEl = document.querySelector('.footer-contact .phone-link');
    const emailEl = document.querySelector('.footer-contact .email-link');
    const instagramEl = document.querySelector('.social-links .instagram-link');
    const facebookEl = document.querySelector('.social-links .facebook-link');
    const whatsappEl = document.querySelector('.social-links .whatsapp-link');
    const floatingWhatsappEl = document.querySelector('.whatsapp-btn');

    if (addressEl && contact.address?.[0]) {
        addressEl.textContent = contact.address[0].text;
        addressEl.dir = contact.address[0].direction || (isArabic ? 'rtl' : 'ltr');
    }
    if (phoneEl && contact.phone?.url) {
        phoneEl.href = contact.phone.url;
        phoneEl.textContent = contact.phone.url.replace('tel:', '');
        phoneEl.dir = isArabic ? 'rtl' : 'ltr';
        if (contact.phone.target) phoneEl.target = contact.phone.target;
    }
    if (emailEl && contact.email?.url) {
        emailEl.href = `mailto:${contact.email.url}`;
        emailEl.textContent = contact.email.url;
        emailEl.dir = isArabic ? 'rtl' : 'ltr';
        if (contact.email.target) emailEl.target = contact.email.target;
    }
    if (instagramEl && contact.instgram_urk?.url) {
        instagramEl.href = contact.instgram_urk.url;
        if (contact.instgram_urk.target) instagramEl.target = contact.instgram_urk.target;
    }
    if (facebookEl && contact.facebook_url?.url) {
        facebookEl.href = contact.facebook_url.url;
        if (contact.facebook_url.target) facebookEl.target = contact.facebook_url.target;
    }
    if (whatsappEl && contact.whatsapp_url?.url) {
        whatsappEl.href = contact.whatsapp_url.url;
        if (contact.whatsapp_url.target) whatsappEl.target = contact.whatsapp_url.target;
    }
    if (floatingWhatsappEl && contact.whatsapp_url?.url) {
        floatingWhatsappEl.href = contact.whatsapp_url.url;
        if (contact.whatsapp_url.target) floatingWhatsappEl.target = contact.whatsapp_url.target;
    }
}

// --- Initialize ---
// Run the script once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', fetchAndRenderHomepage);
// Re-run the script when the language is changed.
document.addEventListener('languageChanged', fetchAndRenderHomepage);
