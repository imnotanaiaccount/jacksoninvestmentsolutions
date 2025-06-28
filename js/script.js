document.addEventListener('DOMContentLoaded', function() {
    const leadForm = document.getElementById('leadForm');

    if (leadForm) {
        leadForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default browser submission

            // Clear all previous error messages
            document.querySelectorAll('.error-message').forEach(span => {
                span.style.display = 'none';
            });

            let isValid = true;
            const formData = new FormData(leadForm); // Get form data

            // --- Client-Side Validation ---
            // Example: Validate Full Name
            const fullNameInput = document.getElementById('fullName');
            if (fullNameInput && fullNameInput.value.trim() === '') {
                fullNameInput.nextElementSibling.style.display = 'block'; // Show error message
                isValid = false;
            }

            // Example: Validate Phone Number
            const phoneNumberInput = document.getElementById('phoneNumber');
            const phonePattern = /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/;
            if (phoneNumberInput && (!phoneNumberInput.value.trim() || !phonePattern.test(phoneNumberInput.value.trim()))) {
                phoneNumberInput.nextElementSibling.style.display = 'block';
                isValid = false;
            }

            // Example: Validate Email
            const emailAddressInput = document.getElementById('emailAddress');
            // Basic email regex (can be more robust if needed)
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailAddressInput && (!emailAddressInput.value.trim() || !emailPattern.test(emailAddressInput.value.trim()))) {
                emailAddressInput.nextElementSibling.style.display = 'block';
                isValid = false;
            }

            // Example: Validate Interest Type
            const interestTypeSelect = document.getElementById('interestType');
            if (interestTypeSelect && interestTypeSelect.value === '') {
                interestTypeSelect.nextElementSibling.style.display = 'block';
                isValid = false;
            }

            // You might also have logic to show/hide propertyAddress based on interestType
            // and make propertyAddress required only if selling options are selected.
            // For now, assume it's optional unless explicitly chosen.

            if (!isValid) {
                // If validation fails, stop here
                return;
            }

            // --- If validation passes, submit to Netlify via AJAX ---
            try {
                // Netlify recommends submitting to the root path for AJAX forms
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    // Success! You can display a success message to the user
                    alert('Your message has been sent successfully!'); // Replace with a nicer UI update
                    leadForm.reset(); // Clear the form
                    // Optionally redirect to a success page or display a success div
                    // window.location.href = '/success.html';
                } else {
                    // Something went wrong with Netlify's processing
                    alert('There was an error submitting your form. Please try again.'); // Replace with UI update
                    console.error('Form submission failed:', response.statusText);
                }
            } catch (error) {
                // Network error or other JavaScript error
                alert('A network error occurred. Please check your connection and try again.'); // Replace with UI update
                console.error('Network or JS error:', error);
            }
        });

        // Optional: Add event listeners to input fields to hide error messages when user types
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
            input.addEventListener('input', function() {
                const errorMessage = this.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.style.display = 'none';
                }
            });
        });
    }
});
