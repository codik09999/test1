// Seat Selection JavaScript
class SeatReservation {
    constructor() {
        this.selectedSeats = [];
        this.bookingData = this.loadBookingData();
        this.busLayout = {
            rows: 12,
            seatsPerRow: 4,
            occupiedSeats: [
                '1A', '3B', '5C', '7A', '9B', '11C'
            ]
        };
        this.seatTypes = {
            classic: { rows: [3, 4, 5, 6, 7, 8, 9, 10], price: 0 },
            premium: { rows: [1, 2, 11, 12], price: 0 }
        };
        
        this.init();
    }

    loadBookingData() {
        try {
            const data = localStorage.getItem('bookingData');
            if (data) {
                const parsed = JSON.parse(data);
                console.log('Loaded booking data:', parsed);
                return parsed;
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
        }
        
        // Default data if none found
        return {
            from: 'Warszawa',
            to: 'Berlin',
            date: new Date().toISOString().split('T')[0],
            passengers: { adults: 1, children: 0, infants: 0 },
            departureTime: '20:15',
            arrivalTime: '09:25 +1 day',
            duration: '13:10 hrs',
            price: '€76.98'
        };
    }

    init() {
        this.updateRouteInfo();
        this.generateSeatLayout();
        this.bindEvents();
        this.updateUI();
    }

    updateRouteInfo() {
        // Update route information in header
        const fromCity = document.querySelector('.from-city');
        const toCity = document.querySelector('.to-city');
        
        if (fromCity && this.bookingData.from) {
            fromCity.textContent = this.bookingData.from;
        }
        if (toCity && this.bookingData.to) {
            toCity.textContent = this.bookingData.to;
        }
        
        console.log('Route info updated:', this.bookingData.from, '->', this.bookingData.to);
    }

    generateSeatLayout() {
        const seatRows = document.getElementById('seatRows');
        if (!seatRows) return;

        seatRows.innerHTML = '';

        for (let row = 1; row <= this.busLayout.rows; row++) {
            const rowElement = this.createSeatRow(row);
            seatRows.appendChild(rowElement);
        }
    }

    createSeatRow(rowNumber) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        // Row number
        const rowNumberDiv = document.createElement('div');
        rowNumberDiv.className = 'row-number';
        rowNumberDiv.textContent = rowNumber;
        
        // Left seat pair (A, B)
        const leftPair = document.createElement('div');
        leftPair.className = 'seat-pair';
        leftPair.appendChild(this.createSeat(rowNumber, 'A'));
        leftPair.appendChild(this.createSeat(rowNumber, 'B'));
        
        // Aisle
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        
        // Right seat pair (C, D)
        const rightPair = document.createElement('div');
        rightPair.className = 'seat-pair';
        rightPair.appendChild(this.createSeat(rowNumber, 'C'));
        rightPair.appendChild(this.createSeat(rowNumber, 'D'));
        
        rowDiv.appendChild(leftPair);
        rowDiv.appendChild(rowNumberDiv);
        rowDiv.appendChild(aisle);
        rowDiv.appendChild(rightPair);
        
        return rowDiv;
    }

    createSeat(row, letter) {
        const seat = document.createElement('div');
        const seatId = `${row}${letter}`;
        
        seat.className = 'seat';
        seat.dataset.seat = seatId;
        seat.textContent = letter;
        
        // Determine seat type
        const seatType = this.getSeatType(row);
        if (seatType !== 'classic') {
            seat.classList.add(seatType);
        }
        
        // Check if seat is occupied
        if (this.busLayout.occupiedSeats.includes(seatId)) {
            seat.classList.add('occupied');
        } else {
            seat.classList.add('available');
        }
        
        return seat;
    }

    getSeatType(row) {
        if (this.seatTypes.premium.rows.includes(row)) return 'premium';
        return 'classic';
    }

    bindEvents() {
        // Seat selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('seat') && e.target.classList.contains('available')) {
                this.toggleSeat(e.target);
            }
        });


        // Navigation buttons
        const backBtn = document.querySelector('.back-btn');
        const closeBtn = document.querySelector('.close-btn');
        const confirmBtn = document.querySelector('.confirm-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.history.back();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmSelection();
            });
        }

    }

    toggleSeat(seatElement) {
        const seatId = seatElement.dataset.seat;
        
        if (seatElement.classList.contains('selected')) {
            // Deselect seat
            seatElement.classList.remove('selected');
            this.selectedSeats = this.selectedSeats.filter(id => id !== seatId);
        } else {
            // Select seat
            seatElement.classList.add('selected');
            this.selectedSeats.push(seatId);
        }
        
        this.updateUI();
    }


    updateUI() {
        const selectedCount = document.querySelector('.selected-count');
        const selectedSeatsSpan = document.querySelector('.selected-seats');
        const confirmBtn = document.querySelector('.confirm-btn');
        
        const count = this.selectedSeats.length;
        
        if (selectedCount) {
            if (count === 0) {
                selectedCount.textContent = 'No seats selected';
            } else if (count === 1) {
                selectedCount.textContent = '1 seat selected';
            } else {
                selectedCount.textContent = `${count} seats selected`;
            }
        }
        
        if (selectedSeatsSpan) {
            if (count > 0) {
                selectedSeatsSpan.textContent = `Seats: ${this.selectedSeats.join(', ')}`;
            } else {
                selectedSeatsSpan.textContent = '';
            }
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedSeats.length === 0;
        }
    }


    confirmSelection() {
        if (this.selectedSeats.length === 0) {
            alert('Please select at least one seat.');
            return;
        }
        
        // Save selection to localStorage for next page
        localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
        
        // Show confirmation message
        const seatList = this.selectedSeats.join(', ');
        const confirmMessage = `You have selected seats: ${seatList}\n\nWould you like to proceed?`;
        
        if (confirm(confirmMessage)) {
            // Redirect to payment step
            window.location.href = 'payment.html';
        }
    }

    // Animation effects
    addSeatAnimations() {
        const seats = document.querySelectorAll('.seat.available');
        
        seats.forEach((seat, index) => {
            seat.style.animationDelay = `${index * 0.02}s`;
            seat.classList.add('seat-fade-in');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SeatReservation();
});

// Add CSS animation class
const style = document.createElement('style');
style.textContent = `
    @keyframes seatFadeIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .seat-fade-in {
        animation: seatFadeIn 0.3s ease-out forwards;
    }
    
    .seat.pulse {
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);