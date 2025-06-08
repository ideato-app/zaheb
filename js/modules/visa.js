async function fetchVisaData() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

    // Get current language code from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    const langCode = urlParams.get('lang') || 'en-us'; // Default to English if not specified

    try {
        console.log("Fetching visa page data...");

        // Get the API ref first
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        const ref = data.refs[0].ref;
        console.log("API ref:", ref);

        // Include language code in the API query
        const query = `[[at(document.type,"visa")]]`;
        const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=${query}&lang=${langCode}`);
        const docsData = await docsRes.json();

        console.log("API response:", docsData);

        if (!docsData.results || docsData.results.length === 0) {
            console.error('No visa page data found, using fallback content');
            displayFallbackContent();
            return;
        }

        const doc = docsData.results[0];
        console.log("Visa data loaded:", doc.data);

        // Update page content with API data
        updatePageTitle(doc.data);
        updateIntroSection(doc.data);
        updateVisaInformation(doc.data);
        updateCTA(doc.data);

        // Hide loading indicators if any
        const loadingIndicators = document.querySelectorAll('.loading-spinner');
        loadingIndicators.forEach(indicator => {
            indicator.style.display = 'none';
        });

    } catch (err) {
        console.error('Error fetching visa data:', err);
        displayFallbackContent();
    }
}

function updatePageTitle(data) {
    const pageTitle = document.querySelector('.container h1');
    if (pageTitle && data.tittle_page && data.tittle_page.length > 0) {
        const title = data.tittle_page[0]?.text || '';
        if (title) {
            // Remove existing data attributes but keep the element
            pageTitle.removeAttribute('data-en');
            pageTitle.removeAttribute('data-ar');
            pageTitle.textContent = title;
        }
    }
}

function updateIntroSection(data) {
    // Update intro title
    const introTitle = document.querySelector('.visa-intro .section-title');
    if (introTitle && data.tittle_paragraph && data.tittle_paragraph.length > 0) {
        const title = data.tittle_paragraph[0]?.text || '';
        if (title) {
            // Remove existing data attributes but keep the element
            introTitle.removeAttribute('data-en');
            introTitle.removeAttribute('data-ar');
            introTitle.textContent = title;
        }
    }

    // Update intro paragraph
    const introParagraph = document.querySelector('.visa-intro .lead');
    if (introParagraph && data.paragraph_text && data.paragraph_text.length > 0) {
        const text = data.paragraph_text[0]?.text || '';
        if (text) {
            // Remove existing data attributes but keep the element
            introParagraph.removeAttribute('data-en');
            introParagraph.removeAttribute('data-ar');
            introParagraph.textContent = text;
        }
    }
}

function updateVisaInformation(data) {
    if (!data.visa_information || data.visa_information.length === 0) {
        return;
    }

    // Get the countries grid
    const countriesGrid = document.querySelector('.countries-grid');
    if (!countriesGrid) return;

    // Clear existing content
    countriesGrid.innerHTML = '';

    // Use the actual visa information from the API
    const visaCountries = data.visa_information;

    // Process each country's visa information
    visaCountries.forEach((country, index) => {
        // Create country section
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country glass-card fade-in';

        // Determine which icon to use based on country name
        let iconClass = 'fas fa-globe';
        if (country.country_name.toLowerCase().includes('canada')) {
            iconClass = 'fas fa-leaf';
        } else if (country.country_name.toLowerCase().includes('united states') || country.country_name.toLowerCase().includes('us')) {
            iconClass = 'fas fa-flag-usa';
        } else if (country.country_name.toLowerCase().includes('china')) {
            iconClass = 'fas fa-dragon';
        } else if (country.country_name.toLowerCase().includes('arabic') || country.country_name.toLowerCase().includes('arab')) {
            iconClass = 'fas fa-mosque';
        }

        // Create country HTML structure
        countryDiv.innerHTML = `
            <div class="country-header">
                <h2><i class="${iconClass}"></i> <span>${country.country_name}</span></h2>
            </div>
            <div class="country-content">
                <div class="visa-info">
                    <h3><i class="fas fa-id-card"></i> <span>${country.visa_types_list}</span></h3>
                    ${generateVisaTypesContent(country.visa_types_content)}
                </div>
                <div class="requirements">
                    <h3><i class="fas fa-clipboard-list"></i> <span>${country.general_requirements_list}</span></h3>
                    ${generateRequirementsList(country.general_requirements_content)}
                </div>
                <a href="${country.cta_inquire_link?.url || 'contact.html'}" class="btn btn-primary"><i class="fas fa-envelope"></i> <span>${country.cta_inquire_label}</span></a>
                <a href="#" class="btn btn-secondary" data-country-index="${index}"><i class="fas fa-info-circle"></i> <span>${country.cta_more_label || 'More Details'}</span></a>
            </div>
        `;

        // Add the country section to the grid
        countriesGrid.appendChild(countryDiv);

        // Prepare modal content for this country
        prepareModalContent(country, index);
    });

    // Add event listeners to the "More Details" buttons
    setupModalListeners();
}

function generateVisaTypesContent(visaTypes) {
    if (!visaTypes || visaTypes.length === 0) {
        return '<p>Please contact us for information on visa types.</p>';
    }

    let html = '';

    // Process each content item
    visaTypes.forEach(item => {
        if (item.type === 'paragraph') {
            // If it's a simple paragraph, display it
            html += `<p>${item.text}</p>`;
        } else if (item.type === 'list-item') {
            // If it's the first list item, start a new list
            if (!html.includes('<ul>')) {
                html += '<ul>';
            }

            // For list items, check if there are spans to make parts bold
            if (item.spans && item.spans.length > 0) {
                let text = item.text;

                // Sort spans by start position in descending order to avoid position shifts
                const sortedSpans = [...item.spans].sort((a, b) => b.start - a.start);

                // Apply each span
                sortedSpans.forEach(span => {
                    if (span.type === 'strong') {
                        const before = text.substring(0, span.start);
                        const highlighted = text.substring(span.start, span.end);
                        const after = text.substring(span.end);
                        text = before + '<strong>' + highlighted + '</strong>' + after;
                    }
                });

                html += `<li>${text}</li>`;
            } else {
                html += `<li>${item.text}</li>`;
            }
        }
    });

    // Close the list if it was opened
    if (html.includes('<ul>') && !html.endsWith('</ul>')) {
        html += '</ul>';
    }

    return html;
}

function generateRequirementsList(requirements) {
    if (!requirements || requirements.length === 0) {
        return '<ul><li>Please contact us for detailed requirements.</li></ul>';
    }

    // If there's only one item and it's a paragraph, display it as text
    if (requirements.length === 1 && requirements[0].type === 'paragraph') {
        return `<p>${requirements[0].text}</p>`;
    }

    let html = '';
    let hasList = false;

    requirements.forEach(item => {
        if (item.type === 'paragraph') {
            html += `<p>${item.text}</p>`;
        } else if (item.type === 'list-item') {
            // If this is our first list item, start a list
            if (!hasList) {
                html += '<ul>';
                hasList = true;
            }
            html += `<li>${item.text}</li>`;
        }
    });

    // Close the list if it was opened
    if (hasList) {
        html += '</ul>';
    }

    // If we didn't generate any content, provide a fallback
    if (!html) {
        return '<ul><li>Please contact us for detailed requirements.</li></ul>';
    }

    return html;
}

function prepareModalContent(country, index) {
    // Create a hidden div to store the modal content for this country
    const contentDiv = document.createElement('div');
    contentDiv.id = `modal-content-${index}`;
    contentDiv.className = 'hidden-modal-content';
    contentDiv.style.display = 'none';

    // Generate HTML for modal content from "more" field
    let html = '';

    if (country.more && country.more.length > 0) {
        // Process each item in the "more" content
        let currentList = null;

        country.more.forEach(item => {
            if (item.type.startsWith('heading')) {
                // If we were building a list, close it before adding a new heading
                if (currentList) {
                    html += '</ul>';
                    currentList = null;
                }

                // Extract heading level (h2, h3, etc.)
                const level = item.type.replace('heading', '');

                // Check if there are spans to make parts bold
                if (item.spans && item.spans.length > 0) {
                    let text = item.text;

                    // Apply each span
                    item.spans.forEach(span => {
                        if (span.type === 'strong') {
                            const before = text.substring(0, span.start);
                            const highlighted = text.substring(span.start, span.end);
                            const after = text.substring(span.end);
                            text = before + '<strong>' + highlighted + '</strong>' + after;
                        }
                    });

                    html += `<h${level}>${text}</h${level}>`;
                } else {
                    html += `<h${level}>${item.text}</h${level}>`;
                }
            } else if (item.type === 'paragraph') {
                // If we were building a list, close it before adding a paragraph
                if (currentList) {
                    html += '</ul>';
                    currentList = null;
                }

                html += `<p>${item.text}</p>`;
            } else if (item.type === 'list-item') {
                // If this is the first list item, start a new list
                if (!currentList) {
                    html += '<ul>';
                    currentList = 'ul';
                }

                html += `<li>${item.text}</li>`;
            }
        });

        // Close any open list
        if (currentList) {
            html += `</${currentList}>`;
        }
    } else {
        // Fallback content if no "more" data is available
        html = `
            <h2>Visa Requirements: ${country.country_name}</h2>
            ${generateRequirementsList(country.general_requirements_content)}
            <div class="additional-requirements">
                <h3>Additional Requirements:</h3>
                <ul>
                    <li>Please contact us for detailed additional requirements.</li>
                </ul>
            </div>
        `;
    }

    contentDiv.innerHTML = html;

    // Append to the document (will be hidden)
    document.body.appendChild(contentDiv);
}

function setupModalListeners() {
    // Get modal elements
    const modal = document.getElementById('visaDetailsModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !modalContent || !closeBtn) return;

    // Get all "More Details" buttons
    const detailButtons = document.querySelectorAll('.btn.btn-secondary');

    // Add click event to all detail buttons
    detailButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Get the country index from data attribute
            const countryIndex = this.getAttribute('data-country-index');

            // Get the stored modal content for this country
            const storedContent = document.getElementById(`modal-content-${countryIndex}`);

            if (storedContent) {
                // Set modal content
                modalContent.innerHTML = storedContent.innerHTML;

                // Show the modal
                modal.style.display = 'block';
            }
        });
    });

    // Close modal when clicking the X
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function updateCTA(data) {
    // Update CTA title
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle && data.cta_tittle && data.cta_tittle.length > 0) {
        const title = data.cta_tittle[0]?.text || '';
        if (title) {
            // Remove existing data attributes but keep the element
            ctaTitle.removeAttribute('data-en');
            ctaTitle.removeAttribute('data-ar');
            ctaTitle.textContent = title;
        }
    }

    // Update CTA description
    const ctaText = document.querySelector('.cta-text');
    if (ctaText && data.cta_description && data.cta_description.length > 0) {
        const text = data.cta_description[0]?.text || '';
        if (text) {
            // Remove existing data attributes but keep the element
            ctaText.removeAttribute('data-en');
            ctaText.removeAttribute('data-ar');
            ctaText.textContent = text;
        }
    }

    // Update CTA button
    const ctaButton = document.querySelector('.cta .btn-primary');
    if (ctaButton) {
        if (data.lable_button && data.lable_button.length > 0) {
            const label = data.lable_button[0]?.text || '';
            if (label) {
                // Remove existing data attributes but keep the element
                ctaButton.removeAttribute('data-en');
                ctaButton.removeAttribute('data-ar');
                ctaButton.textContent = label;
            }
        }

        if (data.url_button && data.url_button.length > 0) {
            const url = data.url_button[0]?.text || '';
            if (url) {
                ctaButton.href = url;
            }
        }
    }
}

// Display fallback content when API fails
function displayFallbackContent() {
    console.log('Using existing HTML content as fallback');

    // Hide any loading indicators
    const loadingIndicators = document.querySelectorAll('.loading-spinner');
    loadingIndicators.forEach(indicator => {
        indicator.style.display = 'none';
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetchVisaData();
});