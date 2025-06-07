/**
 * Modal Module - Handles the visa details popup functionality
 */
const ModalModule = (function () {
    'use strict';

    // Private variables
    const modalId = 'visaDetailsModal';
    const modalContentId = 'modalContent';
    const closeBtnClass = 'close-modal';
    const detailBtnClass = 'btn-secondary';
    let lastFocusedElement = null;

    // Country-specific additional requirements
    const additionalRequirements = {
        us: {
            en: [
                'Proof of strong ties to your home country',
                'Proof of financial ability to cover trip expenses',
                'Detailed travel itinerary',
                'Previous travel history (if applicable)'
            ],
            ar: [
                'إثبات الروابط القوية مع بلدك الأصلي',
                'إثبات القدرة المالية لتغطية نفقات الرحلة',
                'خطة سفر مفصلة',
                'تاريخ سفر سابق (إن وجد)'
            ]
        },
        canada: {
            en: [
                'Bank statements for the last 6 months',
                'Detailed travel itinerary',
                'Travel insurance',
                'Proof of employment or study'
            ],
            ar: [
                'بيان حساب مصرفي لآخر 6 أشهر',
                'خطة سفر مفصلة',
                'تأمين سفر',
                'إثبات العمل أو الدراسة'
            ]
        },
        china: {
            en: [
                'Confirmed hotel reservation',
                'Detailed travel itinerary',
                'Invitation from Chinese company (for business visa)',
                'Acceptance from educational institution (for student visa)'
            ],
            ar: [
                'حجز فندقي مؤكد',
                'خطة سفر مفصلة',
                'دعوة من شركة صينية (لتأشيرة الأعمال)',
                'قبول من مؤسسة تعليمية (لتأشيرة الطالب)'
            ]
        },
        arabic: {
            en: [
                'Sponsorship letter (for some countries)',
                'Confirmed hotel reservation',
                'Travel insurance',
                'Proof of employment'
            ],
            ar: [
                'خطاب كفالة (لبعض البلدان)',
                'حجز فندقي مؤكد',
                'تأمين سفر',
                'إثبات العمل'
            ]
        }
    };

    /**
     * Create loading spinner element
     * @returns {HTMLElement} - The loading spinner element
     */
    function createLoadingSpinner() {
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-spinner';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';

        loadingContainer.appendChild(spinner);
        return loadingContainer;
    }

    /**
     * Get the country code based on country name
     * @param {string} countryName - The name of the country
     * @returns {string} - The country code
     */
    function getCountryCode(countryName) {
        if (countryName === 'United States (US)' || countryName === 'الولايات المتحدة الأمريكية') {
            return 'us';
        } else if (countryName === 'Canada' || countryName === 'كندا') {
            return 'canada';
        } else if (countryName === 'China' || countryName === 'الشنجن') {
            return 'china';
        } else {
            return 'arabic';
        }
    }

    /**
     * Create additional requirements HTML
     * @param {string} countryCode - The country code
     * @param {string} lang - The current language
     * @returns {HTMLElement} - The additional requirements element
     */
    function createAdditionalRequirements(countryCode, lang) {
        const additionalInfo = document.createElement('div');
        additionalInfo.classList.add('additional-requirements');

        const title = document.createElement('h3');
        title.textContent = lang === 'ar' ? 'متطلبات إضافية:' : 'Additional Requirements:';
        additionalInfo.appendChild(title);

        const list = document.createElement('ul');
        additionalRequirements[countryCode][lang === 'ar' ? 'ar' : 'en'].forEach(req => {
            const item = document.createElement('li');
            item.textContent = req;
            list.appendChild(item);
        });

        additionalInfo.appendChild(list);
        return additionalInfo;
    }

    /**
 * Show modal with country-specific visa details
 * @param {HTMLElement} countrySection - The country section element
 */
    function showCountryDetails(countrySection) {
        const modal = document.getElementById(modalId);
        const modalContent = document.getElementById(modalContentId);

        // Store last focused element to return focus when modal closes
        lastFocusedElement = document.activeElement;

        // Show the modal with loading spinner first
        modalContent.innerHTML = '';
        modalContent.appendChild(createLoadingSpinner());

        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modal.focus();

        // Simulate loading delay (can be removed in production)
        setTimeout(() => {
            // Get country information
            const countryName = countrySection.querySelector('.country-header h2 span').textContent;
            const requirementsList = countrySection.querySelector('.requirements ul').cloneNode(true);
            const countryCode = getCountryCode(countryName);

            // Get current language
            const currentLang = document.documentElement.getAttribute('lang') || 'en';
            const title = currentLang === 'ar' ?
                `متطلبات التأشيرة: ${countryName}` :
                `Visa Requirements: ${countryName}`;

            // Set modal content
            modalContent.innerHTML = '';

            // Add title
            const modalTitle = document.createElement('h2');
            modalTitle.id = 'modalTitle'; // Add ID for ARIA labelling
            modalTitle.textContent = title;
            modalContent.appendChild(modalTitle);

            // Add basic requirements
            modalContent.appendChild(requirementsList);

            // Add additional requirements
            modalContent.appendChild(createAdditionalRequirements(countryCode, currentLang));
        }, 300); // Short delay to show loading animation
    }

    /**
     * Close the modal
     */
    function closeModal() {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');

        // Return focus to the element that was focused before the modal was opened
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    /**
     * Handle keyboard events for the modal
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handleKeyDown(e) {
        const modal = document.getElementById(modalId);

        // If modal is not open, do nothing
        if (modal.style.display !== 'block') {
            return;
        }

        // Close modal on Escape key
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    /**
     * Initialize the modal functionality
     */
    function init() {
        // Get modal elements
        const modal = document.getElementById(modalId);
        const closeBtn = document.querySelector(`.${closeBtnClass}`);

        // Get all "More Details" buttons
        const detailButtons = document.querySelectorAll(`.btn.${detailBtnClass}`);

        // Add click event to all detail buttons
        detailButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const countrySection = this.closest('.country');
                showCountryDetails(countrySection);
            });
        });

        // Close modal when clicking the X
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close modal when clicking outside the modal
        window.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Add keyboard event listener
        document.addEventListener('keydown', handleKeyDown);

        // Listen for language changes to update modal content if open
        document.addEventListener('languageChanged', function (e) {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'block') {
                // Find which country's modal is currently open
                const modalTitle = document.getElementById(modalContentId).querySelector('h2');
                if (modalTitle) {
                    const titleParts = modalTitle.textContent.split(':');
                    if (titleParts.length > 1) {
                        const countryName = titleParts[1].trim();
                        // Find the country section in the main document
                        const countrySection = Array.from(document.querySelectorAll('.country')).find(section => {
                            const sectionName = section.querySelector('.country-header h2 span').textContent;
                            return sectionName === countryName || getCountryCode(sectionName) === getCountryCode(countryName);
                        });

                        if (countrySection) {
                            showCountryDetails(countrySection);
                        }
                    }
                }
            }
        });
    }

    // Public API
    return {
        init: init,
        closeModal: closeModal
    };
})();

// Export the module
window.ModalModule = ModalModule; 