/* ==========================================================================
   ORIXA - PLAYFUL CARTOON GAME CONTROLLER
   ========================================================================== */

// 1. QUESTION DATABASE: Shuffled per subject, 9 questions required for 3x3 layout
const QUIZ_SUBJECTS = {
    gk: [
        {
            question: "Which is the largest and deepest ocean on Earth?",
            options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
            answer: "Pacific Ocean",
            solved: false
        },
        {
            question: "How many colors are there in a standard rainbow?",
            options: ["6", "7", "8", "9"],
            answer: "7",
            solved: false
        },
        {
            question: "What is the capital city of France?",
            options: ["Berlin", "London", "Rome", "Paris"],
            answer: "Paris",
            solved: false
        },
        {
            question: "Which animal is famous as the 'Ship of the Desert'?",
            options: ["Camel", "Horse", "Elephant", "Lion"],
            answer: "Camel",
            solved: false
        },
        {
            question: "Which country is famous for the ancient Pyramids of Giza?",
            options: ["Italy", "Egypt", "Greece", "Mexico"],
            answer: "Egypt",
            solved: false
        },
        {
            question: "How many letters are there in the English alphabet?",
            options: ["24", "25", "26", "27"],
            answer: "26",
            solved: false
        },
        {
            question: "Which cartoon character lives in a pineapple under the sea?",
            options: ["Patrick Star", "Sandy Cheeks", "SpongeBob SquarePants", "Squidward"],
            answer: "SpongeBob SquarePants",
            solved: false
        },
        {
            question: "In which season do leaves change color and fall from trees?",
            options: ["Spring", "Summer", "Autumn", "Winter"],
            answer: "Autumn",
            solved: false
        },
        {
            question: "What is the name of the fairy in Peter Pan who spreads pixie dust?",
            options: ["Tinker Bell", "Cinderella", "Snow White", "Ariel"],
            answer: "Tinker Bell",
            solved: false
        }
    ],
    science: [
        {
            question: "What planet is closest to our Sun?",
            options: ["Venus", "Earth", "Mars", "Mercury"],
            answer: "Mercury",
            solved: false
        },
        {
            question: "What gas do humans need to breathe in to survive?",
            options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
            answer: "Oxygen",
            solved: false
        },
        {
            question: "Which force pulls objects toward the center of the Earth?",
            options: ["Friction", "Magnetism", "Gravity", "Electricity"],
            answer: "Gravity",
            solved: false
        },
        {
            question: "What temperature does water boil at in Celsius?",
            options: ["50°C", "80°C", "100°C", "120°C"],
            answer: "100°C",
            solved: false
        },
        {
            question: "Which part of the plant takes in water and nutrients from the soil?",
            options: ["Stem", "Leaf", "Flower", "Roots"],
            answer: "Roots",
            solved: false
        },
        {
            question: "What is the name of the closest star to planet Earth?",
            options: ["Proxima Centauri", "Sirius", "The Sun", "Polaris"],
            answer: "The Sun",
            solved: false
        },
        {
            question: "Which insect is known for making sweet honey in hives?",
            options: ["Wasp", "Honeybee", "Butterfly", "Ant"],
            answer: "Honeybee",
            solved: false
        },
        {
            question: "What state of matter is water when it is frozen into ice?",
            options: ["Solid", "Liquid", "Gas", "Plasma"],
            answer: "Solid",
            solved: false
        },
        {
            question: "Which planet is commonly known as the 'Red Planet'?",
            options: ["Jupiter", "Saturn", "Mars", "Neptune"],
            answer: "Mars",
            solved: false
        }
    ],
    maths: [
        {
            question: "What is 15 minus 7?",
            options: ["6", "7", "8", "9"],
            answer: "8",
            solved: false
        },
        {
            question: "How many sides does a pentagon have?",
            options: ["4", "5", "6", "8"],
            answer: "5",
            solved: false
        },
        {
            question: "What is 6 multiplied by 8?",
            options: ["42", "46", "48", "54"],
            answer: "48",
            solved: false
        },
        {
            question: "What is half of 100?",
            options: ["25", "40", "50", "75"],
            answer: "50",
            solved: false
        },
        {
            question: "If a triangle has three equal sides, what is it called?",
            options: ["Isosceles", "Equilateral", "Scalene", "Right-angled"],
            answer: "Equilateral",
            solved: false
        },
        {
            question: "What is 9 plus 14?",
            options: ["21", "22", "23", "24"],
            answer: "23",
            solved: false
        },
        {
            question: "What is 64 divided by 8?",
            options: ["6", "7", "8", "9"],
            answer: "8",
            solved: false
        },
        {
            question: "What mathematical shape is similar to a soccer ball?",
            options: ["Cylinder", "Cube", "Cone", "Sphere"],
            answer: "Sphere",
            solved: false
        },
        {
            question: "What is the next number in this pattern: 2, 4, 6, 8, ...?",
            options: ["9", "10", "11", "12"],
            answer: "10",
            solved: false
        }
    ],
    history: [
        {
            question: "Who was the first President of the United States?",
            options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
            answer: "George Washington",
            solved: false
        },
        {
            question: "Which ancient civilization built the Colosseum in Rome?",
            options: ["Greeks", "Egyptians", "Romans", "Persians"],
            answer: "Romans",
            solved: false
        },
        {
            question: "What is the name of the ship that brought the Pilgrims to America in 1620?",
            options: ["Santa Maria", "Mayflower", "Beagle", "Titanic"],
            answer: "Mayflower",
            solved: false
        },
        {
            question: "Who was the famous queen of ancient Egypt who ruled alongside Mark Antony?",
            options: ["Cleopatra", "Nefertiti", "Hatshepsut", "Sobekneferu"],
            answer: "Cleopatra",
            solved: false
        },
        {
            question: "Which country did the Vikings originally come from?",
            options: ["France", "England", "Scandinavia", "Italy"],
            answer: "Scandinavia",
            solved: false
        },
        {
            question: "Who wrote the famous play 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Homer"],
            answer: "William Shakespeare",
            solved: false
        },
        {
            question: "In which century did the Wright brothers make their first powered airplane flight?",
            options: ["18th Century", "19th Century", "20th Century", "21st Century"],
            answer: "20th Century",
            solved: false
        },
        {
            question: "Which explorer is credited with reaching the Americas in 1492?",
            options: ["Marco Polo", "Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan"],
            answer: "Christopher Columbus",
            solved: false
        },
        {
            question: "What was the name of the first artificial satellite launched into space by humans in 1957?",
            options: ["Sputnik 1", "Explorer 1", "Vostok 1", "Apollo 11"],
            answer: "Sputnik 1",
            solved: false
        }
    ]
};

