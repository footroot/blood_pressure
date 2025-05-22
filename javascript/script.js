// script.js

// Ensure all code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Element References ---
    // Input elements for adding readings (ensure these IDs match your HTML)
    const systolicInput = document.getElementById('systolic');
    const diastolicInput = document.getElementById('diastolic');
    const pulseInput = document.getElementById('pulse');
    const notesInput = document.getElementById('notes');
    const readingList = document.getElementById('reading-list'); // For displaying the list of readings

    // Chart.js Initialization
    const bpChartCanvas = document.getElementById('bpChart');
    let bpChart; // Declare chart variable to be accessible later

    // FullCalendar Initialization
    const calendarEl = document.getElementById('calendar');
    let calendar; // Declare calendar variable to be accessible later


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
                maintainAspectRatio: true,
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
                plugins: { // Use 'plugins' for Chart.js v3+ options like title and legend
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
                    tooltip: { // Use 'tooltip' for tooltips
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
                    if (!response.ok) { // Check if response is OK
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
        const totalPulse = filteredReadings.reduce((sum, r) => sum + (parseInt(r.pulse) || 0), 0);

        const avgSystolic = (totalSystolic / filteredReadings.length).toFixed(0);
        const avgDiastolic = (totalDiastolic / filteredReadings.length).toFixed(0);
        const avgPulse = (totalPulse / filteredReadings.length).toFixed(0);

        return {
            systolic: avgSystolic,
            diastolic: avgDiastolic,
            pulse: avgPulse
        };
    }


    // --- Function to Update Chart.js Chart ---
    function updateChart(readings) {
        const dates = readings.map(r => new Date(r.timestamp).toLocaleDateString());
        const systolicData = readings.map(r => r.systolic);
        const diastolicData = readings.map(r => r.diastolic);
        const pulseData = readings.map(r => r.pulse);

        bpChart.data.labels = dates;
        bpChart.data.datasets[0].data = systolicData;
        bpChart.data.datasets[1].data = diastolicData;
        bpChart.data.datasets[2].data = pulseData;

        bpChart.update();
    }


    // --- Main Function to Fetch and Display All Readings (List, Chart, Averages, Calendar) ---
    window.fetchAndDisplayReadings = async function() {
        try {
            const response = await fetch('get_readings.php');
            const readings = await response.json();

            // Display in list
            if (readingList) {
                readingList.innerHTML = ''; // Clear previous readings
                readings.forEach(reading => {
                    const li = document.createElement('li');
                    const date = new Date(reading.timestamp).toLocaleString();
                    const category = getBpCategory(reading.systolic, reading.diastolic);
                    li.classList.add('category-' + category.toLowerCase().replace(/ /g, '-'));
                    li.textContent = `${date}: Systolic ${reading.systolic}, Diastolic ${reading.diastolic}, Pulse ${reading.pulse || '-'}`;
                    if (reading.notes) {
                        li.textContent += ` (Notes: ${reading.notes})`;
                    }
                    readingList.appendChild(li);
                });
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

            // Tell FullCalendar to refetch its events. This is key for updates!
            if (calendar) { // Ensure calendar object exists
                calendar.refetchEvents();
            }

        } catch (error) {
            console.error('Error fetching readings:', error);
        }
    }


    // --- Function to Add a New Reading ---
    // (This function is made global so it can be called from the HTML button's onclick)
    window.addReading = async function() {
        const systolic = parseInt(systolicInput.value);
        const diastolic = parseInt(diastolicInput.value);
        const pulse = parseInt(pulseInput.value || 0); // Default to 0 if pulse is empty
        const notes = notesInput.value;

        if (!isNaN(systolic) && !isNaN(diastolic)) {
            const newReading = { systolic, diastolic, pulse, notes };
            try {
                const response = await fetch('add_reading.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(newReading)
                });
                const data = await response.json();
                if (data.success) {
                    fetchAndDisplayReadings(); // Reload all displays after adding
                    // Clear form fields
                    systolicInput.value = '';
                    diastolicInput.value = '';
                    pulseInput.value = '';
                    notesInput.value = '';
                } else {
                    alert(data.message || 'Failed to save reading.');
                }
            } catch (error) {
                console.error('Error saving reading:', error);
                alert('Failed to save reading due to a network error.');
            }
        } else {
            alert('Please enter valid systolic and diastolic readings.');
        }
    }

    // --- Initial Load of Readings when the Page Loads ---
    // This calls the main function to populate all data displays.
    window.fetchAndDisplayReadings();

}); // End of DOMContentLoaded