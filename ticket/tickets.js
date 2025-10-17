// Global variables
let bookingData = null;
let hasReturnFlight = false;

// Debug function
function toggleDebug() {
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.classList.toggle('show');
}

// Update debug information
function updateDebugInfo(message, data = null) {
    const debugContent = document.getElementById('debugContent');
    const timestamp = new Date().toLocaleTimeString();
    debugContent.textContent = `[${timestamp}] ${message}\n`;
    if (data) {
    debugContent.textContent += JSON.stringify(data, null, 2);
    }
}

// Get booking data from URL
function loadBookingData() {
    const params = new URLSearchParams(window.location.search);
    const dataJSON = params.get("data");
    
    updateDebugInfo("Loading booking data from URL...");
    
    if (!dataJSON) {
    updateDebugInfo("No data parameter found in URL");
    showErrorMessage("No booking data found. Please go back and complete your booking.");
    return false;
    }
    
    try {
    bookingData = JSON.parse(decodeURIComponent(dataJSON));
    updateDebugInfo("Successfully parsed booking data", bookingData);
    
    // Check for return flight in multiple possible locations
    hasReturnFlight = false;
    if (bookingData.returnItinerary) {
        hasReturnFlight = true;
        updateDebugInfo("Found return flight in returnItinerary");
    } else if (bookingData.returnFlight) {
        hasReturnFlight = true;
        updateDebugInfo("Found return flight in returnFlight");
    } else if (bookingData.flight && bookingData.flight.returnItinerary) {
        hasReturnFlight = true;
        bookingData.returnItinerary = bookingData.flight.returnItinerary;
        updateDebugInfo("Found return flight in flight.returnItinerary");
    } else if (bookingData.flight && bookingData.flight.returnFlight) {
        hasReturnFlight = true;
        bookingData.returnFlight = bookingData.flight.returnFlight;
        updateDebugInfo("Found return flight in flight.returnFlight");
    }
    
    if (!hasReturnFlight) {
        updateDebugInfo("No return flight found in any expected location");
    }
    
    return true;
    } catch (e) {
    updateDebugInfo("Error parsing booking data: " + e.message);
    showErrorMessage("Invalid booking data. Please go back and try again.");
    return false;
    }
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message message-error show';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.querySelector('.card-body').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize page with flight data
function initializePage() {
    if (!loadBookingData()) {
    return;
    }
    
    // Update outbound booking summary
    if (bookingData.passenger) {
    document.getElementById('passengerName').textContent = 
        `${bookingData.passenger.firstName || ''} ${bookingData.passenger.lastName || ''}`.trim();
    document.getElementById('passengerEmail').textContent = bookingData.passenger.email || '-';
    document.getElementById('passengerPhone').textContent = bookingData.passenger.phone || '-';
    }
    
    // Get flight data (could be in different locations)
    const outboundFlight = bookingData.flight || bookingData.outboundFlight || bookingData;
    const returnFlight = bookingData.returnItinerary || bookingData.returnFlight;
    
    if (outboundFlight) {
    document.getElementById('flightName').textContent = outboundFlight.airlineName || '-';
    document.getElementById('flightDuration').textContent = outboundFlight.duration || '-';
    document.getElementById('flightPrice').textContent = outboundFlight.price ? 
        `BDT ${outboundFlight.price.toFixed(2)}` : '-';
    
    // Generate flight segments for outbound flight
    generateFlightSegments('outbound', outboundFlight);
    }
    
    // Handle return flight
    if (hasReturnFlight && returnFlight) {
    // Show return tab
    document.getElementById('returnTab').style.display = 'block';
    document.getElementById('returnTicketTab').style.display = 'block';
    
    // Hide no data messages
    document.getElementById('noReturnData').style.display = 'none';
    document.getElementById('noReturnTicketData').style.display = 'none';
    document.getElementById('returnFlightRoute').style.display = 'block';
    document.getElementById('returnBookingDetails').style.display = 'grid';
    document.getElementById('returnTicketContent').style.display = 'block';
    
    // Update return booking summary
    if (bookingData.passenger) {
        document.getElementById('returnPassengerName').textContent = 
        `${bookingData.passenger.firstName || ''} ${bookingData.passenger.lastName || ''}`.trim();
        document.getElementById('returnPassengerEmail').textContent = bookingData.passenger.email || '-';
        document.getElementById('returnPassengerPhone').textContent = bookingData.passenger.phone || '-';
    }
    
    document.getElementById('returnFlightName').textContent = returnFlight.airlineName || '-';
    document.getElementById('returnFlightDuration').textContent = returnFlight.duration || '-';
    document.getElementById('returnFlightPrice').textContent = returnFlight.price ? 
        `BDT ${returnFlight.price.toFixed(2)}` : '-';
    
    // Generate flight segments for return flight
    generateFlightSegments('return', returnFlight);
    } else {
    // Hide return tab
    document.getElementById('returnTab').style.display = 'none';
    document.getElementById('returnTicketTab').style.display = 'none';
    }
}

// Function to generate flight segments with transit information
function generateFlightSegments(type, flightData) {
    const segmentsContainer = document.getElementById(`${type}FlightSegments`);
    const routeTitle = document.getElementById(`${type}RouteTitle`);
    const flightDate = document.getElementById(`${type}FlightDate`);
    
    if (!flightData || !flightData.dep || !flightData.arr) {
    updateDebugInfo(`Invalid flight data for ${type}`, flightData);
    return;
    }
    
    // Set route title dynamically from flight data
    routeTitle.textContent = `${flightData.dep.iataCode} to ${flightData.arr.iataCode}`;
    
    // Set flight date
    const departureDate = new Date(flightData.dep.at);
    flightDate.textContent = departureDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
    });
    
    // Clear existing segments
    segmentsContainer.innerHTML = '';
    
    // Check for stops or transits
    const stops = flightData.stops || flightData.transits || flightData.stopData || [];
    
    if (stops && stops.length > 0) {
    // Create segments for each leg of the journey
    const allStops = [flightData.dep, ...stops, flightData.arr];
    
    for (let i = 0; i < allStops.length - 1; i++) {
        const departure = allStops[i];
        const arrival = allStops[i + 1];
        
        // Create segment
        const segment = document.createElement('div');
        segment.className = 'flight-segment';
        
        // Create segment icon
        const segmentIcon = document.createElement('div');
        segmentIcon.className = 'segment-icon';
        
        const icon = document.createElement('i');
        icon.className = i === 0 ? 'fas fa-plane-departure' : 'fas fa-plane';
        
        segmentIcon.appendChild(icon);
        
        // Create segment details
        const segmentDetails = document.createElement('div');
        segmentDetails.className = 'segment-details';
        
        const segmentAirport = document.createElement('div');
        segmentAirport.className = 'segment-airport';
        segmentAirport.textContent = departure.iataCode;
        
        const segmentTime = document.createElement('div');
        segmentTime.className = 'segment-time';
        const depTime = new Date(departure.at);
        segmentTime.textContent = depTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
        });
        
        const segmentCity = document.createElement('div');
        segmentCity.className = 'segment-city';
        segmentCity.textContent = departure.city || departure.iataCode;
        
        const segmentFlight = document.createElement('div');
        segmentFlight.className = 'segment-flight';
        const flightNumber = flightData.flightNumber || flightData.number || '';
        segmentFlight.textContent = `${flightData.airlineName} ${flightNumber}`.trim();
        
        segmentDetails.appendChild(segmentAirport);
        segmentDetails.appendChild(segmentTime);
        segmentDetails.appendChild(segmentCity);
        segmentDetails.appendChild(segmentFlight);
        
        segment.appendChild(segmentIcon);
        segment.appendChild(segmentDetails);
        
        segmentsContainer.appendChild(segment);
        
        // Add layover information if not the last segment
        if (i < allStops.length - 2) {
        const layover = document.createElement('div');
        layover.className = 'layover';
        
        const layoverIcon = document.createElement('i');
        layoverIcon.className = 'fas fa-clock';
        
        const layoverDetails = document.createElement('div');
        layoverDetails.className = 'layover-details';
        
        const layoverDuration = document.createElement('span');
        layoverDuration.className = 'layover-duration';
        
        // Calculate layover duration
        const arrivalTime = new Date(arrival.at);
        const nextDepartureTime = new Date(allStops[i + 1].at);
        const layoverTimeMs = nextDepartureTime - arrivalTime;
        const layoverHours = Math.floor(layoverTimeMs / (1000 * 60 * 60));
        const layoverMinutes = Math.floor((layoverTimeMs % (1000 * 60 * 60)) / (1000 * 60));
        
        layoverDuration.textContent = `Layover: ${layoverHours}h ${layoverMinutes}m`;
        
        const layoverLocation = document.createElement('span');
        layoverLocation.textContent = ` at ${arrival.iataCode} (${arrival.city || arrival.iataCode})`;
        
        layoverDetails.appendChild(layoverDuration);
        layoverDetails.appendChild(layoverLocation);
        
        layover.appendChild(layoverIcon);
        layover.appendChild(layoverDetails);
        
        segmentsContainer.appendChild(layover);
        }
    }
    
    // Add final arrival segment
    const finalSegment = document.createElement('div');
    finalSegment.className = 'flight-segment';
    
    const finalSegmentIcon = document.createElement('div');
    finalSegmentIcon.className = 'segment-icon';
    
    const finalIcon = document.createElement('i');
    finalIcon.className = 'fas fa-plane-arrival';
    
    finalSegmentIcon.appendChild(finalIcon);
    
    const finalSegmentDetails = document.createElement('div');
    finalSegmentDetails.className = 'segment-details';
    
    const finalSegmentAirport = document.createElement('div');
    finalSegmentAirport.className = 'segment-airport';
    finalSegmentAirport.textContent = flightData.arr.iataCode;
    
    const finalSegmentTime = document.createElement('div');
    finalSegmentTime.className = 'segment-time';
    const arrTime = new Date(flightData.arr.at);
    finalSegmentTime.textContent = arrTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const finalSegmentCity = document.createElement('div');
    finalSegmentCity.className = 'segment-city';
    finalSegmentCity.textContent = flightData.arr.city || flightData.arr.iataCode;
    
    finalSegmentDetails.appendChild(finalSegmentAirport);
    finalSegmentDetails.appendChild(finalSegmentTime);
    finalSegmentDetails.appendChild(finalSegmentCity);
    
    finalSegment.appendChild(finalSegmentIcon);
    finalSegment.appendChild(finalSegmentDetails);
    
    segmentsContainer.appendChild(finalSegment);
    } else {
    // Direct flight with no stops
    const segment = document.createElement('div');
    segment.className = 'flight-segment';
    
    // Create departure segment
    const depSegmentIcon = document.createElement('div');
    depSegmentIcon.className = 'segment-icon';
    
    const depIcon = document.createElement('i');
    depIcon.className = 'fas fa-plane-departure';
    
    depSegmentIcon.appendChild(depIcon);
    
    const depSegmentDetails = document.createElement('div');
    depSegmentDetails.className = 'segment-details';
    
    const depSegmentAirport = document.createElement('div');
    depSegmentAirport.className = 'segment-airport';
    depSegmentAirport.textContent = flightData.dep.iataCode;
    
    const depSegmentTime = document.createElement('div');
    depSegmentTime.className = 'segment-time';
    const depTime = new Date(flightData.dep.at);
    depSegmentTime.textContent = depTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const depSegmentCity = document.createElement('div');
    depSegmentCity.className = 'segment-city';
    depSegmentCity.textContent = flightData.dep.city || flightData.dep.iataCode;
    
    const depSegmentFlight = document.createElement('div');
    depSegmentFlight.className = 'segment-flight';
    const flightNumber = flightData.flightNumber || flightData.number || '';
    depSegmentFlight.textContent = `${flightData.airlineName} ${flightNumber}`.trim();
    
    depSegmentDetails.appendChild(depSegmentAirport);
    depSegmentDetails.appendChild(depSegmentTime);
    depSegmentDetails.appendChild(depSegmentCity);
    depSegmentDetails.appendChild(depSegmentFlight);
    
    segment.appendChild(depSegmentIcon);
    segment.appendChild(depSegmentDetails);
    
    segmentsContainer.appendChild(segment);
    
    // Create arrival segment
    const arrSegment = document.createElement('div');
    arrSegment.className = 'flight-segment';
    
    const arrSegmentIcon = document.createElement('div');
    arrSegmentIcon.className = 'segment-icon';
    
    const arrIcon = document.createElement('i');
    arrIcon.className = 'fas fa-plane-arrival';
    
    arrSegmentIcon.appendChild(arrIcon);
    
    const arrSegmentDetails = document.createElement('div');
    arrSegmentDetails.className = 'segment-details';
    
    const arrSegmentAirport = document.createElement('div');
    arrSegmentAirport.className = 'segment-airport';
    arrSegmentAirport.textContent = flightData.arr.iataCode;
    
    const arrSegmentTime = document.createElement('div');
    arrSegmentTime.className = 'segment-time';
    const arrTime = new Date(flightData.arr.at);
    arrSegmentTime.textContent = arrTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const arrSegmentCity = document.createElement('div');
    arrSegmentCity.className = 'segment-city';
    arrSegmentCity.textContent = flightData.arr.city || flightData.arr.iataCode;
    
    arrSegmentDetails.appendChild(arrSegmentAirport);
    arrSegmentDetails.appendChild(arrSegmentTime);
    arrSegmentDetails.appendChild(arrSegmentCity);
    
    arrSegment.appendChild(arrSegmentIcon);
    arrSegment.appendChild(arrSegmentDetails);
    
    segmentsContainer.appendChild(arrSegment);
    }
}