// 2. PLAYFUL CARTOON SOUND MANAGER (Synthesized via Web Audio API)
class CartoonSoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playClick() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;
        
        // Bouncy bubble-pop click sound
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08); // sweeps up rapidly
        
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;
        
        // Cute upward chiming notes
        const now = this.ctx.currentTime;
        const notes = [659.25, 783.99, 1046.50, 1318.51]; // E5 -> G5 -> C6 -> E6
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            
            gainNode.gain.setValueAtTime(0.28, now + idx * 0.06);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.25);
        });
    }

    playError() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;
        
        // Comedic springy slide down sound (wrong answer)
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.35); // slides down
        
        gainNode.gain.setValueAtTime(0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playOpen() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

        gainNode.gain.setValueAtTime(0.16, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playVictory() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;
        
        // Happy, bouncy cartoon victory fanfare (major scale arpeggio run)
        const now = this.ctx.currentTime;
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1318.51, 1567.98];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            const gainVal = idx === notes.length - 1 ? 0.3 : 0.18;
            const duration = idx === notes.length - 1 ? 0.8 : 0.3;
            
            gainNode.gain.setValueAtTime(gainVal, now + idx * 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + duration);
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        this.resume();
        if (!this.ctx) return;
        
        // Comedic sad descending slide
        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23, 261.63];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            
            gainNode.gain.setValueAtTime(0.15, now + idx * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.4);
        });
    }
}

const soundManager = new CartoonSoundManager();

