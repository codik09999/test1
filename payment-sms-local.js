// Local SMS Verification System (без webhook сервера)
class LocalPaymentSMS {
  constructor() {
    this.currentBookingId = null;
    this.smsModal = null;
    this.pollingInterval = null;
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
            <p class="sms-description">Проверьте Telegram и нажмите кнопку "📱 Отправить SMS"</p>
          </div>
          
          <div class="sms-status" id="smsStatus">
            <div class="loading-spinner"></div>
            <p>Ожидание подтверждения администратора...</p>
          </div>
          
          <div class="sms-code-section" id="smsCodeSection" style="display: none;">
            <p>Введите SMS код из Telegram:</p>
            <div class="sms-input-container">
              <input type="text" id="smsCodeInput" placeholder="000000" maxlength="6" pattern="[0-9]{6}">
              <button id="verifySMSBtn" class="verify-btn">Подтвердить</button>
            </div>
            <div class="sms-error" id="smsError"></div>
            <div class="sms-timer" id="smsTimer">Код действителен: <span>05:00</span></div>
          </div>
          
          <div class="sms-debug" id="smsDebug" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <strong>Для тестирования:</strong><br>
            1. Проверьте Telegram на уведомление<br>
            2. Нажмите "📱 Отправить SMS"<br>
            3. Введите код из Telegram<br><br>
            <strong>Симуляция:</strong><br>
            <button id="simulateSMSBtn" style="padding: 5px 10px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Симулировать SMS</button>
            <span id="simulatedCode" style="font-weight: bold; color: green;"></span>
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
    
    // Add CSS styles (same as before but simplified)
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
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .sms-modal.show { opacity: 1; }
        .sms-modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }
        .sms-modal.show .sms-modal-content { transform: translateY(0); }
        .sms-header { text-align: center; margin-bottom: 24px; }
        .sms-header h2 { margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 700; }
        .sms-description { color: #6b7280; margin: 0; font-size: 14px; }
        .sms-status { text-align: center; padding: 20px 0; }
        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .sms-code-section { text-align: center; margin: 24px 0; }
        .sms-input-container { display: flex; gap: 12px; justify-content: center; align-items: center; margin: 16px 0; }
        #smsCodeInput {
          padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px;
          font-size: 18px; font-weight: 600; text-align: center; letter-spacing: 2px;
          width: 120px; transition: border-color 0.2s ease;
        }
        #smsCodeInput:focus { outline: none; border-color: #3b82f6; }
        #smsCodeInput.error { border-color: #ef4444; }
        .verify-btn {
          background: #3b82f6; color: white; border: none; padding: 12px 24px;
          border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease;
        }
        .verify-btn:hover { background: #2563eb; }
        .verify-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .sms-error { color: #ef4444; font-size: 14px; margin-top: 8px; min-height: 20px; }
        .sms-timer { color: #f59e0b; font-size: 14px; font-weight: 600; margin-top: 12px; }
        .sms-actions { display: flex; justify-content: center; margin-top: 24px; }
        .cancel-btn {
          background: #6b7280; color: white; border: none; padding: 10px 20px;
          border-radius: 6px; cursor: pointer; font-weight: 500;
        }
        .cancel-btn:hover { background: #4b5563; }
        .success-message { text-align: center; color: #10b981; font-weight: 600; padding: 20px; }
        .error-message { text-align: center; color: #ef4444; font-weight: 600; padding: 20px; }
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

    // Simulate SMS button (for testing)
    document.getElementById('simulateSMSBtn').addEventListener('click', () => {
      this.simulateSMS();
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

  async startPaymentFlow(bookingId, orderData) {
    console.log('🔐 Starting LOCAL SMS payment flow for booking:', bookingId);
    
    this.currentBookingId = bookingId;
    
    // Store session data locally
    const sessionData = {
      bookingId,
      orderData,
      status: 'pending_approval',
      createdAt: Date.now()
    };
    
    localStorage.setItem(`sms_session_${bookingId}`, JSON.stringify(sessionData));
    
    // Show modal
    this.showModal();
    
    // Start polling for SMS status (simulate server communication)
    this.startStatusPolling();
  }

  startStatusPolling() {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5 second intervals
    
    this.pollingInterval = setInterval(() => {
      attempts++;
      
      // Check localStorage for SMS status updates
      const smsData = localStorage.getItem(`sms_data_${this.currentBookingId}`);
      
      if (smsData) {
        const data = JSON.parse(smsData);
        console.log('📱 SMS status update:', data);
        
        if (data.status === 'sms_sent') {
          this.showSMSInput(data.smsCode);
          this.startTimer();
          clearInterval(this.pollingInterval);
        } else if (data.status === 'declined') {
          this.showError('Оплата отклонена администратором');
          clearInterval(this.pollingInterval);
        }
      }
      
      if (attempts >= maxAttempts) {
        this.showError('Время ожидания истекло');
        clearInterval(this.pollingInterval);
      }
    }, 5000); // Check every 5 seconds
  }

  simulateSMS() {
    // Generate and show SMS code for testing
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store SMS data
    const smsData = {
      bookingId: this.currentBookingId,
      smsCode: smsCode,
      status: 'sms_sent',
      timestamp: Date.now()
    };
    
    localStorage.setItem(`sms_data_${this.currentBookingId}`, JSON.stringify(smsData));
    
    // Show code in debug section
    document.getElementById('simulatedCode').textContent = `Код: ${smsCode}`;
    
    // Show success message
    this.updateStatus('SMS симулирована! Код: ' + smsCode);
    
    setTimeout(() => {
      this.showSMSInput(smsCode);
      this.startTimer();
    }, 1000);
  }

  updateStatus(message) {
    document.getElementById('smsStatus').innerHTML = `
      <div class="loading-spinner"></div>
      <p>${message}</p>
    `;
  }

  showSMSInput(smsCode = null) {
    document.getElementById('smsStatus').style.display = 'none';
    document.getElementById('smsCodeSection').style.display = 'block';
    document.getElementById('smsCodeInput').focus();
    
    if (smsCode) {
      // Auto-fill for testing
      document.getElementById('smsCodeInput').value = smsCode;
    }
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
      // Get stored SMS data
      const smsData = JSON.parse(localStorage.getItem(`sms_data_${this.currentBookingId}`));
      
      if (!smsData) {
        throw new Error('SMS данные не найдены');
      }
      
      // Check SMS code expiration (5 minutes)
      const SMS_TIMEOUT = 5 * 60 * 1000;
      if (Date.now() - smsData.timestamp > SMS_TIMEOUT) {
        throw new Error('SMS код истек');
      }
      
      // Verify code
      if (smsData.smsCode !== smsCode) {
        throw new Error('Неверный SMS код');
      }
      
      // Success!
      this.showSuccess('Оплата подтверждена!');
      
      // Move pending payment to completed
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        localStorage.setItem('paymentComplete', pendingPayment);
        localStorage.removeItem('pendingPayment');
      }
      
      // Clean up
      localStorage.removeItem(`sms_session_${this.currentBookingId}`);
      localStorage.removeItem(`sms_data_${this.currentBookingId}`);
      
      setTimeout(() => {
        this.hideModal();
        window.location.href = 'confirmation.html';
      }, 2000);
      
    } catch (error) {
      console.error('SMS verification error:', error);
      errorElement.textContent = error.message;
      document.getElementById('smsCodeInput').classList.add('error');
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
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
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

// Initialize local SMS verification
window.paymentSMS = new LocalPaymentSMS();