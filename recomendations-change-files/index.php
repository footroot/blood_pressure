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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BP Tracker Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <link href='css/fullcalendar/main.min.css' rel='stylesheet' />
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Blood Pressure Tracker</h1>
            <p>Welcome, **<?php echo htmlspecialchars($_SESSION['username']); ?>!**</p>
            <button id="logoutButton" class="logout-btn">Logout</button>
        </div>

        <div id="input-section" class="card input-form-container">
            <h2>Add New Reading</h2>
            <form id="addReadingForm">
                <div class="input-group">
                    <label for="systolic">Systolic (mmHg)</label>
                    <input type="number" id="systolic" placeholder="e.g., 120" required>
                </div>
                <div class="input-group">
                    <label for="diastolic">Diastolic (mmHg)</label>
                    <input type="number" id="diastolic" placeholder="e.g., 80" required>
                </div>
                 <div class="input-group">
                    <label for="pulse">Pulse (bpm)</label>
                    <input type="number" id="pulse" placeholder="Optional, e.g., 70">
                </div>
                <div class="input-group">
                    <label for="reading_date">Date of Reading</label>
                    <input type="date" id="reading_date" required> </div>
                <div class="input-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" placeholder="Optional notes..."></textarea>
                </div>
                <button type="submit">Add Reading</button>
                <p id="addReadingMessage" class="message"></p>
            </form>
        </div>

        <div class="dashboard-sections">
            <div id="averages-section" class="card">
                <h2>Average Readings</h2>
                <div class="average-group">
                    <h3>Last 7 Days</h3>
                    <p>Systolic: <span id="avg-systolic-7d">--</span> mmHg</p>
                    <p>Diastolic: <span id="avg-diastolic-7d">--</span> mmHg</p>
                    <p>Pulse: <span id="avg-pulse-7d">--</span> bpm</p>
                </div>
                <div class="average-group">
                    <h3>Last 30 Days</h3>
                    <p>Systolic: <span id="avg-systolic-30d">--</span> mmHg</p>
                    <p>Diastolic: <span id="avg-diastolic-30d">--</span> mmHg</p>
                    <p>Pulse: <span id="avg-pulse-30d">--</span> bpm</p>
                </div>
                <div class="average-group">
                    <h3>All Time</h3>
                    <p>Systolic: <span id="avg-systolic-alltime">--</span> mmHg</p>
                    <p>Diastolic: <span id="avg-diastolic-alltime">--</span> mmHg</p>
                    <p>Pulse: <span id="avg-pulse-alltime">--</span> bpm</p>
                </div>
            </div>

            <div id="chart-section" class="card">
                <h2>Readings Chart</h2>
                <div class="chart-container">
                    <canvas id="bpChart"></canvas>
                </div>
            </div>

             <div id="calendar-section" class="card">
                <h2>Calendar View</h2>
                <div id="calendar"></div>
            </div>

            <div id="list-section" class="card">
                <h2>All Readings</h2>
                <ul id="reading-list">
                    </ul>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src='javascript/fullcalendar/index.global.min.js'></script>

    <script src="javascript/script.js"></script>
</body>
</html>