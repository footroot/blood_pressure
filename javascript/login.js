document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('login_username');
    const passwordInput = document.getElementById('login_password');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            loginMessage.textContent = ''; // Clear previous messages
            loginMessage.className = 'message'; // Reset message class

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Client-side validation (basic)
            if (!username || !password) {
                loginMessage.textContent = 'Please enter both username and password.';
                loginMessage.classList.add('error');
                return;
            }

            try {
                const response = await fetch('login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: username,
                        password: password
                    }).toString()
                });

                const data = await response.json(); // Parse the JSON response from login.php

                if (data.success) {
                    loginMessage.textContent = data.message;
                    loginMessage.classList.add('success');
                    // Redirect to the main application page
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    loginMessage.textContent = data.message;
                    loginMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginMessage.textContent = 'An unexpected error occurred. Please try again.';
                loginMessage.classList.add('error');
            }
        });
    }
});