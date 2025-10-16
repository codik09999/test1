// Bus Results Page JavaScript
class BusResultsPage {
    constructor() {
        this.currentDate = new Date();
        this.isLoading = false;
        this.searchParams = this.parseUrlParams();
        this.init();
    }
    
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            from: urlParams.get('from') || 'Warszawa',
            to: urlParams.get('to') || 'Berlin',
            date: urlParams.get('date') || new Date().toISOString().split('T')[0],
            passengers: urlParams.get('passengers') || '1',
            tripType: urlParams.get('tripType') || 'oneway'
        };
    }

    init() {
        this.updatePageWithSearchData();
        this.initEventListeners();
        this.initDateNavigation();
        this.initQuickDates();
        this.simulateRealTimeUpdates();
    }
    
    updatePageWithSearchData() {
        // Обновляем города
        const fromCityElement = document.querySelector('.from-input .city-name');
        const toCityElement = document.querySelector('.to-input .city-name');
        if (fromCityElement) fromCityElement.textContent = this.searchParams.from;
        if (toCityElement) toCityElement.textContent = this.searchParams.to;
        
        // Trip type selector removed
        
        // Обновляем пассажиров
        const passengerText = document.querySelector('.passenger-text');
        if (passengerText) {
            const count = this.searchParams.passengers;
            const text = count === '1' ? '1 Adult' : `${count} Adults`;
            passengerText.textContent = text;
        }
        
        // Обновляем дату
        if (this.searchParams.date) {
            this.currentDate = new Date(this.searchParams.date);
        }
        
        this.updateDateDisplay();
        this.updateQuickDates();
        
        // Обновляем города в карточках автобусов
        const departureCities = document.querySelectorAll('.departure-city');
        const arrivalCities = document.querySelectorAll('.arrival-city');
        
        departureCities.forEach(element => {
            element.textContent = this.searchParams.from;
        });
        
        arrivalCities.forEach(element => {
            element.textContent = this.searchParams.to;
        });
    }

    initEventListeners() {
        // Trip type selector removed

        // Route swap button
        const swapBtn = document.querySelector('.swap-route-btn');
        if (swapBtn) {
            swapBtn.addEventListener('click', this.swapRoute.bind(this));
        }

        // Date navigation
        const prevBtn = document.querySelector('.date-nav-btn.prev');
        const nextBtn = document.querySelector('.date-nav-btn.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeDate(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeDate(1));
        }

        // Select buttons
        const selectButtons = document.querySelectorAll('.select-btn');
        selectButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectBus(index));
        });

        // Load more button
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.loadMoreResults.bind(this));
        }

        // Search inputs (simulate functionality)
        const searchInputs = document.querySelectorAll('.city-display, .date-display, .passengers-display');
        searchInputs.forEach(input => {
            input.addEventListener('click', () => {
                this.showSearchModal(input.closest('.input-group'));
            });
        });
    }

    initDateNavigation() {
        this.updateDateDisplay();
    }

    initQuickDates() {
        const quickDateBtns = document.querySelectorAll('.quick-date-btn');
        quickDateBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                quickDateBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const newDate = new Date(this.currentDate);
                newDate.setDate(newDate.getDate() + index - 1);
                this.currentDate = newDate;
                this.updateDateDisplay();
                this.searchBuses();
            });
        });
    }

    // Trip type methods removed

    swapRoute() {
        const fromCity = document.querySelector('.from-input .city-name');
        const toCity = document.querySelector('.to-input .city-name');
        
        if (fromCity && toCity) {
            const tempText = fromCity.textContent;
            fromCity.textContent = toCity.textContent;
            toCity.textContent = tempText;
            
            // Trigger new search
            setTimeout(() => {
                this.searchBuses();
            }, 300);
        }
    }

    changeDate(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentDate = newDate;
        this.updateDateDisplay();
        this.updateQuickDates();
        this.searchBuses();
    }

    updateDateDisplay() {
        const dateText = document.querySelector('.date-text');
        if (dateText) {
            const options = { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short'
            };
            const today = new Date();
            
            let dateString = this.currentDate.toLocaleDateString('en-US', options);
            
            // Add "Today" or "Tomorrow" labels
            if (this.isSameDate(this.currentDate, today)) {
                dateString = `Today, ${dateString.split(', ')[1]}`;
            } else if (this.isSameDate(this.currentDate, new Date(today.getTime() + 86400000))) {
                dateString = `Tomorrow, ${dateString.split(', ')[1]}`;
            }
            
            dateText.textContent = dateString;
        }
    }

    updateQuickDates() {
        const quickDateBtns = document.querySelectorAll('.quick-date-btn');
        const baseDate = new Date(this.currentDate);
        baseDate.setDate(baseDate.getDate() - 1);
        
        quickDateBtns.forEach((btn, index) => {
            const btnDate = new Date(baseDate);
            btnDate.setDate(btnDate.getDate() + index);
            
            const options = { weekday: 'short', day: 'numeric', month: 'short' };
            btn.textContent = btnDate.toLocaleDateString('en-US', options);
            
            // Update active state
            if (this.isSameDate(btnDate, this.currentDate)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    selectBus(index) {
        const busOption = document.querySelectorAll('.bus-option')[index];
        if (busOption) {
            // Add selection animation
            busOption.style.transform = 'scale(0.98)';
            busOption.style.transition = 'transform 0.1s ease';
            
            setTimeout(() => {
                busOption.style.transform = 'scale(1)';
                // Navigate to booking page
                this.proceedToBooking(index);
            }, 100);
        }
    }

    proceedToBooking(busIndex) {
        // Show loading state
        const btn = document.querySelectorAll('.select-btn')[busIndex];
        const originalText = btn.textContent;
        btn.textContent = 'Loading...';
        btn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // In a real app, this would navigate to booking page
            console.log(`Proceeding to booking for bus ${busIndex}`);
            alert('Redirecting to booking page...');
            
            // Reset button
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1500);
    }

    loadMoreResults() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadBtn = document.querySelector('.load-more-btn');
        const originalContent = loadBtn.innerHTML;
        
        loadBtn.innerHTML = `
            <span>Loading...</span>
            <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top: 2px solid #1e40af; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        `;
        
        // Simulate loading more results
        setTimeout(() => {
            this.addMoreBusOptions();
            loadBtn.innerHTML = originalContent;
            this.isLoading = false;
        }, 2000);
    }

    addMoreBusOptions() {
        const resultsList = document.querySelector('.results-list');
        const loadMore = document.querySelector('.load-more');
        
        // Mock data for additional bus options
        const newBusOptions = [
            {
                departure: { time: '14:30', location: 'Warszawa (Młociny)' },
                arrival: { time: '03:45', location: 'Berlin (ZOB)', nextDay: true },
                duration: '13:15 hrs',
                price: '€79.99',
                amenities: ['📶', '🔌', '❄️'],
                availability: 'Few seats left',
                badges: ['COMFORTABLE']
            },
            {
                departure: { time: '22:00', location: 'Warszawa (PKS)' },
                arrival: { time: '11:30', location: 'Berlin (Alexanderplatz)', nextDay: true },
                duration: '13:30 hrs',
                price: '€74.50',
                amenities: ['📶', '🔌'],
                availability: 'Available',
                badges: ['ECO-FRIENDLY']
            }
        ];

        newBusOptions.forEach(bus => {
            const busElement = this.createBusOptionElement(bus);
            resultsList.insertBefore(busElement, loadMore);
        });

        // Update results count
        const resultsCount = document.querySelector('.results-count');
        const currentCount = parseInt(resultsCount.textContent.match(/\d+/)[0]);
        resultsCount.textContent = `${currentCount + newBusOptions.length} results`;
    }

    createBusOptionElement(busData) {
        const busOption = document.createElement('div');
        busOption.className = 'bus-option';
        busOption.style.opacity = '0';
        busOption.style.transform = 'translateY(20px)';
        
        busOption.innerHTML = `
            <div class="bus-info">
                <div class="time-info">
                    <div class="departure">
                        <span class="time">${busData.departure.time}</span>
                        <span class="location">${busData.departure.location}</span>
                    </div>
                    
                    <div class="journey-info">
                        <span class="duration">${busData.duration}</span>
                        <div class="journey-line"></div>
                    </div>
                    
                    <div class="arrival">
                        <span class="time">${busData.arrival.time}${busData.arrival.nextDay ? ' <small>+1 day</small>' : ''}</span>
                        <span class="location">${busData.arrival.location}</span>
                    </div>
                </div>
                
                <div class="bus-details">
                    <div class="transport-type">
                        <span class="bus-icon">🚌</span>
                        <span class="type-text">Bus</span>
                        <span class="direct-badge">Direct</span>
                    </div>
                    <div class="amenities">
                        ${busData.amenities.map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
                        <span class="availability">${busData.availability}</span>
                    </div>
                </div>
            </div>
            
            <div class="pricing-info">
                <div class="price-section">
                    <span class="price">${busData.price.replace('.', '<small>.')}</small></span>
                    <div class="price-badges">
                        ${busData.badges.map(badge => `<span class="price-badge">${badge}</span>`).join('')}
                    </div>
                </div>
                <button class="select-btn">Continue</button>
            </div>
        `;

        // Add event listener to new select button
        const selectBtn = busOption.querySelector('.select-btn');
        selectBtn.addEventListener('click', () => {
            const allOptions = document.querySelectorAll('.bus-option');
            const index = Array.from(allOptions).indexOf(busOption);
            this.selectBus(index);
        });

        // Animate in
        setTimeout(() => {
            busOption.style.transition = 'all 0.5s ease';
            busOption.style.opacity = '1';
            busOption.style.transform = 'translateY(0)';
        }, 100);

        return busOption;
    }

    searchBuses() {
        // Simulate search with loading state
        const busOptions = document.querySelectorAll('.bus-option');
        busOptions.forEach((option, index) => {
            setTimeout(() => {
                option.style.opacity = '0.5';
                option.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    option.style.opacity = '1';
                    option.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    }

    showSearchModal(inputGroup) {
        const inputType = inputGroup.querySelector('label').textContent.toLowerCase();
        console.log(`Opening search modal for: ${inputType}`);
        
        // In a real app, this would open a search modal
        switch(inputType) {
            case 'from':
            case 'to':
                alert('City search modal would open here');
                break;
            case 'departure':
                alert('Date picker would open here');
                break;
            case 'passengers':
                alert('Passenger selector would open here');
                break;
        }
    }

    simulateRealTimeUpdates() {
        // Simulate real-time price and availability updates
        setInterval(() => {
            const availabilityElements = document.querySelectorAll('.availability');
            const warningElements = document.querySelectorAll('.availability-warning');
            
            // Randomly update availability status
            availabilityElements.forEach(element => {
                if (Math.random() < 0.1) { // 10% chance to update
                    const statuses = ['Almost full', 'Few seats left', 'Available', 'Limited seats'];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    element.textContent = randomStatus;
                }
            });
            
            // Update seat warnings
            warningElements.forEach(element => {
                if (Math.random() < 0.05) { // 5% chance to update
                    const warnings = [
                        '1 seat left at this price',
                        '2 seats left at this price',
                        '3 seats left at this price',
                        'Last seats at this price'
                    ];
                    const randomWarning = warnings[Math.floor(Math.random() * warnings.length)];
                    element.textContent = randomWarning;
                }
            });
        }, 30000); // Update every 30 seconds
    }
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BusResultsPage();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BusResultsPage;
}