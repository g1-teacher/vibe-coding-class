document.addEventListener('DOMContentLoaded', () => {
    // 퀴즈 데이터
    const questions = [
        {
            question: "다음 중 파이썬에서 'a가 b와 같다'를 표현하는 올바른 조건식은?",
            code: null,
            options: ["a = b", "a == b", "a := b", "a === b"],
            answerIndex: 1,
            hint: "==는 양쪽이 같다는 의미의 비교 연산자입니다. =는 변수에 값을 넣는 대입 연산자예요."
        },
        {
            question: "다음 코드의 실행 결과는 무엇일까요?",
            code: "x = 10\nif x > 5:\n    print('크다')",
            options: ["크다", "작다", "10", "에러 발생"],
            answerIndex: 0,
            hint: "x는 10이고, 10은 5보다 큽니다. 조건식이 참(True)이므로 if문 안의 코드가 실행됩니다."
        },
        {
            question: "다음 코드의 빈칸 (가)에 들어갈 알맞은 키워드는?",
            code: "age = 15\nif age >= 18:\n    print('성인입니다.')\n(가):\n    print('미성년자입니다.')",
            options: ["else if", "elif", "else", "then"],
            answerIndex: 2,
            hint: "if의 조건이 거짓일 때 실행되는 부분을 지정하는 키워드입니다. '그렇지 않으면'이라는 뜻을 가집니다."
        },
        {
            question: "다음 코드의 실행 결과로 알맞은 것은?",
            code: "score = 85\nif score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelse:\n    print('C')",
            options: ["A", "B", "C", "에러 발생"],
            answerIndex: 1,
            hint: "score는 85입니다. 첫 번째 조건(>=90)은 거짓이지만, 두 번째 조건(>=80)은 참이네요!"
        },
        {
            question: "다음 코드의 실행 결과는?",
            code: "a = 5\nb = 10\nif a > 0 and b < 5:\n    print('참')\nelse:\n    print('거짓')",
            options: ["참", "거짓", "True", "False"],
            answerIndex: 1,
            hint: "and 연산자는 양쪽 조건이 모두 참이어야 전체가 참이 됩니다. b < 5는 거짓입니다."
        }
    ];

    // DOM Elements
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    const currentQText = document.getElementById('current-q');
    const totalQText = document.getElementById('total-q');
    const progressFill = document.getElementById('progress-fill');
    
    // Timer and Hint Elements
    const timeLeftSpan = document.getElementById('time-left');
    const timerTextContainer = document.querySelector('.timer-text');
    const btnHint = document.getElementById('btn-hint');
    const hintText = document.getElementById('hint-text');

    const questionText = document.getElementById('question-text');
    const codeBlock = document.getElementById('code-block');
    const codeText = document.getElementById('code-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');
    const feedbackText = document.getElementById('feedback-text');
    const btnNext = document.getElementById('btn-next');
    
    // Result Elements
    const scoreText = document.getElementById('score-text');
    const resultMessage = document.getElementById('result-message');
    const btnRestart = document.getElementById('btn-restart');

    // State Variables
    let currentQuestionIndex = 0;
    let score = 0;
    let canClick = true;
    let isHintUsed = false;
    let timeLeft = 30;
    let timerInterval = null;

    // Initialize Quiz
    function initQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        totalQText.textContent = questions.length;
        
        quizScreen.classList.add('active-screen');
        quizScreen.classList.remove('hidden-screen');
        resultScreen.classList.remove('active-screen');
        resultScreen.classList.add('hidden-screen');
        
        loadQuestion();
    }

    // Start Timer
    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 30;
        timeLeftSpan.textContent = timeLeft;
        timerTextContainer.classList.remove('urgent');

        timerInterval = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;
            
            if (timeLeft <= 5 && timeLeft > 0) {
                timerTextContainer.classList.add('urgent');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeOut();
            }
        }, 1000);
    }

    // Handle Time Out
    function handleTimeOut() {
        if (!canClick) return;
        canClick = false;
        timerTextContainer.classList.remove('urgent');

        const currentQ = questions[currentQuestionIndex];
        
        // Disable all buttons and show correct answer
        const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');
        allOptionBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === currentQ.answerIndex) {
                btn.classList.add('correct');
            }
        });

        // Time out is treated as wrong
        feedbackText.textContent = '⏱️ 시간 초과! 초록색으로 표시된 것이 정답이에요!';
        feedbackText.className = 'feedback-text error';
        feedbackArea.classList.remove('hidden');

        // Automatically move to next question after 2.5 seconds
        setTimeout(() => {
            goToNextQuestion();
        }, 2500);
    }

    // Load current question
    function loadQuestion() {
        canClick = true;
        isHintUsed = false;
        const currentQ = questions[currentQuestionIndex];
        
        // Update Progress
        currentQText.textContent = currentQuestionIndex + 1;
        progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
        
        // Setup text and code
        questionText.textContent = currentQ.question;
        if (currentQ.code) {
            codeText.textContent = currentQ.code;
            codeBlock.classList.remove('hidden');
        } else {
            codeBlock.classList.add('hidden');
        }
        
        // Setup options
        optionsContainer.innerHTML = '';
        currentQ.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => handleOptionClick(index, btn));
            optionsContainer.appendChild(btn);
        });
        
        // Setup hint
        hintText.classList.add('hidden');
        hintText.textContent = currentQ.hint;
        btnHint.disabled = false;
        
        // Hide feedback
        feedbackArea.classList.add('hidden');

        // Start timer
        startTimer();
    }

    // Handle Hint Click
    btnHint.addEventListener('click', () => {
        if (!canClick) return;
        isHintUsed = true;
        btnHint.disabled = true;
        hintText.classList.remove('hidden');
    });

    // Handle user's answer
    function handleOptionClick(selectedIndex, btnElement) {
        if (!canClick) return;
        canClick = false; // Prevent multiple clicks
        clearInterval(timerInterval); // Stop timer
        timerTextContainer.classList.remove('urgent');
        
        const currentQ = questions[currentQuestionIndex];
        const isCorrect = selectedIndex === currentQ.answerIndex;
        
        // Disable all buttons
        const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');
        allOptionBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === currentQ.answerIndex) {
                btn.classList.add('correct'); // Highlight correct answer
            }
        });
        
        // Handle result
        if (isCorrect) {
            // Check if hint was used
            if (isHintUsed) {
                score += 10; // Half score
                feedbackText.textContent = '🎉 정답입니다! (힌트 사용으로 10점 획득)';
            } else {
                score += 20; // Full score
                feedbackText.textContent = '🎉 정답입니다! (20점 획득)';
            }
            btnElement.classList.add('correct');
            feedbackText.className = 'feedback-text success';
        } else {
            btnElement.classList.add('wrong');
            feedbackText.textContent = '❌ 오답입니다. 초록색으로 표시된 것이 정답이에요!';
            feedbackText.className = 'feedback-text error';
        }
        
        // Show feedback area
        feedbackArea.classList.remove('hidden');
    }

    // Go to next question logic
    function goToNextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }

    btnNext.addEventListener('click', goToNextQuestion);

    // Show Results
    function showResults() {
        clearInterval(timerInterval);
        quizScreen.classList.remove('active-screen');
        quizScreen.classList.add('hidden-screen');
        resultScreen.classList.add('active-screen');
        resultScreen.classList.remove('hidden-screen');
        
        scoreText.textContent = score;
        
        if (score === 100) {
            resultMessage.textContent = '완벽해요! 파이썬 선택문 마스터네요! 🏆';
            if (window.confetti) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        } else if (score >= 60) {
            resultMessage.textContent = '잘했어요! 힌트를 줄이거나 복습하면 완벽할 거예요! 👍';
        } else {
            resultMessage.textContent = '다시 한 번 차근차근 도전해봐요! 화이팅! 💪';
        }
    }

    // Restart logic
    btnRestart.addEventListener('click', initQuiz);

    // Start!
    initQuiz();
});
