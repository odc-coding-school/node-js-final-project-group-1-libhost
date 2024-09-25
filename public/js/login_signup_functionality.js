function switchOverlay(formType) {
    const loginFormContainer = document.getElementById('loginFormContainer');
    const signupFormContainer = document.getElementById('signupFormContainer');

    if (formType === 'signup') {
        loginFormContainer.classList.add('d-none'); // Hide login form
        signupFormContainer.classList.remove('d-none'); // Show signup form
    } else if (formType === 'login') {
        signupFormContainer.classList.add('d-none'); // Hide signup form
        loginFormContainer.classList.remove('d-none'); // Show login form
    }
}
