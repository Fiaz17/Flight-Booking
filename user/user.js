// Get flight data from URL
const params = new URLSearchParams(window.location.search);
const flightJSON = params.get("flight");
let flight;

try {
    flight = JSON.parse(decodeURIComponent(flightJSON));
    
    // Generate flight summary HTML
    generateFlightSummary();
} catch (e) {
    console.error("Error parsing flight data:", e);
}

// Generate flight summary HTML
function generateFlightSummary() {
    const flightSummary = document.getElementById('flightSummary');
    let summaryHTML = '';
    
    // Outbound flight
    summaryHTML += `
        <div class="flight-leg">
            <div class="flight-leg-header">
                <h3>Outbound Flight</h3>
                <span>${new Date(flight.dep.at).toLocaleDateString()}</span>
            </div>
            <div class="flight-details">
                <img src="https://content.airhex.com/content/logos/airlines_${flight.carrierCode}_200_200_s.png" 
                        alt="${flight.airlineName}" 
                        onerror="this.src='https://via.placeholder.com/80?text=${flight.carrierCode}'">
                <div class="flight-info">
                    <p class="route">${flight.dep.iataCode} to ${flight.arr.iataCode}</p>
                    <p>${flight.airlineName}</p>
                    <div class="time">
                        <i class="fas fa-clock"></i>
                        <span>${flight.duration}</span>
                    </div>
                </div>
                <div class="price-tag">BDT ${flight.price.toFixed(2)}</div>
            </div>
        </div>
    `;
    
    // Return flight if exists
    if (flight.returnItinerary) {
        const returnFlight = flight.returnItinerary;
        summaryHTML += `
            <div class="flight-leg return">
                <div class="flight-leg-header">
                    <h3>Return Flight</h3>
                    <span>${new Date(returnFlight.dep.at).toLocaleDateString()}</span>
                </div>
                <div class="flight-details">
                    <img src="https://content.airhex.com/content/logos/airlines_${returnFlight.carrierCode}_200_200_s.png" 
                            alt="${returnFlight.airlineName}" 
                            onerror="this.src='https://via.placeholder.com/80?text=${returnFlight.carrierCode}'">
                    <div class="flight-info">
                        <p class="route">${returnFlight.dep.iataCode} to ${returnFlight.arr.iataCode}</p>
                        <p>${returnFlight.airlineName}</p>
                        <div class="time">
                            <i class="fas fa-clock"></i>
                            <span>${returnFlight.duration}</span>
                        </div>
                    </div>
                    <div class="price-tag">BDT ${returnFlight.price.toFixed(2)}</div>
                </div>
            </div>
        `;
        
        // Total price for round trip
        const totalPrice = flight.price + returnFlight.price;
        summaryHTML += `
            <div class="total-price">
                <h3>Total Price (Round Trip)</h3>
                <div class="amount">BDT ${totalPrice.toFixed(2)}</div>
            </div>
        `;
    } else {
        // Single flight total
        summaryHTML += `
            <div class="total-price">
                <h3>Total Price</h3>
                <div class="amount">BDT ${flight.price.toFixed(2)}</div>
            </div>
        `;
    }
    
    flightSummary.innerHTML = summaryHTML;
}

// Handle form submission
document.getElementById('passengerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    nationality: document.getElementById('nationality').value,
    passport: document.getElementById('passport').value
    };
    
    // Combine flight and passenger data
    const bookingData = {
    flight: flight,
    passenger: formData
    };
    
    // Redirect to ticket page with combined data
    const encodedData = encodeURIComponent(JSON.stringify(bookingData));
    window.location.href = `../ticket/ticket.html?data=${encodedData}`;
});
