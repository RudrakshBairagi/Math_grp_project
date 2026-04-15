document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    
    let currentSlide = 0;
    let chartRendered = false;

    // Initialization
    updateControls();

    // Chart Data (Slide 4)
    const simulatedData = [16, 8, 13, 12, 17, 17, 20, 10, 14, 8, 12, 15, 8, 12, 16, 15, 12, 16, 18, 6, 18, 17, 13, 11, 22, 13, 10, 10, 19, 16];
    
    function renderChart() {
        if (chartRendered) return;
        const ctx = document.getElementById('erDataChart').getContext('2d');
        
        // Setup modern gradient for bar
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(79, 172, 254, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 242, 254, 0.2)');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: simulatedData.map((_, i) => `Day ${i + 1}`),
                datasets: [{
                    label: 'Hospital ER Arrivals (Patients/hr)',
                    data: simulatedData,
                    backgroundColor: gradient,
                    borderColor: '#4facfe',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#a0aec0', font: { family: 'Inter' } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0aec0' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0aec0' }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
        chartRendered = true;
    }

    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;
        
        slides[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        
        updateControls();
        
        // Render Chart if Slide index 3 (0-indexed 4th slide) is hit
        if (currentSlide === 3) {
            setTimeout(() => {
                renderChart();
            }, 300);
        }
    }

    function updateControls() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === slides.length - 1;
        
        const progressPercentage = ((currentSlide + 1) / slides.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    // Event Listeners
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
        }
    });

    // Optional click anywhere on slide to progress
    document.querySelector('.presentation-container').addEventListener('click', (e) => {
        if(e.target.closest('.control-btn') !== null) return;
        if(currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
        }
    });
});
