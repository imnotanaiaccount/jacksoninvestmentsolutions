document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Logic ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    // Function to open the mobile nav
    const openNav = () => {
        mobileNav.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling on the body
        // Add a class to the body to apply a backdrop
        document.body.classList.add('nav-open'); 
    };

    // Function to close the mobile nav
    const closeNav = () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
        document.body.classList.remove('nav-open');
    };

    // Event listener for the hamburger button to open the nav
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openNav);
    }

    // Event listener for the close button to close the nav
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNav);
    }

    // Event listeners for each link to close the nav when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });
    
    // --- NEW: Close the navbar by clicking outside of it ---
    document.addEventListener('click', (event) => {
        // Check if the click target is outside both the navbar and the hamburger button
        // and if the navbar is currently open.
        if (
            mobileNav.classList.contains('open') &&
            !mobileNav.contains(event.target) &&
            !hamburgerBtn.contains(event.target)
        ) {
            closeNav();
        }
    });

    // --- Smooth Scrolling for all internal links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Check if the mobile nav is open and close it first
                if (mobileNav.classList.contains('open')) {
                    closeNav();
                }

                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, mobileNav.classList.contains('open') ? 400 : 0); // Delay if nav is closing
            }
        });
    });


    // --- Form Validation & Submission Logic ---
    const contactForm = document.getElementById('leadForm');
    const sellerGuideForm = document.getElementById('sellerGuideForm');
    const buyerGuideForm = document.getElementById('buyerGuideForm');
    const messageModal = document.getElementById('messageModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalTitle = document.getElementById('modalTitleText');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const guideModal = document.getElementById('guideModal');
    const guideModalCloseBtn = document.getElementById('guideModalCloseBtn');
    const guideModalFallbackLink = document.getElementById('guideModalFallbackLink');

    const showModal = (title, message, isSuccess, modalType = 'message') => {
        const modal = modalType === 'guide' ? guideModal : messageModal;
        const titleEl = modal.querySelector('#modalTitleText, #guideModalTitleText');
        const messageEl = modal.querySelector('#modalMessage, #guideModalMessage');
        const iconEl = modal.querySelector('#modalIcon, #guideModalIcon');

        titleEl.textContent = title;
        messageEl.innerHTML = message;

        if (iconEl) {
            iconEl.innerHTML = isSuccess ?
                '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>' :
                '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
            iconEl.classList.toggle('success', isSuccess);
            iconEl.classList.toggle('error', !isSuccess);
        }

        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    };

    const hideModal = (modalType = 'message') => {
        const modal = modalType === 'guide' ? guideModal : messageModal;
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => hideModal('message'));
    }
    if (guideModalCloseBtn) {
        guideModalCloseBtn.addEventListener('click', () => hideModal('guide'));
    }

    // Close modals when clicking outside the modal content
    document.addEventListener('click', (event) => {
        if (messageModal.classList.contains('visible') && !messageModal.querySelector('.message-modal-content').contains(event.target)) {
            hideModal('message');
        }
        if (guideModal.classList.contains('visible') && !guideModal.querySelector('.message-modal-content').contains(event.target)) {
            hideModal('guide');
        }
    });

    // Close modals with the ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideModal('message');
            hideModal('guide');
        }
    });

    const isFieldValid = (field) => {
        let isValid = field.checkValidity();

        if (field.id === 'fullName') {
            isValid = /^[a-zA-Z]+\s+[a-zA-Z]+/.test(field.value.trim());
        } else if (field.id === 'phoneNumber') {
            isValid = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(field.value.trim());
        } else if (field.id === 'emailAddress') {
             isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        } else if (field.id === 'interestType') {
            isValid = field.value !== '';
        }

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.toggle('has-error', !isValid);
        }

        return isValid;
    };

    const validateForm = (form) => {
        let isFormValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!isFieldValid(field)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    };

    const handleFormSubmission = async (form) => {
        if (!validateForm(form)) {
            showModal('Validation Error', 'Please correct the errors in the form before submitting.', false);
            return;
        }
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

        const formData = new FormData(form);
        const formName = form.getAttribute('name');
        formData.append('form-name', formName);

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                if (form.id === 'sellerGuideForm') {
                    showModal('Thank You!', 'Your Home Seller\'s Guide is on its way to your inbox. A download will begin shortly.', true, 'guide');
                    guideModalFallbackLink.href = 'guides/JIS_Home_Seller_Guide.pdf';
                    // Trigger download
                    setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = 'guides/JIS_Home_Seller_Guide.pdf';
                        link.download = 'JIS_Home_Seller_Guide.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }, 2000);
                } else if (form.id === 'buyerGuideForm') {
                     showModal('Thank You!', 'Your Home Buyer\'s Guide is on its way to your inbox. A download will begin shortly.', true, 'guide');
                     guideModalFallbackLink.href = 'guides/JIS_Home_Buyer_Guide.pdf';
                      // Trigger download
                     setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = 'guides/JIS_Home_Buyer_Guide.pdf';
                        link.download = 'JIS_Home_Buyer_Guide.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }, 2000);
                } else {
                    showModal('Success!', 'Thank you for your message! We will get back to you within 24 hours.', true);
                }
                form.reset();
                form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
                
            } else {
                showModal('Error!', 'Oops! There was a problem with your submission. Please try again.', false);
            }
        } catch (error) {
            console.error('Submission error:', error);
            showModal('Error!', 'Oops! There was a network error. Please check your connection and try again.', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Contact Me'; // Reset button text
            if (form.id === 'sellerGuideForm' || form.id === 'buyerGuideForm') {
                 submitBtn.innerHTML = form.id === 'sellerGuideForm' ? 'Download Seller\'s Guide' : 'Download Buyer\'s Guide';
            }
        }
    };

    // Add submit event listeners to all forms
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(contactForm);
        });
    }

    if (sellerGuideForm) {
        sellerGuideForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(sellerGuideForm);
        });
    }

    if (buyerGuideForm) {
        buyerGuideForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission(buyerGuideForm);
        });
    }

    // --- Dynamic Character Counter for Textarea ---
    const additionalInfoTextarea = document.getElementById('additionalInfo');
    const charCountSpan = document.getElementById('charCount');

    if (additionalInfoTextarea && charCountSpan) {
        additionalInfoTextarea.addEventListener('input', (e) => {
            const currentLength = e.target.value.length;
            const maxLength = e.target.maxLength;
            charCountSpan.textContent = currentLength;

            if (currentLength >= maxLength) {
                charCountSpan.style.color = var(--red-error);
            } else {
                charCountSpan.style.color = '#888';
            }
        });
    }

    // --- Sticky Header Logic ---
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.innerWidth >= 768) { // Only on larger screens
            if (lastScrollY < window.scrollY && window.scrollY > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        } else {
            // On mobile, just show the header
            header.style.transform = 'translateY(0)';
        }
    });
    
    // --- FAB Button Logic ---
    const fabContainer = document.querySelector('.fab-container');
    const fabToggleBtn = document.querySelector('.fab-toggle-btn');
    const fabActionsGroup = document.querySelector('.fab-actions-group');

    if (fabToggleBtn) {
        fabToggleBtn.addEventListener('click', () => {
            fabContainer.classList.toggle('open');
        });
    }
    
    // --- Scroll Fade-In Animation ---
    const faders = document.querySelectorAll('.fade-in-section');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
});
