const systolicInput = document.getElementById('systolic');


const diastolicInput = document.getElementById('diastolic');


const pulseInput = document.getElementById('pulse');


const notesInput = document.getElementById('notes'); // Add a notes input field in your HTML


const readingList = document.getElementById('reading-list');


const bpChartCanvas = document.getElementById('bpChart');


const bpChart = new Chart(bpChartCanvas, {


    type: 'line',


    data: {


        labels: [],


        datasets: [


            {


                label: 'Systolic (mmHg)',


                data: [],


                borderColor: 'red',


                fill: false,


                tension: 0.3 // Optional: for smoother lines


            },


            {


                label: 'Diastolic (mmHg)',


                data: [],


                borderColor: 'blue',


                fill: false,


                tension: 0.3 // Optional: for smoother lines


            },


            {


                label: 'Pulse (bpm)',


                data: [],


                borderColor: 'green',


                fill: false,


                tension: 0.3 // Optional: for smoother lines


            }


        ]


    },


    options: {


        background: 'rgba(230, 14, 14, 0.8)',


        scales: {


            y: {


                beginAtZero: false // Don't force the Y-axis to start at 0


            }


        }


    }


}); /* ... chart configuration ... */



async function addReading() {


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


                    'Content-Type': 'application/x-www-form-urlencoded' // Important for PHP $_POST


                },


                body: new URLSearchParams(newReading) // Encode data for form submission


            });


            const data = await response.json();


            if (data.success) {


                fetchAndDisplayReadings(); // Reload readings after adding


                systolicInput.value = '';


                diastolicInput.value = '';


                pulseInput.value = '';


                notesInput.value = '';


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



async function fetchAndDisplayReadings() {


    try {


        const response = await fetch('get_readings.php');


        const readings = await response.json();


        console.log("Data received from PHP:", readings);


        displayReadings(readings);


        updateChart(readings);


    } catch (error) {


        console.error('Error fetching readings:', error);


        // alert('Failed to load readings.');


    }


}



function displayReadings(readings) {


    readingList.innerHTML = '';


    readings.forEach(reading => {


        const listItem = document.createElement('li');


        const formattedTimestamp = new Date(reading.timestamp).toLocaleString();


        listItem.textContent = `${formattedTimestamp}: ${reading.systolic}/${reading.diastolic} mmHg (Pulse: ${reading.pulse || '-'}) ${reading.notes ? '- Notes: ' + reading.notes : ''}`;


        readingList.appendChild(listItem);


    });


}



function updateChart(readings) {


    bpChart.data.labels = readings.map(r => new Date(r.timestamp).toLocaleDateString());


    bpChart.data.datasets[0].data = readings.map(r => r.systolic);


    bpChart.data.datasets[1].data = readings.map(r => r.diastolic);


    bpChart.data.datasets[2].data = readings.map(r => r.pulse);


    bpChart.update();


}



// Initial load of readings


fetchAndDisplayReadings();



// Update your HTML to include a notes input:


// <label for="notes">Notes (Optional):</label>


// <textarea id="notes"></textarea><br><br>



// const bpChartCanvas = document.getElementById('bpChart');




function updateChart(readings) {


    const dates = readings.map(r => new Date(r.timestamp).toLocaleDateString());


    const systolicData = readings.map(r => r.systolic);


    const diastolicData = readings.map(r => r.diastolic);


    const pulseData = readings.map(r => r.pulse);



    bpChart.data.labels = dates;


    bpChart.data.datasets[0].data = systolicData;


    bpChart.data.datasets[1].data = diastolicData;


    bpChart.data.datasets[2].data = pulseData; // Ensure pulse data is included



    bpChart.update();


}



// script for calendar section


document.addEventListener('DOMContentLoaded', function () {


    var calendarEl = document.getElementById('calendar');


    var calendar = new FullCalendar.Calendar(calendarEl, {


        initialView: 'dayGridMonth',


        events: function (fetchInfo, successCallback, failureCallback) {


            // Function to fetch events (your blood pressure readings)


            fetch('get_calendar_events.php', {


                method: 'GET',


                headers: {


                    'Content-Type': 'application/json'


                }


            })


                .then(response => response.json())


                .then(data => {


                    const events = data.map(reading => ({


                        title: `${reading.systolic}/${reading.diastolic} mmHg`,


                        start: reading.timestamp,


                        allDay: true, // Or false if you want to show specific times


                        extendedProps: reading // Store the full reading data


                    }));


                    successCallback(events);


                })


                .catch(error => {


                    console.error('Error fetching calendar events:', error);


                    failureCallback(error);


                });


        },


        eventClick: function (info) {


            // Handle clicking on an event (a blood pressure reading)


            const reading = info.event.extendedProps;


            alert(`Date: ${new Date(reading.timestamp).toLocaleString()}\nSystolic: ${reading.systolic}\nDiastolic: ${reading.diastolic}\nPulse: ${reading.pulse || '-'}\nNotes: ${reading.notes || ''}`);


            // You could also display more details in a specific area of your page


        }


    });


    calendar.render();


});


// inicialize calendar


document.addEventListener('DOMContentLoaded', function () {


    var calendarEl = document.getElementById('calendar');


    var calendar = new FullCalendar.Calendar(calendarEl, {


        initialView: 'dayGridMonth',


        events: 'get_calendar_events.php', // Simplest way if your PHP returns the correct format


        eventClick: function (info) {


            alert('Event: ' + info.event.title);


            // You can access more data via info.event.extendedProps


        }


    });


    calendar.render();


});

