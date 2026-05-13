document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const btnExplore = document.getElementById('btn-explore');
    const btnQuiz = document.getElementById('btn-quiz');
    const exploreSection = document.getElementById('explore-section');
    const quizSection = document.getElementById('quiz-section');
    
    // Explore Elements
    const exploreNum = document.getElementById('explore-numerator');
    const exploreDen = document.getElementById('explore-denominator');
    
    // Quiz Elements
    const quizNum = document.getElementById('quiz-numerator');
    const quizDen = document.getElementById('quiz-denominator');
    const btnCheck = document.getElementById('btn-check');
    const btnNext = document.getElementById('btn-next');
    const feedbackMsg = document.getElementById('feedback-message');
    
    // State
    let currentQuizNum = 0;
    let currentQuizDen = 0;
    
    // Mode Switching
    btnExplore.addEventListener('click', () => {
        btnExplore.classList.add('active');
        btnQuiz.classList.remove('active');
        exploreSection.classList.add('active-section');
        quizSection.classList.remove('active-section');
        updateExploreChart();
    });
    
    btnQuiz.addEventListener('click', () => {
        btnQuiz.classList.add('active');
        btnExplore.classList.remove('active');
        quizSection.classList.add('active-section');
        exploreSection.classList.remove('active-section');
        startNewQuiz();
    });
    
    // SVG Drawing Function
    function drawPieChart(svgId, numerator, denominator) {
        const svg = document.getElementById(svgId);
        svg.innerHTML = ''; // Clear existing slices
        
        // Ensure values are numbers
        numerator = parseInt(numerator);
        denominator = parseInt(denominator);
        
        // Validation
        if (isNaN(numerator) || isNaN(denominator) || denominator <= 0) return;
        if (numerator > denominator) numerator = denominator; // Clamp to 100%
        
        // Full circle special case
        if (denominator === 1 || numerator === denominator) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", "0");
            circle.setAttribute("cy", "0");
            circle.setAttribute("r", "1");
            circle.setAttribute("fill", numerator === denominator && denominator > 0 ? "var(--slice-filled)" : "var(--slice-empty)");
            if (denominator > 1) {
                // If denominator > 1 but fully colored, we still want to show lines. We can just draw individual slices
            } else {
                svg.appendChild(circle);
                return;
            }
        }
        
        // Draw slices
        for (let i = 0; i < denominator; i++) {
            const startAngle = (i * 360) / denominator;
            const endAngle = ((i + 1) * 360) / denominator;
            
            // Convert to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            // Calculate coordinates (radius = 1)
            const x1 = Math.cos(startRad);
            const y1 = Math.sin(startRad);
            const x2 = Math.cos(endRad);
            const y2 = Math.sin(endRad);
            
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
            
            // Create path
            const pathData = `
                M 0 0 
                L ${x1} ${y1} 
                A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} 
                Z
            `;
            
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData.trim());
            
            // Determine color (fill first 'numerator' slices)
            const isFilled = i < numerator;
            path.setAttribute("fill", isFilled ? "var(--slice-filled)" : "var(--slice-empty)");
            path.setAttribute("stroke", "var(--stroke-color)");
            path.setAttribute("stroke-width", "0.02");
            path.classList.add('slice');
            
            svg.appendChild(path);
        }
    }
    
    // Explore Logic
    function updateExploreChart() {
        let n = parseInt(exploreNum.value);
        let d = parseInt(exploreDen.value);
        
        if (d < 1) {
            d = 1;
            exploreDen.value = 1;
        }
        if (n < 0) {
            n = 0;
            exploreNum.value = 0;
        }
        if (n > d) {
            n = d; // Let's auto-correct, or allow improper fractions? 
            // For simple 5th grade visualizer, limit to 1.
            exploreNum.value = d;
        }
        
        drawPieChart('explore-pie', n, d);
    }
    
    exploreNum.addEventListener('input', updateExploreChart);
    exploreDen.addEventListener('input', updateExploreChart);
    
    // Quiz Logic
    function startNewQuiz() {
        // Generate random fraction (1/2 to 9/10)
        currentQuizDen = Math.floor(Math.random() * 8) + 2; // 2 to 9
        currentQuizNum = Math.floor(Math.random() * (currentQuizDen - 1)) + 1; // 1 to den-1
        
        drawPieChart('quiz-pie', currentQuizNum, currentQuizDen);
        
        // Reset UI
        quizNum.value = '';
        quizDen.value = '';
        feedbackMsg.textContent = '';
        feedbackMsg.className = 'feedback';
        btnCheck.classList.remove('hidden');
        btnNext.classList.add('hidden');
        quizNum.disabled = false;
        quizDen.disabled = false;
        quizNum.focus();
    }
    
    function checkAnswer() {
        const userNum = parseInt(quizNum.value);
        const userDen = parseInt(quizDen.value);
        
        if (isNaN(userNum) || isNaN(userDen)) {
            feedbackMsg.textContent = '숫자를 모두 입력해주세요!';
            feedbackMsg.className = 'feedback error';
            return;
        }
        
        // Allow unsimplified answers, but exact is better. We'll check exact visual match first.
        if (userNum === currentQuizNum && userDen === currentQuizDen) {
            // Correct
            feedbackMsg.textContent = '🎉 정답입니다! 참 잘했어요! 🎉';
            feedbackMsg.className = 'feedback success';
            btnCheck.classList.add('hidden');
            btnNext.classList.remove('hidden');
            quizNum.disabled = true;
            quizDen.disabled = true;
            
            // Trigger Confetti
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FF8A65', '#4DD0E1', '#FFCA28', '#81C784']
                });
            }
        } else if (userNum / userDen === currentQuizNum / currentQuizDen) {
            // Equivalent fraction
            feedbackMsg.textContent = `크기는 같지만, 그려진 조각 수는 ${currentQuizDen}개, 색칠된 수는 ${currentQuizNum}개입니다.`;
            feedbackMsg.className = 'feedback error';
        } else {
            // Incorrect
            feedbackMsg.textContent = '아쉽네요. 다시 한 번 그림을 잘 세어보세요!';
            feedbackMsg.className = 'feedback error';
            
            // Reset animation by triggering reflow
            feedbackMsg.style.animation = 'none';
            feedbackMsg.offsetHeight; /* trigger reflow */
            feedbackMsg.style.animation = null; 
        }
    }
    
    btnCheck.addEventListener('click', checkAnswer);
    btnNext.addEventListener('click', startNewQuiz);
    
    // Add enter key support
    quizNum.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') quizDen.focus();
    });
    
    quizDen.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    
    // Initialize
    updateExploreChart();
});
