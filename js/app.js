/**
 * app.js
 *
 * This file contains all the client-side JavaScript for the Jackson Investment Solutions website.
 * It handles navigation, form submissions, interactive UI elements like modals and floating action buttons,
 * and animations.
 *
 * Refactored for security, maintainability, and performance.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- UTILITY & HELPER FUNCTIONS ---

    /**
     * Encodes form data for submission via the 'application/x-www-form-urlencoded' content type.
     * @param {object} data - The form data as a key-value object.
     * @returns {string} The URL-encoded string.
     */
    const encode = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");
    };

    /**
     * A set of known disposable email domains to prevent spam or low-quality leads.
     * This list is not exhaustive and can be expanded.
     */
    const disposableEmailDomains = new Set([
        'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org', 
        'getnada.com', 'throwawaymail.com'
    ]);

    // --- MODAL HANDLING ---

    const mainModal = document.getElementById('messageModal');
    const modalTitleText = document.getElementById('modalTitleText');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const guideModal = document.getElementById('guideModal');
    const guideModalCloseBtn = document.getElementById('guideModalCloseBtn');

    /**
     * Displays a generic message modal.
     * @param {'success' | 'error'} type - The type of message, determines the icon.
     * @param {string} title - The title of the modal.
     * @param {string} message - The body text of the modal.
     */
    function showMainModal(type, title, message) {
        // Use textContent to prevent XSS attacks from user-inputted data (e.g., name in message)
        modalTitleText.textContent = title;
        modalMessage.textContent = message;
        modalIcon.className = 'modal-icon'; // Reset classes

        if (type === 'success') {
            modalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
            modalIcon.classList.add('success');
        } else if (type === 'error') {
            modalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
            modalIcon.classList.add('error');
        }
        mainModal.classList.add('visible');
    }

    /**
     * Hides the main message modal.
     */
    function hideMainModal() {
        mainModal.classList.remove('visible');
    }

    /**
     * Displays the guide download modal and initiates the download.
     * @param {string} pdfPath - The path to the PDF file for download.
     * @param {string} pdfName - The filename for the downloaded PDF.
     * @param {string} guideTitle - The title of the guide for the modal text.
     */
    function showGuideModal(pdfPath, pdfName, guideTitle) {
        const guideModalMessage = document.getElementById('guideModalMessage');
        const guideModalFallbackLink = document.getElementById('guideModalFallbackLink');

        if (guideModalMessage && guideModalFallbackLink) {
            guideModalMessage.firstChild.textContent = `Your download of "${guideTitle}" should begin shortly. If it doesn't, `;
            guideModalFallbackLink.href = pdfPath;
        }

        // Trigger the download automatically
        const link = document.createElement('a');
        link.href = pdfPath;
        link.download = pdfName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        guideModal.classList.add('visible');
    }

    /**
     * Hides the guide download modal.
     */
    function hideGuideModal() {
        guideModal.classList.remove('visible');
    }

    // Modal close event listeners
    modalCloseBtn.addEventListener('click', hideMainModal);
    guideModalCloseBtn.addEventListener('click', hideGuideModal);
    mainModal.addEventListener('click', (e) => e.target === mainModal && hideMainModal());
    guideModal.addEventListener('click', (e) => e.target === guideModal && hideGuideModal());


    // --- FORM VALIDATION & HANDLING ---

    /**
     * Validates a single form field and updates its UI state.
     * @param {HTMLElement} field - The input, select, or textarea element to validate.
     * @returns {boolean} - True if the field is valid, false otherwise.
     */
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true; // Not a field we are validating

        let fieldIsValid = true;
        let errorMessage = 'This field is required.';
        const errorElement = formGroup.querySelector('.error-message');

        // Reset error state first
        formGroup.classList.remove('has-error');
        if (errorElement) errorElement.textContent = '';

        if (field.hasAttribute('required') && !field.value.trim()) {
            fieldIsValid = false;
        } else if (field.type === 'email' && field.value.trim()) {
            const emailValue = field.value.trim();
            const domain = emailValue.substring(emailValue.lastIndexOf('@') + 1).toLowerCase();

            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailValue)) {
                fieldIsValid = false;
                errorMessage = 'Please enter a valid email address.';
            } else if (disposableEmailDomains.has(domain)) {
                fieldIsValid = false;
                errorMessage = 'Please use a permanent email address.';
            }
        } else if (field.type === 'tel' && field.value.trim() && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(field.value)) {
            fieldIsValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number.';
        } else if (field.id === 'fullName' && field.value.trim() && field.value.trim().split(' ').length < 2) {
            fieldIsValid = false;
            errorMessage = 'Please enter your first and last name.';
        }

        // Special case for property address, which is conditionally required
        if (field.id === 'propertyAddress') {
            const interestTypeField = field.form.querySelector('#interestType');
            const selectedInterest = interestTypeField.value;
            const isSellingInterest = ['sell-cash', 'sell-list', 'both'].includes(selectedInterest);
            if (isSellingInterest && !field.value.trim()) {
                fieldIsValid = false;
                errorMessage = 'Property address is required for selling inquiries.';
            }
        }

        if (!fieldIsValid) {
            formGroup.classList.add('has-error');
            if (errorElement) errorElement.textContent = errorMessage;
        }

        return fieldIsValid;
    }

    /**
     * Validates an entire form by checking each of its fields.
     * @param {HTMLFormElement} form - The form element to validate.
     * @returns {boolean} - True if the form is valid, false otherwise.
     */
    function validateForm(form) {
        let isFormValid = true;
        // We validate all fields that could have validation rules.
        form.querySelectorAll('input, select, textarea').forEach(field => {
            // Use a flag to ensure all fields are validated, not short-circuiting with `&&`
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    /**
     * Resets all validation error states within a form.
     * @param {HTMLFormElement} form - The form element to reset.
     */
    function resetValidation(form) {
        form.querySelectorAll('.form-group.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    /**
     * Handles the submission process for any form on the site.
     * @param {Event} e - The form submission event.
     * @param {HTMLFormElement} form - The form being submitted.
     * @param {object} options - Configuration options for the submission.
     * @param {function} options.onSuccess - Callback function to run on successful submission.
     * @param {object} [options.trackingEvent] - Optional GA4 tracking data.
     * @param {string} options.loadingText - Text to display on the submit button while processing.
     */
    async function handleFormSubmit(e, form, options) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Prevents other 'submit' listeners on this form from running
        if (!validateForm(form)) {
            showMainModal('error', 'Oops!', 'Please correct the errors marked in the form before submitting.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        submitButton.disabled = true;
        submitButton.textContent = options.loadingText || 'Submitting...';

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: encode({ "form-name": form.getAttribute('name'), ...data })
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            // Fire tracking event if it exists and gtag is available
            if (options.trackingEvent && typeof gtag === 'function') {
                gtag('event', options.trackingEvent.name, {
                    'event_category': options.trackingEvent.category,
                    'event_label': options.trackingEvent.label,
                    'value': 1
                });
            }

            options.onSuccess(data); // Execute the success callback
            form.reset();
            resetValidation(form);
            
            // Also reset character count if it exists
            const charCount = form.querySelector('#charCount');
            if (charCount) charCount.textContent = '0';


        } catch (error) {
            console.error('Form submission error:', error, 'Form:', form.id);
            showMainModal('error', 'Submission Error!', 'Something went wrong. Please check your connection or contact us directly.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    // Attach submit handlers to all forms
    const mainLeadForm = document.getElementById('leadForm');
    const sellerGuideForm = document.getElementById('sellerGuideForm');
    const buyerGuideForm = document.getElementById('buyerGuideForm');

    if (mainLeadForm) {
        mainLeadForm.addEventListener('submit', (e) => handleFormSubmit(e, mainLeadForm, {
            loadingText: 'Submitting...',
            onSuccess: (data) => {
                const firstName = data.fullName.split(' ')[0];
                showMainModal('success', 'Thank You!', `We've received your information, ${firstName}. Jimmie will get to work and contact you with your options within 24 hours.`);
            },
            trackingEvent: {
                name: 'lead_form_submit',
                category: 'form',
                label: 'Property Inquiry Form'
            }
        }));
    }

    if (sellerGuideForm) {
        sellerGuideForm.addEventListener('submit', (e) => handleFormSubmit(e, sellerGuideForm, {
            loadingText: 'Downloading...',
            onSuccess: () => showGuideModal('/grand-rapids-seller-guide.pdf', 'Grand_Rapids_Home_Sellers_Guide.pdf', "The Grand Rapids Home Seller's Guide"),
            trackingEvent: {
                name: 'guide_download_submit',
                category: 'lead_magnet',
                label: 'Seller Guide Download'
            }
        }));
    }

    if (buyerGuideForm) {
        buyerGuideForm.addEventListener('submit', (e) => handleFormSubmit(e, buyerGuideForm, {
            loadingText: 'Downloading...',
            onSuccess: () => showGuideModal('/grand-rapids-buyer-guide.pdf', 'Grand_Rapids_Home_Buyers_Guide.pdf', "The Grand Rapids Home Buyer's Guide"),
            trackingEvent: {
                name: 'guide_download_submit',
                category: 'lead_magnet',
                label: 'Buyer Guide Download'
            }
        }));
    }

    // Real-time validation on input blur for all form fields
    document.querySelectorAll('#leadForm input, #leadForm select, #sellerGuideForm input, #buyerGuideForm input').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    // Character counter for textarea
    const additionalInfo = document.getElementById('additionalInfo');
    const charCount = document.getElementById('charCount');
    if(additionalInfo && charCount) {
        additionalInfo.addEventListener('input', () => {
            charCount.textContent = additionalInfo.value.length;
        });
    }

    // --- UI & NAVIGATION ---

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const mobileNav = document.getElementById('mobileNav');

            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (mobileNav.classList.contains('open')) {
                    mobileNav.classList.remove('open');
                }
            }
        });
    });

    // Mobile Navigation
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && closeBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => mobileNav.classList.add('open'));
        closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
    }

    // Hero CTA buttons update the form dropdown
    const heroSellBtn = document.getElementById('heroSellBtn');
    const heroFinanceBtn = document.getElementById('heroFinanceBtn');
    const interestTypeDropdown = document.getElementById('interestType');
    if (interestTypeDropdown) {
        if (heroSellBtn) {
            heroSellBtn.addEventListener('click', () => {
                interestTypeDropdown.value = 'sell-cash';
            });
        }
        if (heroFinanceBtn) {
            heroFinanceBtn.addEventListener('click', () => {
                interestTypeDropdown.value = 'buy-financing';
            });
        }
    }

    // Track clicks on the "Contact Jimmie" button in the profile cards
    document.querySelectorAll('.cta-profile .contact-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'contact_card_click', {
                    'event_category': 'engagement',
                    'event_label': 'Contact Jimmie Profile Card'
                });
            }
        });
    });
    
    // Validate property address when interest type changes
    if (interestTypeDropdown) {
        interestTypeDropdown.addEventListener('change', () => validateForm(mainLeadForm));
    }

    // Collapsible Floating Action Buttons (FAB)
    const fabContainer = document.querySelector('.fab-container');
    const fabToggleBtn = document.querySelector('.fab-toggle-btn');
    if (fabContainer && fabToggleBtn) {
        const toggleFab = () => {
            const isExpanded = fabContainer.classList.toggle('expanded');
            const icon = fabToggleBtn.querySelector('i');
            icon.classList.toggle('fa-comment-dots', !isExpanded);
            icon.classList.toggle('fa-times', isExpanded);
        };
        fabToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFab();
        });
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target) && fabContainer.classList.contains('expanded')) {
                toggleFab();
            }
        });
    }

    // --- ANIMATIONS ---

    // Fade-in sections on scroll
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });

});
