// Ensure this part is at the top of your script.js if not already there
document.addEventListener('DOMContentLoaded', function() {
    // Input elements for adding readings (ensure these IDs match your HTML)
    const systolicInput = document.getElementById('systolic');
    const diastolicInput = document.getElementById('diastolic');
    const pulseInput = document.getElementById('pulse');
    const notesInput = document.getElementById('notes');

    // Chart initialization
    const bpChartCanvas = document.getElementById('bpChart');
    let bpChart; // Declare chart variable to be accessible later

    // Only initialize the chart if the canvas element exists (i.e., on index.html)
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
                maintainAspectRatio: false,
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
                title: { // Chart Title
                    display: true,
                    text: 'Blood Pressure Trends Over Time',
                    position: 'top',
                    font: {
                        size: 16,
                        weight: 'bold',
                        color: '#333'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    },
                    align: 'center'
                },
                legend: { // Chart Legend
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
                tooltips: { // Chart Tooltips
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
                },
                scales: { // Chart Axes
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

    // FullCalendar Initialization
    var calendarEl = document.getElementById('calendar');
    if (calendarEl) { // Only initialize calendar if the element exists (i.e., on index.html)
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: function(fetchInfo, successCallback, failureCallback) {
                fetch('get_calendar_events.php')
                .then(response => response.json())
                .then(data => {
                    const events = data.map(reading => ({
                        title: `${reading.systolic}/${reading.diastolic} mmHg`,
                        start: reading.timestamp,
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


    // Function to add a new reading
    // (Ensure this function is global or accessible from your HTML button's onclick)
    window.addReading = async function() { // Made it a global function
        const systolic = parseInt(systolicInput.value);
        const diastolic = parseInt(diastolicInput.value);
        const pulse = parseInt(pulseInput.value || 0);
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
                    fetchAndDisplayReadings(); // Reload readings after adding
                    // Clear form fields
                    systolicInput.value = '';
                    diastolicInput.value = '';
                    pulseInput.value = '';
                    notesInput.value = '';
                    // alert(data.message || 'Reading added successfully.'); // Removed alert as per previous discussion
                } else {
                    alert(data.message || 'Failed to save reading.');
                }
            } catch (error) {
                console.error('Error saving reading:', error);
                alert('Failed to save reading.');
            }
        } else {
            alert('Please enter valid systolic and diastolic readings.');
        }
    }


    // Function to fetch and display readings (list and chart)
    window.fetchAndDisplayReadings = async function() { // Made it global
        try {
            const response = await fetch('get_readings.php');
            const readings = await response.json();

            // Display in list
            const readingList = document.getElementById('reading-list');
            if (readingList) { // Check if list exists on this page
                readingList.innerHTML = ''; // Clear previous readings
                readings.forEach(reading => {
                    const li = document.createElement('li');
                    const date = new Date(reading.timestamp).toLocaleString();
                    li.textContent = `${date}: Systolic ${reading.systolic}, Diastolic ${reading.diastolic}, Pulse ${reading.pulse || '-'}`;
                    if (reading.notes) {
                        li.textContent += ` (Notes: ${reading.notes})`;
                    }
                    readingList.appendChild(li);
                });
            }

            // Update chart if it's initialized
            if (bpChart) {
                updateChart(readings);
            }
            // Update calendar if it's initialized (FullCalendar usually updates itself if events are dynamic,
            // but if new events are added, you might need to refetch if not using URL directly)
            if (calendarEl && calendarEl.fullCalendar) { // Check if FullCalendar is initialized on this element
                 calendar.refetchEvents(); // Instruct FullCalendar to re-fetch its events
            }

        } catch (error) {
            console.error('Error fetching readings:', error);
            // alert('Failed to load readings.'); // Removed alert for cleaner UX
        }
    }

    // Function to update the Chart.js chart
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

    // Initial load of readings when the page loads
    fetchAndDisplayReadings();
});



