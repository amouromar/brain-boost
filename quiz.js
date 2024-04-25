import { goldStarSVG, bronzeStarSVG, grayStarSVG, redXSvg } from "./icons.js";

document.addEventListener("DOMContentLoaded", function () {
    fetchCategoryLookup();
    const quizContainer = document.getElementById("quiz");
    const resultsContainer = document.getElementById("results");
    const submitButton = document.getElementById("submit");
    const prevButton = document.getElementById("prev");
    const skipButton = document.getElementById("skip");
    const title = document.getElementById("title");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const customTopicInput = document.getElementById("customTopic");
    let quizData = []; // Initialize quizData as an empty array
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = []; // Array to store user's answers

    function buildQuiz() {
        const currentQuestion = quizData[currentQuestionIndex];
        if (!currentQuestion) {
            return; // Ensure currentQuestion is defined
        }
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.innerHTML = `
            <h2>${currentQuestion.question}</h2>
            <div class="options">
                ${currentQuestion.options
                .map(
                    (option) => `
                    <label>
                        <input type="radio" name="question${currentQuestionIndex}" value="${option}">
                        ${option}
                    </label>
                `
                )
                .join("")}
            </div>
        `;
        quizContainer.innerHTML = ""; // Clear previous content
        quizContainer.appendChild(questionElement);
        questionElement.classList.add("active"); // Show the active question

        // Restore user's last choice if available
        const lastChoice = userAnswers[currentQuestionIndex];
        if (lastChoice) {
            const radioInput = questionElement.querySelector(
                `input[value="${lastChoice}"]`
            );
            if (radioInput) {
                radioInput.checked = true;
                radioInput.parentElement.classList.add("highlighted-option"); // Apply highlight class to selected option's label
            }
        }

        // Add event listeners to radio inputs to apply highlight class on selection
        const radioInputs = questionElement.querySelectorAll('input[type="radio"]');
        radioInputs.forEach((input) => {
            input.addEventListener("change", function () {
                // Remove highlight from all options
                radioInputs.forEach((radio) => {
                    radio.parentElement.classList.remove("highlighted-option");
                });

                // Apply highlight to the selected option
                input.parentElement.classList.add("highlighted-option");
            });
        });
    }

    function fetchCategoryLookup() {
        fetch("https://opentdb.com/api_category.php")
            .then((response) => response.json())
            .then((data) => {
                // Populate the dropdown with category options
                categoryDropdown.innerHTML = data.trivia_categories
                    .map(
                        (category) => `
                    <option value="${category.id}">${category.name}</option>
                `
                    )
                    .join("");
            })
            .catch((error) =>
                console.error("Error fetching category lookup:", error)
            );
    }

    categoryDropdown.addEventListener("change", function () {
        const selectedCategory = categoryDropdown.value;
        if (selectedCategory) {
            fetchQuizData(selectedCategory);
        }
    });

    function fetchQuizData(category) {
        const apiUrl = category
            ? `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=easy&type=multiple`
            : "https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple";
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                }
                return response.json();
            })
            .then((data) => {
                if (data && data.results && Array.isArray(data.results)) {
                    quizData = data.results.map((question) => ({
                        question: question.question,
                        options: [...question.incorrect_answers, question.correct_answer],
                        answer: question.correct_answer,
                    }));
                    buildQuiz(); // Initialize the quiz with fetched data
                } else {
                    throw new Error("Unexpected API response format.");
                }
            })
            .catch((error) => console.error("Error fetching quiz data:", error));
    }

    function showNextQuestion() {
        const selectedOption = document.querySelector(
            `input[name="question${currentQuestionIndex}"]:checked`
        );
        if (!selectedOption) {
            alert("Please select an option before moving to the next question.");
            return;
        }

        const isCorrect =
            selectedOption.value === quizData[currentQuestionIndex].answer;

        const questionElement = document.querySelector(".question.active");
        questionElement.style.color = isCorrect ? "lightgreen" : "red";

        // Add visual indication
        const feedbackElement = document.createElement("p");
        feedbackElement.textContent = isCorrect ? "" : "";
        feedbackElement.classList.add(isCorrect ? "correct" : "incorrect");
        questionElement.appendChild(feedbackElement);

        // Delay before moving to the next question
        setTimeout(() => {
            // Remove the feedback message
            questionElement.removeChild(feedbackElement);

            // Store user's answer
            userAnswers[currentQuestionIndex] = selectedOption.value;

            if (isCorrect) {
                score++;
            }

            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                buildQuiz(); // Show the next question
            } else {
                showResults(); // Show results if all questions are answered
            }
        }, 1000); // Adjust delay time as needed
    }

    // quiz.js

    function showResults() {
        let resultHTML = "";
        if (score >= 8) {
            resultHTML = `
            <span class="result-icon">
                ${goldStarSVG}
            </span>
            <h4 style="text-align: center;"> You scored ${score} out of ${quizData.length}.</h4>
            `;
        } else if (score >= 5) {
            resultHTML = `
            <span class="result-icon">
                ${bronzeStarSVG}
            </span>
            <h4 style="text-align: center;"> You scored ${score} out of ${quizData.length}.</h4>
            `;
        } else if (score >= 3) {
            resultHTML = `
            <span class="result-icon">
                ${grayStarSVG}
            </span>
            <h4 style="text-align: center;"> You scored ${score} out of ${quizData.length}.</h4>
            `;
        } else {
            resultHTML = `
            <span class="result-icon">
                ${redXSvg}
            </span>
            <h4 style="text-align: center;"> You scored ${score} out of ${quizData.length}.</h4>
            `;
        }
        resultHTML += `<h2>Quiz Results</h2>`;
        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            resultHTML += `
            <div class="result-item ${isCorrect ? "correct" : "incorrect"}">
                <p>${index + 1}. ${question.question}</p>
                <p>Your Answer: ${userAnswer}</p>
                <p>Correct Answer: ${question.answer}</p>
                <p class="answer-feedback">${isCorrect ? "Correct!" : "Incorrect!"
                }</p>
            </div>
        `;
        });

        resultHTML += `
        <button id="retake">Retake Quiz</button>
    `;

        resultsContainer.innerHTML = resultHTML;
        resultsContainer.style.display = "block"; // Show the results container
        quizContainer.style.display = "none"; // Hide the quiz container
        skipButton.style.display = "none"; // Hide skip button
        categoryDropdown.style.display = "none"; // Hide categories
        title.style.display = "none"; // Hide title
        submitButton.style.display = "none"; // Hide submit button
        prevButton.style.display = "none"; // Hide previous button

        resultsContainer.classList.add("results-container");

        // Center the results div
        resultsContainer.style.textAlign = "center";

        // Add event listener to retake button
        const retakeButton = document.getElementById("retake");
        retakeButton.addEventListener("click", function () {
            currentQuestionIndex = 0; // Reset question index
            score = 0; // Reset score
            userAnswers = []; // Reset user's answers
            buildQuiz(); // Rebuild the quiz
            resultsContainer.style.display = "none"; // Hide results container
            quizContainer.style.display = "block"; // Show quiz container
            skipButton.style.display = "block"; // Show skip button
            submitButton.style.display = "block"; // Show submit button
            prevButton.style.display = "block"; // Show previous button
        });
        if (score >= 8) {
            resultHTML = `
            <span class="result-icon">
                ${goldStarSVG}
            </span>
            `;
        } else if (score >= 5) {
            resultHTML = `
            <span class="result-icon">
                ${bronzeStarSVG}
            </span>
            `;
        } else if (score >= 3) {
            resultHTML = `
            <span class="result-icon">
                ${grayStarSVG}
            </span>
            `;
        }
    }

    buildQuiz(quizData); // Initialize the quiz

    submitButton.addEventListener("click", showNextQuestion); // Add event listener to submit button

    prevButton.addEventListener("click", function () {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            buildQuiz(quizData); // Show the previous question
        }
    });

    skipButton.addEventListener("click", function () {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            buildQuiz(quizData); // Skip to the next question
        } else {
            currentQuestionIndex = quizData.length - 1; // Set index to last question
        }
    });

    fetchQuizData(); // Fetch quiz data when the page loads
});
