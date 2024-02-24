const animals = ['🦁', '🐯', '🐻', '🐵', '🐘', '🦒', '🦓', '🦌'];
const multipliers = [5, 5, 5, 5, 10, 15, 25, 50];
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const wheelRadius = 180;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const numSegments = animals.length;
const angle = (2 * Math.PI) / numSegments;
const betTime = 30; // Betting time in seconds
const gameTime = 2; // Game time in seconds
const maxResults = 10; // Maximum number of results to display
const startingCredits = 1000; // Starting credits for each player
let spinning = false;
let bets = new Array(numSegments).fill(0);
let results = [];
let credits = startingCredits;

// Preload audio files
const spinSound = new Audio('spin.mp3');
const betSound = new Audio('chip.mp3');
const winSound = new Audio('result.mp3');
const loseSound = new Audio('lose.mp3');

function spinWheel() {
  spinning = true;
  let minBetIndex = 0;
  for (let i = 1; i < numSegments; i++) {
    if (bets[i] < bets[minBetIndex]) {
      minBetIndex = i;
    }
  }
  const resultIndex = minBetIndex;
  const result = animals[resultIndex];
  results.unshift(result);
  if (results.length > maxResults) {
    results.pop();
  }
  const multiplier = multipliers[resultIndex];
  const winnings = bets[resultIndex] * multiplier;
  credits += winnings;
  drawWheel(result);
  setTimeout(() => {
    document.getElementById('result').innerText = `Result: ${result} (x${multiplier}) - Winnings: ${winnings}`;
    displayResults();
    setTimeout(startGame, 2000); // Start the next game after 2 seconds
  }, 1000); // Display result after 1 second
}

function placeBet(index) {
  if (credits > 0) {
    bets[index]++;
    credits--;
    updateBetButtons();
    document.getElementById('credit').textContent = `Credits: ${credits}`;
  }
}

function manualResultSelection() {
  const resultIndex = parseInt(prompt(`Enter the index of the result (0-${numSegments - 1}):`));
  if (resultIndex >= 0 && resultIndex < numSegments) {
    spinWheel(resultIndex);
  } else {
    alert('Invalid result index!');
  }
}
function startGame() {
  resetBets();
  document.getElementById('result').innerText = '';
  document.getElementById('betButtons').style.display = 'flex';
  document.getElementById('credit').textContent = `Credits: ${credits}`;

  countdownTimer('betTimerValue', betTime, () => {
    document.getElementById('betButtons').style.display = 'none';
    countdownTimer('gameTimerValue', gameTime, () => {
      spinWheel();
    });
  });
}

function spinWheel() {
  spinning = true;
  let spinCount = 0;
  const maxSpins = 20 + Math.floor(Math.random() * 10); // Randomize spin count
  const spinInterval = setInterval(() => {
    // Rotate the wheel gradually
    drawWheel(animals[spinCount % numSegments]);
    spinCount++;
    if (spinCount === maxSpins) {
      clearInterval(spinInterval);
      let resultIndex;
      let result;

      // Check if any bets were placed
      const betsPlaced = bets.some(bet => bet > 0);

      if (betsPlaced) {
        // Check if bets were placed only on one animal
        const singleBetIndex = bets.findIndex(bet => bet > 0 && bets.filter(b => b > 0).length === 1);
        if (singleBetIndex !== -1) {
          // Generate a list of valid indices (excluding the one with the single bet)
          const validIndices = [...Array(numSegments).keys()].filter(i => i !== singleBetIndex);
          // Randomly select one of the valid indices as the result index
          resultIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        } else {
          // Find the index with the lowest bet amount * multiplier
          let minBetIndex = -1;
          let minBetMultiplier = Infinity;
          for (let i = 0; i < numSegments; i++) {
            const totalBetAmount = bets[i] * multipliers[i];
            if (totalBetAmount < minBetMultiplier && bets[i] > 0) {
              minBetMultiplier = totalBetAmount;
              minBetIndex = i;
            }
          }
          resultIndex = minBetIndex;
        }
      } else {
        // If no bets were placed, select a random result
        resultIndex = Math.floor(Math.random() * numSegments);
      }

      result = animals[resultIndex];
      results.unshift(result);
      if (results.length > maxResults) {
        results.pop();
      }
      const multiplier = multipliers[resultIndex];
      const winnings = bets[resultIndex] * multiplier;
      credits += winnings;
      // Redraw the wheel with the final result highlighted
      drawWheel(result);
      setTimeout(() => {
        // Display the result after a delay
        document.getElementById('result').innerText = `Result: ${result} (x${multiplier}) - Winnings: ${winnings}`;
        displayResults();
        if (winnings > 0) {
          winSound.play();
        } else {
          loseSound.play();
        }
        // Start the next game after another delay
        setTimeout(startGame, 2000);
      }, 1000);
    }
  }, 100); // Spin every 0.1 second
}

function placeBet(index) {
  if (credits > 0) {
    bets[index]++;
    credits--;
    updateBetButtons();
    document.getElementById('credit').textContent = `Credits: ${credits}`;
    betSound.play(); // Play bet sound effect
  }
}
let betAmount = 1;
let enableBetMode = false;

function enableBet() {
  betAmount = parseInt(document.getElementById('betAmount').value);
  enableBetMode = true;
}

function placeBet(index) {
  if (enableBetMode) {
    if (credits >= betAmount) {
      bets[index] += betAmount;
      credits -= betAmount;
    }
  } else {
    if (credits > 0) {
      bets[index]++;
      credits--;
    }
  }
  updateBetButtons();
  document.getElementById('credit').textContent = `Credits: ${credits}`;
}


function updateBetButtons() {
  const betButtons = document.getElementsByClassName('betButton');
  for (let i = 0; i < betButtons.length; i++) {
    betButtons[i].textContent = `${animals[i]} (${multipliers[i]}x) - Bet: ${bets[i]}`;
  }
}

function resetBets() {
  bets = new Array(numSegments).fill(0);
  updateBetButtons();
}

function countdownTimer(id, duration, callback) {
  let timer = duration;
  const interval = setInterval(() => {
    document.getElementById(id).textContent = timer;
    if (--timer < 0) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 1000);
}

function drawWheel(result) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSegments; i++) {
    const startAngle = i * angle;
    const endAngle = (i + 1) * angle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
    ctx.fillStyle = (i % 2 === 0) ? 'lightgray' : 'white';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + angle / 2);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(animals[i], wheelRadius / 2, 0);
    ctx.restore();
  }

  // Highlight the result
  if (result) {
    const resultIndex = animals.indexOf(result);
    if (resultIndex !== -1) {
      const startAngle = resultIndex * angle;
      const endAngle = (resultIndex + 1) * angle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  }
}

function displayResults() {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';
  for (let i = 0; i < results.length; i++) {
    const listItem = document.createElement('li');
    listItem.textContent = `Result: ${results[i]} (x${multipliers[animals.indexOf(results[i])]}${i === 0 ? ' - Latest' : ''})`;
    if (i === 0) {
      listItem.classList.add('latest');
    }
    resultsList.appendChild(listItem);
  }
}

function changeBackgroundColor() {
  const colors = ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da']; // List of light shade colors
  let index = 0;

  setInterval(() => {
    document.querySelector('.container').style.backgroundColor = colors[index];
    index = (index + 1) % colors.length;
  }, 5000); // Change color every 5 seconds
}

// Call the function to start changing the background color
changeBackgroundColor();

// Automatically start the first game
startGame();