// 3. CARTOON BUBBLE CANVAS BACKGROUND
class CartoonParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bubbles = [];
        this.colors = ['#81c784', '#ffd54f', '#4fc3f7', '#ba68c8', '#ffb74d'];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initBubbles();
    }

    initBubbles() {
        this.bubbles = [];
        const count = Math.min(Math.floor(window.innerWidth / 35), 35);
        for (let i = 0; i < count; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height + this.canvas.height, // start below or randomly
                radius: Math.random() * 12 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                vx: (Math.random() - 0.5) * 0.4,
                vy: -(Math.random() * 0.6 + 0.3), // upward floating
                alpha: Math.random() * 0.25 + 0.15
            });
        }
        
        // Randomize initial Y positions so they don't group together at startup
        this.bubbles.forEach(b => b.y = Math.random() * this.canvas.height);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bubbles.forEach(b => {
            // Main bubble circle
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = b.color;
            this.ctx.globalAlpha = b.alpha;
            this.ctx.fill();
            
            // Shiny highlight crescent reflection (Top-Left)
            this.ctx.beginPath();
            this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = b.alpha * 0.75;
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1.0; // reset
            
            // Move bubble
            b.x += b.vx + Math.sin(b.y / 50) * 0.15; // gentle side swaying
            b.y += b.vy;
            
            // Reset to bottom if floated off the top screen
            if (b.y + b.radius < 0) {
                b.y = this.canvas.height + b.radius;
                b.x = Math.random() * this.canvas.width;
                b.vx = (Math.random() - 0.5) * 0.4;
                b.vy = -(Math.random() * 0.6 + 0.3);
            }
            
            // Keep X drift within boundaries
            if (b.x < -b.radius) b.x = this.canvas.width + b.radius;
            if (b.x > this.canvas.width + b.radius) b.x = -b.radius;
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 4. CONFETTI SYSTEM (Bubbly, colorful victory particles)
class ConfettiSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#81c784', '#ffd54f', '#4fc3f7', '#ffb74d', '#e57373', '#ba68c8'];
        this.active = false;
        
        window.addEventListener('resize', () => {
            if (this.active) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });
    }

    start() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        this.active = true;
        
        const count = 120;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * -this.canvas.height - 20,
                radius: Math.random() * 7 + 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2
            });
        }
        
        this.animate();
    }

    stop() {
        this.active = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            if (p.y > this.canvas.height) {
                p.y = -20;
                p.x = Math.random() * this.canvas.width;
                p.vy = Math.random() * 3 + 2;
            }
            
            p.x += p.vx + Math.sin(p.y / 25) * 0.3;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            
            // Draw playful circular/oval spots and rectangle confetti shapes
            if (p.radius % 2 === 0) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.radius, -p.radius / 1.5, p.radius * 2, p.radius * 1.3);
            }
            this.ctx.restore();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

const confettiSystem = new ConfettiSystem('confetti-canvas');

