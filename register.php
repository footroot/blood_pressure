<?php
// No session_start() needed here unless you immediately log the user in after registration,
// but generally, it's better to redirect them to the login page.
require 'db_connect.php'; // Include your database connection file

header('Content-Type: application/json'); // Set header to indicate JSON response

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Basic validation
    if (empty($username) || empty($password) || empty($confirm_password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    if ($password !== $confirm_password) {
        echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
        exit;
    }

    // Password strength (optional, but good practice)
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long.']);
        exit;
    }

    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    if (!$stmt) {
        error_log("Register prepare failed: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
        exit;
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists. Please choose a different one.']);
        $stmt->close();
        exit;
    }
    $stmt->close();

    // Hash the password securely
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user into the database
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    if (!$stmt) {
        error_log("Insert user prepare failed: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Failed to prepare user insertion.']);
        exit;
    }

    $stmt->bind_param("ss", $username, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful! You can now login.', 'redirect' => 'login.html']);
    } else {
        error_log("User registration failed: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }

    $stmt->close();
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>