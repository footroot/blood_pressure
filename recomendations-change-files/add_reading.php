<?php
session_start(); // Start the session to access user_id
require 'db_connect.php'; // Your existing database connection file

header('Content-Type: application/json'); // Respond with JSON

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

$user_id = $_SESSION['user_id']; // Get the logged-in user's ID

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect and sanitize input data
    $systolic = filter_input(INPUT_POST, 'systolic', FILTER_VALIDATE_INT);
    $diastolic = filter_input(INPUT_POST, 'diastolic', FILTER_VALIDATE_INT);
    $pulse = filter_input(INPUT_POST, 'pulse', FILTER_VALIDATE_INT);
    $notes = filter_input(INPUT_POST, 'notes', FILTER_SANITIZE_STRING);
    // NEW: Get the reading_date from the POST request
    $reading_date_str = filter_input(INPUT_POST, 'reading_date', FILTER_SANITIZE_STRING); // e.g., "YYYY-MM-DD"

    // Validate required fields
    if ($systolic === false || $systolic <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid systolic reading.']);
        exit;
    }
    if ($diastolic === false || $diastolic <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid diastolic reading.']);
        exit;
    }
    // NEW: Validate reading_date
    if (empty($reading_date_str)) {
        echo json_encode(['success' => false, 'message' => 'Reading date is required.']);
        exit;
    }

    // Default pulse to NULL if not provided or invalid
    if ($pulse === false || $pulse === null) {
        $pulse = null;
    }

    // Combine the user-provided date with the current time
    // This creates a DATETIME string like "YYYY-MM-DD HH:MM:SS"
    try {
        $date_obj = new DateTime($reading_date_str); // Parse the YYYY-MM-DD part
        $current_time = new DateTime(); // Get current time
        // Set the time part of the date_obj to the current time
        $date_obj->setTime(
            (int)$current_time->format('H'),
            (int)$current_time->format('i'),
            (int)$current_time->format('s')
        );
        $final_timestamp = $date_obj->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        error_log("Error creating DateTime object for reading_date in add_reading.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Invalid date format provided for reading.']);
        exit;
    }

    // Prepare and execute the SQL statement to insert the reading
    $sql = "INSERT INTO blood_pressure_readings (user_id, systolic, diastolic, pulse, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        error_log("Error preparing statement for add_reading.php: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error: Could not prepare statement.']);
        exit;
    }

    // Bind parameters: i = integer, s = string, i = integer (for pulse, can be null), s = string (for notes), s = string (for timestamp)
    // Note: mysqli's bind_param is generally tolerant with binding NULL to an 'i' (integer) type.
    // If you explicitly wanted to bind NULL as a string, you would use 's', but 'iiiiss' is common and usually works.
    $stmt->bind_param("iiiiss", $user_id, $systolic, $diastolic, $pulse, $notes, $final_timestamp);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Reading added successfully!']);
    } else {
        error_log("Error executing statement for add_reading.php: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => 'Failed to save reading to database.']);
    }

    $stmt->close();
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>