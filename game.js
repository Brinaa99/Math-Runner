/**
 * GAME 4: MATH RUNNER — 3-LANE ATHLETIC SPRINT ENGINE
 * Standard 3 Mathematics: Addition, Subtraction & Operations up to 1,000
 * Retro Arcade + Modern Cartoon Visual Style (100% Emoji Free)
 * StuCent Sandboxed Runtime Compatible
 */

(() => {
  'use strict';

  const doc = typeof root !== 'undefined' ? root : document;
  const gameCtx = typeof game !== 'undefined' ? game : (window.game || null);

  // ==========================================================================
  // 1. ARCADE SOUND & ATHLETIC PROCEDURAL BGM SYNTHESIZER
  // ==========================================================================
  let audioCtx = null;
  let isMuted = localStorage.getItem('math_games_sound') === 'false';
  let bgmMasterGain = null;
  let bgmInterval = null;
  let bgmStep = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        bgmMasterGain = audioCtx.createGain();
        bgmMasterGain.gain.setValueAtTime(isMuted ? 0 : 0.045, audioCtx.currentTime);
        bgmMasterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startRunnerBGM() {
    initAudio();
    if (!audioCtx || bgmInterval) return;

    // Upbeat Athletic Funk / Chiptune (128 BPM) in D Dorian
    const bassline = [
      146.83, 0, 146.83, 174.61,  220.00, 0, 146.83, 0,
      196.00, 0, 196.00, 246.94,  220.00, 0, 174.61, 0,
      146.83, 0, 146.83, 174.61,  246.94, 0, 220.00, 0,
      164.81, 0, 174.61, 0,       196.00, 0, 293.66, 0
    ];

    const leadNotes = [
      587.33, 739.99, 880.00, 1174.66, 880.00, 739.99, 587.33, 739.99,
      783.99, 987.77, 1174.66, 987.77, 880.00, 739.99, 659.25, 587.33,
      587.33, 739.99, 880.00, 1174.66, 987.77, 880.00, 739.99, 880.00,
      659.25, 739.99, 880.00, 987.77,  1174.66, 1318.51, 1174.66, 880.00
    ];

    const stepDuration = (60 / 128) / 4;
    bgmStep = 0;

    bgmInterval = setInterval(() => {
      if (isMuted || !audioCtx || !isPlaying || isGameOver) return;
      const t = audioCtx.currentTime;
      const idx = bgmStep % 32;

      // Bass note
      const bFreq = bassline[idx];
      if (bFreq > 0) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(bFreq, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.6);
          osc.connect(gain);
          gain.connect(bgmMasterGain);
          osc.start(t);
          osc.stop(t + stepDuration * 1.7);
        } catch (e) {}
      }

      // Melody tick
      if (idx % 2 === 0) {
        const lFreq = leadNotes[idx];
        if (lFreq > 0) {
          try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(lFreq, t);
            gain.gain.setValueAtTime(0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.3);
            osc.connect(gain);
            gain.connect(bgmMasterGain);
            osc.start(t);
            osc.stop(t + stepDuration * 1.4);
          } catch (e) {}
        }
      }

      bgmStep++;
    }, stepDuration * 1000);
  }

  function stopRunnerBGM() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  function beep(freq, durationMs, type = 'sine', vol = 0.15, delaySec = 0) {
    if (isMuted) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const t = audioCtx.currentTime + delaySec;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + durationMs / 1000);
    } catch (e) {}
  }

  function playCollectSound(comboMult = 1) {
    const base = 520 + comboMult * 50;
    beep(base, 70, 'sine', 0.22);
    beep(base * 1.33, 90, 'sine', 0.18, 0.04);
  }

  function playJumpSound() {
    beep(380, 80, 'triangle', 0.18);
    beep(580, 110, 'sine', 0.14, 0.03);
  }

  function playHurdleHitSound() {
    beep(160, 280, 'sawtooth', 0.3);
    beep(110, 280, 'square', 0.24, 0.06);
    triggerScreenShake(10, 14);
  }

  function playCorrectFanfare() {
    [523.25, 659.25, 783.99, 1046.50, 1318.5].forEach((f, i) => {
      beep(f, 180, 'sine', 0.18, i * 0.07);
    });
  }

  function playWrongBuzz() {
    beep(180, 240, 'sawtooth', 0.28);
    beep(130, 260, 'square', 0.22, 0.05);
    triggerScreenShake(8, 12);
  }

  let screenShakeIntensity = 0;

  function triggerScreenShake(intensity = 10, frames = 15) {
    screenShakeIntensity = intensity;
  }

  // ==========================================================================
  // 2. 10 EDITABLE MATHEMATICS CHALLENGES (STANDARD 3 CURRICULUM)
  // ==========================================================================
  const MATH_CHALLENGES = [
    {
      id: 1,
      badge: 'STAGE 01 • ADDITION',
      question: '320 + 150 = ?',
      answer: 470,
      options: [470, 370, 450],
      tip: 'Add hundreds first (300+100=400), then tens (20+50=70) = 470.',
      explain: '320 + 150: 300+100=400 and 20+50=70, total is 470.'
    },
    {
      id: 2,
      badge: 'STAGE 02 • SUBTRACTION',
      question: '580 - 240 = ?',
      answer: 340,
      options: [320, 340, 440],
      tip: 'Subtract hundreds (500-200=300), then tens (80-40=40) = 340.',
      explain: '580 - 240: 500-200=300 and 80-40=40, result is 340.'
    },
    {
      id: 3,
      badge: 'STAGE 03 • ADDITION',
      question: '415 + 230 = ?',
      answer: 645,
      options: [635, 655, 645],
      tip: '400+200=600 and 15+30=45 -> 645.',
      explain: '415 + 230: 400+200=600, 15+30=45, total is 645.'
    },
    {
      id: 4,
      badge: 'STAGE 04 • SUBTRACTION',
      question: '760 - 320 = ?',
      answer: 440,
      options: [440, 540, 420],
      tip: '700 - 300 = 400, 60 - 20 = 40 -> 440.',
      explain: '760 - 320: 700-300=400, 60-20=40, result is 440.'
    },
    {
      id: 5,
      badge: 'STAGE 05 • REGROUPING ADDITION',
      question: '248 + 316 = ?',
      answer: 564,
      options: [554, 564, 574],
      tip: '248 + 300 = 548; 548 + 16 = 564.',
      explain: '248 + 316: 200+300=500, 48+16=64, total is 564.'
    },
    {
      id: 6,
      badge: 'STAGE 06 • REGROUPING SUBTRACTION',
      question: '650 - 275 = ?',
      answer: 375,
      options: [475, 385, 375],
      tip: '650 - 200 = 450; 450 - 75 = 375.',
      explain: '650 - 275: 650 - 250 = 400, 400 - 25 = 375.'
    },
    {
      id: 7,
      badge: 'STAGE 07 • MULTIPLICATION',
      question: '45 × 4 = ?',
      answer: 180,
      options: [160, 180, 200],
      tip: '40 × 4 = 160; 5 × 4 = 20 -> 160 + 20 = 180.',
      explain: '45 × 4 = (40 × 4) + (5 × 4) = 160 + 20 = 180.'
    },
    {
      id: 8,
      badge: 'STAGE 08 • SUBTRACTION',
      question: '830 - 450 = ?',
      answer: 380,
      options: [480, 380, 390],
      tip: '830 - 400 = 430; 430 - 50 = 380.',
      explain: '830 - 450: 830 - 430 = 400, 400 - 20 = 380.'
    },
    {
      id: 9,
      badge: 'STAGE 09 • MULTIPLICATION',
      question: '125 × 3 = ?',
      answer: 375,
      options: [325, 375, 395],
      tip: '100 × 3 = 300; 25 × 3 = 75 -> 375.',
      explain: '125 × 3 = (100 × 3) + (25 × 3) = 300 + 75 = 375.'
    },
    {
      id: 10,
      badge: 'STAGE 10 • GRAND FINALE',
      question: '1000 - 365 = ?',
      answer: 635,
      options: [735, 645, 635],
      tip: '1000 - 300 = 700; 700 - 65 = 635.',
      explain: '1000 - 365: 1000 - 300 = 700, 700 - 65 = 635.'
    }
  ];

  // ==========================================================================
  // 3. GAME STATE & RUNNER VARIABLES
  // ==========================================================================
  let currentStageIdx = 0;
  let score = 0;
  let lives = 3;
  let combo = 1;
  let bestCombo = 1;
  let totalStagesCleared = 0;
  let totalAttempts = 0;
  let timeRemaining = 90;
  let gameTimerInterval = null;
  let gameStartTime = 0;
  let isPlaying = false;
  let isGameOver = false;

  let currentLane = 1; // 0: Left, 1: Center, 2: Right
  let targetRunnerX = 400;

  const runner = {
    x: 400,
    y: 440,
    width: 44,
    height: 64,
    isJumping: false,
    jumpY: 0,
    jumpVy: 0,
    stumbleTimer: 0,
    runAnimFrame: 0
  };

  // Active Gate Row: approaching 3-lane choice tokens
  let activeGate = null;
  let obstacles = [];
  let particles = [];
  let floatingTexts = [];
  let trackScrollOffset = 0;

  const canvas = doc.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;

  // ==========================================================================
  // 4. SCREEN & HUD MANAGEMENT
  // ==========================================================================
  function setScreen(screenId) {
    const screens = ['start-screen', 'countdown-screen', 'instructions-modal', 'game-over-screen'];
    screens.forEach(id => {
      const el = doc.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });
  }

  function updateHUD() {
    const scoreEl = doc.getElementById('score-display');
    const timerEl = doc.getElementById('timer-display');
    const roundEl = doc.getElementById('round-display');
    const comboEl = doc.getElementById('combo-display');

    if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
    if (timerEl) timerEl.textContent = String(Math.max(0, timeRemaining)).padStart(3, '0');
    if (roundEl) roundEl.textContent = `${String(currentStageIdx + 1).padStart(2, '0')} / 10`;
    if (comboEl) comboEl.textContent = `${combo}x`;

    const heartsContainer = doc.getElementById('lives-container');
    if (heartsContainer) {
      let heartsHtml = '';
      for (let i = 0; i < 3; i++) {
        const isFull = i < lives;
        heartsHtml += `<span class="arcade-heart ${isFull ? 'heart-full' : 'heart-empty'}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
      }
      heartsContainer.innerHTML = heartsHtml;
    }
  }

  function updateBillboard() {
    const challenge = MATH_CHALLENGES[currentStageIdx];
    if (!challenge) return;

    const badgeEl = doc.getElementById('question-badge');
    const promptEl = doc.getElementById('question-prompt');
    const tipEl = doc.getElementById('question-tip');

    if (badgeEl) badgeEl.textContent = challenge.badge;
    if (promptEl) promptEl.textContent = challenge.question;
    if (tipEl) tipEl.textContent = challenge.tip;

    updateHUD();
  }

  function showHint(text) {
    const hintBanner = doc.getElementById('hint-banner');
    const hintText = doc.getElementById('hint-text');
    if (hintBanner && hintText) {
      hintText.textContent = text;
      hintBanner.classList.remove('hidden');
      setTimeout(() => {
        hintBanner.classList.add('hidden');
      }, 4200);
    }
  }

  // ==========================================================================
  // 5. RUNNER TRACK LANE COORDINATES & MOVEMENT
  // ==========================================================================
  function getLaneCenterX(laneIdx) {
    const roadLeft = canvas.width * 0.18;
    const roadWidth = canvas.width * 0.64;
    const laneWidth = roadWidth / 3;
    return roadLeft + laneWidth * (laneIdx + 0.5);
  }

  function switchLane(laneIdx) {
    if (!isPlaying || isGameOver) return;
    currentLane = Math.max(0, Math.min(2, laneIdx));
    targetRunnerX = getLaneCenterX(currentLane);
    beep(450, 40, 'triangle', 0.08);

    for (let i = 0; i < 4; i++) {
      particles.push({
        x: runner.x + (Math.random() - 0.5) * 16,
        y: runner.y + 16,
        vx: (Math.random() - 0.5) * 2,
        vy: -0.5 - Math.random() * 1.5,
        radius: 4 + Math.random() * 4,
        color: '#e2e8f0',
        alpha: 0.7,
        life: 25
      });
    }
  }

  function jump() {
    if (!isPlaying || isGameOver || runner.isJumping) return;
    runner.isJumping = true;
    runner.jumpVy = -13.5;
    playJumpSound();

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: runner.x + (Math.random() - 0.5) * 24,
        y: runner.y + 18,
        vx: (Math.random() - 0.5) * 3,
        vy: -0.8 - Math.random() * 2,
        radius: 5 + Math.random() * 5,
        color: '#cbd5e1',
        alpha: 0.8,
        life: 28
      });
    }
  }

  // ==========================================================================
  // 6. SPAWNING GATES & HURDLES
  // ==========================================================================
  function spawnGate() {
    const challenge = MATH_CHALLENGES[currentStageIdx];
    if (!challenge) return;

    // Shuffle options across the 3 lanes
    const shuffled = [...challenge.options].sort(() => Math.random() - 0.5);

    activeGate = {
      y: -60,
      passed: false,
      options: shuffled.map((val, idx) => ({
        lane: idx,
        value: val,
        isCorrect: val === challenge.answer
      }))
    };
  }

  function spawnObstacle() {
    // Only spawn hurdle in 1 lane if no gate is right at the horizon
    if (activeGate && activeGate.y < 160) return;

    const lane = Math.floor(Math.random() * 3);
    obstacles.push({
      y: -40,
      lane: lane,
      hit: false
    });
  }

  // ==========================================================================
  // 7. RENDER & UPDATE LOOP
  // ==========================================================================
  function update() {
    if (!isPlaying || isGameOver) return;

    // Smooth lane steering
    const dx = targetRunnerX - runner.x;
    runner.x += dx * 0.25;
    runner.y = canvas.height - 110;

    // Jump physics
    if (runner.isJumping) {
      runner.jumpY += runner.jumpVy;
      runner.jumpVy += 0.82;
      if (runner.jumpY >= 0) {
        runner.jumpY = 0;
        runner.isJumping = false;
        runner.jumpVy = 0;
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: runner.x + (Math.random() - 0.5) * 20,
            y: runner.y + 18,
            vx: (Math.random() - 0.5) * 2.5,
            vy: -0.5 - Math.random() * 1.5,
            radius: 4 + Math.random() * 4,
            color: '#cbd5e1',
            alpha: 0.7,
            life: 22
          });
        }
      }
    }

    if (runner.stumbleTimer > 0) runner.stumbleTimer--;
    runner.runAnimFrame = (runner.runAnimFrame + 0.28) % 4;

    if (screenShakeIntensity > 0.1) {
      screenShakeIntensity *= 0.88;
    } else {
      screenShakeIntensity = 0;
    }

    // Scroll speed tuned for comfortable reading (~4.8s travel time)
    const scrollSpeed = 3.6;
    trackScrollOffset = (trackScrollOffset + scrollSpeed) % 60;

    // Gate update
    if (!activeGate) {
      spawnGate();
    } else {
      activeGate.y += scrollSpeed;

      // Check collision when gate reaches player y
      if (!activeGate.passed && activeGate.y >= runner.y - 20) {
        activeGate.passed = true;
        totalAttempts++;

        const chosenOption = activeGate.options.find(opt => opt.lane === currentLane);
        const challenge = MATH_CHALLENGES[currentStageIdx];

        if (chosenOption && chosenOption.isCorrect) {
          // CORRECT ANSWER
          totalStagesCleared++;
          playCollectSound(combo);
          playCorrectFanfare();

          const pts = 100 * combo;
          score += pts;
          combo = Math.min(8, combo + 1);
          if (combo > bestCombo) bestCombo = combo;

          floatingTexts.push({
            x: runner.x,
            y: runner.y - 30,
            text: `CORRECT! +${pts} PTS!`,
            color: '#10b981',
            alpha: 1,
            life: 55
          });

          // Celebration particles
          for (let p = 0; p < 20; p++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            particles.push({
              x: runner.x,
              y: runner.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              radius: 4 + Math.random() * 5,
              color: ['#f59e0b', '#fbbf24', '#38bdf8', '#10b981', '#ffffff'][Math.floor(Math.random() * 5)],
              alpha: 1,
              life: 35
            });
          }

          if (currentStageIdx + 1 < MATH_CHALLENGES.length) {
            currentStageIdx++;
            activeGate = null;
            obstacles = [];
            updateBillboard();
          } else {
            endGame(true);
          }
        } else {
          // WRONG ANSWER
          playWrongBuzz();
          lives--;
          combo = 1;
          runner.stumbleTimer = 35;

          const chosenVal = chosenOption ? chosenOption.value : '?';
          floatingTexts.push({
            x: runner.x,
            y: runner.y - 30,
            text: `WRONG (${chosenVal})! -1 LIFE`,
            color: '#ef4444',
            alpha: 1,
            life: 55
          });

          showHint(challenge.explain);
          updateHUD();

          if (lives <= 0) {
            endGame(false);
          } else {
            // Respawn same gate after a short gap
            activeGate = null;
            setTimeout(() => {
              if (isPlaying && !isGameOver && !activeGate) {
                spawnGate();
              }
            }, 800);
          }
        }
      }

      if (activeGate && activeGate.y > canvas.height + 60) {
        activeGate = null;
      }
    }

    // Spawn Hurdles between gates
    if (Math.random() < 0.015 && obstacles.length < 2 && (!activeGate || activeGate.y > 220 || activeGate.y < -30)) {
      spawnObstacle();
    }

    // Update Hurdles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += scrollSpeed;

      const obsX = getLaneCenterX(obs.lane);

      // Hit obstacle if in same lane, close in Y, and NOT jumped
      if (!obs.hit && obs.lane === currentLane && Math.abs(runner.y - obs.y) < 24) {
        if (runner.jumpY > -20) {
          obs.hit = true;
          playHurdleHitSound();
          lives--;
          combo = 1;
          runner.stumbleTimer = 30;

          floatingTexts.push({
            x: obsX,
            y: obs.y - 20,
            text: `HURDLE HIT! -1 LIFE`,
            color: '#ef4444',
            alpha: 1,
            life: 50
          });

          showHint('Press JUMP! or Spacebar to leap over hurdles!');
          updateHUD();

          if (lives <= 0) {
            endGame(false);
          }
        }
      }

      if (obs.y > canvas.height + 40) {
        obstacles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;
      p.life--;
      if (p.life <= 0 || p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 1.2;
      ft.alpha -= 0.02;
      ft.life--;
      if (ft.life <= 0 || ft.alpha <= 0) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (screenShakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * screenShakeIntensity;
      const sy = (Math.random() - 0.5) * screenShakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Midnight Stadium Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#091326');
    skyGrad.addColorStop(0.5, '#0f244a');
    skyGrad.addColorStop(1, '#1b3566');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stadium Stands & Floodlights
    ctx.fillStyle = '#0a1630';
    ctx.fillRect(0, 0, canvas.width * 0.18, canvas.height);
    ctx.fillRect(canvas.width * 0.82, 0, canvas.width * 0.18, canvas.height);

    // Stadium floodlight beams
    ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(canvas.width * 0.4, canvas.height);
    ctx.lineTo(canvas.width * 0.2, canvas.height); ctx.closePath(); ctx.fill();

    const roadLeft = canvas.width * 0.18;
    const roadRight = canvas.width * 0.82;
    const roadWidth = roadRight - roadLeft;
    const laneWidth = roadWidth / 3;

    // Tartan Track Running Surface (Crimson Track)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);

    // Track Texture Stripes
    ctx.fillStyle = '#7f1d1d';
    for (let y = -60 + trackScrollOffset; y < canvas.height; y += 60) {
      ctx.fillRect(roadLeft, y, roadWidth, 20);
    }

    // Neon Track Divider Lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, canvas.height);
    ctx.moveTo(roadLeft + laneWidth, 0); ctx.lineTo(roadLeft + laneWidth, canvas.height);
    ctx.moveTo(roadLeft + laneWidth * 2, 0); ctx.lineTo(roadLeft + laneWidth * 2, canvas.height);
    ctx.moveTo(roadRight, 0); ctx.lineTo(roadRight, canvas.height);
    ctx.stroke();

    // 2. Render Approaching Answer Gate Row
    if (activeGate) {
      activeGate.options.forEach(opt => {
        const laneX = getLaneCenterX(opt.lane);
        ctx.save();
        ctx.translate(laneX, activeGate.y);

        // Gate Token Chassis
        ctx.fillStyle = '#0f1d38';
        ctx.beginPath();
        ctx.roundRect(-46, -24, 92, 48, 10);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner Banner
        ctx.fillStyle = '#1e3a6a';
        ctx.beginPath();
        ctx.roundRect(-40, -18, 80, 36, 6);
        ctx.fill();

        // Answer Digits
        ctx.fillStyle = '#fcd34d';
        ctx.font = "900 22px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(opt.value, 0, 1);

        ctx.restore();
      });
    }

    // 3. Render Hurdles
    obstacles.forEach(obs => {
      const obsX = getLaneCenterX(obs.lane);
      ctx.save();
      ctx.translate(obsX, obs.y);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-32, -14, 64, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-18, -14, 12, 16);
      ctx.fillRect(8, -14, 12, 16);
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-32, -14, 64, 16);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-26, 2, 6, 16);
      ctx.fillRect(20, 2, 6, 16);

      ctx.restore();
    });

    // 4. Render Athletic Runner Character
    ctx.save();
    const wobble = runner.stumbleTimer > 0 ? (Math.random() - 0.5) * 8 : 0;
    ctx.translate(runner.x + wobble, runner.y + runner.jumpY);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 18 - runner.jumpY * 0.35, 24, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();

    const step = Math.sin(runner.runAnimFrame * Math.PI);
    const armSwing = step * 9;
    const legSwing = step * 11;

    // Back arm
    ctx.save();
    ctx.rotate(-0.28 + armSwing * 0.018);
    ctx.strokeStyle = '#f2b88f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-11, -14); ctx.lineTo(-20, 0); ctx.stroke();
    ctx.restore();

    // Legs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(-11 - legSwing * 0.35, 19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 3); ctx.lineTo(11 + legSwing * 0.35, 19); ctx.stroke();
    
    // Sneakers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-11 - legSwing * 0.35, 19); ctx.lineTo(-19 - legSwing * 0.35, 19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11 + legSwing * 0.35, 19); ctx.lineTo(19 + legSwing * 0.35, 19); ctx.stroke();

    // Torso (Sport jersey with #4)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(-14, -25, 28, 31, 8);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.roundRect(-7, -19, 14, 15, 4); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = "900 11px 'Fredoka', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4', 0, -11);

    // Front arm
    ctx.save();
    ctx.rotate(0.22 - armSwing * 0.018);
    ctx.strokeStyle = '#f2b88f';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(11, -14); ctx.lineTo(20, -1); ctx.stroke();
    ctx.restore();

    // Head
    ctx.fillStyle = '#f2b88f';
    ctx.beginPath(); ctx.arc(0, -39, 15, 0, Math.PI * 2); ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(0, -43, 15, Math.PI, Math.PI * 2); ctx.fill();

    // Headband
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-14, -46, 28, 4);

    // Face
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-5, -39, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -39, 1.8, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 5. Render Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 6. Render Floating Texts
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = "900 20px 'Fredoka', cursive, sans-serif";
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }

  function gameLoop() {
    update();
    render();
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // ==========================================================================
  // 8. START & END GAME
  // ==========================================================================
  function startGame() {
    currentStageIdx = 0;
    currentLane = 1;
    score = 0;
    lives = 3;
    combo = 1;
    bestCombo = 1;
    totalStagesCleared = 0;
    totalAttempts = 0;
    timeRemaining = 90;
    activeGate = null;
    obstacles = [];
    particles = [];
    floatingTexts = [];
    isPlaying = true;
    isGameOver = false;
    gameStartTime = Date.now();

    targetRunnerX = getLaneCenterX(currentLane);
    runner.x = targetRunnerX;

    setScreen(null);
    updateBillboard();
    startRunnerBGM();

    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
      if (!isPlaying || isGameOver) return;
      timeRemaining--;
      updateHUD();
      if (timeRemaining <= 0) {
        endGame(totalStagesCleared >= 6);
      }
    }, 1000);

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function startCountdown() {
    initAudio();
    setScreen('countdown-screen');
    let count = 3;
    const numEl = doc.getElementById('countdown-number');
    if (numEl) numEl.textContent = count;
    beep(440, 100, 'sine', 0.15);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        if (numEl) numEl.textContent = count;
        beep(440, 100, 'sine', 0.15);
      } else {
        clearInterval(interval);
        beep(880, 250, 'sine', 0.2);
        startGame();
      }
    }, 750);
  }

  function endGame(isVictory) {
    isPlaying = false;
    isGameOver = true;
    stopRunnerBGM();
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const totalTimeTaken = Math.round((Date.now() - gameStartTime) / 1000);
    const accuracy = totalAttempts > 0 ? Math.round((totalStagesCleared / Math.max(1, totalAttempts)) * 100) : 100;

    let stars = 1;
    if (score >= 600 && lives >= 2) stars = 3;
    else if (score >= 300) stars = 2;

    localStorage.setItem('math_runner_stars', stars);

    if (isVictory) {
      playCorrectFanfare();
    } else {
      playHurdleHitSound();
    }

    const badgeEl = doc.getElementById('game-over-badge');
    const titleEl = doc.getElementById('game-over-title');
    const scoreEl = doc.getElementById('final-score');
    const roundsEl = doc.getElementById('final-rounds');
    const accuracyEl = doc.getElementById('final-accuracy');
    const comboEl = doc.getElementById('final-combo');
    const timeEl = doc.getElementById('final-time');
    const starsContainer = doc.getElementById('stars-container');

    if (badgeEl) badgeEl.textContent = isVictory ? 'STADIUM SPRINT CHAMPION!' : 'SPRINT FINISHED';
    if (titleEl) titleEl.textContent = isVictory ? 'STADIUM CHAMPION!' : 'GREAT SPRINT!';
    if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
    if (roundsEl) roundsEl.textContent = `${String(Math.min(10, currentStageIdx + (isVictory ? 1 : 0))).padStart(2, '0')} / 10`;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    if (comboEl) comboEl.textContent = `${bestCombo}x`;
    if (timeEl) timeEl.textContent = `${totalTimeTaken}s`;

    if (starsContainer) {
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        const active = s <= stars ? 'star-active' : '';
        starsHtml += `<span class="arcade-star ${active}"><svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span>`;
      }
      starsContainer.innerHTML = starsHtml;
    }

    setScreen('game-over-screen');

    // StuCent Reporting Contract
    if (gameCtx && typeof gameCtx.end === 'function') {
      const targetMax = (gameCtx.config && gameCtx.config.maxPoints) || 100;
      const normalizedScore = Math.min(targetMax, Math.round((score / 1000) * targetMax));
      gameCtx.end({
        score: normalizedScore,
        maxScore: targetMax,
        timeTaken: totalTimeTaken,
        success: isVictory || normalizedScore >= 50
      });
    }
  }

  // ==========================================================================
  // 9. CONTROLS & RESIZING
  // ==========================================================================
  function resizeCanvas() {
    const container = doc.getElementById('canvas-viewport');
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width || window.innerWidth;
    canvas.height = rect.height || (window.innerHeight - 180);

    targetRunnerX = getLaneCenterX(currentLane);
    runner.x = targetRunnerX;
    runner.y = canvas.height - 110;
  }

  function setupControls() {
    window.addEventListener('resize', resizeCanvas);

    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (!isPlaying || isGameOver) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        switchLane(currentLane - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        switchLane(currentLane + 1);
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
      }
    });

    // Touch Controls
    const btnLeft = doc.getElementById('btn-left');
    const btnRight = doc.getElementById('btn-right');
    const btnJump = doc.getElementById('btn-jump');

    if (btnLeft) btnLeft.addEventListener('pointerdown', () => switchLane(currentLane - 1));
    if (btnRight) btnRight.addEventListener('pointerdown', () => switchLane(currentLane + 1));
    if (btnJump) btnJump.addEventListener('pointerdown', () => jump());

    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        if (!isPlaying || isGameOver) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        if (clientY < canvas.height * 0.5) {
          jump();
        } else {
          const roadLeft = canvas.width * 0.18;
          const roadWidth = canvas.width * 0.64;
          const laneWidth = roadWidth / 3;

          if (clientX < roadLeft + laneWidth) {
            switchLane(0);
          } else if (clientX > roadLeft + laneWidth * 2) {
            switchLane(2);
          } else {
            switchLane(1);
          }
        }
      });
    }

    // Modal Buttons
    const startBtn = doc.getElementById('start-game-btn');
    const howToBtn = doc.getElementById('how-to-play-btn');
    const hudRulesBtn = doc.getElementById('hud-how-to-play-btn');
    const closeInstBtn = doc.getElementById('close-instructions-btn');
    const startFromInstBtn = doc.getElementById('start-from-instructions-btn');
    const playAgainBtn = doc.getElementById('play-again-btn');
    const soundBtn = doc.getElementById('sound-toggle-btn');

    if (startBtn) startBtn.addEventListener('click', startCountdown);
    if (howToBtn) howToBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (hudRulesBtn) hudRulesBtn.addEventListener('click', () => setScreen('instructions-modal'));
    if (closeInstBtn) closeInstBtn.addEventListener('click', () => setScreen('start-screen'));
    if (startFromInstBtn) startFromInstBtn.addEventListener('click', startCountdown);
    if (playAgainBtn) playAgainBtn.addEventListener('click', startCountdown);

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('math_games_sound', isMuted ? 'false' : 'true');
        if (isMuted) {
          stopRunnerBGM();
        } else if (isPlaying && !isGameOver) {
          startRunnerBGM();
        }
      });
    }
  }

  // ==========================================================================
  // 10. STUCENT INIT & BOOTSTRAP
  // ==========================================================================
  window.game = window.game || {};
  window.game.init = function (config) {
    window.game.config = config || {};
  };

  function init() {
    resizeCanvas();
    setupControls();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
