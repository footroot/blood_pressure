// script.js

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References ---
    const addReadingForm = document.getElementById('addReadingForm'); // The form for adding readings
    const systolicInput = document.getElementById('systolic');
    const diastolicInput = document.getElementById('diastolic');
    const pulseInput = document.getElementById('pulse');
    const notesInput = document.getElementById('notes');
    const readingDateInput = document.getElementById('reading_date'); // New: Date input
    const addReadingMessage = document.getElementById('addReadingMessage'); // For messages

    const readingList = document.getElementById('reading-list'); // For displaying the list of readings
    const logoutButton = document.getElementById('logoutButton'); // Logout button

    // Chart.js Initialization
    const bpChartCanvas = document.getElementById('bpChart');
    let bpChart; // Declare chart variable to be accessible later

    // FullCalendar Initialization
    const calendarEl = document.getElementById('calendar');
    let calendar; // Declare calendar variable to be accessible later


    // --- Set default date for reading_date input to today ---
    if (readingDateInput) {
        readingDateInput.valueAsDate = new Date();
    }

    // --- Chart.js Setup ---
    if (bpChartCanvas) {
        bpChart = new Chart(bpChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Systolic (mmHg)',
                        data: [],
                        borderColor: 'red',
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: 'red',
                        pointBorderColor: '#fff'
                    },
                    {
                        label: 'Diastolic (mmHg)',
                        data: [],
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 255, 0.2)',
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: 'blue',
                        pointBorderColor: '#fff'
                    },
                    {
                        label: 'Pulse (bpm)',
                        data: [],
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 128, 0, 0.2)',
                        fill: false,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: 'green',
                        pointBorderColor: '#fff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow chart to fill container better
                backgroundColor: 'rgba(240, 248, 255, 0.5)',
                borderColor: 'lightgray',
                borderWidth: 1,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 0,
                        bottom: 0
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Blood Pressure Trends Over Time',
                        font: {
                            size: 16,
                            weight: 'bold',
                            color: '#333'
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            font: {
                                size: 12,
                                color: '#666'
                            },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 12
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Blood Pressure (mmHg) / Pulse (bpm)',
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // --- FullCalendar Setup ---
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: function(fetchInfo, successCallback, failureCallback) {
                fetch('get_calendar_events.php')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Calendar data fetched:", data); // For debugging
                    const events = data.map(reading => ({
                        title: `${reading.systolic}/${reading.diastolic} mmHg`,
                        start: reading.timestamp, // Ensure this format is ISO 8601 or compatible
                        allDay: true,
                        extendedProps: reading
                    }));
                    successCallback(events);
                })
                .catch(error => {
                    console.error('Error fetching calendar events:', error);
                    failureCallback(error);
                });
            },
            eventClick: function(info) {
                const reading = info.event.extendedProps;
                alert(`Date: ${new Date(reading.timestamp).toLocaleString()}\nSystolic: ${reading.systolic}\nDiastolic: ${reading.diastolic}\nPulse: ${reading.pulse || '-'}\nNotes: ${reading.notes || ''}`);
            }
        });
        calendar.render();
    }


    // --- Blood Pressure Categorization Function ---
    function getBpCategory(systolic, diastolic) {
        if (systolic >= 180 || diastolic >= 120) {
            return 'Hypertensive Crisis';
        } else if (systolic >= 140 || diastolic >= 90) {
            return 'Hypertension Stage 2';
        } else if (systolic >= 130 || diastolic >= 80) {
            return 'Hypertension Stage 1';
        } else if (systolic >= 120 && diastolic < 80) {
            return 'Elevated';
        } else if (systolic < 120 && diastolic < 80) {
            return 'Normal';
        } else {
            return 'Uncategorized';
        }
    }


    // --- Average Calculation Function ---
    function calculateAverages(readings, days = null) {
        let filteredReadings = readings;
        if (days !== null) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filteredReadings = readings.filter(reading => new Date(reading.timestamp) >= cutoffDate);
        }

        if (filteredReadings.length === 0) {
            return { systolic: '--', diastolic: '--', pulse: '--' };
        }

        const totalSystolic = filteredReadings.reduce((sum, r) => sum + parseInt(r.systolic), 0);
        const totalDiastolic = filteredReadings.reduce((sum, r) => sum + parseInt(r.diastolic), 0);
        // Only include pulse in average if it's a valid number
        const validPulses = filteredReadings.filter(r => r.pulse && !isNaN(parseInt(r.pulse)));
        const totalPulse = validPulses.reduce((sum, r) => sum + parseInt(r.pulse), 0);

        const avgSystolic = (totalSystolic / filteredReadings.length).toFixed(0);
        const avgDiastolic = (totalDiastolic / filteredReadings.length).toFixed(0);
        const avgPulse = validPulses.length > 0 ? (totalPulse / validPulses.length).toFixed(0) : '--';

        return {
            systolic: avgSystolic,
            diastolic: avgDiastolic,
            pulse: avgPulse
        };
    }


    // --- Function to Update Chart.js Chart ---
    function updateChart(readings) {
        // Sort readings by timestamp to ensure chronological order for the chart
        readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const dates = readings.map(r => {
            const d = new Date(r.timestamp);
            return `${d.getMonth() + 1}/${d.getDate()}`; // MM/DD format
        });
        const systolicData = readings.map(r => r.systolic);
        const diastolicData = readings.map(r => r.diastolic);
        const pulseData = readings.map(r => r.pulse);

        bpChart.data.labels = dates;
        bpChart.data.datasets[0].data = systolicData;
        bpChart.data.datasets[1].data = diastolicData;
        bpChart.data.datasets[2].data = pulseData;

        bpChart.update();
    }


    // --- Function to Display All Readings (List, Chart, Averages, Calendar) ---
    // Made global so it can be called from add_reading success
    window.fetchAndDisplayReadings = async function() {
        try {
            const response = await fetch('get_readings.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const readings = await response.json();
            console.log("Fetched Readings:", readings); // For debugging

            // Display in list
            if (readingList) {
                readingList.innerHTML = ''; // Clear previous readings
                // Sort readings by timestamp descending (newest first) for the list
                readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                if (readings.length === 0) {
                    readingList.innerHTML = '<li class="no-readings">No readings yet. Add one above!</li>';
                } else {
                    readings.forEach(reading => {
                        const li = document.createElement('li');
                        // Format the timestamp for display
                        const readingDateTime = new Date(reading.timestamp);
                        const formattedDate = readingDateTime.toLocaleDateString();
                        const formattedTime = readingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        const category = getBpCategory(reading.systolic, reading.diastolic);
                        li.classList.add('reading-item');
                        li.classList.add('category-' + category.toLowerCase().replace(/ /g, '-'));

                        let readingText = `${formattedDate} ${formattedTime}: ${reading.systolic}/${reading.diastolic} mmHg`;
                        if (reading.pulse && reading.pulse !== '0') { // Only add pulse if it's not empty or zero
                            readingText += `, Pulse ${reading.pulse} bpm`;
                        }
                        if (reading.notes) {
                            readingText += ` (Notes: ${reading.notes})`;
                        }

                        // Add delete button
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.classList.add('delete-btn');
                        deleteBtn.onclick = function() {
                            deleteReading(reading.id);
                        };

                        li.innerHTML = `<span>${readingText}</span>`;
                        li.appendChild(deleteBtn);
                        readingList.appendChild(li);
                    });
                }
            }

            // Calculate and Display Averages
            const avg7d = calculateAverages(readings, 7);
            document.getElementById('avg-systolic-7d').textContent = avg7d.systolic;
            document.getElementById('avg-diastolic-7d').textContent = avg7d.diastolic;
            document.getElementById('avg-pulse-7d').textContent = avg7d.pulse;

            const avg30d = calculateAverages(readings, 30);
            document.getElementById('avg-systolic-30d').textContent = avg30d.systolic;
            document.getElementById('avg-diastolic-30d').textContent = avg30d.diastolic;
            document.getElementById('avg-pulse-30d').textContent = avg30d.pulse;

            const avgAllTime = calculateAverages(readings, null);
            document.getElementById('avg-systolic-alltime').textContent = avgAllTime.systolic;
            document.getElementById('avg-diastolic-alltime').textContent = avgAllTime.diastolic;
            document.getElementById('avg-pulse-alltime').textContent = avgAllTime.pulse;

            // Update chart if it's initialized
            if (bpChart) {
                updateChart(readings);
            }

            // Tell FullCalendar to refetch its events.
            if (calendar) {
                calendar.refetchEvents();
            }

        } catch (error) {
            console.error('Error fetching readings:', error);
            // Optionally display a user-friendly error message
            if (readingList) {
                readingList.innerHTML = '<li class="error-message">Failed to load readings. Please try again.</li>';
            }
        }
    };


    // --- Event Listener for Adding a New Reading ---
    if (addReadingForm) {
        addReadingForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            addReadingMessage.textContent = ''; // Clear previous messages
            addReadingMessage.className = 'message'; // Reset message class

            const systolic = parseInt(systolicInput.value);
            const diastolic = parseInt(diastolicInput.value);
            const pulse = parseInt(pulseInput.value || '0'); // Default to 0 if empty
            const notes = notesInput.value.trim();
            const reading_date = readingDateInput.value; // Get the date value

            // Client-side validation
            if (isNaN(systolic) || isNaN(diastolic) || !reading_date) {
                addReadingMessage.textContent = 'Please enter valid systolic, diastolic, and a date.';
                addReadingMessage.classList.add('error');
                return;
            }

            try {
                const response = await fetch('add_reading.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        systolic: systolic,
                        diastolic: diastolic,
                        pulse: pulse,
                        notes: notes,
                        reading_date: reading_date // Include the date
                    }).toString()
                });

                const data = await response.json();

                if (data.success) {
                    addReadingMessage.textContent = data.message;
                    addReadingMessage.classList.add('success');
                    // Clear form fields after successful submission
                    systolicInput.value = '';
                    diastolicInput.value = '';
                    pulseInput.value = '';
                    notesInput.value = '';
                    readingDateInput.valueAsDate = new Date(); // Reset date to today

                    fetchAndDisplayReadings(); // Reload all data displays
                } else {
                    addReadingMessage.textContent = data.message || 'Failed to save reading.';
                    addReadingMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error saving reading:', error);
                addReadingMessage.textContent = 'An unexpected error occurred while saving. Please try again.';
                addReadingMessage.classList.add('error');
            }
        });
    }

    // --- Function to Delete a Reading ---
    window.deleteReading = async function(readingId) {
        if (!confirm('Are you sure you want to delete this reading?')) {
            return;
        }

        try {
            const response = await fetch('delete_reading.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${readingId}` // Send the ID of the reading to delete
            });

            const data = await response.json();

            if (data.success) {
                console.log(data.message); // Log success
                fetchAndDisplayReadings(); // Reload all data displays
            } else {
                alert(data.message || 'Failed to delete reading.');
            }
        } catch (error) {
            console.error('Error deleting reading:', error);
            alert('An unexpected error occurred while deleting. Please try again.');
        }
    };

    // --- Event Listener for Logout Button ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async function() {
            if (confirm('Are you sure you want to log out?')) {
                try {
                    const response = await fetch('logout.php', {
                        method: 'POST', // Use POST for logout to prevent CSRF via GET
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });
                    const data = await response.json(); // Assuming logout.php returns JSON

                    if (data.success) {
                        window.location.href = 'login.html'; // Redirect to login page on successful logout
                    } else {
                        alert(data.message || 'Failed to log out.');
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                    alert('An error occurred during logout. Please try again.');
                }
            }
        });
    }

    // --- Initial Load of Readings when the Page Loads ---
    // This calls the main function to populate all data displays.
    window.fetchAndDisplayReadings();

}); // End of DOMContentLoaded