// Tab switching for booking summary
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        const tabType = this.getAttribute('data-tab');
        document.getElementById(tabType).classList.add('active');
    });
});

// Tab switching for ticket view
document.querySelectorAll('.ticket-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.ticket-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.ticket-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        const tabType = this.getAttribute('data-ticket-tab');
        document.getElementById(tabType + 'Ticket').classList.add('active');
    });
});

// Agreement checkbox change handler
document.getElementById('agreeTerms').addEventListener('change', function() {
    const generateBtn = document.getElementById('generateBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    if (this.checked) {
        generateBtn.disabled = false;
        errorMessage.style.display = 'none';
    } else {
        generateBtn.disabled = true;
    }
});

// Generate button click handler
document.getElementById('generateBtn').addEventListener('click', function() {
    const agreeTerms = document.getElementById('agreeTerms');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const ticketSection = document.getElementById('ticketSection');
    
    // Reset messages
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    if (!agreeTerms.checked) {
        // Terms not agreed
        errorMessage.style.display = 'block';
    } else {
        // Terms agreed
        successMessage.style.display = 'block';
        ticketSection.style.display = 'block';
        
        // Generate ticket details
        generateTicketDetails();
        
        // Scroll to ticket section
        ticketSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// Generate ticket details
function generateTicketDetails() {
    // Generate a random ticket number
    const ticketNumber = 'TKT' + Math.floor(1000000000 + Math.random() * 9000000000);
    document.getElementById('ticketNumber').textContent = ticketNumber;
    
    // Get flight data
    const outboundFlight = bookingData.flight || bookingData.outboundFlight || bookingData;
    const returnFlight = bookingData.returnItinerary || bookingData.returnFlight;
    
    // Format outbound date and time
    const departureDate = new Date(outboundFlight.dep.at);
    const arrivalDate = new Date(outboundFlight.arr.at);
    const formattedDate = departureDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
    });
    const formattedDepTime = departureDate.toLocaleTimeString('en-US', {
    hour: '2-digit', 
    minute: '2-digit'
    });
    const formattedArrTime = arrivalDate.toLocaleTimeString('en-US', {
    hour: '2-digit', 
    minute: '2-digit'
    });
    
    // Update outbound ticket details
    if (bookingData.passenger) {
    document.getElementById('ticketPassenger').textContent = 
        `${bookingData.passenger.firstName || ''} ${bookingData.passenger.lastName || ''}`.trim();
    }
    document.getElementById('ticketFlight').textContent = outboundFlight.airlineName || '-';
    document.getElementById('ticketDeparture').textContent = 
    `${outboundFlight.dep.iataCode} at ${formattedDepTime}`;
    document.getElementById('ticketArrival').textContent = 
    `${outboundFlight.arr.iataCode} at ${formattedArrTime}`;
    document.getElementById('ticketDuration').textContent = outboundFlight.duration || '-';
    document.getElementById('ticketPrice').textContent = outboundFlight.price ? 
    `BDT ${outboundFlight.price.toFixed(2)}` : '-';
    
    // Update outbound ticket route
    document.getElementById('outboundTicketRouteTitle').textContent = 
    `${outboundFlight.dep.iataCode} to ${outboundFlight.arr.iataCode}`;
    document.getElementById('outboundTicketFlightDate').textContent = formattedDate;
    
    // Generate outbound ticket flight segments
    generateTicketFlightSegments('outbound', outboundFlight);
    
    // Update return ticket details if return flight exists
    if (hasReturnFlight && returnFlight) {
        const returnDepDate = new Date(returnFlight.dep.at);
        const returnArrDate = new Date(returnFlight.arr.at);
        const returnFormattedDate = returnDepDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
        });
        const returnFormattedDepTime = returnDepDate.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit'
        });
        const returnFormattedArrTime = returnArrDate.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit'
        });
        
        if (bookingData.passenger) {
        document.getElementById('returnTicketPassenger').textContent = 
            `${bookingData.passenger.firstName || ''} ${bookingData.passenger.lastName || ''}`.trim();
        }
        document.getElementById('returnTicketFlight').textContent = returnFlight.airlineName || '-';
        document.getElementById('returnTicketDeparture').textContent = 
        `${returnFlight.dep.iataCode} at ${returnFormattedDepTime}`;
        document.getElementById('returnTicketArrival').textContent = 
        `${returnFlight.arr.iataCode} at ${returnFormattedArrTime}`;
        document.getElementById('returnTicketDuration').textContent = returnFlight.duration || '-';
        document.getElementById('returnTicketPrice').textContent = returnFlight.price ? 
        `BDT ${returnFlight.price.toFixed(2)}` : '-';
        
        // Update return ticket route
        document.getElementById('returnTicketRouteTitle').textContent = 
        `${returnFlight.dep.iataCode} to ${returnFlight.arr.iataCode}`;
        document.getElementById('returnTicketFlightDate').textContent = returnFormattedDate;
        
        // Generate return ticket flight segments
        generateTicketFlightSegments('return', returnFlight);
    }
}

