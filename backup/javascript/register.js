document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    const username = document.getElementById('reg_username').value;
    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;
    const confirmPassword = document.getElementById('reg_confirm_password').value;
    const registerMessage = document.getElementById('registerMessage');

    if (password !== confirmPassword) {
        registerMessage.className = 'message error';
        registerMessage.textContent = 'Passwords do not match!';
        return;
    }

    // Basic password strength check (you can make this more robust)

    if (password.length < 8) {
        registerMessage.className = 'message error';
        registerMessage.textContent = 'Password must be at least 8 characters long!';
        return;
    }


    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    fetch('register.php', {
        method: 'POST',
        body: formData
    })

        .then(response => response.json())
        .then(data => {
            if (data.success) {
                registerMessage.className = 'message success';
                registerMessage.textContent = data.message;
                document.getElementById('registerForm').reset(); // Clear the form

                // Optionally redirect to login page

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000); // Redirect after 2 seconds
            } else {
                registerMessage.className = 'message error';
                registerMessage.textContent = data.message;
            }
        })

        .catch(error => {
            console.error('Error:', error);
            registerMessage.className = 'message error';
            registerMessage.textContent = 'An unexpected error occurred. Please try again.';
        });
});

