document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('reg_username');
    const passwordInput = document.getElementById('reg_password');
    const confirmPasswordInput = document.getElementById('reg_confirm_password');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            registerMessage.textContent = ''; // Clear previous messages
            registerMessage.className = 'message'; // Reset message class

            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Client-side validation (basic)
            if (!username || !password || !confirmPassword) {
                registerMessage.textContent = 'All fields are required.';
                registerMessage.classList.add('error');
                return;
            }
            if (password !== confirmPassword) {
                registerMessage.textContent = 'Passwords do not match.';
                registerMessage.classList.add('error');
                return;
            }
            if (password.length < 6) {
                registerMessage.textContent = 'Password must be at least 6 characters long.';
                registerMessage.classList.add('error');
                return;
            }

            try {
                const response = await fetch('register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: username,
                        password: password,
                        confirm_password: confirmPassword
                    }).toString()
                });

                const data = await response.json(); // Parse the JSON response from register.php

                if (data.success) {
                    registerMessage.textContent = data.message;
                    registerMessage.classList.add('success');
                    // Optionally clear form fields on success
                    usernameInput.value = '';
                    passwordInput.value = '';
                    confirmPasswordInput.value = '';

                    // Redirect to login page after a short delay
                    if (data.redirect) {
                        setTimeout(() => {
                            window.location.href = data.redirect;
                        }, 2000); // Redirect after 2 seconds
                    }

                } else {
                    registerMessage.textContent = data.message;
                    registerMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                registerMessage.textContent = 'An unexpected error occurred. Please try again.';
                registerMessage.classList.add('error');
            }
        });
    }
});