// Function to generate flight segments for ticket view
function generateTicketFlightSegments(type, flightData) {
    const segmentsContainer = document.getElementById(`${type}TicketFlightSegments`);
    
    // Clear existing segments
    segmentsContainer.innerHTML = '';
    
    if (!flightData || !flightData.dep || !flightData.arr) {
        return;
    }
    
    // Check for stops or transits
    const stops = flightData.stops || flightData.transits || flightData.stopData || [];
    
    if (stops && stops.length > 0) {
        // Create segments for each leg of the journey
        const allStops = [flightData.dep, ...stops, flightData.arr];
        
        for (let i = 0; i < allStops.length - 1; i++) {
            const departure = allStops[i];
            const arrival = allStops[i + 1];
            
            // Create segment
            const segment = document.createElement('div');
            segment.className = 'ticket-segment';
            
            // Create segment icon
            const segmentIcon = document.createElement('div');
            segmentIcon.className = 'ticket-segment-icon';
            
            const icon = document.createElement('i');
            icon.className = i === 0 ? 'fas fa-plane-departure' : 'fas fa-plane';
            
            segmentIcon.appendChild(icon);
            
            // Create segment details
            const segmentDetails = document.createElement('div');
            segmentDetails.className = 'ticket-segment-details';
            
            const segmentAirport = document.createElement('div');
            segmentAirport.className = 'ticket-segment-airport';
            segmentAirport.textContent = departure.iataCode;
            
            const segmentTime = document.createElement('div');
            segmentTime.className = 'ticket-segment-time';
            const depTime = new Date(departure.at);
            segmentTime.textContent = depTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const segmentCity = document.createElement('div');
            segmentCity.className = 'segment-city';
            segmentCity.textContent = departure.city || departure.iataCode;
            
            const segmentFlight = document.createElement('div');
            segmentFlight.className = 'ticket-segment-flight';
            const flightNumber = flightData.flightNumber || flightData.number || '';
            segmentFlight.textContent = `${flightData.airlineName} ${flightNumber}`.trim();
            
            segmentDetails.appendChild(segmentAirport);
            segmentDetails.appendChild(segmentTime);
            segmentDetails.appendChild(segmentCity);
            segmentDetails.appendChild(segmentFlight);
            
            segment.appendChild(segmentIcon);
            segment.appendChild(segmentDetails);
            
            segmentsContainer.appendChild(segment);
            
            // Add layover information if not the last segment
            if (i < allStops.length - 2) {
                const layover = document.createElement('div');
                layover.className = 'ticket-layover';
                
                const layoverIcon = document.createElement('i');
                layoverIcon.className = 'fas fa-clock';
                
                const layoverDetails = document.createElement('div');
                layoverDetails.className = 'ticket-layover-details';
                
                const layoverDuration = document.createElement('span');
                layoverDuration.className = 'layover-duration';
                
                // Calculate layover duration
                const arrivalTime = new Date(arrival.at);
                const nextDepartureTime = new Date(allStops[i + 1].at);
                const layoverTimeMs = nextDepartureTime - arrivalTime;
                const layoverHours = Math.floor(layoverTimeMs / (1000 * 60 * 60));
                const layoverMinutes = Math.floor((layoverTimeMs % (1000 * 60 * 60)) / (1000 * 60));
                
                layoverDuration.textContent = `Layover: ${layoverHours}h ${layoverMinutes}m`;
                
                const layoverLocation = document.createElement('span');
                layoverLocation.textContent = ` at ${arrival.iataCode} (${arrival.city || arrival.iataCode})`;
                
                layoverDetails.appendChild(layoverDuration);
                layoverDetails.appendChild(layoverLocation);
                
                layover.appendChild(layoverIcon);
                layover.appendChild(layoverDetails);
                
                segmentsContainer.appendChild(layover);
            }
        }
        
        // Add final arrival segment
        const finalSegment = document.createElement('div');
        finalSegment.className = 'ticket-segment';
        
        const finalSegmentIcon = document.createElement('div');
        finalSegmentIcon.className = 'ticket-segment-icon';
        
        const finalIcon = document.createElement('i');
        finalIcon.className = 'fas fa-plane-arrival';
        
        finalSegmentIcon.appendChild(finalIcon);
        
        const finalSegmentDetails = document.createElement('div');
        finalSegmentDetails.className = 'ticket-segment-details';
        
        const finalSegmentAirport = document.createElement('div');
        finalSegmentAirport.className = 'ticket-segment-airport';
        finalSegmentAirport.textContent = flightData.arr.iataCode;
        
        const finalSegmentTime = document.createElement('div');
        finalSegmentTime.className = 'ticket-segment-time';
        const arrTime = new Date(flightData.arr.at);
        finalSegmentTime.textContent = arrTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const finalSegmentCity = document.createElement('div');
        finalSegmentCity.className = 'segment-city';
        finalSegmentCity.textContent = flightData.arr.city || flightData.arr.iataCode;
        
        finalSegmentDetails.appendChild(finalSegmentAirport);
        finalSegmentDetails.appendChild(finalSegmentTime);
        finalSegmentDetails.appendChild(finalSegmentCity);
        
        finalSegment.appendChild(finalSegmentIcon);
        finalSegment.appendChild(finalSegmentDetails);
        
        segmentsContainer.appendChild(finalSegment);
    } else {
        // Direct flight with no stops
        const segment = document.createElement('div');
        segment.className = 'ticket-segment';
        
        // Create departure segment
        const depSegmentIcon = document.createElement('div');
        depSegmentIcon.className = 'ticket-segment-icon';
        
        const depIcon = document.createElement('i');
        depIcon.className = 'fas fa-plane-departure';
        
        depSegmentIcon.appendChild(depIcon);
        
        const depSegmentDetails = document.createElement('div');
        depSegmentDetails.className = 'ticket-segment-details';
        
        const depSegmentAirport = document.createElement('div');
        depSegmentAirport.className = 'ticket-segment-airport';
        depSegmentAirport.textContent = flightData.dep.iataCode;
        
        const depSegmentTime = document.createElement('div');
        depSegmentTime.className = 'ticket-segment-time';
        const depTime = new Date(flightData.dep.at);
        depSegmentTime.textContent = depTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const depSegmentCity = document.createElement('div');
        depSegmentCity.className = 'segment-city';
        depSegmentCity.textContent = flightData.dep.city || flightData.dep.iataCode;
        
        const depSegmentFlight = document.createElement('div');
        depSegmentFlight.className = 'ticket-segment-flight';
        const flightNumber = flightData.flightNumber || flightData.number || '';
        depSegmentFlight.textContent = `${flightData.airlineName} ${flightNumber}`.trim();
        
        depSegmentDetails.appendChild(depSegmentAirport);
        depSegmentDetails.appendChild(depSegmentTime);
        depSegmentDetails.appendChild(depSegmentCity);
        depSegmentDetails.appendChild(depSegmentFlight);
        
        segment.appendChild(depSegmentIcon);
        segment.appendChild(depSegmentDetails);
        
        segmentsContainer.appendChild(segment);
        
        // Create arrival segment
        const arrSegment = document.createElement('div');
        arrSegment.className = 'ticket-segment';
        
        const arrSegmentIcon = document.createElement('div');
        arrSegmentIcon.className = 'ticket-segment-icon';
        
        const arrIcon = document.createElement('i');
        arrIcon.className = 'fas fa-plane-arrival';
        
        arrSegmentIcon.appendChild(arrIcon);
        
        const arrSegmentDetails = document.createElement('div');
        arrSegmentDetails.className = 'ticket-segment-details';
        
        const arrSegmentAirport = document.createElement('div');
        arrSegmentAirport.className = 'ticket-segment-airport';
        arrSegmentAirport.textContent = flightData.arr.iataCode;
        
        const arrSegmentTime = document.createElement('div');
        arrSegmentTime.className = 'ticket-segment-time';
        const arrTime = new Date(flightData.arr.at);
        arrSegmentTime.textContent = arrTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const arrSegmentCity = document.createElement('div');
        arrSegmentCity.className = 'segment-city';
        arrSegmentCity.textContent = flightData.arr.city || flightData.arr.iataCode;
        
        arrSegmentDetails.appendChild(arrSegmentAirport);
        arrSegmentDetails.appendChild(arrSegmentTime);
        arrSegmentDetails.appendChild(arrSegmentCity);
        
        arrSegment.appendChild(arrSegmentIcon);
        arrSegment.appendChild(arrSegmentDetails);
        
        segmentsContainer.appendChild(arrSegment);
    }
}

