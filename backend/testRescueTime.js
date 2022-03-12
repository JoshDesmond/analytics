import RescueTime from './RescueTime.js';

const testProductivityPulseData = {
    notes: 'data is an array of arrays (rows), column names for rows in row_headers',
    row_headers: [
        'Date',
        'Time Spent (seconds)',
        'Number of People',
        'Productivity'
    ],
    rows: [
        ['2022-03-12T00:00:00', 2327, 1, -2],
        ['2022-03-12T00:00:00', 950, 1, 0],
        ['2022-03-12T00:00:00', 918, 1, 1],
        ['2022-03-12T00:00:00', 720, 1, -1],
        ['2022-03-12T00:00:00', 142, 1, 2]
    ]
}

const rt = new RescueTime();
const pp = rt._calculateProductivityPulse(testProductivityPulseData);
console.log(pp);
