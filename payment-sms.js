// SMS Verification Integration for Payment Flow
class PaymentSMSVerification {
  constructor() {
    this.currentBookingId = null;
    this.eventSource = null;
    this.smsModal = null;
    this.init();
  }

  init() {
    this.createSMSModal();
    this.setupEventListeners();
  }

  createSMSModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="smsModal" class="sms-modal" style="display: none;">
        <div class="sms-modal-content">
          <div class="sms-header">
            <h2>📱 SMS Подтверждение</h2>
            <p class="sms-description">Ждем подтверждения от администратора для отправки SMS кода</p>
          </div>
          
          <div class="sms-status" id="smsStatus">
            <div class="loading-spinner"></div>
            <p>Обработка вашего запроса...</p>
          </div>
          
          <div class="sms-code-section" id="smsCodeSection" style="display: none;">
            <p>Введите SMS код, отправленный на ваш телефон:</p>
            <div class="sms-input-container">
              <input type="text" id="smsCodeInput" placeholder="000000" maxlength="6" pattern="[0-9]{6}">
              <button id="verifySMSBtn" class="verify-btn">Подтвердить</button>
            </div>
            <div class="sms-error" id="smsError"></div>
            <div class="sms-timer" id="smsTimer">Код действителен: <span>05:00</span></div>
          </div>
          
          <div class="sms-actions">
            <button id="cancelSMSBtn" class="cancel-btn">Отмена</button>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Store modal reference
    this.smsModal = document.getElementById('smsModal');
    
