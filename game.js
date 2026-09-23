/**
 * MATH RUNNER - Standard 3 Mathematics Arcade Game
 * Game 1 of 6-game collection
 * 
 * Features:
 * - 3-Lane 2.5D Canvas Runner Engine
 * - Addition & Subtraction up to 1,000 (10 Editable Challenges)
 * - Autonomous Web Audio API Synthesizer with MP3 fallback
 * - Desktop & Mobile Touch Controls (Keyboard, Swipe, On-Screen Buttons)
 * - 3-Star Rating System & Animated HUD
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. EDITABLE MATHEMATICS CHALLENGES (Standard 3: Addition & Subtraction <= 1000)
  // ==========================================================================
  const MATH_CHALLENGES = [
    {
      id: 1,
      question: "320 + 150 = ?",
      answer: 470,
      options: [470, 370, 450],
      hint: "Add hundreds first: 300+100=400, then tens: 20+50=70"
    },
    {
      id: 2,
      question: "580 - 240 = ?",
      answer: 340,
      options: [320, 340, 440],
      hint: "500 - 200 = 300, 80 - 40 = 40"
    },
    {
      id: 3,
      question: "415 + 230 = ?",
      answer: 645,
      options: [635, 655, 645],
      hint: "400+200=600, 15+30=45"
    },
    {
      id: 4,
      question: "760 - 320 = ?",
      answer: 440,
      options: [440, 540, 420],
      hint: "700 - 300 = 400, 60 - 20 = 40"
    },
    {
      id: 5,
      question: "248 + 316 = ?",
      answer: 564,
      options: [554, 564, 574],
      hint: "248 + 300 = 548, 548 + 16 = 564"
    },
    {
      id: 6,
      question: "650 - 275 = ?",
      answer: 375,
      options: [475, 385, 375],
      hint: "650 - 200 = 450, 450 - 75 = 375"
    },
    {
      id: 7,
      question: "520 + 380 = ?",
      answer: 900,
      options: [900, 890, 910],
      hint: "520 + 380 = 500 + 300 + 100 = 900"
    },
    {
      id: 8,
      question: "830 - 450 = ?",
      answer: 380,
      options: [480, 380, 390],
      hint: "830 - 400 = 430, 430 - 50 = 380"
    },
    {
      id: 9,
      question: "465 + 372 = ?",
      answer: 837,
      options: [827, 837, 847],
      hint: "400+300=700, 65+72=137, 700+137=837"
    },
    {
      id: 10,
      question: "1000 - 365 = ?",
      answer: 635,
      options: [735, 645, 635],
      hint: "1000 - 300 = 700, 700 - 65 = 635"
    }
  ];

  // ==========================================================================
  // 2. AUDIO MANAGER (With Procedural Web Audio Synth Fallback)
  // ==========================================================================
  class AudioManager {
    constructor() {
      const pref = localStorage.getItem('math_games_sound') ?? localStorage.getItem('math_runner_sound');
      this.soundEnabled = pref !== 'false';
      this.ctx = null;
      this.bgmTimer = null;
      this.bgmStep = 0;
      this.audioFiles = {};
      this.audioLoaded = {};

      this.initAudioFiles();
    }

    initAudioContext() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    initAudioFiles() {
      const files = {
        bgm: 'assets/music/background.mp3',
        correct: 'assets/sounds/correct.mp3',
        wrong: 'assets/sounds/wrong.mp3',
        gameover: 'assets/sounds/gameover.mp3'
      };

      Object.keys(files).forEach(key => {
        try {
          const audio = new Audio();
          audio.src = files[key];
          audio.preload = 'auto';
          if (key === 'bgm') audio.loop = true;
          
          audio.addEventListener('canplaythrough', () => {
            this.audioLoaded[key] = true;
          });
          audio.addEventListener('error', () => {
            this.audioLoaded[key] = false; // Graceful fallback
          });
          this.audioFiles[key] = audio;
        } catch (e) {
          this.audioLoaded[key] = false;
        }
      });
    }

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      if (window.NumberlandFeedback) {
        window.NumberlandFeedback.setSoundEnabled(this.soundEnabled);
      }
      localStorage.setItem('math_games_sound', this.soundEnabled ? 'true' : 'false');
      localStorage.setItem('math_runner_sound', this.soundEnabled ? 'true' : 'false');
      if (!this.soundEnabled) {
        this.stopBGM();
      } else {
        this.initAudioContext();
        this.startBGM();
      }
      return this.soundEnabled;
    }

    startBGM() {
      if (!this.soundEnabled) return;
      this.initAudioContext();

      // If MP3 loaded and ready
      if (this.audioLoaded.bgm && this.audioFiles.bgm) {
        this.audioFiles.bgm.play().catch(() => {
          this.startProceduralBGM();
        });
      } else {
        this.startProceduralBGM();
      }
    }

    stopBGM() {
      if (this.audioFiles.bgm) {
        this.audioFiles.bgm.pause();
        this.audioFiles.bgm.currentTime = 0;
      }
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }

    // High energy cheerful retro chiptune melody
    startProceduralBGM() {
      if (!this.soundEnabled || this.bgmTimer || !this.ctx) return;

      const melody = [
        261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
        293.66, 369.99, 440.00, 587.33, 440.00, 369.99,
        329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
        392.00, 329.63, 293.66, 261.63, 293.66, 329.63
      ];
      const bass = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 196.00, 196.00];

      this.bgmStep = 0;
      this.bgmTimer = setInterval(() => {
        if (!this.soundEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Play melody note
        const noteFreq = melody[this.bgmStep % melody.length];
        this.playTone(noteFreq, 'square', 0.12, 0.04, now);

        // Play bass note
        if (this.bgmStep % 3 === 0) {
          const bassFreq = bass[Math.floor(this.bgmStep / 3) % bass.length];
          this.playTone(bassFreq, 'triangle', 0.2, 0.08, now);
        }

        this.bgmStep++;
      }, 160);
    }

    playTone(freq, type = 'sine', duration = 0.15, volume = 0.1, startTime = null) {
      if (!this.soundEnabled) return;
      this.initAudioContext();
      if (!this.ctx) return;

      const start = startTime || this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    }

    playLaneSwitch() {
      if (!this.soundEnabled) return;
      this.playTone(480, 'sine', 0.08, 0.07);
    }

    playCorrect() {
      if (!this.soundEnabled) return;
      if (this.audioLoaded.correct && this.audioFiles.correct) {
        this.audioFiles.correct.currentTime = 0;
        this.audioFiles.correct.play().catch(() => this.synthCorrect());
      } else {
        this.synthCorrect();
      }
    }

    synthCorrect() {
      this.initAudioContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.18, 0.12, now + idx * 0.06);
      });
    }

    playWrong() {
      if (!this.soundEnabled) return;
      if (this.audioLoaded.wrong && this.audioFiles.wrong) {
        this.audioFiles.wrong.currentTime = 0;
        this.audioFiles.wrong.play().catch(() => this.synthWrong());
      } else {
        this.synthWrong();
      }
    }

    synthWrong() {
      this.initAudioContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }

    playGameOver() {
      if (!this.soundEnabled) return;
      if (this.audioLoaded.gameover && this.audioFiles.gameover) {
        this.audioFiles.gameover.currentTime = 0;
        this.audioFiles.gameover.play().catch(() => this.synthGameOver());
      } else {
        this.synthGameOver();
      }
    }

    synthGameOver() {
      this.initAudioContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392.00, 369.99, 329.63, 293.66, 261.63];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'sawtooth', 0.25, 0.12, now + idx * 0.12);
      });
    }

    playVictory() {
      if (!this.soundEnabled) return;
      this.initAudioContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfare.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.3, 0.14, now + idx * 0.09);
      });
    }
  }

  // ==========================================================================
  // 3. MAIN GAME ENGINE
  // ==========================================================================
  class MathRunnerGame {
    constructor() {
      // DOM Elements
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.container = document.getElementById('game-container');

      // HUD Elements
      this.scoreEl = document.getElementById('score-display');
      this.timerEl = document.getElementById('timer-display');
      this.challengeEl = document.getElementById('challenge-display');
      this.livesContainer = document.getElementById('lives-container');
      this.questionBillboard = document.getElementById('question-billboard');
      this.questionTextEl = document.getElementById('question-text');
      this.soundToggleBtn = document.getElementById('sound-toggle-btn');
      this.soundIcon = document.getElementById('sound-icon');
      this.feedbackBanner = document.getElementById('feedback-banner');

      // Screens & Modals
      this.startScreen = document.getElementById('start-screen');
      this.instructionsModal = document.getElementById('instructions-modal');
      this.endScreen = document.getElementById('end-screen');
      this.startSoundToggle = document.getElementById('start-sound-toggle');
      this.startSoundIcon = document.getElementById('start-sound-icon');
      this.startSoundText = document.getElementById('start-sound-text');

      // End Screen Elements
      this.endHeaderBadge = document.getElementById('end-header-badge');
      this.endTitle = document.getElementById('end-title');
      this.endSubtitle = document.getElementById('end-subtitle');
      this.starsContainer = document.getElementById('stars-container');
      this.finalScoreVal = document.getElementById('final-score-val');
      this.finalChallengesVal = document.getElementById('final-challenges-val');
      this.finalLivesVal = document.getElementById('final-lives-val');
      this.finalTimeVal = document.getElementById('final-time-val');

      // Buttons
      this.startGameBtn = document.getElementById('start-game-btn');
      this.howToPlayBtn = document.getElementById('how-to-play-btn');
      this.closeInstructionsBtn = document.getElementById('close-instructions-btn');
      this.startFromInstBtn = document.getElementById('start-from-instructions-btn');
      this.playAgainBtn = document.getElementById('play-again-btn');
      this.btnLeft = document.getElementById('btn-left');
      this.btnRight = document.getElementById('btn-right');

      // Audio Manager
      this.audio = new AudioManager();

      // Game States: 'START', 'PLAYING', 'GAMEOVER', 'VICTORY'
      this.state = 'START';
      this.score = 0;
      this.lives = 3;
      this.timer = 60;
      this.currentChallengeIndex = 0;
      this.challenges = [...MATH_CHALLENGES];
      this.activeChallenge = null;

      // Runner World & Perspective Settings
      this.laneCount = 3; // Lane 0 (Left), 1 (Middle), 2 (Right)
      this.playerLane = 1; // Start in middle lane
      this.playerCurrentLaneX = 1; // For smooth lerp animation
      this.playerY = 0;
      this.playerJumpY = 0;
      this.isJumping = false;
      this.stumbleTimer = 0;
      this.runFrame = 0;

      // 3D Perspective Highway settings
      this.roadSegments = [];
      this.segmentCount = 120;
      this.segmentLength = 100;
      this.cameraZ = 0;
      this.speed = 450; // Units per second
      this.horizonRatio = 0.38; // Horizon position Y (0 to 1)

      // Approaching Gates (3 gates per challenge, 1 per lane)
      this.gates = [];
      this.gateZ = 1200; // Starting distance
      this.gatePassed = false;

      // Side Scenery (Trees, Neon Pillars, floating crystals)
      this.sceneryProps = [];
      this.initScenery();

      // Particles & Visual FX
      this.particles = [];
      this.floatingTexts = [];

      // Timing & Animation
      this.lastTime = 0;
      this.timerInterval = null;
      this.animFrameId = null;

      // Setup
      this.resizeCanvas();
      this.bindEvents();
      this.updateSoundUI();
    }

    // ========================================================================
    // INITIALIZATION & EVENT BINDINGS
    // ========================================================================
    initScenery() {
      this.sceneryProps = [];
      for (let i = 0; i < 40; i++) {
        this.sceneryProps.push({
          z: i * 200 + Math.random() * 50,
          side: i % 2 === 0 ? -1 : 1, // -1 Left, 1 Right
          distance: 1.6 + Math.random() * 0.8,
          type: Math.floor(Math.random() * 3), // 0: Tree, 1: Tech Pillar, 2: Crystal
          hue: Math.floor(Math.random() * 360)
        });
      }
    }

    resizeCanvas() {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);

      this.virtualWidth = rect.width;
      this.virtualHeight = rect.height;
    }

    bindEvents() {
      window.addEventListener('resize', () => this.resizeCanvas());

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (this.state !== 'PLAYING') return;

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this.moveLeft();
          e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.moveRight();
          e.preventDefault();
        }
      });

      // UI Button Clicks
      this.startGameBtn.addEventListener('click', () => this.startNewGame());
      if (this.howToPlayBtn) this.howToPlayBtn.addEventListener('click', () => this.showInstructions());
      const hudHowToPlay = document.getElementById('hud-how-to-play-btn');
      if (hudHowToPlay) hudHowToPlay.addEventListener('click', () => this.showInstructions());
      this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
      this.startFromInstBtn.addEventListener('click', () => {
        this.hideInstructions();
        this.startNewGame();
      });
      this.playAgainBtn.addEventListener('click', () => this.startNewGame());

      // Sound Toggles
      this.soundToggleBtn.addEventListener('click', () => {
        this.audio.toggleSound();
        this.updateSoundUI();
      });
      this.startSoundToggle.addEventListener('click', () => {
        this.audio.toggleSound();
        this.updateSoundUI();
      });

      // Mobile Touch Buttons
      this.btnLeft.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.moveLeft();
      });
      this.btnRight.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.moveRight();
      });

      // Canvas Touch & Swipe Controls
      let touchStartX = 0;
      let touchStartY = 0;

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        if (this.state !== 'PLAYING' || !e.changedTouches.length) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) this.moveLeft();
          else this.moveRight();
        } else {
          // Direct tap on screen halves
          const rect = this.canvas.getBoundingClientRect();
          const tapX = touchStartX - rect.left;
          if (tapX < rect.width * 0.4) {
            this.moveLeft();
          } else if (tapX > rect.width * 0.6) {
            this.moveRight();
          }
        }
      }, { passive: true });
    }

    updateSoundUI() {
      const enabled = window.NumberlandFeedback ? window.NumberlandFeedback.isSoundEnabled() : this.audio.soundEnabled;
      this.audio.soundEnabled = enabled;
      const icon = enabled ? '🔊' : '🔇';
      if (this.soundIcon) this.soundIcon.textContent = icon;
      if (this.startSoundIcon) this.startSoundIcon.textContent = icon;
      if (this.startSoundText) this.startSoundText.textContent = enabled ? 'ON' : 'OFF';
      if (this.soundToggleBtn) this.soundToggleBtn.title = enabled ? 'Mute Sound' : 'Unmute Sound';
    }

    showInstructions() {
      this.instructionsModal.classList.remove('hidden');
      this.instructionsModal.classList.add('active');
    }

    hideInstructions() {
      this.instructionsModal.classList.remove('active');
      this.instructionsModal.classList.add('hidden');
    }

    // ========================================================================
    // GAMEPLAY LOGIC & CONTROLS
    // ========================================================================
    moveLeft() {
      if (this.playerLane > 0) {
        this.playerLane--;
        this.audio.playLaneSwitch();
        this.createLaneSwitchParticles(-1);
      }
    }

    moveRight() {
      if (this.playerLane < this.laneCount - 1) {
        this.playerLane++;
        this.audio.playLaneSwitch();
        this.createLaneSwitchParticles(1);
      }
    }

    startNewGame() {
      this.state = 'PLAYING';
      this.score = 0;
      this.lives = 3;
      this.timer = 60;
      this.currentChallengeIndex = 0;
      this.playerLane = 1;
      this.playerCurrentLaneX = 1;
      this.gatePassed = false;
      this.stumbleTimer = 0;
      this.particles = [];
      this.floatingTexts = [];
      this.cameraZ = 0;

      // Reset combo
      if (window.NumberlandFeedback) {
        window.NumberlandFeedback.resetCombo();
      }

      // Hide overlays
      this.startScreen.classList.remove('active');
      this.startScreen.classList.add('hidden');
      this.endScreen.classList.remove('active');
      this.endScreen.classList.add('hidden');
      this.instructionsModal.classList.add('hidden');

      // Update HUD & clear warning
      this.updateHUD();
      if (typeof updateTimerWarning === 'function') {
        updateTimerWarning(this.timerEl, this.timer);
      }
      this.loadChallenge(this.currentChallengeIndex);

      // Start BGM
      this.audio.startBGM();

      // Start Countdown Timer
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.state !== 'PLAYING') return;
        this.timer--;
        this.timerEl.textContent = `${this.timer}s`;

        if (typeof updateTimerWarning === 'function') {
          updateTimerWarning(this.timerEl, this.timer);
        }

        if (this.timer <= 0) {
          this.endGame(false, "Time's up!");
        }
      }, 1000);

      // Start Game Loop
      this.lastTime = performance.now();
      if (!this.animFrameId) {
        this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
      }
    }

    loadChallenge(index) {
      if (index >= this.challenges.length) {
        this.endGame(true, "All challenges conquered!");
        return;
      }

      // Show challenge transition badge for challenges after the 1st
      if (index > 0 && typeof showChallengeTransition === 'function') {
        showChallengeTransition(`CHALLENGE ${index + 1}/10`, { container: this.container });
      }

      this.activeChallenge = this.challenges[index];
      this.gatePassed = false;
      this.gateZ = 1300; // Reset gates approach distance

      // Shuffle options across 3 lanes
      const shuffledOptions = [...this.activeChallenge.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      // Generate 3 gates
      this.gates = shuffledOptions.map((value, laneIndex) => ({
        lane: laneIndex,
        value: value,
        isCorrect: value === this.activeChallenge.answer,
        color: laneIndex === 0 ? '#38bdf8' : (laneIndex === 1 ? '#a855f7' : '#ec4899')
      }));

      // Update HUD & Billboard
      this.questionTextEl.textContent = this.activeChallenge.question;
      this.questionBillboard.classList.remove('pulse-new');
      void this.questionBillboard.offsetWidth; // Trigger reflow
      this.questionBillboard.classList.add('pulse-new');

      this.updateHUD();
    }

    updateHUD() {
      this.scoreEl.textContent = this.score;
      this.timerEl.textContent = `${this.timer}s`;
      this.challengeEl.textContent = `${Math.min(this.currentChallengeIndex + 1, 10)}/10`;

      // Update Lives Hearts
      const hearts = this.livesContainer.querySelectorAll('.heart');
      hearts.forEach((heart, idx) => {
        if (idx < this.lives) {
          heart.classList.remove('lost');
        } else {
          heart.classList.add('lost');
        }
      });
    }

    showToastFeedback(text, type = 'correct') {
      this.feedbackBanner.textContent = text;
      this.feedbackBanner.className = `feedback-toast show-${type}`;
      setTimeout(() => {
        this.feedbackBanner.className = 'feedback-toast';
      }, 700);
    }

    triggerScreenShake() {
      if (typeof shakeScreen === 'function') {
        shakeScreen(this.container);
      } else {
        this.container.classList.add('screen-shake');
        setTimeout(() => this.container.classList.remove('screen-shake'), 400);
      }
    }

    triggerFlash(type = 'green') {
      const cls = type === 'green' ? 'screen-flash-green' : 'screen-flash-red';
      this.container.classList.add(cls);
      setTimeout(() => this.container.classList.remove(cls), 400);
    }

    // ========================================================================
    // COLLISION & CHALLENGE RESOLUTION
    // ========================================================================
    handleGateCollision() {
      this.gatePassed = true;
      const chosenGate = this.gates.find(g => g.lane === this.playerLane);
      const targetX = this.virtualWidth / 2 + (this.playerCurrentLaneX - 1) * (this.virtualWidth * 0.25);
      const targetY = this.virtualHeight * 0.55;

      if (chosenGate && chosenGate.isCorrect) {
        // Correct Answer Collected!
        const prevScore = this.score;
        this.score += 100;

        if (typeof showCorrectFeedback === 'function') {
          showCorrectFeedback({
            points: 100,
            message: 'GREAT JOB!',
            container: this.container,
            x: targetX,
            y: targetY
          });
        } else {
          this.audio.playCorrect();
          this.showToastFeedback("+100 NICE!", "correct");
          this.triggerFlash('green');
          this.createSuccessParticles();
        }

        if (typeof animateScore === 'function') {
          animateScore(this.scoreEl, prevScore, this.score, 350);
        } else {
          this.scoreEl.textContent = this.score;
        }

        this.isJumping = true;
        this.playerJumpY = 25;
      } else {
        // Wrong Answer Hit!
        const hearts = this.livesContainer.querySelectorAll('.heart');
        const lostHeart = hearts[this.lives - 1] || null;

        this.lives--;
        this.stumbleTimer = 0.6;

        if (typeof showWrongFeedback === 'function') {
          showWrongFeedback({
            message: '-1 LIFE 💔',
            container: this.container,
            heartEl: lostHeart,
            x: targetX,
            y: targetY
          });
        } else {
          this.audio.playWrong();
          this.triggerScreenShake();
          this.triggerFlash('red');
          this.showToastFeedback("-1 LIFE 💔", "wrong");
          this.createHitParticles();
        }

        if (this.lives <= 0) {
          this.updateHUD();
          this.endGame(false, "Out of lives!");
          return;
        }
      }

      this.updateHUD();

      // Proceed to Next Challenge after short delay
      setTimeout(() => {
        if (this.state === 'PLAYING') {
          this.currentChallengeIndex++;
          this.loadChallenge(this.currentChallengeIndex);
        }
      }, 400);
    }

    endGame(isVictory, reasonText) {
      this.state = isVictory ? 'VICTORY' : 'GAMEOVER';
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.audio.stopBGM();

      if (typeof updateTimerWarning === 'function') {
        updateTimerWarning(this.timerEl, 60);
      }

      // Calculate Stars:
      // 1 Star: Completed run
      // 2 Stars: Score >= 700
      // 3 Stars: Score >= 900 and at least 2 lives remaining
      let stars = 0;
      if (isVictory) {
        if (this.score >= 900 && this.lives >= 2) {
          stars = 3;
        } else if (this.score >= 700) {
          stars = 2;
        } else {
          stars = 1;
        }
        if (typeof playGameSound === 'function') {
          playGameSound('victory');
        } else {
          this.audio.playVictory();
        }
      } else {
        stars = this.score >= 600 ? 1 : 0;
        if (typeof playGameSound === 'function') {
          playGameSound('gameover');
        } else {
          this.audio.playGameOver();
        }
      }

      // Save stars to localStorage for main portal progress
      try {
        if (window.NumberlandProfile) {
          window.NumberlandProfile.recordGameResult('runner', this.score, stars, Math.max(0, 60 - this.timer));
        } else {
          const existing = parseInt(localStorage.getItem('math_runner_stars') || '0', 10);
          if (stars > existing) {
            localStorage.setItem('math_runner_stars', stars);
          }
          localStorage.setItem('math_runner_highscore', Math.max(this.score, parseInt(localStorage.getItem('math_runner_highscore') || '0', 10)));
        }
      } catch (e) {}

      // Populate End Screen
      this.endHeaderBadge.textContent = isVictory ? 'VICTORY!' : 'GAME OVER';
      this.endHeaderBadge.className = `result-badge ${isVictory ? 'victory' : 'gameover'}`;
      this.endTitle.textContent = isVictory ? 'RUN COMPLETED!' : 'RUN FAILED!';
      this.endSubtitle.textContent = isVictory 
        ? (stars === 3 ? '🌟 Outstanding Speed & Math Mastery!' : '🎉 Great job! Keep practicing!') 
        : `${reasonText} Try again to conquer all 10!`;

      // Update Star icons
      const starSlots = this.starsContainer.querySelectorAll('.star-slot');
      starSlots.forEach((slot, idx) => {
        slot.classList.remove('earned');
        if (idx < stars) {
          setTimeout(() => slot.classList.add('earned'), 300 + idx * 250);
        }
      });

      // Update Stats
      this.finalScoreVal.textContent = this.score;
      this.finalChallengesVal.textContent = `${this.currentChallengeIndex} / 10`;
      this.finalLivesVal.textContent = '❤️'.repeat(Math.max(0, this.lives)) || '💔';
      this.finalTimeVal.textContent = `${Math.max(0, this.timer)}s`;

      // Show Overlay
      this.endScreen.classList.remove('hidden');
      this.endScreen.classList.add('active');
    }

    // ========================================================================
    // PARTICLE FX & FLOATING TEXTS
    // ========================================================================
    createSuccessParticles() {
      const centerX = this.virtualWidth / 2;
      const centerY = this.virtualHeight * 0.75;
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 200;
        this.particles.push({
          x: centerX + (this.playerCurrentLaneX - 1) * (this.virtualWidth * 0.25),
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          color: ['#fbbf24', '#38bdf8', '#34d399', '#f472b6'][Math.floor(Math.random() * 4)],
          size: 4 + Math.random() * 6,
          alpha: 1,
          life: 0.8
        });
      }
    }

    createHitParticles() {
      const centerX = this.virtualWidth / 2;
      const centerY = this.virtualHeight * 0.75;
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 150;
        this.particles.push({
          x: centerX + (this.playerCurrentLaneX - 1) * (this.virtualWidth * 0.25),
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#f43f5e',
          size: 5 + Math.random() * 5,
          alpha: 1,
          life: 0.5
        });
      }
    }

    createLaneSwitchParticles(dir) {
      const startX = this.virtualWidth / 2 + (this.playerCurrentLaneX - 1) * (this.virtualWidth * 0.25);
      const startY = this.virtualHeight * 0.82;
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: startX,
          y: startY,
          vx: -dir * (40 + Math.random() * 60),
          vy: -20 - Math.random() * 30,
          color: 'rgba(255, 255, 255, 0.6)',
          size: 3 + Math.random() * 4,
          alpha: 0.8,
          life: 0.35
        });
      }
    }

    addFloatingText(text, color = '#ffffff') {
      const x = this.virtualWidth / 2 + (this.playerCurrentLaneX - 1) * (this.virtualWidth * 0.25);
      const y = this.virtualHeight * 0.65;
      this.floatingTexts.push({
        text,
        color,
        x,
        y,
        alpha: 1,
        life: 0.9,
        scale: 1.3
      });
    }

    // ========================================================================
    // MAIN GAME LOOP & 2.5D CANVAS RENDERING
    // ========================================================================
    gameLoop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
      this.runFrame += dt * 12;

      // Smooth Lane Interpolation (Lerp)
      const targetLaneX = this.playerLane;
      this.playerCurrentLaneX += (targetLaneX - this.playerCurrentLaneX) * Math.min(1, dt * 14);

      // Jump / Stumble Animation Logic
      if (this.isJumping) {
        this.playerJumpY -= dt * 60;
        if (this.playerJumpY <= 0) {
          this.playerJumpY = 0;
          this.isJumping = false;
        }
      }

      if (this.stumbleTimer > 0) {
        this.stumbleTimer -= dt;
      }

      if (this.state === 'PLAYING') {
        // Advance Camera & Gates
        this.cameraZ += this.speed * dt;
        this.gateZ -= this.speed * dt;

        // Check Gate Proximity & Collision
        if (this.gateZ <= 50 && !this.gatePassed) {
          this.handleGateCollision();
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt / p.life;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= dt * 45;
        ft.alpha -= dt / ft.life;
        if (ft.alpha <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    render() {
      const w = this.virtualWidth;
      const h = this.virtualHeight;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, w, h);

      // 1. Render Sky & Distant Mountains
      this.renderEnvironment(w, h);

      // 2. Render 3D Perspective Road
      this.renderRoad(w, h);

      // 3. Render Approaching Answer Gates
      this.renderGates(w, h);

      // 4. Render Runner Character
      this.renderCharacter(w, h);

      // 5. Render Particles & Floating Texts
      this.renderFX(w, h);
    }

    renderEnvironment(w, h) {
      const ctx = this.ctx;
      const horizonY = h * this.horizonRatio;

      // Realistic Sunset / Dusk Atmosphere with volumetric gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#040714');
      skyGrad.addColorStop(0.35, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e1b4b');
      skyGrad.addColorStop(0.9, '#431407');
      skyGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Realistic Golden Sun / Halo with Lens Flare
      ctx.save();
      const sunX = w * 0.5;
      const sunY = horizonY * 0.9;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 130);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.2, '#fde047');
      sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Distant Realistic Cityscape Silhouette with Illuminated Windows
      ctx.save();
      ctx.fillStyle = '#090d16';
      const buildingWidths = [45, 30, 55, 40, 70, 35, 60, 48, 65, 38, 52, 44, 58, 36, 62, 50, 42, 68, 34, 54, 46, 60];
      let curBx = 0;
      let bIdx = 0;
      while (curBx < w) {
        const bw = buildingWidths[bIdx % buildingWidths.length];
        const bh = 30 + ((bIdx * 17) % 55);
        ctx.fillRect(curBx, horizonY - bh, bw, bh);
        
        // Window lights
        ctx.fillStyle = (bIdx % 3 === 0) ? 'rgba(253, 224, 71, 0.6)' : 'rgba(56, 189, 248, 0.5)';
        for (let wy = horizonY - bh + 6; wy < horizonY - 4; wy += 9) {
          for (let wx = curBx + 5; wx < curBx + bw - 5; wx += 8) {
            if ((wx + wy) % 5 === 0) {
              ctx.fillRect(wx, wy, 3.5, 4.5);
            }
          }
        }
        ctx.fillStyle = '#090d16';
        curBx += bw + 3;
        bIdx++;
      }
      ctx.restore();

      // Side Grassland / Mountain Verge
      const vergeGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      vergeGrad.addColorStop(0, '#064e3b');
      vergeGrad.addColorStop(0.4, '#022c22');
      vergeGrad.addColorStop(1, '#011711');
      ctx.fillStyle = vergeGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);
    }

    renderRoad(w, h) {
      const ctx = this.ctx;
      const horizonY = h * this.horizonRatio;
      const roadTopWidth = w * 0.16;
      const roadBottomWidth = w * 0.88;
      const roadCenterX = w * 0.5;

      // Draw Main Asphalt Surface with Realistic Gradient
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      roadGrad.addColorStop(0, '#1e293b');
      roadGrad.addColorStop(0.5, '#0f172a');
      roadGrad.addColorStop(1, '#020617');
      ctx.fillStyle = roadGrad;
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, h);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, h);
      ctx.closePath();
      ctx.fill();

      // Banked Red & White Rumble Curbs (Realistic Apex Curbs)
      const curbSegments = 20;
      const curbScroll = (this.cameraZ % 80) / 80;
      for (let i = 0; i < curbSegments; i++) {
        const p1 = Math.pow((i + curbScroll) / curbSegments, 2.2);
        const p2 = Math.pow(Math.min(1, (i + 1 + curbScroll) / curbSegments), 2.2);

        const y1 = horizonY + p1 * (h - horizonY);
        const y2 = horizonY + p2 * (h - horizonY);

        const w1 = roadTopWidth + p1 * (roadBottomWidth - roadTopWidth);
        const w2 = roadTopWidth + p2 * (roadBottomWidth - roadTopWidth);

        const curbW1 = Math.max(2, 18 * p1);
        const curbW2 = Math.max(2, 18 * p2);

        const isRed = (i + Math.floor(this.cameraZ / 40)) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';

        // Left Curb
        ctx.beginPath();
        ctx.moveTo(roadCenterX - w1 / 2, y1);
        ctx.lineTo(roadCenterX - w2 / 2, y2);
        ctx.lineTo(roadCenterX - w2 / 2 - curbW2, y2);
        ctx.lineTo(roadCenterX - w1 / 2 - curbW1, y1);
        ctx.closePath();
        ctx.fill();

        // Right Curb
        ctx.beginPath();
        ctx.moveTo(roadCenterX + w1 / 2, y1);
        ctx.lineTo(roadCenterX + w2 / 2, y2);
        ctx.lineTo(roadCenterX + w2 / 2 + curbW2, y2);
        ctx.lineTo(roadCenterX + w1 / 2 + curbW1, y1);
        ctx.closePath();
        ctx.fill();
      }

      // Neon Guardrail Glow
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX - roadBottomWidth / 2, h);
      ctx.moveTo(roadCenterX + roadTopWidth / 2, horizonY);
      ctx.lineTo(roadCenterX + roadBottomWidth / 2, h);
      ctx.stroke();
      ctx.restore();

      // Realistic Yellow Dashed Center Lane Dividers (3 Lanes -> 2 Dividers)
      const lines = 18;
      const segmentScroll = (this.cameraZ % 100) / 100;
      for (let laneDiv = 1; laneDiv <= 2; laneDiv++) {
        const laneOffsetRatio = (laneDiv / 3) - 0.5; // -0.166, +0.166
        for (let i = 0; i < lines; i++) {
          if (i % 2 === 0) continue; // Dashed look
          const p = (i + segmentScroll) / lines;
          const pNext = Math.min(1, p + 0.045);

          const y1 = horizonY + Math.pow(p, 2.2) * (h - horizonY);
          const y2 = horizonY + Math.pow(pNext, 2.2) * (h - horizonY);

          const curWidth1 = roadTopWidth + Math.pow(p, 2.2) * (roadBottomWidth - roadTopWidth);
          const curWidth2 = roadTopWidth + Math.pow(pNext, 2.2) * (roadBottomWidth - roadTopWidth);

          const x1 = roadCenterX + laneOffsetRatio * curWidth1;
          const x2 = roadCenterX + laneOffsetRatio * curWidth2;

          ctx.save();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = Math.max(1.5, 4 * p);
          ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
          ctx.shadowBlur = 4 * p;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Render Side Scenery (Trees / Pillars)
      this.renderScenery(w, h, horizonY, roadTopWidth, roadBottomWidth, roadCenterX);
    }

    renderScenery(w, h, horizonY, topW, botW, centerX) {
      const ctx = this.ctx;
      this.sceneryProps.forEach(prop => {
        let relZ = (prop.z - (this.cameraZ % 8000) + 8000) % 8000;
        if (relZ < 50 || relZ > 3000) return;

        const p = Math.pow(Math.max(0, 1 - relZ / 3000), 2.5);
        const y = horizonY + p * (h - horizonY);
        const roadW = topW + p * (botW - topW);
        const x = centerX + prop.side * (roadW * 0.65 + prop.distance * 80 * p);
        const size = (44 + prop.distance * 34) * p;

        if (size < 2) return;

        ctx.save();
        if (prop.type === 0) {
          // Lush Realistic Cyber Palm / Tree
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.arc(x, y - size, size * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(x, y - size * 1.2, size * 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#78350f';
          ctx.fillRect(x - size * 0.1, y - size * 0.5, size * 0.2, size * 0.5);
        } else {
          // Glowing Neon Energy Tower
          ctx.fillStyle = `hsl(${prop.hue}, 90%, 65%)`;
          ctx.shadowColor = `hsl(${prop.hue}, 90%, 65%)`;
          ctx.shadowBlur = 10 * p;
          ctx.beginPath();
          ctx.moveTo(x, y - size * 1.5);
          ctx.lineTo(x + size * 0.45, y - size * 0.8);
          ctx.lineTo(x, y - size * 0.2);
          ctx.lineTo(x - size * 0.45, y - size * 0.8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
    }

    renderGates(w, h) {
      if (this.gateZ < 20 || this.gateZ > 1400 || !this.gates.length) return;

      const ctx = this.ctx;
      const horizonY = h * this.horizonRatio;
      const roadTopWidth = w * 0.16;
      const roadBottomWidth = w * 0.88;
      const roadCenterX = w * 0.5;

      // Perspective Scale calculation
      const p = Math.pow(Math.max(0, 1 - (this.gateZ / 1400)), 2.3);
      const y = horizonY + p * (h - horizonY);
      const currentRoadWidth = roadTopWidth + p * (roadBottomWidth - roadTopWidth);
      const laneWidth = currentRoadWidth / 3;

      // Overhead Truss Arch connecting all lanes
      const archY = y - laneWidth * 0.85;
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(2, 6 * p);
      ctx.beginPath();
      ctx.moveTo(roadCenterX - currentRoadWidth * 0.55, y);
      ctx.lineTo(roadCenterX - currentRoadWidth * 0.55, archY);
      ctx.lineTo(roadCenterX + currentRoadWidth * 0.55, archY);
      ctx.lineTo(roadCenterX + currentRoadWidth * 0.55, y);
      ctx.stroke();
      ctx.restore();

      this.gates.forEach((gate) => {
        const laneOffset = (gate.lane - 1); // -1, 0, 1
        const x = roadCenterX + laneOffset * laneWidth;
        const gateWidth = laneWidth * 0.86;
        const gateHeight = gateWidth * 0.88;
        const gateY = y - gateHeight * 0.6;

        if (gateWidth < 10) return;

        ctx.save();

        // Realistic Glassmorphic Neon Billboard Panel
        const grad = ctx.createLinearGradient(x - gateWidth / 2, gateY, x + gateWidth / 2, gateY + gateHeight);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.94)');
        grad.addColorStop(0.5, 'rgba(30, 41, 59, 0.96)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');

        ctx.fillStyle = grad;
        ctx.strokeStyle = gate.color;
        ctx.lineWidth = Math.max(2, 5 * p);
        ctx.shadowColor = gate.color;
        ctx.shadowBlur = 18 * p;

        const radius = Math.max(6, 16 * p);
        ctx.beginPath();
        ctx.roundRect(x - gateWidth / 2, gateY, gateWidth, gateHeight, radius);
        ctx.fill();
        ctx.stroke();

        // Top Glowing LED Indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, gateY + 8 * p, Math.max(2, 4.5 * p), 0, Math.PI * 2);
        ctx.fill();

        // Bold Crisp Number Typography
        ctx.shadowBlur = 8 * p;
        ctx.fillStyle = '#ffffff';
        const fontSize = Math.max(14, Math.floor(32 * p + 8));
        ctx.font = `900 ${fontSize}px "Outfit", "Fredoka", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gate.value, x, gateY + gateHeight * 0.55);

        ctx.restore();
      });
    }

    renderCharacter(w, h) {
      const ctx = this.ctx;
      const horizonY = h * this.horizonRatio;
      const roadTopWidth = w * 0.16;
      const roadBottomWidth = w * 0.88;
      const roadCenterX = w * 0.5;

      const p = 0.86;
      const baseY = horizonY + p * (h - horizonY);
      const currentRoadWidth = roadTopWidth + p * (roadBottomWidth - roadTopWidth);
      const laneWidth = currentRoadWidth / 3;

      const charX = roadCenterX + (this.playerCurrentLaneX - 1) * laneWidth;
      const jumpOffset = this.playerJumpY;
      const charY = baseY - jumpOffset;

      const tilt = (this.playerLane - this.playerCurrentLaneX) * 0.14; // Dynamic body lean into turns

      ctx.save();
      ctx.translate(charX, charY);
      ctx.rotate(tilt);

      // Stumble Shake when hitting wrong gate
      if (this.stumbleTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6);
      }

      // 1. Soft Ground Drop Shadow
      ctx.fillStyle = 'rgba(21, 34, 52, 0.45)';
      ctx.beginPath();
      const shadowW = Math.max(12, 34 - jumpOffset * 0.25);
      ctx.ellipse(0, 18 + jumpOffset * 0.15, shadowW, shadowW * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Running Animation Parameters
      const runCycle = this.state === 'PLAYING' ? this.runFrame : 0;
      const legSwing = Math.sin(runCycle);
      const armSwing = Math.cos(runCycle);
      const bounce = this.isJumping ? -14 : -Math.abs(Math.sin(runCycle)) * 6;
      const bodyY = bounce - 10;

      // Color Palette for Human Kid Runner
      const skinColor = '#fbcfe8';       // Fair skin
      const skinShadow = '#f472b6';
      const hairColor = '#78350f';       // Brown hair
      const capColor = '#ef4444';        // Red backwards cap
      const capBrim = '#dc2626';
      const shirtColor = '#2563eb';      // Blue runner jersey
      const shirtTrim = '#f59e0b';       // Gold trim
      const shortsColor = '#1e293b';     // Navy running shorts
      const shoeColor = '#e11d48';       // Red sneakers
      const shoeSole = '#ffffff';        // White chunky sole
      const outlineColor = '#152234';    // Dark navy outline

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // ======================================================================
      // 2. LEGS & SNEAKERS (Animated running stride)
      // ======================================================================
      const legLength = 22;
      
      // LEFT LEG & SHOE
      const leftLegAngle = this.isJumping ? -0.4 : legSwing * 0.7;
      const leftFootLift = this.isJumping ? -10 : Math.max(0, -legSwing * 14);
      const leftKneeX = -10 + leftLegAngle * 8;
      const leftKneeY = bodyY + 22;
      const leftFootX = -12 + leftLegAngle * 14;
      const leftFootY = bodyY + 34 - leftFootLift;

      // Left Leg
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-8, bodyY + 16);
      ctx.lineTo(leftKneeX, leftKneeY);
      ctx.lineTo(leftFootX, leftFootY);
      ctx.stroke();

      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, bodyY + 16);
      ctx.lineTo(leftKneeX, leftKneeY);
      ctx.lineTo(leftFootX, leftFootY);
      ctx.stroke();

      // Left Sneaker
      ctx.fillStyle = shoeColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(leftFootX - 7, leftFootY - 4, 14, 10, [4, 4, 2, 2]);
      ctx.fill();
      ctx.stroke();

      // Left Sneaker Sole
      ctx.fillStyle = shoeSole;
      ctx.fillRect(leftFootX - 8, leftFootY + 4, 16, 4);
      ctx.strokeRect(leftFootX - 8, leftFootY + 4, 16, 4);

      // RIGHT LEG & SHOE
      const rightLegAngle = this.isJumping ? 0.4 : -legSwing * 0.7;
      const rightFootLift = this.isJumping ? -10 : Math.max(0, legSwing * 14);
      const rightKneeX = 10 + rightLegAngle * 8;
      const rightKneeY = bodyY + 22;
      const rightFootX = 12 + rightLegAngle * 14;
      const rightFootY = bodyY + 34 - rightFootLift;

      // Right Leg
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(8, bodyY + 16);
      ctx.lineTo(rightKneeX, rightKneeY);
      ctx.lineTo(rightFootX, rightFootY);
      ctx.stroke();

      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(8, bodyY + 16);
      ctx.lineTo(rightKneeX, rightKneeY);
      ctx.lineTo(rightFootX, rightFootY);
      ctx.stroke();

      // Right Sneaker
      ctx.fillStyle = shoeColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(rightFootX - 7, rightFootY - 4, 14, 10, [4, 4, 2, 2]);
      ctx.fill();
      ctx.stroke();

      // Right Sneaker Sole
      ctx.fillStyle = shoeSole;
      ctx.fillRect(rightFootX - 8, rightFootY + 4, 16, 4);
      ctx.strokeRect(rightFootX - 8, rightFootY + 4, 16, 4);

      // Running Shorts
      ctx.fillStyle = shortsColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-15, bodyY + 10, 30, 12, 4);
      ctx.fill();
      ctx.stroke();

      // ======================================================================
      // 3. ARMS (Swinging in opposition to legs)
      // ======================================================================
      // LEFT ARM
      const leftArmAngle = this.isJumping ? -1.2 : -armSwing * 0.6;
      const leftHandX = -18 + leftArmAngle * 12;
      const leftHandY = bodyY + 6 - leftArmAngle * 10;

      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-12, bodyY - 4);
      ctx.lineTo(-16, bodyY + 2);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.stroke();

      ctx.strokeStyle = shirtColor;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-12, bodyY - 4);
      ctx.lineTo(-16, bodyY + 2);
      ctx.stroke();

      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-16, bodyY + 2);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.stroke();

      // Left Hand Fist
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // RIGHT ARM
      const rightArmAngle = this.isJumping ? 1.2 : armSwing * 0.6;
      const rightHandX = 18 + rightArmAngle * 12;
      const rightHandY = bodyY + 6 + rightArmAngle * 10;

      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(12, bodyY - 4);
      ctx.lineTo(16, bodyY + 2);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();

      ctx.strokeStyle = shirtColor;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(12, bodyY - 4);
      ctx.lineTo(16, bodyY + 2);
      ctx.stroke();

      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(16, bodyY + 2);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();

      // Right Hand Fist
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rightHandX, rightHandY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // ======================================================================
      // 4. TORSO & EXPLORER BACKPACK
      // ======================================================================
      // Runner Jersey Body
      ctx.fillStyle = shirtColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-14, bodyY - 10, 28, 22, 6);
      ctx.fill();
      ctx.stroke();

      // Yellow Explorer Backpack on Back
      ctx.fillStyle = shirtTrim;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-10, bodyY - 8, 20, 16, 5);
      ctx.fill();
      ctx.stroke();

      // Backpack Zip Pocket
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-7, bodyY - 4, 14, 8);
      ctx.strokeRect(-7, bodyY - 4, 14, 8);

      // Star / Number 3 badge on backpack
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, bodyY);

      // ======================================================================
      // 5. HEAD & BACKWARDS RUNNER CAP
      // ======================================================================
      const headY = bodyY - 22;

      // Ears
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-13, headY + 2, 3.5, 0, Math.PI * 2);
      ctx.arc(13, headY + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head Base (Hair visible at nape of neck)
      ctx.fillStyle = hairColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Red Backwards Cap
      ctx.fillStyle = capColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headY - 2, 12.5, Math.PI * 0.9, Math.PI * 2.1, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cap Back Strap / Hole
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, headY + 5, 4, Math.PI, Math.PI * 2);
      ctx.fill();

      // Cap Curved Backwards Brim
      ctx.fillStyle = capBrim;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, headY + 6, 11, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    renderFX(w, h) {
      const ctx = this.ctx;

      // Particles
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Numbers / Emojis
      this.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = '900 24px "Outfit", "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });
    }
  }

  // ==========================================================================
  // INITIALIZE ON DOM CONTENT LOADED
  // ==========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    window.mathRunnerGame = new MathRunnerGame();
  });
})();
