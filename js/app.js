document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Logic ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (hamburgerBtn && closeBtn && mobileNav) {
        // Open the mobile nav
        hamburgerBtn.addEventListener('click', () => {
            mobileNav.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevents scrolling on the body
        });

        // Close the mobile nav using the close button
        closeBtn.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            document.body.style.overflow = ''; // Restores scrolling
        });

        // Close the mobile nav by clicking a link
        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // --- FIX: Close the navbar by tapping outside of it ---
        document.addEventListener('click', (event) => {
            // Check if the nav is open and if the click is outside the nav and the hamburger button
            if (mobileNav.classList.contains('open') && !mobileNav.contains(event.target) && !hamburgerBtn.contains(event.target)) {
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Add fade-in section functionality ---
    // This is the stable and correct implementation using IntersectionObserver.
    const fadeElements = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'is-visible' class when the element enters the viewport
                entry.target.classList.add('is-visible');
                // Stop observing the element once it's visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    fadeElements.forEach(element => observer.observe(element));

    // --- Form Encoding Function ---
    const encode = (data) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");
    };

    // --- Disposable Email Domains ---
    const disposableEmailDomains = new Set([
        'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org',
        'getnada.com', 'throwawaymail.com'
    ]);

    // --- Modal Elements ---
    const mainModal = document.getElementById('messageModal');
    const modalTitleText = document.getElementById('modalTitleText');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const guideModal = document.getElementById('guideModal');
    const guideModalCloseBtn = document.getElementById('guideModalCloseBtn');

    // --- Modal Display Functions ---
    function showMainModal(type, title, message) {
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

        // Trigger download
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

    // --- Modal Event Listeners ---
    modalCloseBtn.addEventListener('click', hideMainModal);
    guideModalCloseBtn.addEventListener('click', hideGuideModal);

    // Close main modal when clicking outside of it
    mainModal.addEventListener('click', (e) => e.target === mainModal && hideMainModal());
    
    // Close guide modal when clicking outside of it
    guideModal.addEventListener('click', (e) => e.target === guideModal && hideGuideModal());

    // --- Form Validation Logic ---
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true; // Exit if no form-group parent

        let fieldIsValid = true;
        let errorMessage = 'This field is required.';
        const errorElement = formGroup.querySelector('.error-message');

        // Reset validation state
        formGroup.classList.remove('has-error');
        if (errorElement) errorElement.textContent = '';

        // Check for required fields
        if (field.hasAttribute('required') && !field.value.trim()) {
            fieldIsValid = false;
        }
        // Specific validations
        else if (field.type === 'email' && field.value.trim()) {
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
        
        // Conditional validation for propertyAddress
        if (field.id === 'propertyAddress') {
            const interestTypeField = field.form.querySelector('#interestType');
            const selectedInterest = interestTypeField.value;
            const isSellingInterest = ['sell-cash', 'sell-list', 'both'].includes(selectedInterest);
            if (isSellingInterest && !field.value.trim()) {
                fieldIsValid = false;
                errorMessage = 'Property address is required for selling inquiries.';
            }
        }

        // Apply error state if invalid
        if (!fieldIsValid) {
            formGroup.classList.add('has-error');
            if (errorElement) errorElement.textContent = errorMessage;
        }

        return fieldIsValid;
    }

    function validateForm(form) {
        let isFormValid = true;
        // Check all inputs, selects, and textareas in the form
        form.querySelectorAll('input, select, textarea').forEach(field => {
            // We don't short-circuit, so all fields get validated and show errors
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

    // --- Generic Form Submission Handler ---
    async function handleFormSubmit(e, form, options) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Validate the entire form on submission
        if (!validateForm(form)) {
            showMainModal('error', 'Oops!', 'Please correct the errors marked in the form before submitting.');
            return; // Stop submission if validation fails
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
            
            // Call success callback and tracking event
            options.onSuccess(data);

            // Reset form and validation state
            form.reset();
            resetValidation(form);

            // Reset character count if applicable
            const charCount = form.querySelector('#charCount');
            if (charCount) charCount.textContent = '0';

        } catch (error) {
            console.error('Form submission error:', error);
            showMainModal('error', 'Submission Error!', 'Something went wrong. Please check your connection or contact us directly.');
        } finally {
            // Re-enable the button and restore its text
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    // --- Attach Submit Handlers to Forms ---
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
        }));
    }

    if (sellerGuideForm) {
        sellerGuideForm.addEventListener('submit', (e) => handleFormSubmit(e, sellerGuideForm, {
            loadingText: 'Downloading...',
            onSuccess: () => showGuideModal('downloads/PUBLISHED-The_Home_Sellers_Guide.pdf', 'Jackson_Investment_Solutions_Home_Sellers_Guide.pdf', "Jackson Investment Solutions - Home Seller's Guide"),
        }));
    }

    if (buyerGuideForm) {
        buyerGuideForm.addEventListener('submit', (e) => handleFormSubmit(e, buyerGuideForm, {
            loadingText: 'Downloading...',
            onSuccess: () => showGuideModal('downloads/PUBLISHED-The_Home_Buyers_Guide.pdf', 'Jackson_Investment_Solutions_Home_Buyers_Guide.pdf', "Jackson Investment Solutions - Home Buyer's Guide"),
        }));
    }

    // --- Attach Validation to Blur Event ---
    document.querySelectorAll('#leadForm input, #leadForm select, #sellerGuideForm input, #buyerGuideForm input').forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });
    });

    // --- Character Counter for Textarea ---
    const additionalInfo = document.getElementById('additionalInfo');
    const charCount = document.getElementById('charCount');
    if (additionalInfo && charCount) {
        additionalInfo.addEventListener('input', () => {
            charCount.textContent = additionalInfo.value.length;
        });
    }

    // --- Smooth Scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset - 20;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Sticky Header Logic ---
    const header = document.querySelector('header');
    if (header) {
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.innerWidth >= 768) { // Only on larger screens
                if (lastScrollY < window.scrollY && window.scrollY > 100) {
                    // Scrolling down
                    header.classList.add('hidden-header');
                } else {
                    // Scrolling up
                    header.classList.remove('hidden-header');
                }
                lastScrollY = window.scrollY;
            } else {
                // On mobile, always show the header
                header.classList.remove('hidden-header');
            }
        });
    }
});
