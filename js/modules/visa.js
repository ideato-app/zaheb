/**
 * Visa Module
 * Handles fetching and displaying visa information data from the Prismic API
 */

const VisaModule = (function () {
    'use strict';

    // Modal reference
    let modal;

    async function fetchVisaData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

        // Get current language code from localStorage or use default
        const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' || langCode === 'ar-kw' ? 'ar-kw' : 'en-us';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        console.log(`Fetching visa data for language: ${prismicLangCode}`);

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
                        document.querySelector('.loading-spinner').innerHTML = `<p dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${errorMessage}</p>`;
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
            document.querySelector('.loading-spinner').innerHTML = `<p dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${errorMessage}</p>`;
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
                pageTitle.dir = isArabic ? 'rtl' : 'ltr';
                pageTitle.style.textAlign = isArabic ? 'right' : 'left';
            }
        }

        // Update visa introduction
        if (data.tittle_paragraph && data.paragraph_text) {
            const introTitle = document.querySelector('.visa-intro .section-title');
            const introText = document.querySelector('.visa-intro .lead');

            if (introTitle && data.tittle_paragraph.length > 0) {
                introTitle.textContent = data.tittle_paragraph[0].text;
                introTitle.dir = isArabic ? 'rtl' : 'ltr';
                introTitle.style.textAlign = isArabic ? 'right' : 'left';
            }

            if (introText && data.paragraph_text.length > 0) {
                introText.textContent = data.paragraph_text[0].text;
                introText.dir = isArabic ? 'rtl' : 'ltr';
                introText.style.textAlign = isArabic ? 'right' : 'left';
            }
        }

        // Update CTA section
        if (data.cta_tittle && data.cta_description) {
            const ctaTitle = document.querySelector('.cta-title');
            const ctaText = document.querySelector('.cta-text');
            const ctaButton = document.querySelector('.cta-content .btn');

            if (ctaTitle && data.cta_tittle.length > 0) {
                ctaTitle.textContent = data.cta_tittle[0].text;
                ctaTitle.dir = isArabic ? 'rtl' : 'ltr';
                ctaTitle.style.textAlign = isArabic ? 'right' : 'left';
            }

            if (ctaText && data.cta_description.length > 0) {
                ctaText.textContent = data.cta_description[0].text;
                ctaText.dir = isArabic ? 'rtl' : 'ltr';
                ctaText.style.textAlign = isArabic ? 'right' : 'left';
            }

            if (ctaButton && data.lable_button && data.lable_button.length > 0) {
                ctaButton.textContent = data.lable_button[0].text;
                ctaButton.dir = isArabic ? 'rtl' : 'ltr';

                if (data.url_button && data.url_button.length > 0) {
                    ctaButton.href = data.url_button[0].text;
                }
            }
        }

        // Render countries
        if (data.visa_information && data.visa_information.length > 0) {
            renderCountries(data.visa_information, isArabic);
        }

        // Render footer
        renderFooter(data, isArabic);
    }

    function renderCountries(countries, isArabic) {
        const countriesGrid = document.querySelector('.countries-grid');
        countriesGrid.dir = isArabic ? 'rtl' : 'ltr';
        let html = '';

        // Define translations for headers
        const translations = {
            'visa_types': {
                'en': 'Visa Types',
                'ar': 'أنواع التأشيرات'
            },
            'requirements': {
                'en': 'Requirements',
                'ar': 'المتطلبات'
            },
            'more_info': {
                'en': 'More Info',
                'ar': 'مزيد من المعلومات'
            },
            'inquire_now': {
                'en': 'Inquire Now',
                'ar': 'استفسر الآن'
            },
            'visa_details': {
                'en': 'Visa Details',
                'ar': 'تفاصيل التأشيرة'
            }
        };

        countries.forEach((country) => {
            // Process visa types
            let visaTypesHtml = '';
            if (country.visa_types_content && country.visa_types_content.length > 0) {
                visaTypesHtml = `<ul class="visa-types-list" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">`;
                country.visa_types_content.forEach(item => {
                    if (item.type === 'paragraph') {
                        visaTypesHtml += `<p dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</p>`;
                    } else if (item.type === 'list-item') {
                        visaTypesHtml += `<li dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</li>`;
                    }
                });
                visaTypesHtml += '</ul>';
            }

            // Process requirements
            let requirementsHtml = '';
            if (country.general_requirements_content && country.general_requirements_content.length > 0) {
                requirementsHtml = `<ol class="requirements-list" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">`;
                country.general_requirements_content.forEach(item => {
                    if (item.type === 'list-item') {
                        requirementsHtml += `<li dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</li>`;
                    } else if (item.type === 'paragraph') {
                        requirementsHtml += `<p dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</p>`;
                    }
                });
                requirementsHtml += '</ol>';
            }

            // Create buttons HTML
            const inquireUrl = country.cta_inquire_link?.url || 'contact.html';
            const inquireLabel = country.cta_inquire_label || translations.inquire_now[isArabic ? 'ar' : 'en'];
            const moreInfoLabel = country.cta_more_label || translations.more_info[isArabic ? 'ar' : 'en'];

            const buttonsHtml = `
                <div class="visa-buttons" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">
                    <a href="${inquireUrl}" class="btn btn-primary" dir="${isArabic ? 'rtl' : 'ltr'}">${inquireLabel}</a>
                    <button class="btn btn-secondary more-info-btn" data-country="${country.country_name}" dir="${isArabic ? 'rtl' : 'ltr'}">${moreInfoLabel}</button>
                </div>
            `;

            // Store detailed information for modal
            if (country.more && country.more.length > 0) {
                const moreInfoHtml = processMoreInfo(country.more, isArabic);
                html += `<div id="more-info-${sanitizeId(country.country_name)}" class="hidden-modal-content" style="display:none;" dir="${isArabic ? 'rtl' : 'ltr'}">${moreInfoHtml}</div>`;
            }

            // Use country-provided headers if available, otherwise use translated defaults
            const visaTypesHeader = country.visa_types_list || translations.visa_types[isArabic ? 'ar' : 'en'];
            const requirementsHeader = country.general_requirements_list || translations.requirements[isArabic ? 'ar' : 'en'];

            // Combine all sections into country HTML
            const countryHtml = `
                <div class="country glass-card" dir="${isArabic ? 'rtl' : 'ltr'}">
                    <div class="country-header">
                        <h2 dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}"><i class="fas fa-globe"></i> ${country.country_name}</h2>
                    </div>
                    <div class="country-content" style="text-align: ${isArabic ? 'right' : 'left'}">
                        <div class="visa-info">
                            <h3 dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}"><i class="fas fa-passport"></i> ${visaTypesHeader}</h3>
                            ${visaTypesHtml}
                        </div>
                        <div class="requirements">
                            <h3 dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}"><i class="fas fa-list-check"></i> ${requirementsHeader}</h3>
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

    function processMoreInfo(moreInfo, isArabic) {
        let html = `<div class="modal-content-inner" dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">`;

        moreInfo.forEach(item => {
            if (item.type === 'heading3') {
                html += `<h3 dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</h3>`;
            } else if (item.type === 'paragraph') {
                html += `<p dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</p>`;
            } else if (item.type === 'list-item') {
                if (!html.includes('<ul>')) {
                    html += `<ul dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">`;
                }
                html += `<li dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${item.text}</li>`;
            }
        });

        if (html.includes('<ul>')) {
            html += '</ul>';
        }

        html += '</div>';
        return html;
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
            <h2 dir="${isArabic ? 'rtl' : 'ltr'}" style="text-align: ${isArabic ? 'right' : 'left'}">${title}</h2>
            ${detailsText}
        `;

        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();
    }

    function sanitizeId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    function renderFooter(data, isArabic) {
        // Update footer content
        if (data.footer_address) {
            const addressText = document.querySelector('.address-text');
            if (addressText) {
                addressText.textContent = data.footer_address;
                addressText.dir = isArabic ? 'rtl' : 'ltr';
                addressText.style.textAlign = isArabic ? 'right' : 'left';
            }
        }

        if (data.footer_phone) {
            const phoneLink = document.querySelector('.phone-link');
            if (phoneLink) {
                phoneLink.textContent = data.footer_phone;
                phoneLink.href = `tel:${data.footer_phone.replace(/\s/g, '')}`;
                phoneLink.dir = isArabic ? 'rtl' : 'ltr';
                phoneLink.style.textAlign = isArabic ? 'right' : 'left';
            }
        }

        if (data.footer_email) {
            const emailLink = document.querySelector('.email-link');
            if (emailLink) {
                emailLink.textContent = data.footer_email;
                emailLink.href = `mailto:${data.footer_email}`;
                emailLink.dir = isArabic ? 'rtl' : 'ltr';
                emailLink.style.textAlign = isArabic ? 'right' : 'left';
            }
        }

        // Update social media links if available
        if (data.contact) {
            updateSocialLinks(data.contact);
        }
    }

    function updateSocialLinks(contact) {
        const instagramLink = document.querySelector('.instagram-link');
        const facebookLink = document.querySelector('.facebook-link');
        const whatsappLink = document.querySelector('.whatsapp-link');

        if (contact.instagram_url && instagramLink) {
            instagramLink.href = contact.instagram_url;
        }

        if (contact.facebook_url && facebookLink) {
            facebookLink.href = contact.facebook_url;
        }

        if (contact.whatsapp_number && whatsappLink) {
            const whatsappNumber = contact.whatsapp_number.replace(/\s/g, '');
            whatsappLink.href = `https://wa.me/${whatsappNumber}`;
        }
    }

    function init() {
        // Initialize modal functionality
        initModal();
        // Fetch visa data
        fetchVisaData();
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('visa-page')) {
        VisaModule.init();
    }
});