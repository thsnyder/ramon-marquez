import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://piinsnlbdfmkaawrsrwc.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpaW5zbmxiZGZta2Fhd3JzcndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3NTY4NzgsImV4cCI6MjA0ODMzMjg3OH0.I53xD_bc2d4_y-a8PF-v69Y1EmObFUjUusvOQ-dWZ_g';
const supabase = createClient(supabaseUrl, supabaseKey);

let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let countdownInterval;
let timeLeft = 15; // Set starting time for each question to 15 seconds

function createSnowflake() {
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.style.left = Math.random() * 100 + '%';
  snowflake.style.opacity = Math.random() * 0.7 + 0.3;
  snowflake.style.width = (Math.random() * 15 + 5) + 'px';
  snowflake.style.height = snowflake.style.width;
  
  // Random animation duration between 5 and 10 seconds
  const animationDuration = Math.random() * 5 + 5;
  snowflake.style.animationDuration = animationDuration + 's';
  
  document.getElementById('snowfall').appendChild(snowflake);
  
  // Remove snowflake after animation completes
  setTimeout(() => {
      snowflake.remove();
  }, animationDuration * 1000);
}

// Create new snowflakes periodically
setInterval(createSnowflake, 300);

// Create initial batch of snowflakes
for(let i = 0; i < 20; i++) {
  setTimeout(createSnowflake, Math.random() * 2000);
}

// Fetch questions from the JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    selectRandomQuestions();
  })
  .catch(error => console.error("Error loading questions:", error));

// Select 5 unique random questions
function selectRandomQuestions() {
  selectedQuestions = [];
  const uniqueQuestions = new Set();
  while (uniqueQuestions.size < 5) {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    uniqueQuestions.add(randomQuestion);
  }
  selectedQuestions = Array.from(uniqueQuestions);
}

// Update the loadQuestion function
function loadQuestion() {
  if (currentQuestionIndex >= selectedQuestions.length) {
    showFinalScore();
    return;
  }

  timeLeft = 15; // Reset time to 15 seconds at the beginning of each question
  startTimer();

  const question = selectedQuestions[currentQuestionIndex];
  const optionsDiv = document.getElementById("options");
  document.getElementById("summary-text").textContent = question.summary; 
  document.getElementById("poster").src = ""; // Clear previous image
  document.getElementById("poster-container").style.display = "none";
  optionsDiv.style.display = "grid";
  document.getElementById("summary-text").style.display = "block";
  document.getElementById("feedback").style.display = "none";
  updateScoreTally();

  optionsDiv.innerHTML = '';
  question.options.sort(() => 0.5 - Math.random()).forEach(option => {
    const button = document.createElement("button");
    button.className = "btn btn-primary w-full";
    button.textContent = option;
    button.onclick = () => checkAnswer(option, question.correct, question.image);
    optionsDiv.appendChild(button);
  });
}

// Update the startTimer function
function startTimer() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeLeft -= 0.1;
    document.getElementById("timer-bar").style.width = (timeLeft / 15) * 100 + "%"; // Adjust width calculation to 15 seconds
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      handleTimeout();
    }
  }, 100);
}

// Handle time expiration
function handleTimeout() {
  // Clear the timer interval to stop the countdown
  clearInterval(countdownInterval);
  
  // Get the current question
  const currentQuestion = selectedQuestions[currentQuestionIndex];
  if (!currentQuestion) return; // Safety check
  
  // Get references to all needed elements
  const feedback = document.getElementById("feedback");
  const optionsDiv = document.getElementById("options");
  const summaryText = document.getElementById("summary-text");
  const posterContainer = document.getElementById("poster-container");
  const poster = document.getElementById("poster");
  
  // Update and show feedback
  feedback.innerHTML = `
    <div class="text-center">
      <p class="text-primary font-bold text-xl mb-2">⏰ Time's Up!</p>
      <p class="text-white">Correct answer:</p>
      <p class="text-white font-bold text-lg">${currentQuestion.correct}</p>
    </div>
  `;
  
  // Show feedback and update display states
  feedback.style.display = "block";
  optionsDiv.style.display = "none";
  summaryText.style.display = "none";
  
  // Show poster if available
  if (currentQuestion.image) {
    poster.src = currentQuestion.image;
    posterContainer.style.display = "block";
  }
  
  // Delay before moving to next question
  setTimeout(() => {
    // Reset display states
    feedback.style.display = "none";
    posterContainer.style.display = "none";
    poster.src = ""; // Clear poster source
    
    // Move to next question
    currentQuestionIndex++;
    loadQuestion();
  }, 3000); // Increased to 3 seconds to give more time to read the correct answer
}