    // Add CSS styles
    this.addSMSStyles();
  }

  addSMSStyles() {
    const styles = `
      <style>
        .sms-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sms-modal.show {
          opacity: 1;
        }

        .sms-modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 480px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }

        .sms-modal.show .sms-modal-content {
          transform: translateY(0);
        }

        .sms-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .sms-header h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .sms-description {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .sms-status {
          text-align: center;
          padding: 20px 0;
        }

        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .sms-code-section {
          text-align: center;
          margin: 24px 0;
        }

        .sms-input-container {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          margin: 16px 0;
        }

        #smsCodeInput {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 2px;
          width: 120px;
          transition: border-color 0.2s ease;
        }

        #smsCodeInput:focus {
          outline: none;
          border-color: #3b82f6;
        }

        #smsCodeInput.error {
          border-color: #ef4444;
        }

        .verify-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .verify-btn:hover {
          background: #2563eb;
        }

        .verify-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .sms-error {
          color: #ef4444;
          font-size: 14px;
          margin-top: 8px;
          min-height: 20px;
        }

        .sms-timer {
          color: #f59e0b;
          font-size: 14px;
          font-weight: 600;
          margin-top: 12px;
        }

        .sms-actions {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn:hover {
          background: #4b5563;
        }

        .success-message {
          text-align: center;
          color: #10b981;
          font-weight: 600;
          padding: 20px;
        }

        .error-message {
          text-align: center;
          color: #ef4444;
          font-weight: 600;
          padding: 20px;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  setupEventListeners() {
    // Verify SMS button
    document.getElementById('verifySMSBtn').addEventListener('click', () => {
      this.verifySMSCode();
    });

    // Cancel button
    document.getElementById('cancelSMSBtn').addEventListener('click', () => {
      this.cancelPayment();
    });

    // SMS code input - auto submit on 6 digits
    document.getElementById('smsCodeInput').addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '').substring(0, 6);
      e.target.value = value;
      
      if (value.length === 6) {
        setTimeout(() => this.verifySMSCode(), 100);
      }
    });

    // Close modal on outside click
    this.smsModal.addEventListener('click', (e) => {
      if (e.target === this.smsModal) {
        this.cancelPayment();
      }
    });
  }

  getApiBaseUrl() {
    // Auto-detect API base URL
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }

  async startPaymentFlow(bookingId, orderData) {
    console.log('🔐 Starting SMS payment flow for booking:', bookingId);
    console.log('📊 orderData:', orderData);
    
    this.currentBookingId = bookingId;
    const apiBase = this.getApiBaseUrl();
    
    console.log('🌐 API Base URL:', apiBase);
    console.log('🔗 Full API URL:', `${apiBase}/api/payment/create-session`);
    
    // Show modal
    this.showModal();
    
    try {
      console.log('🚀 Making fetch request...');
      
      // Create payment session on server
      const sessionResponse = await fetch(`${apiBase}/api/payment/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, orderData })
      });
      
      console.log('📡 Fetch response status:', sessionResponse.status);
      console.log('📡 Fetch response ok:', sessionResponse.ok);
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('❌ Session creation failed:', errorText);
        throw new Error(`Failed to create payment session: ${sessionResponse.status} ${errorText}`);
      }
      
      const sessionResult = await sessionResponse.json();
      console.log('✅ Session created successfully:', sessionResult);
      
      // Connect to Server-Sent Events
      this.connectToEventStream(bookingId);
      
    } catch (error) {
      console.error('❌ Error starting payment flow:', error);
      console.error('🔍 Error stack:', error.stack);
      
      // Show detailed error in modal
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Ошибка подключения к серверу. Проверьте, что webhook сервер запущен.'
        : `Ошибка: ${error.message}`;
        
      this.showError(errorMessage);
    }
  }

  connectToEventStream(bookingId) {
    if (this.eventSource) {
      this.eventSource.close();
    }
    
    const apiBase = this.getApiBaseUrl();
    const sseUrl = `${apiBase}/api/payment/events/${bookingId}`;
    console.log('📡 Connecting to SSE:', sseUrl);
    
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📡 SSE message:', data);
      
      this.handleServerMessage(data);
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.showError('Соединение с сервером потеряно');
    };
  }

  handleServerMessage(data) {
    const { action, message } = data;
    
    switch (action) {
      case 'connected':
        this.updateStatus('Подключено к системе оплаты...');
        break;
        
      case 'sms_sent':
        this.showSMSInput();
        this.startTimer();
        break;
        
      case 'payment_declined':
        this.showError(message);
        setTimeout(() => this.hideModal(), 3000);
        break;
    }
  }

  updateStatus(message) {
    document.getElementById('smsStatus').innerHTML = `
      <div class="loading-spinner"></div>
      <p>${message}</p>
    `;
  }

  showSMSInput() {
    document.getElementById('smsStatus').style.display = 'none';
    document.getElementById('smsCodeSection').style.display = 'block';
    document.getElementById('smsCodeInput').focus();
  }

  startTimer() {
    let timeLeft = 300; // 5 minutes
    const timerElement = document.querySelector('#smsTimer span');
    
    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        this.showError('Время ожидания SMS истекло');
      }
      
      timeLeft--;
    }, 1000);
    
    // Store timer to clear it later
    this.smsTimer = timer;
  }

  async verifySMSCode() {
    const smsCode = document.getElementById('smsCodeInput').value;
    const errorElement = document.getElementById('smsError');
    const verifyBtn = document.getElementById('verifySMSBtn');
    
    if (smsCode.length !== 6) {
      errorElement.textContent = 'Введите 6-значный код';
      return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Проверка...';
    errorElement.textContent = '';
    
    try {
      const apiBase = this.getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/payment/verify-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: this.currentBookingId, 
          smsCode 
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        this.showSuccess('Оплата подтверждена!');
        setTimeout(() => {
          this.hideModal();
          window.location.href = 'confirmation.html';
        }, 2000);
      } else {
        errorElement.textContent = result.error || 'Неверный код';
        document.getElementById('smsCodeInput').classList.add('error');
      }
      
    } catch (error) {
      console.error('SMS verification error:', error);
      errorElement.textContent = 'Ошибка проверки кода';
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Подтвердить';
    }
  }

  showSuccess(message) {
    const smsCodeSection = document.getElementById('smsCodeSection');
    smsCodeSection.innerHTML = `<div class="success-message">✅ ${message}</div>`;
  }

  showError(message) {
    const smsStatus = document.getElementById('smsStatus');
    smsStatus.innerHTML = `<div class="error-message">❌ ${message}</div>`;
  }

  showModal() {
    this.smsModal.style.display = 'flex';
    setTimeout(() => this.smsModal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
  }

  hideModal() {
    this.smsModal.classList.remove('show');
    setTimeout(() => {
      this.smsModal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
    
    // Clean up
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.smsTimer) {
      clearInterval(this.smsTimer);
      this.smsTimer = null;
    }
  }

  cancelPayment() {
    this.hideModal();
    // Restore payment button
    const payBtn = document.querySelector('.pay-btn');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.classList.remove('loading');
      payBtn.textContent = 'Pay and complete booking';
    }
  }
}

// Initialize SMS verification when page loads
window.paymentSMS = new PaymentSMSVerification();