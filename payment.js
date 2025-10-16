class PaymentPage {
  constructor() {
    this.bookingData = this.loadBookingData();
    this.selectedSeats = this.loadSelectedSeats();
    this.totalPrice = this.calculatePrice();
    this.init();
  }

  loadBookingData() {
    try {
      const data = localStorage.getItem('bookingData');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    }
    
    return {
      from: 'Warszawa',
      to: 'Berlin',
      date: new Date().toISOString().split('T')[0],
      departureTime: '20:15',
      arrivalTime: '09:25 +1 day',
      duration: '13h 10m',
      price: '€76.98'
    };
  }

  loadSelectedSeats() {
    try {
      const seats = localStorage.getItem('selectedSeats');
      if (seats) {
        return JSON.parse(seats);
      }
    } catch (error) {
      console.error('Error loading selected seats:', error);
    }
    
    return ['1A', '1B']; // Default seats
  }

  calculatePrice() {
    // Extract price from booking data or calculate based on seats
    const basePrice = parseFloat(this.bookingData.price?.replace(/[€$£]/g, '') || '76.98');
    return basePrice * this.selectedSeats.length;
  }

  init() {
    this.populateSummary();
    this.initFormValidation();
    this.initCardPreview();
  }

  populateSummary() {
    // Route summary
    const routeSummary = document.getElementById('routeSummary');
    if (routeSummary) {
      routeSummary.innerHTML = `
        <div class="route-header">
          <div class="route-cities">${this.bookingData.from} → ${this.bookingData.to}</div>
          <div class="route-date">${this.formatDate(this.bookingData.date)}</div>
        </div>
        <div class="route-times">
          <div class="time-point">
            <div class="time">${this.bookingData.departureTime}</div>
            <div class="station">Dworzec Centralny</div>
          </div>
          <div class="duration">${this.bookingData.duration}</div>
          <div class="time-point">
            <div class="time">${this.bookingData.arrivalTime}</div>
            <div class="station">ZOB</div>
          </div>
        </div>
      `;
    }

    // Seats summary
    const seatSummary = document.getElementById('seatSummary');
    if (seatSummary) {
      seatSummary.innerHTML = `
        <div class="seats-header">Selected seats (${this.selectedSeats.length})</div>
        <div class="seats-list">${this.selectedSeats.join(', ')}</div>
      `;
    }

    // Price summary
    const priceSummary = document.getElementById('priceSummary');
    if (priceSummary) {
      priceSummary.innerHTML = `
        <div class="price-header">Total amount</div>
        <div class="total-price">€${this.totalPrice.toFixed(2)}</div>
      `;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  }

  initFormValidation() {
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input[required]');
    const payBtn = document.querySelector('.pay-btn');
    const agreeCheckbox = document.getElementById('agree');

    // Add real-time validation
    inputs.forEach(input => {
      input.addEventListener('input', () => this.validateField(input));
      input.addEventListener('blur', () => this.validateField(input));
    });

    agreeCheckbox.addEventListener('change', () => this.updatePayButton());

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        this.processPayment();
      }
    });

    // Initial button state check
    this.updatePayButton();
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.id) {
      case 'cardHolder':
        if (!value) {
          isValid = false;
          errorMessage = 'Name on card is required';
        } else if (!/^[a-zA-Z\s]{2,}$/.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid name';
        }
        break;

      case 'cardNumber':
        const cleanNumber = value.replace(/\s/g, '');
        if (!cleanNumber) {
          isValid = false;
          errorMessage = 'Card number is required';
        } else if (!/^\d{13,19}$/.test(cleanNumber)) {
          isValid = false;
          errorMessage = 'Please enter a valid card number';
        } else if (!this.luhnCheck(cleanNumber)) {
          isValid = false;
          errorMessage = 'Invalid card number';
        }
        break;

      case 'cardExpiry':
        if (!value) {
          isValid = false;
          errorMessage = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
          isValid = false;
          errorMessage = 'Use MM/YY format';
        } else if (this.isExpired(value)) {
          isValid = false;
          errorMessage = 'Card has expired';
        }
        break;

      case 'cardCvc':
        if (!value) {
          isValid = false;
          errorMessage = 'CVC is required';
        } else if (!/^\d{3,4}$/.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid CVC';
        }
        break;
    }

    this.showFieldError(field, isValid ? '' : errorMessage);
    this.updatePayButton();
    return isValid;
  }

  luhnCheck(cardNumber) {
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10) === 0;
  }

  isExpired(expiry) {
    const [month, year] = expiry.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    today.setDate(1); // First day of current month
    
    return expDate < today;
  }

  showFieldError(field, message) {
    const errorElement = document.querySelector(`[data-for="${field.id}"]`);
    
    if (message) {
      field.classList.add('error');
      errorElement.textContent = message;
      errorElement.classList.add('show');
    } else {
      field.classList.remove('error');
      errorElement.classList.remove('show');
    }
  }

  validateForm() {
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  updatePayButton() {
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input[required]');
    const agreeCheckbox = document.getElementById('agree');
    const payBtn = document.querySelector('.pay-btn');

    let allValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim() || input.classList.contains('error')) {
        allValid = false;
      }
    });

    if (!agreeCheckbox.checked) {
      allValid = false;
    }

    payBtn.disabled = !allValid;
  }

  initCardPreview() {
    const cardNumber = document.getElementById('cardNumber');
    const cardHolder = document.getElementById('cardHolder');
    const cardExpiry = document.getElementById('cardExpiry');
    
    const previewNumber = document.getElementById('previewNumber');
    const previewHolder = document.getElementById('previewHolder');
    const previewExpiry = document.getElementById('previewExpiry');

    // Card number formatting and preview
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
      
      // Add spaces every 4 digits
      value = value.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = value;
      
      // Update preview
      if (value) {
        const masked = value.replace(/\d(?=\d{4})/g, '•');
        previewNumber.textContent = masked.padEnd(19, '•').replace(/(.{4})/g, '$1 ').trim();
      } else {
        previewNumber.textContent = '•••• •••• •••• ••••';
      }
    });

    // Card holder preview
    cardHolder.addEventListener('input', (e) => {
      const value = e.target.value.toUpperCase();
      previewHolder.textContent = value || 'CARD HOLDER';
    });

    // Expiry formatting and preview
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      
      e.target.value = value;
      previewExpiry.textContent = value || 'MM/YY';
    });
  }

  async processPayment() {
    const payBtn = document.querySelector('.pay-btn');
    const originalText = payBtn.textContent;
    
    // Show loading state
    payBtn.classList.add('loading');
    payBtn.disabled = true;

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Save payment success to localStorage
      localStorage.setItem('paymentComplete', JSON.stringify({
        bookingId: this.generateBookingId(),
        seats: this.selectedSeats,
        route: `${this.bookingData.from} → ${this.bookingData.to}`,
        date: this.bookingData.date,
        time: `${this.bookingData.departureTime} - ${this.bookingData.arrivalTime}`,
        price: `€${this.totalPrice.toFixed(2)}`,
        timestamp: new Date().toISOString()
      }));

      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      
      // Restore button
      payBtn.classList.remove('loading');
      payBtn.textContent = originalText;
      payBtn.disabled = false;
    }
  }

  generateBookingId() {
    return 'BT' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
}

// Initialize payment page
document.addEventListener('DOMContentLoaded', () => {
  new PaymentPage();
});