// Check answer, update score, and show feedback
function checkAnswer(selected, correct, image) {
  clearInterval(countdownInterval);

  const feedback = document.getElementById("feedback");
  feedback.textContent = selected === correct ? "🙌 Correct!" : "😂 Wrong!!";
  feedback.style.color = "white";
  feedback.style.display = "block";
  if (selected === correct) correctAnswers++;

  const posterContainer = document.getElementById("poster-container");
  posterContainer.style.display = "block";
  document.getElementById("poster").src = image;
  document.getElementById("options").style.display = "none";
  document.getElementById("summary-text").style.display = "none";

  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 2000);
}

// Update score tally
function updateScoreTally() {
  document.getElementById("score-tally").textContent = `Score: ${correctAnswers} / ${currentQuestionIndex}`;
}


// Update showFinalScore function
function showFinalScore() {
  // Hide game card and show final score container
  document.getElementById("game-card").classList.add("hidden");
  const finalScoreContainer = document.getElementById("final-score-container");
  finalScoreContainer.classList.remove("hidden");

  // Get the title and image based on score
  const finalTitle = getTitle(correctAnswers);
  const imageFileName = finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + ".webp";

  // Update text content for final score summary
  document.getElementById("final-score-text").textContent = 
    `You answered ${correctAnswers} out of 5 questions correctly.`;
  document.getElementById("final-title").textContent = `You're a: ${finalTitle}`;
  
  // Update title image
  const titleImage = document.getElementById("title-image");
  titleImage.src = `images/${imageFileName}`;
  titleImage.alt = finalTitle;

  // Fetch and display leaderboard
  fetchLeaderboard();

  // Set up the share button event listener
  document.getElementById("share-button").addEventListener("click", () => {
    shareScore(finalTitle, imageFileName);
  });

  // Display a grid of correct answers
  const gridContainer = document.getElementById("questions-grid");
  gridContainer.innerHTML = ''; // Clear any previous grid items
  selectedQuestions.forEach((question, index) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'relative aspect-square transition-transform hover:scale-105';
    gridItem.innerHTML = `
      <div class="h-full w-full relative">
        <img 
          src="${question.image}" 
          alt="Question ${index + 1}" 
          class="w-full h-full object-cover rounded-lg shadow-md"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm text-center rounded-b-lg">
          ${question.correct}
        </div>
      </div>
    `;
    gridContainer.appendChild(gridItem);
  });
}

// Add new function to fetch leaderboard
async function fetchLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Update the leaderboard display
    displayLeaderboard(data);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

// Update displayLeaderboard function
function displayLeaderboard(leaderboardData) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  leaderboardData.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.className = "flex items-center justify-between p-3 bg-base-100 rounded-lg mb-2";
    listItem.innerHTML = `
      <div class="flex items-center space-x-4">
        <span class="text-xl font-bold ${index < 3 ? 'text-accent' : ''}">#${index + 1}</span>
        <div>
          <div class="font-semibold">${entry.name}</div>
          <div class="text-sm text-primary">${getTitle(entry.score)}</div>
        </div>
      </div>
      <div class="text-xl font-bold">${entry.score}/5</div>
    `;
    leaderboardList.appendChild(listItem);
  });

  if (leaderboardData.length === 0) {
    leaderboardList.innerHTML = `
      <li class="text-center p-4">
        <p class="text-lg">No scores yet!</p>
        <p class="text-sm text-gray-400">Be the first to play</p>
      </li>
    `;
  }
}

// Update handleScoreSubmission function
async function handleScoreSubmission() {
  const playerName = document.getElementById("player-name").value || "Anonymous";

  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert([
        { name: playerName, score: correctAnswers }
      ]);

    if (error) throw error;

    // Fetch and display updated leaderboard
    fetchLeaderboard();
  } catch (error) {
    console.error("Error submitting score:", error);
    alert("Unable to submit score at this time.");
  }
}

