// Modern Bus JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Header scroll effect
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
    
    // Trip tabs functionality
    const tripTabs = document.querySelectorAll('.trip-tab');
    tripTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tripTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
        });
    });
    
    // Swap button functionality
    const swapButton = document.getElementById('swapButton');
    if (swapButton) {
        swapButton.addEventListener('click', () => {
            const fromInput = document.querySelector('.form-input[value="Warszawa"]');
            const toInput = document.querySelector('.form-input[value="Kraków"]');
            
            if (fromInput && toInput) {
                const temp = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = temp;
                
                // Add rotation animation
                swapButton.style.transform = 'rotate(180deg)';
                setTimeout(() => {
                    swapButton.style.transform = 'rotate(0deg)';
                }, 300);
            }
        });
    }
    
    // Search form submission
    const searchForm = document.getElementById('searchForm');
    const searchButton = document.getElementById('searchButton');
    const searchModal = document.getElementById('searchModal');
    const modalClose = document.getElementById('modalClose');
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Add ripple effect to button
            addRippleEffect(searchButton, e);
            
            // Show modal after short delay
            setTimeout(() => {
                if (searchModal) {
                    searchModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            }, 300);
            
            // Hide modal after 3 seconds
            setTimeout(() => {
                if (searchModal) {
                    searchModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            }, 3000);
        });
    }
    
    // Modal close functionality
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            searchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal on outside click
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Ripple effect for buttons
    function addRippleEffect(button, event) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('btn-ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add ripple effect to all buttons
    const buttons = document.querySelectorAll('.btn-search, .btn-primary, .route-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!button.querySelector('.btn-ripple')) {
                addRippleEffect(button, e);
            }
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-delay');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
    
    // Counter animation for statistics
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on target
            if (target.toString().includes('%')) {
                element.textContent = Math.round(current) + '%';
            } else if (target.toString().includes('-')) {
                element.textContent = '-' + Math.round(Math.abs(current)) + '%';
            } else {
                element.textContent = Math.round(current);
            }
        }, 16);
    }
    
    // Animate counters when they come into view
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const text = entry.target.textContent;
                let target = parseInt(text);
                
                if (text.includes('%')) {
                    target = parseInt(text.replace('%', ''));
                } else if (text.includes('-')) {
                    target = -parseInt(text.replace('-', '').replace('%', ''));
                }
                
                animateCounter(entry.target, target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });
    
    // Form input animations and validation
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        // Add focus and blur effects
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Add input validation
        input.addEventListener('input', () => {
            if (input.value.length > 0) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });
    
    // Route card hover effects
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Feature card hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.1)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroPattern = document.querySelector('.hero-pattern');
        const floatingElements = document.querySelectorAll('.floating-circle');
        
        if (heroPattern) {
            heroPattern.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
    
    // Add loading states to buttons
    function addLoadingState(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ładowanie...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', (e) => {
        // Close modal with Escape key
        if (e.key === 'Escape' && searchModal.style.display === 'block') {
            searchModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Submit form with Enter key
        if (e.key === 'Enter' && document.activeElement.classList.contains('form-input')) {
            e.preventDefault();
            searchForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Add focus trap for modal
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    if (searchModal) {
        trapFocus(searchModal);
    }
    
    // Performance optimization: debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debouncing to scroll-heavy functions
    const debouncedScrollHandler = debounce(() => {
        // Any performance-heavy scroll operations go here
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // Initialize tooltips and accessibility features
    function initializeAccessibility() {
        // Add ARIA labels where needed
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (button.textContent) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
        
        // Add role attributes
        const cards = document.querySelectorAll('.route-card, .feature-card');
        cards.forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
        });
    }
    
    initializeAccessibility();
    
    // Add custom cursor effects
    const interactiveElements = document.querySelectorAll(
        'button, a, .route-card, .feature-card, input, select'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            document.body.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', () => {
            document.body.style.cursor = 'default';
        });
    });
    
    // Add page load animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Trigger hero animations
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.fade-in, .fade-in-delay');
            heroElements.forEach(el => {
                el.style.animationPlayState = 'running';
            });
        }, 100);
    });
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}