// 5. ORIXA GAME CORE ENGINE
class OrixaGame {
    constructor() {
        this.score = 0;
        this.solvedCount = 0;
        
        // Subject Choice & Settings
        this.selectedSubject = 'gk';
        this.timeLimitEnabled = true;
        this.totalArcadeTime = 60; // 60 seconds
        
        // Timer values
        this.timeLeft = 60;
        this.elapsedSeconds = 0;
        this.timerInterval = null;
        this.startTime = null;
        this.isGameOver = false;

        // Current active states
        this.activeQuestions = [];
        this.currentQuestionIdx = -1;
        this.currentTileElement = null;

        // DOM elements cache
        this.dom = {
            // Screens
            startScreen: document.getElementById('start-screen'),
            gameWrapper: document.querySelector('.game-wrapper'),
            subjectCards: document.querySelectorAll('.subject-card'),
            timeLimitCheckbox: document.getElementById('time-limit-checkbox'),
            startGameBtn: document.getElementById('start-game-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),

            // Game UI
            grid: document.getElementById('puzzle-grid'),
            score: document.getElementById('score-val'),
            timer: document.getElementById('timer-val'),
            timerIcon: document.getElementById('timer-icon'),
            progressText: document.getElementById('progress-solved'),
            progressPct: document.getElementById('progress-pct'),
            progressBar: document.getElementById('progress-bar-fill'),
            
            // Modal
            modal: document.getElementById('quiz-modal'),
            modalClose: document.getElementById('modal-close'),
            modalQNum: document.getElementById('modal-q-num'),
            modalQuestion: document.getElementById('modal-question'),
            modalOptions: document.getElementById('modal-options'),
            
            // Overlays
            victoryScreen: document.getElementById('victory-screen'),
            finalScore: document.getElementById('final-score'),
            finalTime: document.getElementById('final-time'),
            restartBtn: document.getElementById('restart-btn'),

            gameOverScreen: document.getElementById('game-over-screen'),
            gameOverScore: document.getElementById('gameover-score'),
            gameOverSolved: document.getElementById('gameover-solved'),
            gameOverRestartBtn: document.getElementById('game-over-restart-btn'),

            // Sounds
            soundToggle: document.getElementById('sound-toggle'),

            // Customize Hint box
            // Removed customize widget from UI
        };
        
        this.initEvents();
    }

    initEvents() {
        // Start Screen Category Selector clicks
        this.dom.subjectCards.forEach(card => {
            card.addEventListener('click', () => {
                soundManager.playClick();
                this.dom.subjectCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedSubject = card.dataset.subject;
            });
        });

        // Start playing action
        this.dom.startGameBtn.addEventListener('click', () => {
            soundManager.playClick();
            this.timeLimitEnabled = this.dom.timeLimitCheckbox.checked;
            this.startGame();
        });

        // Go Back to Start Menu
        this.dom.backToMenuBtn.addEventListener('click', () => {
            soundManager.playClick();
            this.stopTimers();
            this.showStartScreen();
        });

        // Modal triggers
        this.dom.modalClose.addEventListener('click', () => {
            soundManager.playClick();
            this.closeModal();
        });
        
        this.dom.modal.addEventListener('click', (e) => {
            if (e.target === this.dom.modal) {
                soundManager.playClick();
                this.closeModal();
            }
        });
        
        // Replay Button clicks
        this.dom.restartBtn.addEventListener('click', () => {
            soundManager.playClick();
            this.showStartScreen();
        });

        this.dom.gameOverRestartBtn.addEventListener('click', () => {
            soundManager.playClick();
            this.showStartScreen();
        });

        // Toggle sound click (showing/hiding monotone SVGs)
        this.dom.soundToggle.addEventListener('click', () => {
            const enabled = soundManager.toggle();
            const onSvg = document.getElementById('speaker-on-svg');
            const offSvg = document.getElementById('speaker-off-svg');
            
            if (enabled) {
                if (onSvg) onSvg.classList.remove('hidden');
                if (offSvg) offSvg.classList.add('hidden');
                soundManager.playClick();
            } else {
                if (onSvg) onSvg.classList.add('hidden');
                if (offSvg) offSvg.classList.remove('hidden');
            }
        });

        // Removed customize helper controls from the game UI

        // Global document interaction handlers to unlock Web Audio context safely
        const resumeAudio = () => {
            soundManager.resume();
            if (soundManager.ctx && soundManager.ctx.state === 'running') {
                // Remove listeners once successfully running
                ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
                    document.removeEventListener(evt, resumeAudio);
                });
            }
        };

        ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
            document.addEventListener(evt, resumeAudio);
        });
    }

    showStartScreen() {
        this.dom.gameWrapper.classList.add('hidden');
        this.dom.startScreen.classList.remove('hidden');
        this.dom.victoryScreen.classList.add('hidden');
        this.dom.gameOverScreen.classList.add('hidden');
        confettiSystem.stop();
    }

    startGame() {
        this.score = 0;
        this.solvedCount = 0;
        this.elapsedSeconds = 0;
        this.isGameOver = false;
        
        // Hide overlays & reset trophy victory animation
        const trophyImg = document.getElementById('revealed-image');
        if (trophyImg) {
            trophyImg.classList.remove('victory-animate');
        }
        
        this.dom.startScreen.classList.add('hidden');
        this.dom.gameWrapper.classList.remove('hidden');
        this.dom.victoryScreen.classList.add('hidden');
        this.dom.gameOverScreen.classList.add('hidden');
        this.closeModal();

        // Load and shuffle questions for selected subject (Take first 9 for 3x3 layout)
        const rawList = QUIZ_SUBJECTS[this.selectedSubject] || QUIZ_SUBJECTS.gk;
        this.activeQuestions = this.shuffleArray([...rawList]).slice(0, 9);
        this.activeQuestions.forEach(q => {
            q.solved = false;
            q.attempts = 0;
        });

        // Grid render
        this.buildGrid();
        
        // Stats bar display setups
        this.updateStatsDisplay();
        this.updateProgressDisplay();
        
        // Setup clock
        this.stopTimers();
        this.startTime = Date.now();
        
        if (this.timeLimitEnabled) {
            this.timeLeft = this.totalArcadeTime;
            this.dom.timerIcon.innerText = '⏱️';
            this.dom.timer.style.color = '';
            this.dom.timer.innerText = this.formatTime(this.timeLeft);
        } else {
            this.dom.timerIcon.innerText = '⏳';
            this.dom.timer.style.color = '';
            this.dom.timer.innerText = '00:00';
        }

        // Loop ticks
        this.timerInterval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (this.isGameOver) return;
        
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        if (this.timeLimitEnabled) {
            this.timeLeft = Math.max(0, this.totalArcadeTime - this.elapsedSeconds);
            this.dom.timer.innerText = this.formatTime(this.timeLeft);
            
            // Warning color text red under 15 seconds
            if (this.timeLeft <= 15) {
                this.dom.timer.style.color = '#e57373';
            }
            
            if (this.timeLeft === 0) {
                this.triggerGameOver();
            }
        } else {
            // Zen Mode counts up
            this.dom.timer.innerText = this.formatTime(this.elapsedSeconds);
        }
    }

    stopTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    buildGrid() {
        this.dom.grid.innerHTML = '';
        
        // 3x3 grid has 9 tiles
        for (let i = 0; i < 9; i++) {
            const tile = document.createElement('div');
            tile.classList.add('puzzle-tile');
            tile.dataset.index = i;
            
            const numberLabel = document.createElement('span');
            numberLabel.classList.add('tile-number');
            numberLabel.innerText = String(i + 1);
            
            tile.appendChild(numberLabel);
            
            // Open modal trigger
            tile.addEventListener('click', () => this.handleTileClick(i, tile));
            
            this.dom.grid.appendChild(tile);
        }
    }

    handleTileClick(index, element) {
        if (this.activeQuestions[index].solved || this.isGameOver) return;
        
        soundManager.playClick();
        this.currentQuestionIdx = index;
        this.currentTileElement = element;
        this.openModal();
    }

    openModal() {
        const qData = this.activeQuestions[this.currentQuestionIdx];
        
        this.dom.modalQNum.innerText = String(this.currentQuestionIdx + 1);
        this.dom.modalQuestion.innerText = qData.question;

        // Update remaining chances display
        const attemptsLeft = 3 - (qData.attempts || 0);
        const chancesVal = document.getElementById('modal-chances-val');
        if (chancesVal) {
            chancesVal.innerText = String(attemptsLeft);
        }
        
        // Build answer option button list
        this.dom.modalOptions.innerHTML = '';
        const optionsShuffled = this.shuffleArray([...qData.options]);
        
        optionsShuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn');
            btn.innerText = opt;
            
            btn.addEventListener('click', () => this.handleAnswerSelect(opt, btn));
            this.dom.modalOptions.appendChild(btn);
        });

        this.dom.modal.classList.remove('hidden');
        this.dom.modal.setAttribute('aria-hidden', 'false');
        soundManager.playOpen();
    }

    closeModal() {
        this.dom.modal.classList.add('hidden');
        this.dom.modal.setAttribute('aria-hidden', 'true');
        this.currentQuestionIdx = -1;
        this.currentTileElement = null;
    }

    handleAnswerSelect(selectedOption, buttonElement) {
        const qData = this.activeQuestions[this.currentQuestionIdx];
        const allOptionButtons = this.dom.modalOptions.querySelectorAll('.option-btn');
        
        // Lock selections during delay
        allOptionButtons.forEach(btn => btn.disabled = true);
        
        if (selectedOption === qData.answer) {
            // Correct answer logic
            buttonElement.classList.add('correct');
            soundManager.playSuccess();
            
            qData.solved = true;
            this.solvedCount++;
            this.score += 100;
            
            if (this.currentTileElement) {
                this.currentTileElement.classList.add('solved');
            }

            this.updateStatsDisplay();
            this.updateProgressDisplay();
            
            // Check victory conditions (9 tiles cleared)
            if (this.solvedCount === 9) {
                this.isGameOver = true;
                this.stopTimers();
            }

            setTimeout(() => {
                this.closeModal();
                if (this.isGameOver) {
                    this.triggerVictory();
                }
            }, 1000);

        } else {
            // Incorrect answer logic
            buttonElement.classList.add('incorrect');
            soundManager.playError();
            
            this.score = Math.max(0, this.score - 50);
            this.updateStatsDisplay();
            
            // Shake current tile on board
            if (this.currentTileElement) {
                this.currentTileElement.classList.add('shake-wrong');
                this.currentTileElement.addEventListener('animationend', () => {
                    this.currentTileElement.classList.remove('shake-wrong');
                }, { once: true });
            }

            // Increment attempts for this question
            qData.attempts = (qData.attempts || 0) + 1;

            // Check if correct answer should be highlighted (if it's the last tile or out of chances)
            const allOtherTilesDone = (this.solvedCount === 8);
            const outOfChances = (qData.attempts >= 3);
            const shouldShowCorrect = allOtherTilesDone || outOfChances;

            if (shouldShowCorrect) {
                // Highlight the correct answer helper
                allOptionButtons.forEach(btn => {
                    if (btn.innerText === qData.answer) {
                        btn.classList.add('correct');
                    }
                });

                // Solve the tile since correct answer is revealed
                qData.solved = true;
                this.solvedCount++;
                if (this.currentTileElement) {
                    this.currentTileElement.classList.add('solved');
                }
                this.updateProgressDisplay();

                if (this.solvedCount === 9) {
                    this.isGameOver = true;
                    this.stopTimers();
                }

                setTimeout(() => {
                    this.closeModal();
                    if (this.isGameOver) {
                        this.triggerVictory();
                    }
                }, 1500);
            } else {
                // Not out of chances yet. Just close the modal so they can try again.
                setTimeout(() => {
                    this.closeModal();
                }, 1200);
            }
        }
    }

    triggerVictory() {
        // Start confetti celebration immediately
        confettiSystem.start();
        
        // Play victory sound fanfare
        soundManager.playVictory();
        
        // Add victory scaling/glow animation to the trophy vector
        const trophyImg = document.getElementById('revealed-image');
        if (trophyImg) {
            trophyImg.classList.add('victory-animate');
        }
        
        // Wait 3 seconds before displaying score and time
        setTimeout(() => {
            this.dom.finalScore.innerText = this.score;
            this.dom.finalTime.innerText = this.formatTime(this.elapsedSeconds);
            this.dom.victoryScreen.classList.remove('hidden');
        }, 3000);
    }

    triggerGameOver() {
        this.isGameOver = true;
        this.stopTimers();
        soundManager.playGameOver();
        
        this.dom.gameOverScore.innerText = this.score;
        this.dom.gameOverSolved.innerText = `${this.solvedCount} / 9`;
        
        this.dom.gameOverScreen.classList.remove('hidden');
    }

    updateStatsDisplay() {
        this.dom.score.innerText = this.score;
    }

    updateProgressDisplay() {
        const percentage = Math.round((this.solvedCount / 9) * 100);
        
        this.dom.progressText.innerText = this.solvedCount;
        this.dom.progressPct.innerText = `${percentage}%`;
        this.dom.progressBar.style.width = `${percentage}%`;
    }

    // Array shuffle helper
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Format seconds value to MM:SS
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// 6. ENGINE BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    // Start cartoon bubbles canvas loops
    const particles = new CartoonParticles('particles-canvas');
    particles.animate();

    // Start game engine
    soundManager.init();
    const game = new OrixaGame();
    // The game class handles showing the start page automatically
});
