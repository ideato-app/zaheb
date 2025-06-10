/**
 * Visa Module
 * Handles fetching and displaying visa information data from the Prismic API
 */

const VisaModule = (function () {
    'use strict';

    // Modal reference
    let modal;

    /**
     * Renders a rich text array from Prismic into clean HTML.
     * @param {Array} content - The rich text array from Prismic.
     * @param {Object} options - Rendering options.
     * @param {string} options.listElement - The tag to use for lists (ul or ol).
     * @returns {string} The generated HTML string.
     */
    function renderRichText(content, { listElement = 'ul' } = {}) {
        if (!content || !Array.isArray(content)) {
            return '';
        }

        let html = '';
        let listOpen = false;

        const closeList = () => {
            if (listOpen) {
                html += `</${listElement}>`;
                listOpen = false;
            }
        };

        content.forEach(item => {
            let text = item.text;

            // Apply spans (e.g., strong for bold)
            if (item.spans && item.spans.length > 0) {
                // Process spans backwards to not mess up indices
                [...item.spans].reverse().forEach(span => {
                    if (span.type === 'strong') {
                        text = text.slice(0, span.start) + `<strong>` + text.slice(span.start, span.end) + `</strong>` + text.slice(span.end);
                    }
                });
            }

            if (item.type === 'list-item') {
                if (!listOpen) {
                    html += `<${listElement} class="dynamic-list">`;
                    listOpen = true;
                }
                html += `<li>${text}</li>`;
            } else {
                closeList();
                switch (item.type) {
                    case 'heading1':
                        html += `<h1>${text}</h1>`;
                        break;
                    case 'heading2':
                        html += `<h2>${text}</h2>`;
                        break;
                    case 'heading3':
                        html += `<h3>${text}</h3>`;
                        break;
                    case 'paragraph':
                        html += `<p>${text}</p>`;
                        break;
                }
            }
        });

        closeList();
        return html;
    }

    async function fetchVisaData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

        // Get current language code - try multiple methods to ensure we get the right one
        let langCode;

        // First try from localStorage directly
        langCode = localStorage.getItem('zaheb-language');
        console.log('Initial language from localStorage:', langCode);

        // Then try from LanguageModule if available
        if (window.LanguageModule && typeof window.LanguageModule.getCurrentLanguage === 'function') {
            const moduleLang = window.LanguageModule.getCurrentLanguage();
            console.log('Language from LanguageModule:', moduleLang);

            // Only use module language if it's valid (not undefined or null)
            if (moduleLang) {
                langCode = moduleLang;
            }
        }

        // Set default if still not set
        if (!langCode) {
            langCode = 'ar-kw';
            console.log('No language found, defaulting to:', langCode);
        }

        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' || langCode === 'ar-kw' ? 'ar-kw' : 'en-us';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        console.log(`Visa module - Current language: ${langCode}, Prismic language: ${prismicLangCode}, isArabic: ${isArabic}`);

        try {
            const apiRes = await fetch(apiUrl);
            const data = await apiRes.json();
            const ref = data.refs[0].ref;

            // Include language code in the API query
            const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"visa")]]&lang=${prismicLangCode}`);
            const docsData = await docsRes.json();

            if (!docsData.results || docsData.results.length === 0) {
                console.error(`No visa data found for language: ${prismicLangCode}`);

                // If no results in requested language, try falling back to English
                if (prismicLangCode !== 'en-us') {
                    console.log('Falling back to English');
                    const fallbackRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=[[at(document.type,"visa")]]&lang=en-us`);
                    const fallbackData = await fallbackRes.json();

                    if (!fallbackData.results || fallbackData.results.length === 0) {
                        const errorMessage = isArabic
                            ? 'لم يتم العثور على بيانات التأشيرات.'
                            : 'No visa data found.';
                        document.querySelector('.loading-spinner').innerHTML = `<p>${errorMessage}</p>`;
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
            console.log(`Loaded visa document in language ${doc.lang} with data:`, doc.data);

            // Update page content with API data
            updatePageContent(doc.data, isArabic);

        } catch (err) {
            console.error('Error fetching visa data:', err);
            const errorMessage = isArabic
                ? 'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.'
                : 'Error loading visa information.';
            document.querySelector('.loading-spinner').innerHTML = `<p>${errorMessage}</p>`;
        }
    }

    function updatePageContent(data, isArabic) {
        // Hide loading spinner
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }

        // Update page title
        if (data.tittle_page && data.tittle_page.length > 0) {
            const pageTitle = document.querySelector('.container h1');
            if (pageTitle) {
                pageTitle.textContent = data.tittle_page[0].text;
            }
        }

        // Update visa introduction
        if (data.tittle_paragraph && data.paragraph_text) {
            const introTitle = document.querySelector('.visa-intro .section-title');
            const introText = document.querySelector('.visa-intro .lead');

            if (introTitle && data.tittle_paragraph.length > 0) {
                introTitle.textContent = data.tittle_paragraph[0].text;
            }

            if (introText && data.paragraph_text.length > 0) {
                introText.textContent = data.paragraph_text[0].text;
            }
        }

        // Update CTA section
        if (data.cta_tittle && data.cta_description) {
            const ctaTitle = document.querySelector('.cta-title');
            const ctaText = document.querySelector('.cta-text');
            const ctaButton = document.querySelector('.cta-content .btn');

            if (ctaTitle && data.cta_tittle.length > 0) {
                ctaTitle.textContent = data.cta_tittle[0].text;
            }

            if (ctaText && data.cta_description.length > 0) {
                ctaText.textContent = data.cta_description[0].text;
            }

            if (ctaButton && data.lable_button && data.lable_button.length > 0) {
                ctaButton.textContent = data.lable_button[0].text;

                if (data.url_button && data.url_button.length > 0) {
                    ctaButton.href = data.url_button[0].text;
                }
            }
        }

        // Render countries
        if (data.visa_information && data.visa_information.length > 0) {
            renderCountries(data.visa_information, isArabic);
        }

        // The footer is now rendered by fetchFooterData
        // renderFooter(data, isArabic);
    }

    function renderCountries(countries, isArabic) {
        const countriesGrid = document.querySelector('.countries-grid');
        let html = '';

        // Define translations for headers
        const translations = {
            'more_info': {
                'en': 'More Info',
                'ar': 'مزيد من المعلومات'
            },
            'inquire_now': {
                'en': 'Inquire Now',
                'ar': 'استفسر الآن'
            },
        };

        countries.forEach((country) => {
            const visaTypesHtml = renderRichText(country.visa_types_content, { listElement: 'ul' });
            const requirementsHtml = renderRichText(country.general_requirements_content, { listElement: 'ol' });

            // Create buttons HTML
            const inquireUrl = country.cta_inquire_link?.url || 'contact.html';
            const inquireLabel = country.cta_inquire_label || translations.inquire_now[isArabic ? 'ar' : 'en'];
            const moreInfoLabel = country.cta_more_label || translations.more_info[isArabic ? 'ar' : 'en'];

            const buttonsHtml = `
                <div class="visa-buttons">
                    <a href="${inquireUrl}" class="btn btn-primary">${inquireLabel}</a>
                    <button class="btn btn-secondary more-info-btn" data-country="${country.country_name}">${moreInfoLabel}</button>
                </div>
            `;

            // Store detailed information for modal
            if (country.more && country.more.length > 0) {
                const moreInfoHtml = processMoreInfo(country.more);
                html += `<div id="more-info-${sanitizeId(country.country_name)}" class="hidden-modal-content" style="display:none;">${moreInfoHtml}</div>`;
            }

            // Use country-provided headers if available, otherwise use translated defaults
            const visaTypesHeader = country.visa_types_list || (isArabic ? 'أنواع التأشيرات' : 'Visa Types');
            const requirementsHeader = country.general_requirements_list || (isArabic ? 'المتطلبات' : 'Requirements');

            // Combine all sections into country HTML
            const countryHtml = `
                <div class="country glass-card">
                    <div class="country-header">
                        <h2><i class="fas fa-globe"></i> ${country.country_name}</h2>
                    </div>
                    <div class="country-content">
                        <div class="visa-info">
                            <h3><i class="fas fa-passport"></i> ${visaTypesHeader}</h3>
                            ${visaTypesHtml}
                        </div>
                        <div class="requirements">
                            <h3><i class="fas fa-list-check"></i> ${requirementsHeader}</h3>
                            ${requirementsHtml}
                        </div>
                        ${buttonsHtml}
                    </div>
                </div>
            `;

            html += countryHtml;
        });

        // Insert all countries HTML into the grid
        countriesGrid.innerHTML = html;

        // Add event listeners to the "More Info" buttons
        setupMoreInfoButtons(isArabic);
    }

    function processMoreInfo(moreInfo) {
        const innerHtml = renderRichText(moreInfo);
        return `<div class="modal-content-inner">${innerHtml}</div>`;
    }

    function setupMoreInfoButtons(isArabic) {
        const moreInfoButtons = document.querySelectorAll('.more-info-btn');
        moreInfoButtons.forEach(button => {
            button.addEventListener('click', function () {
                const countryName = this.getAttribute('data-country');
                const detailsElement = document.getElementById(`more-info-${sanitizeId(countryName)}`);
                if (detailsElement) {
                    showModal(countryName, detailsElement.innerHTML, isArabic);
                }
            });
        });
    }

    function showModal(countryName, detailsText, isArabic) {
        const modal = document.getElementById('visaDetailsModal');
        const modalContent = document.getElementById('modalContent');
        const title = isArabic ? `تفاصيل تأشيرة ${countryName}` : `${countryName} Visa Details`;

        modalContent.innerHTML = `
            <h2>${title}</h2>
            ${detailsText}
        `;

        modal.dir = isArabic ? 'rtl' : 'ltr';
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
    }

    function sanitizeId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    async function fetchFooterData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';
        try {
            const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
            const isArabic = langCode === 'ar-kw' || langCode === 'ar';

            const apiResponse = await fetch(apiUrl);
            if (!apiResponse.ok) throw new Error('Failed to connect to Prismic API for footer.');
            const apiData = await apiResponse.json();
            const masterRef = apiData.refs.find(ref => ref.isMasterRef)?.ref;

            if (!masterRef) throw new Error('Could not find master ref in API response for footer.');

            const docUrl = `${apiUrl}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=${isArabic ? 'ar-kw' : 'en-us'}`;

            let response = await fetch(docUrl);
            let data = await response.json();

            if (!data.results || data.results.length === 0) {
                console.log(`No footer data found for language: ${isArabic ? 'ar-kw' : 'en-us'}. Falling back to English.`);
                const fallbackUrl = `${apiUrl}/documents/search?ref=${masterRef}&q=[[at(document.type,"contact_page")]]&lang=en-us`;
                response = await fetch(fallbackUrl);
                data = await response.json();
            }

            if (data.results && data.results.length > 0) {
                const doc = data.results[0].data;
                renderFooter(doc, isArabic);
            } else {
                console.error("No footer content found in any language.");
            }

        } catch (error) {
            console.error('Failed to fetch footer data:', error);
        }
    }

    function renderFooter(data, isArabic) {
        const setRtl = (el) => {
            if (el) {
                el.dir = isArabic ? 'rtl' : 'ltr';
                el.style.textAlign = isArabic ? 'right' : 'left';
            }
        };

        // Footer Logo
        const footerLogo = document.querySelector('.footer-logo img');
        if (footerLogo && data.footer_logo?.url) {
            footerLogo.src = data.footer_logo.url;
            footerLogo.alt = data.footer_logo.alt || 'Zaheb International Logo';
        }

        // Footer Links
        const quickLinksTitle = document.querySelector('.footer-links h3');
        setRtl(quickLinksTitle);
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
            setRtl(footerLinksContainer);
        }

        // Footer Contact Info
        const contactUsTitle = document.querySelector('.footer-contact h3');
        setRtl(contactUsTitle);
        const contact = data.footer_contacts?.[0];
        if (contact) {
            const addressText = document.querySelector('.footer-contact .address-text');
            if (addressText && contact.address?.[0]?.text) {
                addressText.textContent = contact.address[0].text;
                setRtl(addressText.parentElement);
            }

            const phoneLink = document.querySelector('.footer-contact .phone-link');
            if (phoneLink && contact.phone?.url) {
                phoneLink.href = contact.phone.url;
                phoneLink.textContent = contact.phone.url.replace('tel:', '');
                setRtl(phoneLink.parentElement);
            }

            const emailLink = document.querySelector('.footer-contact .email-link');
            if (emailLink && contact.email?.url) {
                emailLink.href = `mailto:${contact.email.url}`;
                emailLink.textContent = contact.email.url;
                setRtl(emailLink.parentElement);
            }

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
            setRtl(copyright);
        }
    }

    function init() {
        console.log('Visa module initializing...');
        // Initialize modal functionality
        initModal();

        // Check current language directly before initial fetch
        const storedLang = localStorage.getItem('zaheb-language');
        console.log('Stored language before initial fetch:', storedLang);

        // Fetch visa data
        fetchVisaData();
        fetchFooterData();

        // Listen for language changes
        document.addEventListener('languageChanged', function (e) {
            console.log('Language changed event detected in visa module:', e.detail.language);

            // Force update of language in localStorage to ensure consistency
            if (e.detail && e.detail.language) {
                localStorage.setItem('zaheb-language', e.detail.language);
                console.log('Updated localStorage with language from event:', e.detail.language);
            }

            // Small delay to ensure localStorage is updated
            setTimeout(fetchVisaData, 100);
            setTimeout(fetchFooterData, 100);
        });
    }

    function initModal() {
        modal = document.getElementById('visaDetailsModal');
        const closeBtn = modal.querySelector('.close-modal');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Public API
    return {
        init: init
    };
})();

// Export the module
window.VisaModule = VisaModule;

// Remove self-initialization since we're handling this in visa.html
// document.addEventListener('DOMContentLoaded', function () {
//     if (document.body.classList.contains('visa-page')) {
//         VisaModule.init();
//     }
// });