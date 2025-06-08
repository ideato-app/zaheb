async function fetchAboutData() {
    const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

    // Get current language code from URL or use default
    const urlParams = new URLSearchParams(window.location.search);
    const langCode = urlParams.get('lang') || 'en-us'; // Default to English if not specified

    try {
        console.log("Fetching about page data...");
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        const ref = data.refs[0].ref;
        console.log("API ref:", ref);

        // Include language code in the API query - try both "about" and "about_page" document types
        const query = `[[any(document.type,["about","about_page"])]]`;
        const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=${query}&lang=${langCode}`);
        const docsData = await docsRes.json();
        console.log("API response:", docsData);

        if (!docsData.results || docsData.results.length === 0) {
            console.error('No about page data found, using fallback content');
            displayFallbackContent();
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            return;
        }

        const doc = docsData.results[0];
        console.log("About data loaded:", doc.data);

        // Update page content with API data
        updatePageTitle(doc.data);
        updateIntroSection(doc.data);
        updateMissionVisionValues(doc.data);
        updateWhyChooseUs(doc.data);
        updateCTA(doc.data);
        updateFooter(doc.data);

        // Hide loading indicator
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

    } catch (err) {
        console.error('Error fetching about data:', err);
        displayFallbackContent();
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

function updatePageTitle(data) {
    const pageTitle = document.querySelector('.container h1');
    if (pageTitle && data.title) {
        pageTitle.textContent = data.title;
    }
}

function updateIntroSection(data) {
    // Update intro image if available
    const introImage = document.querySelector('.about-image img');
    if (introImage && data.intro_image && data.intro_image.url) {
        introImage.src = data.intro_image.url;
        if (data.intro_image.alt) {
            introImage.alt = data.intro_image.alt;
        }
    }

    // Update intro title
    const introTitle = document.querySelector('.about-content .section-title');
    if (introTitle && data.tittle_parghragh && data.tittle_parghragh.length > 0) {
        const title = data.tittle_parghragh[0]?.text || '';
        if (title) {
            introTitle.textContent = title;
        }
    }

    // Update intro paragraphs
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent && data.intro_paragraphs && data.intro_paragraphs.length > 0) {
        // Remove existing paragraphs except the title
        const existingParagraphs = aboutContent.querySelectorAll('p');
        existingParagraphs.forEach(p => {
            p.remove();
        });

        // Add new paragraphs from API
        data.intro_paragraphs.forEach(item => {
            if (item.paragraph && item.paragraph.length > 0) {
                item.paragraph.forEach(p => {
                    if (p.text) {
                        const paragraph = document.createElement('p');
                        paragraph.textContent = p.text;
                        aboutContent.appendChild(paragraph);
                    }
                });
            }
        });
    }
}

function updateMissionVisionValues(data) {
    if (!data.mission_vision_values || data.mission_vision_values.length === 0) {
        return;
    }

    const missionVisionContainer = document.querySelector('.mission-vision .row');
    if (!missionVisionContainer) return;

    // Clear existing content
    missionVisionContainer.innerHTML = '';

    // Add mission, vision, values from API
    data.mission_vision_values.forEach((item, index) => {
        const iconClass = item.icon && item.icon.includes('fa-') ?
            item.icon : `fas fa-${item.icon || getDefaultIcon(index)}`;

        const title = item.title || '';

        let description = '';
        if (item.description && item.description.length > 0) {
            item.description.forEach(p => {
                if (p.text) {
                    description += p.text + ' ';
                }
            });
        }

        const mvItem = document.createElement('div');
        mvItem.className = `${getClassName(index)} glass-card fade-in`;
        mvItem.innerHTML = `
            <div class="icon">
                <i class="${iconClass}"></i>
            </div>
            <h3>${title}</h3>
            <p>${description}</p>
        `;

        missionVisionContainer.appendChild(mvItem);
    });

    function getClassName(index) {
        const classes = ['mission', 'vision', 'values'];
        return classes[index % 3];
    }

    function getDefaultIcon(index) {
        const icons = ['bullseye', 'eye', 'heart'];
        return icons[index % 3];
    }
}

function updateWhyChooseUs(data) {
    // Update section title
    const sectionTitle = document.querySelector('.why-choose-us .section-title');
    if (sectionTitle && data.tittle_why_us && data.tittle_why_us.length > 0) {
        const title = data.tittle_why_us[0]?.text || '';
        if (title) {
            sectionTitle.textContent = title;
        }
    }

    // Update features
    if (!data.features || data.features.length === 0) {
        return;
    }

    const featuresGrid = document.querySelector('.features-grid');
    if (!featuresGrid) return;

    // Clear existing content
    featuresGrid.innerHTML = '';

    // Add features from API
    data.features.forEach(feature => {
        const iconClass = feature.icon && feature.icon.includes('fa-') ?
            feature.icon : `fas fa-${feature.icon || 'check-circle'}`;

        const title = feature.title || '';

        let description = '';
        if (feature.description && feature.description.length > 0) {
            feature.description.forEach(p => {
                if (p.text) {
                    description += p.text + ' ';
                }
            });
        }

        const featureCard = document.createElement('div');
        featureCard.className = 'feature-card glass-card fade-in';
        featureCard.innerHTML = `
            <div class="feature-icon">
                <i class="${iconClass}"></i>
            </div>
            <h3>${title}</h3>
            <p>${description}</p>
        `;

        featuresGrid.appendChild(featureCard);
    });
}

function updateCTA(data) {
    if (!data.cta || data.cta.length === 0) {
        return;
    }

    const ctaItem = data.cta[0];

    // Update CTA title
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle && ctaItem.cta_title) {
        ctaTitle.textContent = ctaItem.cta_title;
    }

    // Update CTA text
    const ctaText = document.querySelector('.cta-text');
    if (ctaText && ctaItem.cta_text && ctaItem.cta_text.length > 0) {
        const text = ctaItem.cta_text[0]?.text || '';
        if (text) {
            ctaText.textContent = text;
        }
    }

    // Update CTA button
    const ctaButton = document.querySelector('.cta-content .btn');
    if (ctaButton) {
        if (ctaItem.cta_button_label) {
            ctaButton.textContent = ctaItem.cta_button_label;
        }

        if (ctaItem.cta_button_link && ctaItem.cta_button_link.url) {
            ctaButton.href = ctaItem.cta_button_link.url;
        }
    }
}

function updateFooter(data) {
    // Update footer text
    const footerText = document.querySelector('.footer-logo p');
    if (footerText && data.footer_text) {
        footerText.textContent = data.footer_text;
    }

    // Update footer links
    if (data.footer_links && data.footer_links.length > 0) {
        const footerLinks = document.querySelector('.footer-links ul');
        if (footerLinks) {
            // Clear existing links
            footerLinks.innerHTML = '';

            // Add links from API
            data.footer_links.forEach(link => {
                const label = link.link_label || '';
                const url = link.link_url?.url || '#';

                const li = document.createElement('li');
                li.innerHTML = `<a href="${url}">${label}</a>`;
                footerLinks.appendChild(li);
            });
        }
    }

    // Update footer contact
    if (data.footer_contact && data.footer_contact.length > 0) {
        const contact = data.footer_contact[0];

        // Update address
        const addressSpan = document.querySelector('.footer-contact p:first-of-type span');
        if (addressSpan && contact.address) {
            addressSpan.textContent = contact.address;
        }

        // Update phone
        const phoneLink = document.querySelector('.footer-contact a[href^="tel:"]');
        if (phoneLink && contact.phone) {
            phoneLink.textContent = contact.phone;
            phoneLink.href = `tel:${contact.phone.replace(/\s/g, '')}`;
        }
    }

    // Update social links
    if (data.social_links && data.social_links.length > 0) {
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            // Clear existing links
            socialLinks.innerHTML = '';

            // Add social links from API
            data.social_links.forEach(social => {
                const icon = social.social_icon || 'instagram';
                const url = social.social_url?.url || '#';

                const iconClass = icon.includes('fa-') ? icon :
                    icon === 'instagram' ? 'fab fa-instagram' :
                        icon === 'facebook' || icon === 'fb' ? 'fab fa-facebook' :
                            icon === 'twitter' ? 'fab fa-twitter' :
                                icon === 'whatsapp' ? 'fab fa-whatsapp' : 'fab fa-globe';

                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.innerHTML = `<i class="${iconClass}"></i>`;
                socialLinks.appendChild(a);
            });
        }
    }
}

// Update navigation links to preserve language parameter
function updateNavigationLinks() {
    // Get current language code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const langCode = urlParams.get('lang');

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

            // Add language parameter
            absoluteUrl.searchParams.set('lang', langCode);

            // Get the path and query string
            const newHref = absoluteUrl.pathname + absoluteUrl.search;

            // Update the link
            link.setAttribute('href', newHref);
        } catch (e) {
            console.error('Error updating link:', e);
        }
    });
}

// Display fallback content when API fails
function displayFallbackContent() {
    // Add fallback content for intro section
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        aboutContent.innerHTML = `
            <h2 class="section-title">Who We Are</h2>
            <p>Zaheb International is a premier travel and visa services company based in Kuwait. Founded in 2025, we specialize in providing comprehensive visa processing, hotel and transportation bookings, certified translations, and travel insurance services to individuals and businesses in Kuwait.</p>
            <p>Our mission is to simplify the travel experience for our clients by providing expert guidance and support throughout their journey. We take pride in our attention to detail, personalized service, and commitment to excellence in everything we do.</p>
        `;
    }

    // Add fallback content for mission & vision section
    const missionVisionContainer = document.querySelector('.mission-vision .row');
    if (missionVisionContainer) {
        missionVisionContainer.innerHTML = `
            <div class="mission glass-card fade-in">
                <div class="icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <h3>Our Mission</h3>
                <p>To provide exceptional travel and visa services that exceed our clients' expectations, making their journey smooth and hassle-free from start to finish.</p>
            </div>
            <div class="vision glass-card fade-in">
                <div class="icon">
                    <i class="fas fa-eye"></i>
                </div>
                <h3>Our Vision</h3>
                <p>To become the leading travel services provider in Kuwait, known for our reliability, expertise, and commitment to customer satisfaction.</p>
            </div>
            <div class="values glass-card fade-in">
                <div class="icon">
                    <i class="fas fa-heart"></i>
                </div>
                <h3>Our Values</h3>
                <p>Integrity, Excellence, Customer Focus, Innovation, and Teamwork guide everything we do at Zaheb International.</p>
            </div>
        `;
    }

    // Add fallback content for features
    const featuresGrid = document.querySelector('.features-grid');
    if (featuresGrid) {
        featuresGrid.innerHTML = `
            <div class="feature-card glass-card fade-in">
                <div class="feature-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Expertise</h3>
                <p>Our team consists of travel and visa experts with extensive knowledge of global immigration requirements and procedures.</p>
            </div>
            <div class="feature-card glass-card fade-in">
                <div class="feature-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>24/7 Support</h3>
                <p>We provide round-the-clock support to assist our clients whenever they need us, ensuring peace of mind throughout their journey.</p>
            </div>
            <div class="feature-card glass-card fade-in">
                <div class="feature-icon">
                    <i class="fas fa-star"></i>
                </div>
                <h3>Personalized Service</h3>
                <p>We tailor our services to meet the specific needs and preferences of each client, ensuring a personalized experience.</p>
            </div>
            <div class="feature-card glass-card fade-in">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Reliability</h3>
                <p>We are committed to delivering on our promises and ensuring that our clients can rely on us for all their travel needs.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchAboutData();
    updateNavigationLinks();
}); 