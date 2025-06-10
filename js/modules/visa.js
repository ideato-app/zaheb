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
        const langCode = localStorage.getItem('zaheb-language') || 'ar';
        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' ? 'ar-kw' : 'en-us';

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
                        document.querySelector('.loading-spinner').innerHTML = '<p>No visa data found.</p>';
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
            console.log(`Loaded visa document in language ${doc.lang} with data:`, doc.data);

            // Update page content with API data
            updatePageContent(doc.data);

        } catch (err) {
            console.error('Error fetching visa data:', err);
            document.querySelector('.loading-spinner').innerHTML = '<p>Error loading visa information.</p>';
        }
    }

    function updatePageContent(data) {
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
            renderCountries(data.visa_information);
        }

        // Render footer
        renderFooter(data);
    }

    function renderCountries(countries) {
        const countriesGrid = document.querySelector('.countries-grid');
        let html = '';

        countries.forEach((country) => {
            // Process visa types
            let visaTypesHtml = '';
            if (country.visa_types_content && country.visa_types_content.length > 0) {
                visaTypesHtml = '<ul class="visa-types-list">';
                country.visa_types_content.forEach(item => {
                    if (item.type === 'paragraph') {
                        visaTypesHtml += `<p>${item.text}</p>`;
                    } else if (item.type === 'list-item') {
                        visaTypesHtml += `<li>${item.text}</li>`;
                    }
                });
                visaTypesHtml += '</ul>';
            }

            // Process requirements
            let requirementsHtml = '';
            if (country.general_requirements_content && country.general_requirements_content.length > 0) {
                requirementsHtml = '<ul class="requirements-list">';
                country.general_requirements_content.forEach(item => {
                    if (item.type === 'list-item') {
                        requirementsHtml += `<li>${item.text}</li>`;
                    } else if (item.type === 'paragraph') {
                        requirementsHtml += `<p>${item.text}</p>`;
                    }
                });
                requirementsHtml += '</ul>';
            }

            // Create buttons HTML
            const inquireUrl = country.cta_inquire_link?.url || 'contact.html';
            const inquireLabel = country.cta_inquire_label || 'Inquire Now';

            const buttonsHtml = `
                <div class="visa-buttons">
                    <a href="${inquireUrl}" class="btn btn-primary">${inquireLabel}</a>
                    <button class="btn btn-secondary more-info-btn" data-country="${country.country_name}">${country.cta_more_label || 'More Info'}</button>
                </div>
            `;

            // Store detailed information for modal
            if (country.more && country.more.length > 0) {
                // We'll use a hidden div to store the data for the modal
                const moreInfoHtml = processMoreInfo(country.more);
                html += `<div id="more-info-${sanitizeId(country.country_name)}" class="hidden-modal-content" style="display:none;">${moreInfoHtml}</div>`;
            }

            // Combine all sections into country HTML
            const countryHtml = `
                <div class="country glass-card">
                    <div class="country-header">
                        <h2><i class="fas fa-globe"></i> ${country.country_name}</h2>
                    </div>
                    <div class="country-content">
                        <div class="visa-info">
                            <h3><i class="fas fa-passport"></i> ${country.visa_types_list || 'Visa Types'}</h3>
                            ${visaTypesHtml}
                        </div>
                        <div class="requirements">
                            <h3><i class="fas fa-list-check"></i> ${country.general_requirements_list || 'Requirements'}</h3>
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
        setupMoreInfoButtons();
    }

    function processMoreInfo(moreInfo) {
        let html = '';

        moreInfo.forEach(item => {
            switch (item.type) {
                case 'heading1':
                    html += `<h1>${item.text}</h1>`;
                    break;
                case 'heading2':
                    html += `<h2>${item.text}</h2>`;
                    break;
                case 'heading3':
                    html += `<h3>${item.text}</h3>`;
                    break;
                case 'paragraph':
                    html += `<p>${item.text}</p>`;
                    break;
                case 'list-item':
                    // Start a new list or add to an existing one
                    if (!html.includes('<ul>') || html.lastIndexOf('</ul>') > html.lastIndexOf('<ul>')) {
                        html += '<ul>';
                    }
                    html += `<li>${item.text}</li>`;

                    // Check if next item is not a list-item, then close the list
                    const nextItemIndex = moreInfo.indexOf(item) + 1;
                    if (nextItemIndex >= moreInfo.length || moreInfo[nextItemIndex].type !== 'list-item') {
                        html += '</ul>';
                    }
                    break;
                default:
                    html += `<p>${item.text}</p>`;
            }
        });

        return html;
    }

    function setupMoreInfoButtons() {
        const moreInfoButtons = document.querySelectorAll('.more-info-btn');

        moreInfoButtons.forEach(button => {
            button.addEventListener('click', function () {
                const countryName = this.getAttribute('data-country');
                showModal(countryName);
            });
        });
    }

    function showModal(countryName) {
        const modal = document.getElementById('visaDetailsModal');
        const modalContent = document.getElementById('modalContent');
        const moreInfoContent = document.getElementById(`more-info-${sanitizeId(countryName)}`);

        if (modal && moreInfoContent) {
            // Set modal title and content
            modalContent.innerHTML = `
                <h2>${countryName} Visa Details</h2>
                ${moreInfoContent.innerHTML}
            `;

            // Show the modal
            modal.style.display = 'block';

            // Add event listener to close the modal
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function () {
                modal.style.display = 'none';
            });

            // Close modal when clicking outside
            window.addEventListener('click', function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    // Helper function to sanitize country names for use as IDs
    function sanitizeId(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    function renderFooter(data) {
        // Update footer contacts
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

            // Update WhatsApp links
            const whatsappLinks = document.querySelectorAll('.whatsapp-link');
            if (whatsappLinks.length && contact.whatsapp_url?.url) {
                whatsappLinks.forEach(link => {
                    link.href = contact.whatsapp_url.url;
                    if (contact.whatsapp_url.target) link.target = contact.whatsapp_url.target;
                });
            }

            // Also update the floating WhatsApp button if it exists
            const whatsappBtn = document.querySelector('.whatsapp-btn');
            if (whatsappBtn && contact.whatsapp_url?.url) {
                whatsappBtn.href = contact.whatsapp_url.url;
                if (contact.whatsapp_url.target) whatsappBtn.target = contact.whatsapp_url.target;
            }
        }
    }

    // Initialize module
    function init() {
        fetchVisaData();

        // Initialize modal functionality
        initModal();
    }

    function initModal() {
        modal = document.getElementById('visaDetailsModal');

        // Set up close button functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    // Public API
    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('visa-page')) {
        VisaModule.init();
    }
});