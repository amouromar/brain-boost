import { goldStarSVG, bronzeStarSVG, grayStarSVG, redXSvg } from './icons.js';

document.addEventListener("DOMContentLoaded", function () {
    const quizContainer = document.getElementById('quiz');
    const resultsContainer = document.getElementById('results');
    const submitButton = document.getElementById('submit');
    const prevButton = document.getElementById('prev');
    const skipButton = document.getElementById('skip');
    const topicChips = document.querySelectorAll('.chip');
    const customTopicInput = document.getElementById('customTopic');
    let quizData = []; // Initialize quizData as an empty array
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = []; // Array to store user's answers

    function buildQuiz() {
        const currentQuestion = quizData[currentQuestionIndex];
        if (!currentQuestion) {
            return; // Ensure currentQuestion is defined
        }
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <h2>${currentQuestion.question}</h2>
            <div class="options">
                ${currentQuestion.options.map(option => `
                    <label>
                        <input type="radio" name="question${currentQuestionIndex}" value="${option}">
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;
        quizContainer.innerHTML = ''; // Clear previous content
        quizContainer.appendChild(questionElement);
        questionElement.classList.add('active'); // Show the active question

        // Restore user's last choice if available
        const lastChoice = userAnswers[currentQuestionIndex];
        if (lastChoice) {
            const radioInput = questionElement.querySelector(`input[value="${lastChoice}"]`);
            if (radioInput) {
                radioInput.checked = true;
            }
        }
    }

    function fetchQuizData() {
        fetch('https://opentdb.com/api.php?amount=10&category=21&difficulty=easy&type=multiple')
            .then(response => response.json())
            .then(data => {
                quizData = data.results.map(question => ({
                    question: question.question,
                    options: [...question.incorrect_answers, question.correct_answer],
                    answer: question.correct_answer
                }));
                buildQuiz(); // Initialize the quiz with fetched data
            })
            .catch(error => console.error('Error fetching quiz data:', error));
    }

    function showNextQuestion() {
        const selectedOption = document.querySelector(`input[name="question${currentQuestionIndex}"]:checked`);
        if (!selectedOption) {
            alert('Please select an option before moving to the next question.');
            return;
        }

        userAnswers[currentQuestionIndex] = selectedOption.value; // Store user's answer

        if (selectedOption.value === quizData[currentQuestionIndex].answer) {
            score++;
        }

        const questionElement = document.querySelector('.question.active');
        questionElement.style.color = selectedOption.value === quizData[currentQuestionIndex].answer ? 'green' : 'Indian Red';

        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            buildQuiz(); // Show the next question
        } else {
            showResults(); // Show results if all questions are answered
        }
    }

    // quiz.js

    function showResults() {
        let resultHTML = '';

        if (score >= 8) {
            resultHTML = `
            <span class="result-icon">
                ${goldStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else if (score >= 5) {
            resultHTML = `
            <span class="result-icon">
                ${bronzeStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else if (score >= 3) {
            resultHTML = `
            <span class="result-icon">
                ${grayStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else {
            resultHTML = `
            <span class="result-icon">
                ${redXSvg}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        }
        resultHTML += `<h2>Quiz Results</h2>`;
        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            resultHTML += `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <p>${index + 1}. ${question.question}</p>
                <p>Your Answer: ${userAnswer}</p>
                <p>Correct Answer: ${question.answer}</p>
                <p class="answer-feedback">${isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            </div>
        `;
        });

        resultHTML += `
        <div class="final-score">
            <p>You scored ${score} out of ${quizData.length}.</p>
        </div>
        <button id="retake">Retake Quiz</button>
    `;

        resultsContainer.innerHTML = resultHTML;

        // Hide quiz container and show results container
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        // Hide skip, submit, and previous buttons
        skipButton.style.display = 'none';
        submitButton.style.display = 'none';
        prevButton.style.display = 'none';

        // Center the results div
        resultsContainer.style.textAlign = 'center';

        // Add event listener to retake button
        const retakeButton = document.getElementById('retake');
        retakeButton.addEventListener('click', function () {
            currentQuestionIndex = 0; // Reset question index
            score = 0; // Reset score
            userAnswers = []; // Reset user's answers
            buildQuiz(); // Rebuild the quiz
            resultsContainer.style.display = 'none'; // Hide results container
            quizContainer.style.display = 'block'; // Show quiz container
            skipButton.style.display = 'block'; // Show skip button
            submitButton.style.display = 'block'; // Show submit button
            prevButton.style.display = 'block'; // Show previous button
        });
        if (score >= 8) {
            resultHTML = `
            <span class="result-icon">
                ${goldStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else if (score >= 5) {
            resultHTML = `
            <span class="result-icon">
                ${bronzeStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else if (score >= 3) {
            resultHTML = `
            <span class="result-icon">
                ${grayStarSVG}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        } else {
            resultHTML = `
            <span class="result-icon">
                ${redXSvg}
            </span>
            <p>You scored ${score} out of ${quizData.length}.</p>
            `;
        }

        // Add retake button after showing results
        resultHTML += `
            <button id="retake">Retake Quiz</button>
        `;
    }

    buildQuiz(quizData); // Initialize the quiz

    submitButton.addEventListener('click', showNextQuestion); // Add event listener to submit button

    prevButton.addEventListener('click', function () {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            buildQuiz(quizData); // Show the previous question
        }
    });

    skipButton.addEventListener('click', function () {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            buildQuiz(quizData); // Skip to the next question
        } else {
            currentQuestionIndex = quizData.length - 1; // Set index to last question
        }
    });

    topicChips.forEach(chip => {
        chip.addEventListener('click', function () {
            const topic = chip.textContent.trim().toLowerCase();
            const filteredQuestions = quizData.filter(question => question.options.includes(topic));
            const randomQuestions = generateQuestions(Math.min(filteredQuestions.length, 10));
            buildQuiz(randomQuestions);
        });
    });

    customTopicInput.addEventListener('input', function () {
        const inputText = customTopicInput.value.trim().toLowerCase();
        if (inputText) {
            const filteredQuestions = quizData.filter(question => question.question.toLowerCase().includes(inputText));
            const randomQuestions = generateQuestions(Math.min(filteredQuestions.length, 10));
            buildQuiz(randomQuestions);
        } else {
            buildQuiz(quizData);
        }
    });

    fetchQuizData(); // Fetch quiz data when the page loads

});