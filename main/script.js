// DOM Elements
const searchTabs = document.querySelectorAll('.tab');
const returnGroup = document.getElementById('returnGroup');
const flightSearchForm = document.getElementById('flightSearchForm');
const promoToggle = document.getElementById('promoToggle');
const promoBox = document.getElementById('promoBox');
const promoCodeInput = document.getElementById('promoCode');

// Check if user is an agent (based on promo code)
let isAgent = false;

// Search tabs
searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        searchTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show/hide return date based on tab
        const tabType = tab.getAttribute('data-tab');
        if (tabType === 'oneway') {
            returnGroup.style.display = 'none';
        } else {
            returnGroup.style.display = 'flex';
        }
    });
});

// Promo toggle
promoToggle.addEventListener('click', () => {
    promoBox.classList.toggle('active');
});

// Flight search form submission
flightSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get IATA codes from data attributes
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const originIata = originInput.dataset.iata;
    const destinationIata = destinationInput.dataset.iata;
    
    const departure = document.getElementById('departure').value;
    const returnDate = document.getElementById('return').value;
    const passengers = document.getElementById('passengers').value;
    
    // --- UPDATED PROMO CODE LOGIC ---
    const AGENT_PROMO_CODE = "AGENT2023"; // The specific code for agents
    const enteredPromoCode = promoCodeInput.value.trim();

    if (enteredPromoCode !== '' && enteredPromoCode !== AGENT_PROMO_CODE) {
        alert("Invalid promo code. Continuing as a regular user.");
    }
    
    isAgent = (enteredPromoCode === AGENT_PROMO_CODE);
    // --- END OF UPDATED LOGIC ---

    // Basic validation
    if (!originIata || !destinationIata || !departure) {
        alert('Please select valid airports from the suggestions for Origin and Destination.');
        return;
    }
    
    // Redirect to results.html with query params
    const url = `../result/result.html?origin=${originIata}&destination=${destinationIata}&departure=${departure}&returnDate=${returnDate}&passengers=${passengers}&isAgent=${isAgent}`;
    window.location.href = url;
});// Flight search form submission
flightSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get IATA codes from data attributes
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const originIata = originInput.dataset.iata;
    const destinationIata = destinationInput.dataset.iata;
    
    const departure = document.getElementById('departure').value;
    const returnDate = document.getElementById('return').value;
    const passengers = document.getElementById('passengers').value;
    
    // --- UPDATED PROMO CODE LOGIC ---
    const AGENT_PROMO_CODE = "AGENT2023"; // The specific code for agents
    const enteredPromoCode = promoCodeInput.value.trim();

    // Validate promo code if entered
    let validPromoCode = null;
    if (enteredPromoCode !== '') {
        if (enteredPromoCode === AGENT_PROMO_CODE) {
            validPromoCode = enteredPromoCode; // Valid agent code
        } else {
            alert("Invalid promo code. Continuing as a regular user.");
            // Continue without a promo code
        }
    }
    // --- END OF UPDATED LOGIC ---

    // Basic validation
    if (!originIata || !destinationIata || !departure) {
        alert('Please select valid airports from the suggestions for Origin and Destination.');
        return;
    }
    
    // Build URL parameters
    const params = new URLSearchParams();
    params.append('origin', originIata);
    params.append('destination', destinationIata);
    params.append('departure', departure);
    params.append('passengers', passengers);
    
    if (returnDate) {
        params.append('returnDate', returnDate);
    }
    
    // Only add promoCode if it's valid
    if (validPromoCode) {
        params.append('promoCode', validPromoCode);
    }
    
    // Redirect to results.html with query params
    const url = `../result/result.html?${params.toString()}`;
    window.location.href = url;
});

// ===================================================================
// Airport Autocomplete Functionality
// ===================================================================

/**
 * Sets up the autocomplete functionality for a given input field.
 * @param {HTMLInputElement} inputElement - The input field to attach autocomplete to.
 * @param {HTMLDivElement} suggestionsBox - The div to display suggestions in.
 * @param {Array} airportsData - The array of airport objects.
 */
function setupAutocomplete(inputElement, suggestionsBox, airportsData) {
    inputElement.addEventListener('input', () => {
        const query = inputElement.value.toLowerCase();
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        // Filter airports based on name, city, or country
        const filteredAirports = airportsData.filter(airport =>
            airport.name.toLowerCase().includes(query) ||
            airport.City.toLowerCase().includes(query) ||
            airport.country_name.toLowerCase().includes(query)
        );

        // Clear previous suggestions
        suggestionsBox.innerHTML = '';

        if (filteredAirports.length > 0) {
            filteredAirports.slice(0, 10).forEach(airport => {
                const item = document.createElement('div');
                item.classList.add('suggestion-item');
                // Display format: "Name (City, Country)"
                item.textContent = `${airport.name} (${airport.City}, ${airport.country_name})`;
                
                item.addEventListener('click', () => {
                    // Set the input field's visible value
                    inputElement.value = item.textContent;
                    // Store the IATA code in a data attribute for later use
                    inputElement.dataset.iata = airport.iata;
                    // Hide suggestions
                    suggestionsBox.style.display = 'none';
                });
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!inputElement.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });
}

/**
 * Fetches airport data and initializes the autocomplete fields.
 */
async function initializeAutocomplete() {
    try {
        const response = await fetch('./filtered_airports.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const airportsData = await response.json();
        
        // Get the DOM elements for autocomplete
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const originSuggestionsBox = document.getElementById('originSuggestions');
        const destinationSuggestionsBox = document.getElementById('destinationSuggestions');

        // Setup autocomplete for both fields
        setupAutocomplete(originInput, originSuggestionsBox, airportsData);
        setupAutocomplete(destinationInput, destinationSuggestionsBox, airportsData);

    } catch (error) {
        console.error("Could not load airport data:", error);
    }
}

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
document.getElementById('departure').value = today;
document.getElementById('departure').setAttribute('min', today);
document.getElementById('return').setAttribute('min', today);

// Call the function to initialize everything when the script loads
initializeAutocomplete();