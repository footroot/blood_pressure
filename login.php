<?php
session_start(); // Start the session at the very beginning!
require 'db_connect.php'; // Include your database connection file

header('Content-Type: application/json'); // Set header to indicate JSON response

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    // Basic validation
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    if (!$stmt) {
        error_log("Login prepare failed: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
        exit;
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify password using password_verify for hashed passwords
        if (password_verify($password, $user['password'])) {
            // Login successful
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode(['success' => true, 'message' => 'Login successful! Redirecting...', 'redirect' => 'index.php']);
        } else {
            // Password does not match
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
        }
    } else {
        // User not found
        echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    }

    $stmt->close();
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>