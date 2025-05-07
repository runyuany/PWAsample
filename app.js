// JS file for cycleTracker app

// -------------
// Variable declarations
// -------------
let newPeriodFormEl;
let startDateInputEl;
let endDateInputEl;
let pastPeriodContainer;

// Storage key is an app-wide constant
const STORAGE_KEY = 'period-tracker';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM elements
  newPeriodFormEl = document.getElementsByTagName('form')[0];
  startDateInputEl = document.getElementById('start-date');
  endDateInputEl = document.getElementById('end-date');
  pastPeriodContainer = document.getElementById('past-periods');

  // Add event listener
  newPeriodFormEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const startDate = startDateInputEl.value;
    const endDate = endDateInputEl.value;
    if (checkDatesInvalid(startDate, endDate)) {
      return;
    }
    storeNewPeriod(startDate, endDate);
    renderPastPeriods();
    newPeriodFormEl.reset();
  });

  // Initial render
  renderPastPeriods();
});

// -------------
// Event Handlers
// -------------

// -------------
// Functionality
// -------------

// 1. Form validation
function checkDatesInvalid(startDate, endDate) {
  if (!startDate || !endDate || startDate > endDate) {
    newPeriodFormEl.reset();
    return true;
  }
  return false;
}

// 2. Get, add, sort, and store data
function storeNewPeriod(startDate, endDate) {
  const periods = getAllStoredPeriods();
  periods.push({ startDate, endDate });
  periods.sort((a, b) => {
    return new Date(b.startDate) - new Date(a.startDate);
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
}

// 3. Get and parse data
function getAllStoredPeriods() {
  const data = window.localStorage.getItem(STORAGE_KEY);
  console.log('Raw data from localStorage:', data);
  const periods = data ? JSON.parse(data) : [];
  console.log('Parsed periods:', periods);
  return periods;
}

// 4. Display data
function renderPastPeriods() {
  console.log('Starting renderPastPeriods');
  const pastPeriodHeader = document.createElement('h2');
  const pastPeriodList = document.createElement('ul');
  const periods = getAllStoredPeriods();
  console.log('Periods to render:', periods);
  
  pastPeriodContainer.innerHTML = '';
  
  if (periods.length === 0) {
    console.log('No periods found');
    pastPeriodHeader.textContent = 'No periods tracked yet';
    pastPeriodContainer.appendChild(pastPeriodHeader);
    return;
  }
  
  console.log('Rendering periods');
  pastPeriodHeader.textContent = 'Past periods';
  periods.forEach((period) => {
    const periodEl = document.createElement('li');
    periodEl.textContent = `From ${formatDate(
      period.startDate
    )} to ${formatDate(period.endDate)}`;
    pastPeriodList.appendChild(periodEl);
  });

  pastPeriodContainer.appendChild(pastPeriodHeader);
  pastPeriodContainer.appendChild(pastPeriodList);
}

// 5. format dates for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { timeZone: 'UTC' });
}
