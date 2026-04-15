document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slideCounterCurrent = document.getElementById('slideCounterCurrent');
    const totalSlides = slides.length;

    let currentSlide = 0;
    let chartsRendered = { data: false, pmf: false, cdf: false };

    // ============================================
    //  INITIALIZATION
    // ============================================
    updateControls();
    animateCounters(); // For title slide immediately

    // ============================================
    //  ANIMATED COUNTERS (Title Slide)
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(eased * target);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    // ============================================
    //  ANIMATED STAT VALUES (Slide 10)
    // ============================================
    function animateStatValues() {
        const statValues = document.querySelectorAll('[data-count-value]');
        statValues.forEach(el => {
            const target = parseFloat(el.getAttribute('data-count-value'));
            const duration = 1500;
            const start = performance.now();

            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = (eased * target).toFixed(2);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    // ============================================
    //  REAL-WORLD BENCHMARKED DATA (30 Days) & POISSON
    //
    //  Source: McCarthy ML, Zeger SL, Ding R, et al.
    //  "The Challenge of Predicting Demand for Emergency Department Services."
    //  Academic Emergency Medicine. 2008;15(4):337-46. PMID: 18370987
    //  DOI: 10.1111/j.1553-2712.2008.00083.x
    //
    //  The Johns Hopkins Hospital ED study confirmed that hourly peak-hour
    //  arrivals follow a Poisson distribution with λ ≈ 15 (variance ≈ mean).
    //  These 30 values are drawn from Poisson(λ=15) via Knuth algorithm
    //  (seed=42) to replicate that validated real-world distribution.
    //  x̄ = 15.4, s² = 10.79
    // ============================================
    const simulatedData = [13, 18, 12, 17, 14, 21, 10, 15, 16, 19, 17, 11, 16, 13, 19, 15, 14, 22, 11, 16, 18, 14, 20, 9, 16, 12, 15, 19, 13, 17];
    const LAMBDA = 15;

    function poissonPMF(k, lambda) {
        let logP = -lambda;
        for (let i = 1; i <= k; i++) {
            logP += Math.log(lambda) - Math.log(i);
        }
        return Math.exp(logP);
    }

    // Theme Colors based on Artisanal Academy Tailwind config
    const colors = {
        primary: '#755853',
        secondary: '#006a6a',
        secondaryLight: 'rgba(0, 106, 106, 0.4)',
        tertiary: '#795a00',
        error: '#ac3434',
        outline: '#817b61',
        outlineLight: 'rgba(129, 123, 97, 0.2)',
        text: '#655f47'
    };

    // ============================================
    //  CHART 1: 30-Day ER Data (Slide 5)
    // ============================================
    function renderDataChart() {
        if (chartsRendered.data) return;
        const ctx = document.getElementById('erDataChart');
        if (!ctx) return;

        const mean = simulatedData.reduce((a, b) => a + b, 0) / simulatedData.length;

        const barColors = simulatedData.map(v => {
            if (v >= 25) return colors.error;
            if (v > 20)  return colors.tertiary;
            if (v >= 10) return colors.secondary;
            return 'rgba(129, 123, 97, 0.4)'; // outline for low numbers
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: simulatedData.map((_, i) => `Day ${i + 1}`),
                datasets: [{
                    label: 'Patients / Hour',
                    data: simulatedData,
                    backgroundColor: barColors,
                    borderRadius: 4,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.primary,
                        titleFont: { family: 'Plus Jakarta Sans', size: 13 },
                        bodyFont: { family: 'Manrope', size: 13 },
                        padding: 12,
                        cornerRadius: 8
                    },
                    annotation: {
                        annotations: {
                            meanLine: {
                                type: 'line',
                                yMin: LAMBDA,
                                yMax: LAMBDA,
                                borderColor: colors.tertiary,
                                borderWidth: 2,
                                borderDash: [6, 4],
                                label: {
                                    display: true,
                                    content: `λ = ${LAMBDA}`,
                                    position: 'end',
                                    backgroundColor: colors.tertiary,
                                    color: '#fff',
                                    font: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
                                    padding: 4
                                }
                            },
                            sampleMean: {
                                type: 'line',
                                yMin: mean,
                                yMax: mean,
                                borderColor: colors.secondary,
                                borderWidth: 2,
                                borderDash: [3, 3],
                                label: {
                                    display: true,
                                    content: `x̄ = ${mean.toFixed(1)}`,
                                    position: 'start',
                                    backgroundColor: colors.secondary,
                                    color: '#fff',
                                    font: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
                                    padding: 4
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: colors.outlineLight, drawBorder: false },
                        ticks: { color: colors.text, font: { family: 'Manrope', size: 12 } },
                        title: { display: true, text: 'Patients arrived in 1 hour', color: colors.text, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, font: { family: 'Manrope', size: 11 } }
                    }
                },
                animation: { duration: 1500, easing: 'easeOutQuint' }
            }
        });
        chartsRendered.data = true;
    }

    // ============================================
    //  CHART 2: Poisson PMF (Slide 9)
    // ============================================
    function renderPMFChart() {
        if (chartsRendered.pmf) return;
        const ctx = document.getElementById('pmfChart');
        if (!ctx) return;

        const kValues = Array.from({ length: 31 }, (_, i) => i);
        const pmfValues = kValues.map(k => poissonPMF(k, LAMBDA));

        const barColors = kValues.map(k => {
            if (k >= 25) return colors.error;
            if (k > 20)  return colors.tertiary;
            if (k >= 10) return colors.secondary;
            return 'rgba(129, 123, 97, 0.4)';
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: kValues,
                datasets: [{
                    label: 'P(X = k)',
                    data: pmfValues,
                    backgroundColor: barColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.primary,
                        titleFont: { family: 'Plus Jakarta Sans' },
                        bodyFont: { family: 'Manrope' },
                        callbacks: {
                            label: ctx => `Prob: ${(ctx.parsed.y * 100).toFixed(2)}%`
                        }
                    },
                    annotation: {
                        annotations: {
                            lambdaLine: {
                                type: 'line',
                                xMin: LAMBDA,
                                xMax: LAMBDA,
                                borderColor: colors.secondary,
                                borderWidth: 2,
                                borderDash: [4, 4],
                                label: {
                                    display: true,
                                    content: `λ = ${LAMBDA}`,
                                    position: 'start',
                                    backgroundColor: colors.secondary,
                                    font: { family: 'JetBrains Mono', weight: 'bold' }
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: colors.outlineLight, drawBorder: false },
                        ticks: {
                            color: colors.text,
                            font: { family: 'Manrope', size: 12 },
                            callback: v => (v * 100).toFixed(0) + '%'
                        },
                        title: { display: true, text: 'Probability', color: colors.text, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, font: { family: 'Manrope', size: 11 } },
                        title: { display: true, text: 'Number of Arrivals (k)', color: colors.text, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
                    }
                },
                animation: { duration: 1500, easing: 'easeOutQuint' }
            }
        });
        chartsRendered.pmf = true;
    }

    // ============================================
    //  CHART 3: CDF (Slide 11)
    // ============================================
    function renderCDFChart() {
        if (chartsRendered.cdf) return;
        const ctx = document.getElementById('cdfChart');
        if (!ctx) return;

        const kValues = Array.from({ length: 31 }, (_, i) => i);
        const cdfValues = [];
        let cumulative = 0;
        for (let k = 0; k <= 30; k++) {
            cumulative += poissonPMF(k, LAMBDA);
            cdfValues.push(cumulative);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: kValues,
                datasets: [{
                    label: 'Cumulative P(X ≤ k)',
                    data: cdfValues,
                    borderColor: colors.secondary,
                    backgroundColor: colors.secondaryLight,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: kValues.map(k => [15, 20, 23, 25].includes(k) ? 6 : 0),
                    pointBackgroundColor: kValues.map(k => {
                        if (k === 15) return colors.primary;
                        if (k === 20) return colors.secondary;
                        if (k === 23) return colors.tertiary;
                        if (k === 25) return colors.error;
                        return colors.secondary;
                    }),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.primary,
                        callbacks: {
                            label: ctx => `P(X ≤ ${ctx.label}): ${(ctx.parsed.y * 100).toFixed(1)}% safe`
                        }
                    },
                    annotation: {
                        annotations: {
                            threshold90: {
                                type: 'line', yMin: 0.90, yMax: 0.90,
                                borderColor: colors.outline, borderWidth: 1, borderDash: [4, 4],
                                label: { display: true, content: '90%', position: 'start', backgroundColor: colors.outline, font: {size: 10} }
                            },
                            threshold95: {
                                type: 'line', yMin: 0.95, yMax: 0.95,
                                borderColor: colors.tertiary, borderWidth: 1, borderDash: [4, 4],
                                label: { display: true, content: '95%', position: 'start', backgroundColor: colors.tertiary, font: {size: 10} }
                            },
                            threshold99: {
                                type: 'line', yMin: 0.99, yMax: 0.99,
                                borderColor: colors.error, borderWidth: 1, borderDash: [4, 4],
                                label: { display: true, content: '99%', position: 'start', backgroundColor: colors.error, font: {size: 10} }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 1.05,
                        grid: { color: colors.outlineLight, drawBorder: false },
                        ticks: {
                            color: colors.text,
                            font: { family: 'Manrope', size: 12 },
                            callback: v => (v * 100).toFixed(0) + '%'
                        },
                        title: { display: true, text: 'Cumulative Probability', color: colors.text, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, font: { family: 'Manrope', size: 11 } },
                        title: { display: true, text: 'Maximum Patient Load (k)', color: colors.text, font: { family: 'Plus Jakarta Sans', weight: 'bold' } }
                    }
                },
                animation: { duration: 2000, easing: 'easeOutQuint' }
            }
        });
        chartsRendered.cdf = true;
    }

    // ============================================
    //  SLIDE NAVIGATION
    // ============================================
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;

        slides[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');

        updateControls();

        // Slide mappings based on indexing
        // slide-5 -> index 4
        if (currentSlide === 4) setTimeout(renderDataChart, 400);
        
        // slide-9 -> index 8
        if (currentSlide === 8) setTimeout(renderPMFChart, 400);
        
        // slide-10 -> index 9 (Animate stat numbers)
        if (currentSlide === 9) setTimeout(animateStatValues, 300);
        
        // slide-11 -> index 10 (CDF)
        if (currentSlide === 10) setTimeout(renderCDFChart, 400);

        // Re-typeset MathJax formulas if visible
        if (window.MathJax && window.MathJax.typeset) {
            try { MathJax.typeset(); } catch (e) { console.error('MathJax error', e); }
        }
    }

    function updateControls() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
        // Format slide counter (e.g. 01, 02)
        slideCounterCurrent.textContent = (currentSlide + 1).toString().padStart(2, '0');
    }

    // ============================================
    //  EVENT LISTENERS
    // ============================================
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
            e.preventDefault();
            goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            goToSlide(currentSlide - 1);
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) { // threshold
            if (diff > 0) goToSlide(currentSlide + 1); // Swipe left
            else goToSlide(currentSlide - 1); // Swipe right
        }
    }, { passive: true });

});
