class ConfirmationPage {
  constructor() {
    this.paymentData = this.loadPaymentData();
    this.init();
  }

  loadPaymentData() {
    try {
      const data = localStorage.getItem('paymentComplete');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
    
    // Default data if none found
    return {
      bookingId: 'BT' + Date.now().toString().slice(-8),
      seats: ['1A', '1B'],
      route: 'Warszawa → Berlin',
      date: new Date().toISOString().split('T')[0],
      time: '20:15 - 09:25 +1 day',
      price: '€76.98',
      timestamp: new Date().toISOString()
    };
  }

  init() {
    this.populateBookingDetails();
    this.initEventHandlers();
  }

  populateBookingDetails() {
    // Booking ID
    const bookingIdElement = document.getElementById('bookingId');
    if (bookingIdElement) {
      bookingIdElement.textContent = this.paymentData.bookingId;
    }

    // Route Display
    const routeDisplay = document.getElementById('routeDisplay');
    if (routeDisplay) {
      const [fromCity, toCity] = this.paymentData.route.split(' → ');
      const [departureTime, arrivalTime] = this.paymentData.time.split(' - ');
      
      routeDisplay.innerHTML = `
        <div class="route-point">
          <div class="city">${fromCity}</div>
          <div class="time">${departureTime}</div>
          <div class="station">Dworzec Centralny</div>
        </div>
        <div class="route-arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="duration">13h 10m</span>
        </div>
        <div class="route-point">
          <div class="city">${toCity}</div>
          <div class="time">${arrivalTime}</div>
          <div class="station">ZOB</div>
        </div>
      `;
    }

    // Travel Date
    const travelDateElement = document.getElementById('travelDate');
    if (travelDateElement) {
      const date = new Date(this.paymentData.date);
      travelDateElement.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Selected Seats
    const selectedSeatsElement = document.getElementById('selectedSeats');
    if (selectedSeatsElement) {
      selectedSeatsElement.textContent = this.paymentData.seats.join(', ');
    }

    // Total Paid
    const totalPaidElement = document.getElementById('totalPaid');
    if (totalPaidElement) {
      totalPaidElement.textContent = this.paymentData.price;
    }
  }

  initEventHandlers() {
    // Download ticket button
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadTicket();
      });
    }

    // Email ticket button
    const emailBtn = document.querySelector('.email-btn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        this.emailTicket();
      });
    }

    // Clean up localStorage
    setTimeout(() => {
      localStorage.removeItem('bookingData');
      localStorage.removeItem('selectedSeats');
      // Keep paymentComplete for ticket download/email functionality
    }, 1000);
  }

  downloadTicket() {
    // Create a simple ticket as text file
    const ticketContent = this.generateTicketText();
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusTravel-Ticket-${this.paymentData.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Show feedback
    this.showNotification('Ticket downloaded successfully!', 'success');
  }

  emailTicket() {
    // Simulate sending email
    this.showNotification('Ticket sent to your email!', 'success');
    
    // In real app, this would make an API call to send email
    console.log('Email ticket request:', {
      bookingId: this.paymentData.bookingId,
      email: 'user@example.com', // Would be from user data
      ticketData: this.paymentData
    });
  }

  generateTicketText() {
    return `
╔══════════════════════════════════════╗
║              BUS TRAVEL              ║
║            E-TICKET                  ║
╠══════════════════════════════════════╣
║ Booking ID: ${this.paymentData.bookingId.padEnd(23)} ║
║                                      ║
║ Route: ${this.paymentData.route.padEnd(29)} ║
║ Date:  ${new Date(this.paymentData.date).toDateString().padEnd(29)} ║
║ Time:  ${this.paymentData.time.padEnd(29)} ║
║                                      ║
║ Seats: ${this.paymentData.seats.join(', ').padEnd(29)} ║
║ Price: ${this.paymentData.price.padEnd(29)} ║
║                                      ║
║ Departure: Dworzec Centralny         ║
║ Arrival:   ZOB Berlin                ║
║                                      ║
╠══════════════════════════════════════╣
║ Please arrive 15 minutes early       ║
║ Valid ID required for travel         ║
╚══════════════════════════════════════╝

Generated: ${new Date().toLocaleString()}
    `.trim();
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      backgroundColor: type === 'success' ? '#10b981' : '#3b82f6'
    });

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize confirmation page
document.addEventListener('DOMContentLoaded', () => {
  new ConfirmationPage();
});