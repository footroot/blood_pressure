document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
    const loginMessage = document.getElementById('loginMessage');
    const formData = new FormData();

    formData.append('username', username);
    formData.append('password', password);

    fetch('login.php', {
        method: 'POST',
        body: formData
    })

        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginMessage.className = 'message success';
                loginMessage.textContent = data.message;
                // Redirect to the main application page (index.html) after successful login
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 1500); // Redirect after 1.5 seconds
            } else {
                loginMessage.className = 'message error';
                loginMessage.textContent = data.message;
            }
        })

        .catch(error => {
            console.error('Error:', error);
            loginMessage.className = 'message error';
            loginMessage.textContent = 'An unexpected error occurred. Please try again.';
        });
});

