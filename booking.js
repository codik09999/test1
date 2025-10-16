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
            classic: { rows: [1, 2, 3, 4, 5, 6, 7, 8], price: 0 },
            front: { rows: [1, 2], price: 0 },
            panorama: { rows: [11, 12], price: 0 }
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
        if (this.seatTypes.front.rows.includes(row)) return 'front';
        if (this.seatTypes.panorama.rows.includes(row)) return 'panorama';
        return 'classic';
    }

    bindEvents() {
        // Seat selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('seat') && e.target.classList.contains('available')) {
                this.toggleSeat(e.target);
            }
        });

        // Seat type selection
        document.querySelectorAll('.seat-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectSeatType(e.currentTarget);
            });
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

        // Bus navigation arrows
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.scrollBusLayout('prev');
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.scrollBusLayout('next');
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

    selectSeatType(option) {
        // Remove selected class from all options
        document.querySelectorAll('.seat-type-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Filter seats by type (optional functionality)
        const selectedType = option.querySelector('.type-name').textContent.toLowerCase();
        this.highlightSeatsByType(selectedType);
    }

    highlightSeatsByType(type) {
        const seats = document.querySelectorAll('.seat');
        
        seats.forEach(seat => {
            const row = parseInt(seat.dataset.seat);
            const seatType = this.getSeatType(row);
            
            if (type === 'classic' || seatType === type) {
                seat.style.opacity = '1';
            } else {
                seat.style.opacity = '0.3';
            }
        });
        
        // Reset opacity after 2 seconds
        setTimeout(() => {
            seats.forEach(seat => {
                seat.style.opacity = '1';
            });
        }, 2000);
    }

    updateUI() {
        const selectedCount = document.querySelector('.selected-count');
        const confirmBtn = document.querySelector('.confirm-btn');
        
        if (selectedCount) {
            const count = this.selectedSeats.length;
            selectedCount.textContent = count === 0 ? '0 seats reserved' : 
                count === 1 ? '1 seat reserved' : `${count} seats reserved`;
        }
        
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedSeats.length === 0;
        }
    }

    scrollBusLayout(direction) {
        const seatRows = document.getElementById('seatRows');
        if (!seatRows) return;
        
        const scrollAmount = 100;
        const currentScroll = seatRows.scrollTop;
        
        if (direction === 'prev') {
            seatRows.scrollTop = Math.max(0, currentScroll - scrollAmount);
        } else {
            seatRows.scrollTop = currentScroll + scrollAmount;
        }
        
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const seatRows = document.getElementById('seatRows');
        const prevBtn = document.querySelector('.nav-arrow.prev');
        const nextBtn = document.querySelector('.nav-arrow.next');
        
        if (!seatRows || !prevBtn || !nextBtn) return;
        
        const isAtTop = seatRows.scrollTop === 0;
        const isAtBottom = seatRows.scrollTop >= seatRows.scrollHeight - seatRows.clientHeight;
        
        prevBtn.disabled = isAtTop;
        nextBtn.disabled = isAtBottom;
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
            // Redirect to next step (passenger details or payment)
            window.location.href = 'passenger-details.html';
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