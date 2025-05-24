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

// Select all necessary fields for calendar events
$sql = "SELECT id, systolic, diastolic, pulse, notes, timestamp FROM blood_pressure_readings WHERE user_id = ? ORDER BY timestamp ASC";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    // Log the error for debugging purposes
    error_log("Error preparing statement for get_calendar_events.php: " . $conn->error);
    echo json_encode(['error' => 'Failed to prepare statement.']);
    exit;
}

$stmt->bind_param("i", $user_id); // Bind the user_id
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = [
        'title' => $row['systolic'] . '/' . $row['diastolic'] . ' mmHg',
        'start' => $row['timestamp'], // FullCalendar usually handles MySQL DATETIME/TIMESTAMP format well
        'allDay' => false, // <--- CHANGED THIS: Set to false if you want events to appear at specific times
        'extendedProps' => $row // Pass all reading data for eventClick, if needed
    ];
}

echo json_encode($events);

$stmt->close();
$conn->close();
?>