// Function to calculate total hours worked for a single day
function calculateTotalHours(startTime, finishTime, breakHours, breakMinutes) {
    // Set break hours and break minutes to 0 if they are blank
    breakHours = breakHours.trim() === '' ? '0' : breakHours;
    breakMinutes = breakMinutes.trim() === '' ? '0' : breakMinutes;

    const start = new Date(`1970-01-01T${startTime}`);
    const finish = new Date(`1970-01-01T${finishTime}`);
    const hoursWorked = (finish - start) / 3600000; // Calculate hours worked

    const totalBreakMinutes = parseInt(breakHours) * 60 + parseInt(breakMinutes);
    const hoursWorkedAfterBreak = hoursWorked - (totalBreakMinutes / 60); // Subtract break time

    if (!isNaN(hoursWorkedAfterBreak) && hoursWorkedAfterBreak >= 0) {
        return hoursWorkedAfterBreak.toFixed(2);
    }

    return '';
}

// Rest of the code remains the same


// Function to get the date of last Monday and last Sunday
function getLastWeekDates() {
    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - (today.getDay() + 6) % 7); // Calculate last Sunday
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6); // Calculate last Monday
    return { lastMonday, lastSunday };
}

// Function to create a properly formatted CSV string
function createCSVString(formData, fullName) {
    const { lastMonday, lastSunday } = getLastWeekDates();
    const formattedLastMonday = lastMonday.toISOString().split('T')[0];
    const formattedLastSunday = lastSunday.toISOString().split('T')[0];

    const header = `Timesheet from ${formattedLastMonday} to ${formattedLastSunday} - ${fullName}\n`;
    const columnTitles = 'Day,Start Time,Finish Time,Break Hours,Break Minutes,Total Hours\n';
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let rows = '';
    let totalHoursWeek = 0;

    for (let dayIndex = 0; dayIndex < daysOfWeek.length; dayIndex++) {
        const day = daysOfWeek[dayIndex];
        const startTime = formData.get(`${day.toLowerCase()}-start`);
        const finishTime = formData.get(`${day.toLowerCase()}-finish`);
        const breakHours = formData.get(`${day.toLowerCase()}-break-hours`) || '';
        const breakMinutes = formData.get(`${day.toLowerCase()}-break-minutes`) || '';
        const totalHours = calculateTotalHours(startTime, finishTime, breakHours, breakMinutes);

        rows += `${day},${startTime || ''},${finishTime || ''},${breakHours || ''},${breakMinutes || ''},${totalHours}\n`;

        if (totalHours !== '') {
            totalHoursWeek += parseFloat(totalHours);
        }
    }

    const footer = `\nTotal Hours Worked This Week:,,,,,${totalHoursWeek.toFixed(2)}`;

    return header + columnTitles + rows + footer;
}

// Function to download the CSV
function downloadCSV(formData) {
    const fullName = formData.get('full-name');
    const csvString = createCSVString(formData, fullName);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const blobUrl = URL.createObjectURL(blob);

    // Get last Monday and last Sunday dates
    const { lastMonday, lastSunday } = getLastWeekDates();
    const formattedLastMonday = lastMonday.toISOString().split('T')[0];
    const formattedLastSunday = lastSunday.toISOString().split('T')[0];

    // Format the file name
    const fileName = `Timesheet_${fullName}_${formattedLastMonday}_${formattedLastSunday}.csv`;

    // Create an anchor element for downloading
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the Blob URL
    URL.revokeObjectURL(blobUrl);
}

// Event listener for the form submission
document.getElementById('timesheet-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    // Download the CSV file
    downloadCSV(formData);
});
