/**
 * About Module
 * Handles about page functionality and content
 */

const AboutModule = (function () {
    'use strict';

    async function fetchAboutData() {
        const apiUrl = 'https://zaheb.cdn.prismic.io/api/v2';

        // Get current language code from localStorage or use default
        const langCode = localStorage.getItem('zaheb-language') || 'ar-kw';
        // Map our simple language codes to Prismic language codes
        const prismicLangCode = langCode === 'ar' || langCode === 'ar-kw' ? 'ar-kw' : 'en-us';
        const isArabic = langCode === 'ar' || langCode === 'ar-kw';

        try {
            console.log("Fetching about page data...");
            const apiRes = await fetch(apiUrl);
            const data = await apiRes.json();
            const ref = data.refs[0].ref;
            console.log("API ref:", ref);

            // Include language code in the API query - try both "about" and "about_page" document types
            const query = `[[any(document.type,["about","about_page"])]]`;
            const docsRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=${query}&lang=${prismicLangCode}`);
            const docsData = await docsRes.json();
            console.log("API response:", docsData);

            if (!docsData.results || docsData.results.length === 0) {
                console.error(`No about page data found for language: ${prismicLangCode}`);

                // If no results in requested language, try falling back to English
                if (prismicLangCode !== 'en-us') {
                    console.log('Falling back to English content');
                    const fallbackRes = await fetch(`${apiUrl}/documents/search?ref=${ref}&q=${query}&lang=en-us`);
                    const fallbackData = await fallbackRes.json();

                    if (!fallbackData.results || fallbackData.results.length === 0) {
                        displayFallbackContent(isArabic);
                        const loadingIndicator = document.querySelector('.loading-indicator');
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                        return;
                    }

                    const doc = fallbackData.results[0];
                    console.log("About data loaded from fallback:", doc.data);
                    updatePageContent(doc.data, isArabic);
                } else {
                    displayFallbackContent(isArabic);
                }
                return;
            }

            const doc = docsData.results[0];
            console.log("About data loaded:", doc.data);

            // Update page content with API data
            updatePageContent(doc.data, isArabic);

            // Hide loading indicator
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

        } catch (err) {
            console.error('Error fetching about data:', err);
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                const errorMessage = isArabic
                    ? 'حدث خطأ في تحميل المحتوى. يرجى المحاولة مرة أخرى لاحقاً.'
                    : 'Error loading content. Please try again later.';
                loadingIndicator.textContent = errorMessage;
                loadingIndicator.style.color = 'red';
            }
            displayFallbackContent(isArabic);
        }
    }

    function updatePageContent(data, isArabic) {
        updatePageTitle(data, isArabic);
        updateIntroSection(data, isArabic);
        updateMissionVisionValues(data, isArabic);
        updateWhyChooseUs(data, isArabic);
        updateCTA(data, isArabic);
        updateFooter(data, isArabic);
    }

    function updatePageTitle(data, isArabic) {
        const pageTitle = document.querySelector('.container h1');
        if (pageTitle && data.title) {
            pageTitle.textContent = data.title;
            pageTitle.dir = isArabic ? 'rtl' : 'ltr';
        }
    }

    function updateIntroSection(data, isArabic) {
        // Update intro image if available
        const introImage = document.querySelector('.about-image img');
        if (introImage && data.intro_image && data.intro_image.url) {
            introImage.src = data.intro_image.url;
            if (data.intro_image.alt) {
                introImage.alt = data.intro_image.alt;
            }
        }

        // Update intro content
        const aboutContent = document.querySelector('.about-content');
        if (!aboutContent) return;

        // Set RTL/LTR direction for the content container
        aboutContent.dir = isArabic ? 'rtl' : 'ltr';
        aboutContent.style.textAlign = isArabic ? 'right' : 'left';

        // Update intro title
        const introTitle = document.querySelector('.about-content .section-title');
        if (introTitle && data.tittle_parghragh && data.tittle_parghragh.length > 0) {
            const title = data.tittle_parghragh[0]?.text || '';
            if (title) {
                introTitle.textContent = title;
                introTitle.dir = isArabic ? 'rtl' : 'ltr';
            }
        }

        // Update intro paragraphs
        if (data.intro_paragraphs && data.intro_paragraphs.length > 0) {
            // Remove existing paragraphs except the title
            const existingParagraphs = aboutContent.querySelectorAll('p');
            existingParagraphs.forEach(p => p.remove());

            // Add new paragraphs from API
            data.intro_paragraphs.forEach(item => {
                if (item.paragraph && item.paragraph.length > 0) {
                    item.paragraph.forEach(p => {
                        if (p.text) {
                            const paragraph = document.createElement('p');
                            paragraph.textContent = p.text;
                            paragraph.dir = isArabic ? 'rtl' : 'ltr';
                            aboutContent.appendChild(paragraph);
                        }
                    });
                }
            });
        }
    }

    function updateMissionVisionValues(data, isArabic) {
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
            mvItem.dir = isArabic ? 'rtl' : 'ltr';
            mvItem.style.textAlign = isArabic ? 'right' : 'left';

            mvItem.innerHTML = `
                <div class="icon">
                    <i class="${iconClass}"></i>
                </div>
                <h3 dir="${isArabic ? 'rtl' : 'ltr'}">${title}</h3>
                <p dir="${isArabic ? 'rtl' : 'ltr'}">${description}</p>
            `;

            missionVisionContainer.appendChild(mvItem);
        });
    }

    function updateWhyChooseUs(data, isArabic) {
        // Update section title
        const sectionTitle = document.querySelector('.why-choose-us .section-title');
        if (sectionTitle && data.tittle_why_us && data.tittle_why_us.length > 0) {
            const title = data.tittle_why_us[0]?.text || '';
            if (title) {
                sectionTitle.textContent = title;
                sectionTitle.dir = isArabic ? 'rtl' : 'ltr';
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
            featureCard.dir = isArabic ? 'rtl' : 'ltr';
            featureCard.style.textAlign = isArabic ? 'right' : 'left';

            featureCard.innerHTML = `
                <div class="feature-icon">
                    <i class="${iconClass}"></i>
                </div>
                <h3 dir="${isArabic ? 'rtl' : 'ltr'}">${title}</h3>
                <p dir="${isArabic ? 'rtl' : 'ltr'}">${description}</p>
            `;

            featuresGrid.appendChild(featureCard);
        });
    }

    function updateCTA(data, isArabic) {
        if (!data.cta || data.cta.length === 0) {
            return;
        }

        const ctaItem = data.cta[0];
        const ctaContent = document.querySelector('.cta-content');
        if (ctaContent) {
            ctaContent.dir = isArabic ? 'rtl' : 'ltr';
            ctaContent.style.textAlign = isArabic ? 'right' : 'left';
        }

        // Update CTA title
        const ctaTitle = document.querySelector('.cta-title');
        if (ctaTitle && ctaItem.cta_title) {
            ctaTitle.textContent = ctaItem.cta_title;
            ctaTitle.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update CTA text
        const ctaText = document.querySelector('.cta-text');
        if (ctaText && ctaItem.cta_text && ctaItem.cta_text.length > 0) {
            const text = ctaItem.cta_text[0]?.text || '';
            if (text) {
                ctaText.textContent = text;
                ctaText.dir = isArabic ? 'rtl' : 'ltr';
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
            if (isArabic) {
                ctaButton.classList.add('rtl');
            } else {
                ctaButton.classList.remove('rtl');
            }
        }
    }

    function updateFooter(data, isArabic) {
        // Update footer text
        const footerText = document.querySelector('.footer-logo p');
        if (footerText && data.footer_text) {
            footerText.textContent = data.footer_text;
            footerText.dir = isArabic ? 'rtl' : 'ltr';
        }

        // Update footer links
        if (data.footer_links && data.footer_links.length > 0) {
            const footerLinks = document.querySelector('.footer-links ul');
            if (footerLinks) {
                footerLinks.dir = isArabic ? 'rtl' : 'ltr';
                footerLinks.innerHTML = '';

                data.footer_links.forEach(link => {
                    const label = link.link_label || '';
                    const url = link.link_url?.url || '#';

                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = url;
                    a.textContent = label;
                    a.dir = isArabic ? 'rtl' : 'ltr';
                    li.appendChild(a);
                    footerLinks.appendChild(li);
                });
            }
        }

        // Update footer contacts
        if (data.footer_contacts && data.footer_contacts.length > 0) {
            const contact = data.footer_contacts[0];

            // Update address
            const addressSpan = document.querySelector('.footer-contact .address-text');
            if (addressSpan && contact.address && contact.address.length > 0) {
                addressSpan.textContent = contact.address[0].text;
                addressSpan.dir = isArabic ? 'rtl' : 'ltr';
            }

            // Update phone
            const phoneLink = document.querySelector('.footer-contact .phone-link');
            if (phoneLink && contact.phone?.url) {
                phoneLink.href = contact.phone.url;
                phoneLink.textContent = contact.phone.url.replace('tel:', '');
                phoneLink.dir = isArabic ? 'rtl' : 'ltr';
                if (contact.phone.target) phoneLink.target = contact.phone.target;
            }

            // Update email
            const emailLink = document.querySelector('.footer-contact .email-link');
            if (emailLink && contact.email?.url) {
                emailLink.href = `mailto:${contact.email.url}`;
                emailLink.textContent = contact.email.url;
                emailLink.dir = isArabic ? 'rtl' : 'ltr';
                if (contact.email.target) emailLink.target = contact.email.target;
            }

            // Update social links
            updateSocialLinks(contact);
        }
    }

    function updateSocialLinks(contact) {
        // Update Instagram
        const instagramLink = document.querySelector('.social-links .instagram-link');
        if (instagramLink && contact.instgram_urk?.url) {
            instagramLink.href = contact.instgram_urk.url;
            if (contact.instgram_urk.target) instagramLink.target = contact.instgram_urk.target;
        }

        // Update WhatsApp
        const whatsappLink = document.querySelector('.social-links .whatsapp-link');
        if (whatsappLink && contact.whatsapp_url?.url) {
            whatsappLink.href = contact.whatsapp_url.url;
            if (contact.whatsapp_url.target) whatsappLink.target = contact.whatsapp_url.target;
        }

        // Update floating WhatsApp button
        const floatingWhatsappBtn = document.querySelector('.whatsapp-btn');
        if (floatingWhatsappBtn && contact.whatsapp_url?.url) {
            floatingWhatsappBtn.href = contact.whatsapp_url.url;
            if (contact.whatsapp_url.target) floatingWhatsappBtn.target = contact.whatsapp_url.target;
        }

        // Update Facebook
        const facebookLink = document.querySelector('.social-links .facebook-link');
        if (facebookLink && contact.facebook_url?.url) {
            facebookLink.href = contact.facebook_url.url;
            if (contact.facebook_url.target) facebookLink.target = contact.facebook_url.target;
        }
    }

    function getClassName(index) {
        const classes = ['mission', 'vision', 'values'];
        return classes[index % 3];
    }

    function getDefaultIcon(index) {
        const icons = ['bullseye', 'eye', 'heart'];
        return icons[index % 3];
    }

    function displayFallbackContent(isArabic) {
        // Add fallback content for intro section
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent) {
            aboutContent.dir = isArabic ? 'rtl' : 'ltr';
            aboutContent.style.textAlign = isArabic ? 'right' : 'left';
            aboutContent.innerHTML = isArabic ? `
                <h2 class="section-title" dir="rtl">من نحن</h2>
                <p dir="rtl">زاهب انترناشيونال هي شركة رائدة في مجال خدمات السفر والتأشيرات في الكويت. تأسست في عام 2025، ونحن متخصصون في تقديم خدمات شاملة لمعالجة التأشيرات، وحجوزات الفنادق، والترجمة المعتمدة، وخدمات تأمين السفر للأفراد والشركات في الكويت.</p>
                <p dir="rtl">مهمتنا هي تبسيط تجربة السفر لعملائنا من خلال تقديم التوجيه والدعم الخبير طوال رحلتهم. نحن نفخر باهتمامنا بالتفاصيل، وخدمتنا الشخصية، والتزامنا بالتميز في كل ما نقوم به.</p>
            ` : `
                <h2 class="section-title">Who We Are</h2>
                <p>Zaheb International is a premier travel and visa services company based in Kuwait. Founded in 2025, we specialize in providing comprehensive visa processing, hotel and transportation bookings, certified translations, and travel insurance services to individuals and businesses in Kuwait.</p>
                <p>Our mission is to simplify the travel experience for our clients by providing expert guidance and support throughout their journey. We take pride in our attention to detail, personalized service, and commitment to excellence in everything we do.</p>
            `;
        }

        // Add fallback content for mission & vision section
        const missionVisionContainer = document.querySelector('.mission-vision .row');
        if (missionVisionContainer) {
            missionVisionContainer.innerHTML = isArabic ? `
                <div class="mission glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <h3>مهمتنا</h3>
                    <p>تقديم خدمات سفر وتأشيرات استثنائية تتجاوز توقعات عملائنا، مما يجعل رحلتهم سلسة وخالية من المتاعب من البداية إلى النهاية.</p>
                </div>
                <div class="vision glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <h3>رؤيتنا</h3>
                    <p>أن نصبح مزود خدمات السفر الرائد في الكويت، المعروف بموثوقيتنا وخبرتنا والتزامنا برضا العملاء.</p>
                </div>
                <div class="values glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3>قيمنا</h3>
                    <p>النزاهة، التميز، التركيز على العملاء، الابتكار، والعمل الجماعي توجه كل ما نقوم به في زاهب انترناشيونال.</p>
                </div>
            ` : `
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
            featuresGrid.innerHTML = isArabic ? `
                <div class="feature-card glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="feature-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>الخبرة</h3>
                    <p>يتكون فريقنا من خبراء السفر والتأشيرات ذوي معرفة واسعة بمتطلبات وإجراءات الهجرة العالمية.</p>
                </div>
                <div class="feature-card glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="feature-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>دعم على مدار الساعة</h3>
                    <p>نقدم دعمًا على مدار الساعة طوال أيام الأسبوع لمساعدة عملائنا عندما يحتاجون إلينا، مما يضمن راحة البال طوال رحلتهم.</p>
                </div>
                <div class="feature-card glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="feature-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3>خدمة شخصية</h3>
                    <p>نقوم بتخصيص خدماتنا لتلبية الاحتياجات والتفضيلات المحددة لكل عميل، مما يضمن تجربة شخصية.</p>
                </div>
                <div class="feature-card glass-card fade-in" dir="rtl" style="text-align: right;">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>الموثوقية</h3>
                    <p>نحن ملتزمون بالوفاء بوعودنا وضمان أن عملائنا يمكنهم الاعتماد علينا في جميع احتياجات سفرهم.</p>
                </div>
            ` : `
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

    // Public API
    return {
        init: function () {
            fetchAboutData();
        }
    };
})();

// Export the module
window.AboutModule = AboutModule;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    AboutModule.init();
}); 