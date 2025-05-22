<?php
session_start(); // Start the session to access user_id
require 'db_connect.php'; // Your existing database connection file

header('Content-Type: application/json'); // Respond with JSON

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([]); // Return empty array if not logged in
    exit;
}

$user_id = $_SESSION['user_id']; // Get the logged-in user's ID

// Prepare a statement to fetch readings for the specific user
$sql = "SELECT id, systolic, diastolic, pulse, notes, timestamp FROM blood_pressure_readings WHERE user_id = ? ORDER BY timestamp ASC";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    // Log the error for debugging purposes (e.g., to a file)
    error_log("Error preparing statement for get_readings.php: " . $conn->error);
    echo json_encode(['error' => 'Failed to prepare statement.']);
    exit;
}

$stmt->bind_param("i", $user_id); // Bind the user_id (i for integer)
$stmt->execute();
$result = $stmt->get_result();

$readings = [];
while ($row = $result->fetch_assoc()) {
    $readings[] = $row; // Add each row (reading) to the readings array
}

echo json_encode($readings); // Encode the array of readings as JSON

$stmt->close();
$conn->close();
?>