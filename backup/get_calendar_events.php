<?php
require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, systolic, diastolic, pulse, timestamp, notes FROM blood_pressure_readings ORDER BY timestamp ASC";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = [
                'title' => $row['systolic'] . '/' . $row['diastolic'] . ' mmHg',
                'start' => $row['timestamp'],
                'allDay' => true, // Adjust as needed if you want to display times
                'extendedProps' => $row // Include all reading data
            ];
        }
        echo json_encode($events);
    } else {
        echo json_encode([]);
    }
} else {
    $response = ['success' => false, 'message' => 'Invalid request method'];
    echo json_encode($response);
}

$conn->close();
?>