// Download button click handler
document.getElementById('downloadBtn').addEventListener('click', function() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get ticket number
    const ticketNumber = document.getElementById('ticketNumber').textContent;
    
    // Get passenger name
    const passengerName = document.getElementById('ticketPassenger').textContent;
    const passengerEmail = document.getElementById('passengerEmail').textContent;
    const passengerPhone = document.getElementById('passengerPhone').textContent;
    
    // Get outbound flight details
    const outboundFlight = document.getElementById('ticketFlight').textContent;
    const outboundDeparture = document.getElementById('ticketDeparture').textContent;
    const outboundArrival = document.getElementById('ticketArrival').textContent;
    const outboundDuration = document.getElementById('ticketDuration').textContent;
    const outboundPrice = document.getElementById('ticketPrice').textContent;
    const outboundDate = document.getElementById('outboundTicketFlightDate').textContent;
    
    // Add custom styling to match the new design
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Add title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('E-Ticket', 105, 25, { align: 'center' });
    
    // Add ticket number
    doc.setFontSize(12);
    doc.text(`Ticket Number: ${ticketNumber}`, 105, 35, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add passenger details
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('Passenger Details:', 20, 60);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text(`Name: ${passengerName}`, 20, 70);
    doc.text(`Email: ${passengerEmail}`, 20, 80);
    doc.text(`Phone: ${passengerPhone}`, 20, 90);
    
    // Add outbound flight details
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('Outbound Flight Details:', 20, 110);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text(`Date: ${outboundDate}`, 20, 120);
    doc.text(`Flight: ${outboundFlight}`, 20, 130);
    doc.text(`Departure: ${outboundDeparture}`, 20, 140);
    doc.text(`Arrival: ${outboundArrival}`, 20, 150);
    doc.text(`Duration: ${outboundDuration}`, 20, 160);
    doc.text(`Price: ${outboundPrice}`, 20, 170);
    
    // Add return flight details if available
    if (hasReturnFlight) {
        const returnFlight = document.getElementById('returnTicketFlight').textContent;
        const returnDeparture = document.getElementById('returnTicketDeparture').textContent;
        const returnArrival = document.getElementById('returnTicketArrival').textContent;
        const returnDuration = document.getElementById('returnTicketDuration').textContent;
        const returnPrice = document.getElementById('returnTicketPrice').textContent;
        const returnDate = document.getElementById('returnTicketFlightDate').textContent;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text('Return Flight Details:', 20, 190);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        doc.text(`Date: ${returnDate}`, 20, 200);
        doc.text(`Flight: ${returnFlight}`, 20, 210);
        doc.text(`Departure: ${returnDeparture}`, 20, 220);
        doc.text(`Arrival: ${returnArrival}`, 20, 230);
        doc.text(`Duration: ${returnDuration}`, 20, 240);
        doc.text(`Price: ${returnPrice}`, 20, 250);
        
        // Calculate total price
        const outboundFlightData = bookingData.flight || bookingData.outboundFlight || bookingData;
        const returnFlightData = bookingData.returnItinerary || bookingData.returnFlight;
        const totalPrice = (outboundFlightData.price || 0) + (returnFlightData.price || 0);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text(`Total Price: BDT ${totalPrice.toFixed(2)}`, 20, 270);
        
        // Add footer
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('This is an electronic ticket. Please present this ticket along with a valid ID at the airport.', 105, 290, { align: 'center' });
    } else {
        // Add footer for one-way ticket
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('This is an electronic ticket. Please present this ticket along with a valid ID at the airport.', 105, 190, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`E-Ticket_${ticketNumber}.pdf`);
});

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateDebugInfo("DOM loaded, initializing page...");
    initializePage();
});
