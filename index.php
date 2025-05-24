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
    <title>Blood Pressure Tracker</title>
    <!-- <link rel="stylesheet" href="css/daygrid-main.css">
    <link rel="stylesheet" href="css/timegrid-main.css"> -->
    <link rel="stylesheet" href="css/style.css">
    <!-- <link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/main.css' rel='stylesheet' /> -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
</head>
<body>
    <header style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
        <h1>Blood Pressure Tracker</h1>
        <div style="font-size: 1.1em; color: #555;">
            Welcome, **<?php echo htmlspecialchars($_SESSION['username']); ?>!**
            <a href="logout.php" style="margin-left: 15px; color: #dc3545; text-decoration: none;">Logout</a>
        </div>
    </header>

    <div id="input-section" class="input-form-container">
        <h2>Enter New Reading</h2>
        <input type="number" id="systolic" placeholder="Systolic (mmHg)" required>
        <input type="number" id="diastolic" placeholder="Diastolic (mmHg)" required>
        <input type="number" id="pulse" placeholder="Pulse (bpm)">
        <textarea id="notes" placeholder="Notes (optional)"></textarea>
        <button onclick="addReading()">Add Reading</button>
    </div>

    ---

    <div id="averages-section" class="input-form-container" style="max-width: 600px;">
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

    ---

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

    ---

    <div id="chart-section">
        <h2>Blood Pressure Chart</h2>
        <canvas id="bpChart"></canvas>
    </div>

    <script src="javascript/script.js"></script>
</body>
</html>