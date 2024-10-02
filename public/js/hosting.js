document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const form = document.querySelector('.step-form');
    const errorMessage = document.getElementById('error-message'); // Error message for the image upload
    const multipleHostImages = document.getElementById('multiple_host_images'); // Image input

    let currentStep = 0;

    // Show current step
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });

        // Optional: scroll to the top of the form section when moving to a new step
        window.scrollTo(0, 0);
    }

    // Display the first step
    showStep(currentStep);

    // Event listener for "Next" buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();

            if (validateStep(currentStep)) {
                currentStep++;
                if (currentStep >= steps.length) {
                    currentStep = steps.length - 1;
                }
                showStep(currentStep);
            }
        });
    });

    // Event listener for "Previous" buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            currentStep--;
            if (currentStep < 0) {
                currentStep = 0;
            }
            showStep(currentStep);
        });
    });

    // Form validation function
    function validateStep(stepIndex) {
        const inputs = steps[stepIndex].querySelectorAll('input, textarea, select');
        let isValid = true;

        // General input validation
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        // Step 1 validation: Check for at least 4 images uploaded
        if (stepIndex === 0) {
            if (multipleHostImages.files.length < 4) {
                errorMessage.style.color = 'red';
                errorMessage.textContent = 'Please upload at least 4 images.';
                isValid = false;
            } else {
                errorMessage.textContent = ''; // Clear error message if validation passes
            }
        }

        // If step is valid, fill review details in the confirmation step
        if (isValid && currentStep === steps.length - 2) {
            fillReviewStep();
        }

        return isValid;
    }

    // Function to fill the review section with form data
    function fillReviewStep() {
        document.getElementById('reviewPropertyName').textContent = document.getElementById('propertyName').value;
        document.getElementById('reviewPropertyType').textContent = document.getElementById('propertyType').value;
        document.getElementById('reviewAddress').textContent = document.getElementById('address').value;
        document.getElementById('reviewCity').textContent = document.getElementById('city').value;
        document.getElementById('reviewZipcode').textContent = document.getElementById('zipcode').value;
        document.getElementById('reviewPrice').textContent = document.getElementById('price').value;
        document.getElementById('reviewCurrency').textContent = document.getElementById('currency').value;
        document.getElementById('reviewDescription').textContent = document.getElementById('description').value;
        document.getElementById('reviewAmenities').textContent = document.getElementById('amenities').value;
    }
});


// display_hosting_form_btn based on screen responsiveness for smaller devices
const display_hosting_form_btn = document.getElementById('display_hosting_form_btn');
const host_place_form = document.getElementById('host_place_form');
const sm_responsive_intro_section = document.getElementById('sm_responsive_intro_section');

function display_hosting_form_btn_func() {

    host_place_form.style.display = 'block';
    sm_responsive_intro_section.style.display = 'none'
}

display_hosting_form_btn.addEventListener('click', display_hosting_form_btn_func);

