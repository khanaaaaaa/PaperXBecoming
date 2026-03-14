const card = document.getElementById('card');
const quoteText = document.getElementById('quote-text');
const reflectionText = document.getElementById('reflection-text');
const nextBtn = document.getElementById('next-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const libraryBtn = document.getElementById('library-btn');
const libraryPanel = document.getElementById('library-panel');
const closeLibrary = document.getElementById('close-library');
const libraryShelf = document.getElementById('library-shelf');
const bookmark = document.getElementById('bookmark');
const ambientOverlay = document.getElementById('ambient-overlay');
const moodOverlay = document.getElementById('splash-screen');
const mainApp = document.getElementById('main-app');

const reflections = {
    heavy: [
        "What is one small thing you can release right now?",
        "What would you say to a friend carrying what you carry?",
        "What does your body need most in this moment?",
        "What are you ready to let go of?",
        "How can you show yourself more compassion today?"
    ],
    searching: [
        "What are you truly looking for beneath this question?",
        "Where can you practice more patience?",
        "How does this moment serve your journey?",
        "What would you do if you knew you couldn't fail?",
        "Which thought served you best today?"
    ],
    grateful: [
        "What abundance are you grateful for right now?",
        "What made you feel worthy today?",
        "What small step did you take toward growth today?",
        "What lesson from your past are you most grateful for?",
        "Who in your life deserves your gratitude today?"
    ]
};

const fallbackQuotes = [
    "I am worthy of all the good things that come into my life.",
    "My thoughts create my reality, and I choose positive ones.",
    "I trust the timing of my life.",
    "I am becoming the best version of myself.",
    "I release what no longer serves me.",
    "I am exactly where I need to be.",
    "My potential is limitless.",
    "Abundance flows freely through me.",
    "I am allowed to take up space.",
    "Every ending makes room for a new beginning.",
    "I choose peace over perfection.",
    "I am enough, exactly as I am."
];

let currentQuote = null;
let savedCards = JSON.parse(localStorage.getItem('savedCards')) || [];
let currentMood = 'searching';
let twCancel = false;

function typeWriter(text) {
    twCancel = true;
    quoteText.textContent = '';
    const token = {};
    twCancel = false;
    let i = 0;
    function tick() {
        if (twCancel) return;
        if (i < text.length) {
            quoteText.textContent = text.slice(0, ++i);
            setTimeout(tick, 40);
        }
    }
    tick();
}

async function loadCard() {
    const pool = reflections[currentMood];
    const reflection = pool[Math.floor(Math.random() * pool.length)];

    // show fallback immediately
    let quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    currentQuote = { quote, reflection };
    typeWriter(quote);
    reflectionText.textContent = reflection;
    card.classList.remove('flipped');
    updateBookmark();

    // try to replace with API quote
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random') + '&t=' + Date.now(), { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        const parsed = JSON.parse(data.contents);
        if (!parsed || !parsed[0] || !parsed[0].q) throw new Error('bad response');
        currentQuote = { quote: parsed[0].q, reflection };
        typeWriter(currentQuote.quote);
        updateBookmark();
    } catch {}
}

function updateBookmark() {
    const isSaved = savedCards.some(c => c.quote === currentQuote.quote);
    bookmark.classList.toggle('visible', isSaved);
}

function saveCard() {
    if (!currentQuote) return;
    const exists = savedCards.some(c => c.quote === currentQuote.quote);
    if (!exists) {
        savedCards.push(currentQuote);
        localStorage.setItem('savedCards', JSON.stringify(savedCards));
        updateBookmark();
        renderLibrary();
    }
}

function deleteCard(index) {
    savedCards.splice(index, 1);
    localStorage.setItem('savedCards', JSON.stringify(savedCards));
    renderLibrary();
    updateBookmark();
}

function renderLibrary() {
    libraryShelf.innerHTML = '';
    savedCards.forEach((c, index) => {
        const el = document.createElement('div');
        el.className = 'saved-card';
        el.innerHTML = `
            <button class="delete-btn">✕</button>
            <p><strong>"${c.quote}"</strong></p>
        `;
        el.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCard(index);
        });
        libraryShelf.appendChild(el);
    });
}

card.addEventListener('click', () => card.classList.toggle('flipped'));
nextBtn.addEventListener('click', loadCard);
favoriteBtn.addEventListener('click', saveCard);

libraryBtn.addEventListener('click', () => {
    libraryPanel.classList.toggle('open');
    renderLibrary();
});

closeLibrary.addEventListener('click', () => libraryPanel.classList.remove('open'));

// tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
    });
});

// meditation timer
const timerDisplay = document.getElementById('timer-display');
const timerStart = document.getElementById('timer-start');
const timerReset = document.getElementById('timer-reset');
const breathCircle = document.getElementById('breath-circle');
const breathText = document.getElementById('breath-text');
const breathStart = document.getElementById('breath-start');

let timerDuration = 300;
let timerRemaining = 300;
let timerInterval = null;
let timerRunning = false;
let breathInterval = null;
let breathRunning = false;

document.querySelectorAll('.timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        timerDuration = parseInt(btn.dataset.time);
        timerRemaining = timerDuration;
        updateTimerDisplay();
        stopTimer();
    });
});

function updateTimerDisplay() {
    const m = String(Math.floor(timerRemaining / 60)).padStart(2, '0');
    const s = String(timerRemaining % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerStart.textContent = 'Begin';
    timerDisplay.classList.remove('timer-running');
}

timerStart.addEventListener('click', () => {
    if (timerRunning) {
        stopTimer();
    } else {
        timerRunning = true;
        timerStart.textContent = 'Pause';
        timerDisplay.classList.add('timer-running');
        timerInterval = setInterval(() => {
            timerRemaining--;
            updateTimerDisplay();
            if (timerRemaining <= 0) {
                stopTimer();
                timerDisplay.textContent = 'Done';
            }
        }, 1000);
    }
});

timerReset.addEventListener('click', () => {
    stopTimer();
    timerRemaining = timerDuration;
    updateTimerDisplay();
});

const breathPhases = [
    { text: 'Inhale',  duration: 4000, scale: 1.3 },
    { text: 'Hold',    duration: 4000, scale: 1.3 },
    { text: 'Exhale',  duration: 4000, scale: 1.0 }
];
let breathPhaseIndex = 0;

function runBreathPhase() {
    const phase = breathPhases[breathPhaseIndex];
    breathText.textContent = phase.text;
    breathCircle.style.transform = `scale(${phase.scale})`;
    breathInterval = setTimeout(() => {
        breathPhaseIndex = (breathPhaseIndex + 1) % breathPhases.length;
        if (breathRunning) runBreathPhase();
    }, phase.duration);
}

breathStart.addEventListener('click', () => {
    if (breathRunning) {
        breathRunning = false;
        clearTimeout(breathInterval);
        breathStart.textContent = 'Start Breathing';
        breathCircle.style.transform = 'scale(1)';
        breathText.textContent = 'Inhale';
    } else {
        breathRunning = true;
        breathPhaseIndex = 0;
        breathStart.textContent = 'Stop';
        runBreathPhase();
    }
});

// mood check-in
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMood = btn.dataset.mood;
        moodOverlay.classList.add('fade-out');
        setTimeout(() => {
            moodOverlay.style.display = 'none';
            mainApp.classList.remove('hidden');
            loadCard();
        }, 800);
    });
});