// Function to handle sharing the score
async function shareScore(finalTitle, imageFileName) {
  const shareText = `I scored as a "${finalTitle}" on the Christmas Movie Quiz! Think you can beat my score? 🎅🎁🎄 Play now`;
  
  // Append the image file name to the URL as a query parameter
  const shareUrl = `${window.location.origin}${window.location.pathname}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Guess the Christmas Movie Quiz",
        text: shareText,
        url: shareUrl
      });
      alert("Shared successfully!");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  } else {
    // Fallback if Web Share API is not available
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Link copied to clipboard! Share it with your friends.");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Unable to copy to clipboard.");
    }
  }
}



// Add these styles for the grid items
const gridStyles = document.createElement('style');
gridStyles.textContent = `
  #questions-grid img {
    transition: transform 0.3s ease;
  }
  
  #questions-grid .relative:hover {
    z-index: 5;
  }
  
  #questions-grid img {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;
document.head.appendChild(gridStyles);


// Helper function to get title based on score
function getTitle(score) {
  return [
    "Yuletide Youngling",
    "Festive Friend",
    "Holiday Hobbyist", 
    "Elf Expert",
    "Seasonal Specialist",
    "Christmas Champion"
  ][score] || "";
}


// Function to set up share button functionality
async function setupShareButton(leaderboard) {
  const shareButton = document.getElementById("share-button");

  // Fetch leaderboard data if not provided
  if (!leaderboard) {
    try {
      const response = await fetch('/api/getLeaderboard');
      if (response.ok) {
        leaderboard = await response.json();
      } else {
        console.error("Error fetching leaderboard for sharing:", response.statusText);
        leaderboard = []; // Fallback to empty array if fetch fails
      }
    } catch (error) {
      console.error("Network error fetching leaderboard for sharing:", error);
      leaderboard = [];
    }
  }

  shareButton.onclick = async () => {
    // Create share text with top scores
    const shareText = createShareText(leaderboard);

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Christmas Movie Quiz Leaderboard',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);

        // Show success message
        const originalText = shareButton.textContent;
        shareButton.textContent = "Copied! 📋";
        shareButton.classList.add("btn-success");

        setTimeout(() => {
          shareButton.textContent = originalText;
          shareButton.classList.remove("btn-success");
        }, 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      shareButton.textContent = "Error sharing";
      shareButton.classList.add("btn-error");

      setTimeout(() => {
        shareButton.textContent = "Share";
        shareButton.classList.remove("btn-error");
      }, 2000);
    }
  };
}


// Function to create share text
function createShareText(leaderboard) {
  let shareText = "🎄 Christmas Movie Quiz Leaderboard 🏆\n\n";
  
  // Add top 3 scores (or all if less than 3)
  const topScores = leaderboard.slice(0, 3);
  topScores.forEach((entry, index) => {
    const medal = ['🥇', '🥈', '🥉'][index];
    const title = getTitle(entry.score);
    shareText += `${medal} ${entry.name}: ${entry.score}/5 (${title})\n`;
  });
  
  // Add call to action
  shareText += "\nCan you beat these scores? Play now! 🎅";
  
  return shareText;
}


// Reset the game
function restartGame() {
  selectedQuestions = [];
  currentQuestionIndex = 0;
  correctAnswers = 0;
  selectRandomQuestions();
  loadQuestion();
}



document.getElementById("game-button").addEventListener("click", () => {
  // Reset game state and show the start screen
  document.getElementById("start-screen").style.display = "flex";
  document.getElementById("game-card").classList.add("hidden");
  document.getElementById("final-score-container").classList.add("hidden");
  document.getElementById("leaderboard-container").classList.add("hidden");
  
  // Reset game variables
  selectedQuestions = [];
  currentQuestionIndex = 0;
  correctAnswers = 0;
});


document.getElementById("leaderboard-button").addEventListener("click", () => {
  // Check if the user has completed the game by verifying content in the final-score-container
  const finalScoreContainer = document.getElementById("final-score-container");

  if (finalScoreContainer.classList.contains("hidden")) {
    // If the final score screen is hidden, assume the game hasn’t been completed yet
    alert("Complete the game to view your final score!");
    document.getElementById("start-screen").classList.remove("hidden");
    document.getElementById("game-card").classList.add("hidden");
  } else {
    // If the final score screen is visible, show it as intended
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-card").classList.add("hidden");
    document.getElementById("leaderboard-container").classList.add("hidden");
    finalScoreContainer.classList.remove("hidden");
  }
});



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-card").classList.remove("hidden");
    restartGame();
  });
});