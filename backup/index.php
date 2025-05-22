<?php
session_start(); // VERY IMPORTANT: Must be at the very top of the file!

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    // If not logged in, redirect to login page
    header('Location: login.html');
    exit; // Stop script execution
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blood Pressure Tracker</title>

    <!-- <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/main.css" rel="stylesheet" /> -->
    <link rel="stylesheet" href="css/style.css">

</head>

<body>
        <header style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
        <h1>Blood Pressure Tracker</h1>
        <div style="font-size: 1.1em; color: #555;">
            Welcome, **<?php echo htmlspecialchars($_SESSION['username']); ?>!**
            <a href="logout.php" style="margin-left: 15px; color: #dc3545; text-decoration: none;">Logout</a>
        </div>
    </header>

    <h1>Blood Pressure Tracker</h1>

    <div id="input-section" class="input-form-container">
        <h2>Enter New Reading</h2>
        <div class="input-group">
            <label for="systolic">Systolic:</label>
            <input type="number" id="systolic" placeholder="e.g., 120" required><br>
        </div>
        <div class="input-group">
            <label for="diastolic">Diastolic:</label>
            <input type="number" id="diastolic" placeholder="e.g., 80" required><br>
        </div>
        <div class="input-group">
            <label for="pulse">Pulse (Optional):</label>
            <input type="number" id="pulse" placeholder="e.g., 70"><br>
        </div>
        <div class="input-group">
            <label for="notes">Notes (Optional):</label>
            <textarea id="notes" rows="3" placeholder="Any relevant notes..."></textarea><br>
        </div>
        <button onclick="addReading()">Add Reading</button>
    </div>





    <div class="main-content-layout">
        <div id="calendar-section">
            <h2>Blood Pressure Calendar</h2>
            <div id='calendar'></div>
        </div>

        <div id="list-section">
            <h2>Reading History</h2>
            <ul id="reading-list"></ul>
        </div>
    </div>

    <div id="chart-section">
        <h2>Blood Pressure Chart</h2>
        <canvas id="bpChart" width="400" height="200"></canvas>
    </div>




    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="javascript/script.js"></script>

</body>

</html>