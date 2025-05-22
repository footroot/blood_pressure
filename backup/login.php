<?php
// Start the session at the very beginning of the script
session_start();

require 'db_connect.php'; // Your existing database connection file

header('Content-Type: application/json'); // Respond with JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    // Basic validation
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
        exit;
    }

    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify the provided password against the hashed password in the database
        if (password_verify($password, $user['password'])) {
            // Password is correct, start session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            echo json_encode(['success' => true, 'message' => 'Login successful!']);
        } else {
            // Incorrect password
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
    } else {
        // Username not found
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>