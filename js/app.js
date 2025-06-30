document.addEventListener('DOMContentLoaded', () => {
    const encode = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");
    };

    const disposableEmailDomains = new Set([
        'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org',
        'getnada.com', 'throwawaymail.com'
    ]);

    const mainModal = document.getElementById('messageModal');
    const modalTitleText = document.getElementById('modalTitleText');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const guideModal = document.getElementById('guideModal');
    const guideModalCloseBtn = document.getElementById('guideModalCloseBtn');

    function showMainModal(type, title, message) {
        modalTitleText.textContent = title;
        modalMessage.textContent = message;
        modalIcon.className = 'modal-icon';

        if (type === 'success') {
            modalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
            modalIcon.classList.add('success');
        } else if (type === 'error') {
            modalIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
            modalIcon.classList.add('error');
        }
        mainModal.classList.add('visible');
    }

    function hideMainModal() {
        mainModal.classList.remove('visible');
    }

    function showGuideModal(pdfPath, pdfName, guideTitle) {
        const guideModalMessage = document.getElementById('guideModalMessage');
        const guideModalFallbackLink = document.getElementById('guideModalFallbackLink');

        if (guideModalMessage && guideModalFallbackLink) {
            guideModalMessage.firstChild.textContent = `Your download of "${guideTitle}" should begin shortly. If it doesn't, `;
            guideModalFallbackLink.href = pdfPath;
        }

        const link = document.createElement('a');
        link.href = pdfPath;
        link.download = pdfName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        guideModal.classList.add('visible');
    }

    function hideGuideModal() {
        guideModal.classList.remove('visible');
    }

    modalCloseBtn.addEventListener('click', hideMainModal);
    guideModalCloseBtn.addEventListener('click', hideGuideModal);
    mainModal.addEventListener('click', (e) => e.target === mainModal && hideMainModal());
    guideModal.addEventListener('click', (e) => e.target === guideModal && hideGuideModal());

    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        let fieldIsValid = true;
        let errorMessage = 'This field is required.';
        const errorElement = formGroup.querySelector('.error-message');

        formGroup.classList.remove('has-error');
        if (errorElement) errorElement.textContent = '';

        if (field.hasAttribute('required') && !field.value.trim()) {
            fieldIsValid = false;
        } else if (field.type === 'email' && field.value.trim()) {
            const emailValue = field.value.trim();
            const domain = emailValue.substring(emailValue.lastIndexOf('@') + 1).toLowerCase();
            if (!/^[^@]+@[^@]+\.[a-z]{2,}$/.test(emailValue)) {
                fieldIsValid = false;
                errorMessage = 'Please enter a valid email address.';
            } else if (disposableEmailDomains.has(domain)) {
                fieldIsValid = false;
                errorMessage = 'Please use a permanent email address.';
            }
        } else if (field.type === 'tel' && field.value.trim() && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(field.value)) {
            fieldIsValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number.';
        } else if (field.id === 'fullName' && field.value.trim().split(' ').length < 2) {
            fieldIsValid = false;
            errorMessage = 'Please enter your first and last name.';
        }

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

    function validateForm(form) {
        let isFormValid = true;
        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    function resetValidation(form) {
        form.querySelectorAll('.form-group.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    async function handleFormSubmit(e, form, options) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!validateForm(form)) {
            showMainModal('error', 'Oops!', 'Please correct the errors marked in the form before submitting.');
            return;
        }

        // Inject Netlify reCAPTCHA on demand
        if (!form.querySelector('[data-netlify-recaptcha]')) {
            const captchaDiv = document.createElement('div');
            captchaDiv.setAttribute('data-netlify-recaptcha', 'true');
            form.appendChild(captchaDiv);
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

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            if (options.trackingEvent && typeof gtag === 'function') {
                gtag('event', options.trackingEvent.name, {
                    event_category: options.trackingEvent.category,
                    event_label: options.trackingEvent.label,
                    value: 1
                });
            }

            options.onSuccess(data);
            form.reset();
            resetValidation(form);
            const charCount = form.querySelector('#charCount');
            if (charCount) charCount.textContent = '0';

        } catch (error) {
            console.error('Form submission error:', error);
            showMainModal('error', 'Submission Error!', 'Something went wrong. Please check your connection or contact us directly.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

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
            onSuccess: () => showGuideModal('downloads/PUBLISHED-The_Home_Sellers_Guide.pdf', 'Jackson_Investment_Solutions_Home_Sellers_Guide.pdf', "Jackson Investment Solutions - Home Seller's Guide"),
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
            onSuccess: () => showGuideModal('downloads/PUBLISHED-The_Home_Buyers_Guide.pdf', 'Jackson_Investment_Solutions_Home_Buyers_Guide.pdf', "Jackson Investment Solutions - Home Buyer's Guide"),
            trackingEvent: {
                name: 'guide_download_submit',
                category: 'lead_magnet',
                label: 'Buyer Guide Download'
            }
        }));
    }

    document.querySelectorAll('#leadForm input, #leadForm select, #sellerGuideForm input, #buyerGuideForm input').forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
    });

    const additionalInfo = document.getElementById('additionalInfo');
    const charCount = document.getElementById('charCount');
    if (additionalInfo && charCount) {
        additionalInfo.addEventListener('input', () => {
            charCount.textContent = additionalInfo.value.length;
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const mobileNav = document.getElementById('mobileNav');

            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                if (mobileNav.classList.contains('open')) {
                    mobileNav.classList.remove('open');
                }
            }
        });
    });

    // Mobile nav toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && closeBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => mobileNav.classList.add('open'));
        closeBtn.addEventListener('click', () => mobileNav.classList.remove('open'));
    }
});
