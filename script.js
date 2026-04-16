/* =========================================================
   Birthday Bliss — script.js
   ========================================================= */

'use strict';

/* ── State ── */
let rejectCount    = 0;
let giftOpened     = false;
let audioCtx       = null;
let selectedType   = 'cake-flowers';
let urlData        = {};

/* ── Constants ── */
const GIFT_IMAGES = {
  'cake-flowers':    'gift-flowers.png',
  'cake-chocolates': 'gift-chocolates.png',
  'cake-teddy':      'gift-teddy.png'
};

const DEFAULT_NOTE = 'Happy Birthday! 🎂 God bless you always! 💝';

/* ── Reject sequence ──
   Each entry: { speech, quby mood, sound type }
*/
const REJECT_STEPS = [
  {
    speech: "It's not a BOMB, take it! 😒",
    mood:   'annoyed',
    sound:  'trombone'
  },
  {
    speech: "Are u Sure?? 😏 Don't be shy now...",
    mood:   'smirk',
    sound:  'gasp'
  },
  {
    speech: "Last chance, take it! 😌 Please...",
    mood:   'calm',
    sound:  'thud'
  },
  {
    speech: 'ERROR... ERROR... ERROR 💀 Take. It. NOW.',
    mood:   'error',
    sound:  'glitch'
  }
];

/* =========================================================
   QUBY SVG CHARACTERS
   ========================================================= */
const QUBY = {
  default: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <!-- Ears -->
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="35" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="115" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <!-- Body -->
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff5f9" stroke="#ffc0d8" stroke-width="2.5"/>
      <!-- Eyes -->
      <ellipse cx="56" cy="89" rx="11" ry="12" fill="#2d1b69"/>
      <ellipse cx="94" cy="89" rx="11" ry="12" fill="#2d1b69"/>
      <circle cx="59.5" cy="85.5" r="4.5" fill="white"/>
      <circle cx="97.5" cy="85.5" r="4.5" fill="white"/>
      <circle cx="60.5" cy="84.5" r="2" fill="#2d1b69"/>
      <circle cx="98.5" cy="84.5" r="2" fill="#2d1b69"/>
      <!-- Nose -->
      <ellipse cx="75" cy="100" rx="4" ry="3" fill="#ffb3c6" opacity=".8"/>
      <!-- Blush -->
      <ellipse cx="40" cy="102" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <ellipse cx="110" cy="102" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <!-- Smile -->
      <path d="M57 112 Q75 126 93 112" stroke="#2d1b69" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  annoyed: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="35" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="115" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff5f9" stroke="#ffc0d8" stroke-width="2.5"/>
      <!-- Angled brows (annoyed) -->
      <line x1="43" y1="74" x2="67" y2="79" stroke="#2d1b69" stroke-width="3.2" stroke-linecap="round"/>
      <line x1="83" y1="79" x2="107" y2="74" stroke="#2d1b69" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Side-glancing eyes -->
      <ellipse cx="56" cy="90" rx="11" ry="11" fill="#2d1b69"/>
      <ellipse cx="94" cy="90" rx="11" ry="11" fill="#2d1b69"/>
      <circle cx="60" cy="88" r="4" fill="white"/>
      <circle cx="98" cy="88" r="4" fill="white"/>
      <!-- Pupils shifted right (looking away) -->
      <circle cx="61" cy="88" r="2" fill="#2d1b69"/>
      <circle cx="99" cy="88" r="2" fill="#2d1b69"/>
      <!-- Nose -->
      <ellipse cx="75" cy="102" rx="4" ry="3" fill="#ffb3c6" opacity=".8"/>
      <!-- Blush -->
      <ellipse cx="40" cy="104" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <ellipse cx="110" cy="104" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <!-- Flat mouth -->
      <line x1="57" y1="115" x2="93" y2="115" stroke="#2d1b69" stroke-width="2.8" stroke-linecap="round"/>
    </svg>`,

  smirk: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="35" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="115" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff5f9" stroke="#ffc0d8" stroke-width="2.5"/>
      <!-- One brow raised -->
      <line x1="43" y1="77" x2="67" y2="72" stroke="#2d1b69" stroke-width="3.2" stroke-linecap="round"/>
      <line x1="83" y1="76" x2="107" y2="76" stroke="#2d1b69" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Eyes (one slightly squinted) -->
      <ellipse cx="56" cy="89" rx="11" ry="12" fill="#2d1b69"/>
      <ellipse cx="94" cy="90" rx="11" ry="10" fill="#2d1b69"/>
      <circle cx="59.5" cy="85.5" r="4.5" fill="white"/>
      <circle cx="97" cy="87" r="4" fill="white"/>
      <circle cx="60" cy="85" r="2" fill="#2d1b69"/>
      <circle cx="97.5" cy="87" r="2" fill="#2d1b69"/>
      <!-- Nose -->
      <ellipse cx="75" cy="102" rx="4" ry="3" fill="#ffb3c6" opacity=".8"/>
      <!-- Blush -->
      <ellipse cx="40" cy="104" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <ellipse cx="110" cy="104" rx="13" ry="8" fill="#ff9eb5" opacity=".45"/>
      <!-- One-sided smirk -->
      <path d="M64 113 Q80 121 90 113" stroke="#2d1b69" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  calm: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="35" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="115" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff5f9" stroke="#ffc0d8" stroke-width="2.5"/>
      <!-- Closed calm eyes -->
      <path d="M45 89 Q56 80 67 89" stroke="#2d1b69" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M83 89 Q94 80 105 89" stroke="#2d1b69" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Nose -->
      <ellipse cx="75" cy="102" rx="4" ry="3" fill="#ffb3c6" opacity=".8"/>
      <!-- Heavy blush -->
      <ellipse cx="40" cy="102" rx="14" ry="9" fill="#ff9eb5" opacity=".6"/>
      <ellipse cx="110" cy="102" rx="14" ry="9" fill="#ff9eb5" opacity=".6"/>
      <!-- Small serene smile -->
      <path d="M59 114 Q75 124 91 114" stroke="#2d1b69" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    </svg>`,

  error: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <!-- Body with pink-red tint -->
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#ffe4e8" stroke="#fca5a5" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#ffe4e8" stroke="#fca5a5" stroke-width="2.5"/>
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff0f0" stroke="#fca5a5" stroke-width="2.5"/>
      <!-- X eyes -->
      <line x1="46" y1="79" x2="66" y2="99" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
      <line x1="66" y1="79" x2="46" y2="99" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
      <line x1="84" y1="79" x2="104" y2="99" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
      <line x1="104" y1="79" x2="84" y2="99" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
      <!-- Wavy panic mouth -->
      <path d="M52 116 Q60 124 68 116 Q76 108 84 116 Q92 124 98 116"
            stroke="#dc2626" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <!-- ! ! ! -->
      <text x="60" y="42" font-size="15" fill="#dc2626" font-weight="900" font-family="Arial">!</text>
      <text x="72" y="38" font-size="20" fill="#ef4444" font-weight="900" font-family="Arial">!</text>
      <text x="86" y="42" font-size="15" fill="#dc2626" font-weight="900" font-family="Arial">!</text>
    </svg>`,

  celebrate: `
    <svg viewBox="0 0 150 155" xmlns="http://www.w3.org/2000/svg">
      <!-- Confetti backdrop -->
      <text x="8"  y="28"  font-size="14">🎊</text>
      <text x="120" y="28" font-size="14">🎉</text>
      <text x="4"  y="130" font-size="12">✨</text>
      <text x="128" y="125" font-size="12">🌟</text>
      <!-- Ears -->
      <ellipse cx="35" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="115" cy="46" rx="20" ry="26" fill="#fff0f7" stroke="#ffc0d8" stroke-width="2.5"/>
      <ellipse cx="35" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <ellipse cx="115" cy="46" rx="12" ry="17" fill="#ffb3ce" opacity=".55"/>
      <!-- Body -->
      <ellipse cx="75" cy="98" rx="58" ry="52" fill="#fff5f9" stroke="#ffc0d8" stroke-width="2.5"/>
      <!-- Star eyes -->
      <text x="42" y="98" font-size="26" text-anchor="middle">⭐</text>
      <text x="108" y="98" font-size="26" text-anchor="middle">⭐</text>
      <!-- Nose -->
      <ellipse cx="75" cy="103" rx="4" ry="3" fill="#ffb3c6" opacity=".8"/>
      <!-- Giant happy smile -->
      <path d="M52 115 Q75 138 98 115" stroke="#2d1b69" stroke-width="3.2" fill="#ffb3c6" opacity=".5"/>
      <path d="M52 115 Q75 138 98 115" stroke="#2d1b69" stroke-width="3.2" fill="none"/>
      <!-- Big blush -->
      <ellipse cx="36" cy="107" rx="15" ry="10" fill="#ff9eb5" opacity=".6"/>
      <ellipse cx="114" cy="107" rx="15" ry="10" fill="#ff9eb5" opacity=".6"/>
    </svg>`
};

/* =========================================================
   WEB AUDIO — SOUNDS
   ========================================================= */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function scheduleNote(ctx, freq, start, dur, type = 'sine', vol = 0.28) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.88);
  osc.start(start);
  osc.stop(start + dur);
}

/* Magic sparkle on gift open */
function playOpenSound() {
  const ctx = initAudio();
  const t   = ctx.currentTime + 0.05;
  const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  seq.forEach((f, i) => scheduleNote(ctx, f, t + i * 0.08, 0.35, 'sine', 0.18));
}

/* Full Happy Birthday melody */
function playBirthdaySong() {
  const ctx = initAudio();
  const bpm = 200;
  const b   = 60 / bpm;
  let   t   = ctx.currentTime + 0.1;

  /* Hap-py  Birth-day  to   You  */
  const song = [
    [392,.5],[392,.25],[440,.75],[392,.75],[523.25,.75],[493.88,1.5],
    [392,.5],[392,.25],[440,.75],[392,.75],[587.33,.75],[523.25,1.5],
    [392,.5],[392,.25],[783.99,.75],[659.25,.75],[523.25,.75],[493.88,.75],[440,1.5],
    [698.46,.5],[698.46,.25],[659.25,.75],[523.25,.75],[587.33,.75],[523.25,1.5]
  ];

  song.forEach(([f, beats]) => {
    const dur = beats * b;
    scheduleNote(ctx, f,      t, dur, 'sine',     0.22);
    scheduleNote(ctx, f * 2,  t, dur, 'sine',     0.06);
    scheduleNote(ctx, f * 1.5,t, dur, 'triangle', 0.05);
    t += dur;
  });
}

/* Reject sounds (different per step) */
function playRejectSound(step) {
  const ctx = initAudio();
  const t   = ctx.currentTime + 0.05;

  if (step === 0) {
    /* Sad trombone wah-wah */
    [523.25, 466.16, 415.30, 349.23].forEach((f, i) => {
      scheduleNote(ctx, f, t + i * 0.3, 0.32, 'sawtooth', 0.15);
    });
  } else if (step === 1) {
    /* Dramatic gasp sweep */
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.44);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t); osc.stop(t + 0.55);
  } else if (step === 2) {
    /* Deep dramatic thuds */
    [220, 196, 164.81, 130.81].forEach((f, i) => {
      scheduleNote(ctx, f, t + i * 0.28, 0.3, 'triangle', 0.22);
    });
  } else {
    /* Glitch / error beeps */
    [880, 440, 1760, 220, 880, 440].forEach((f, i) => {
      scheduleNote(ctx, f, t + i * 0.09, 0.09, 'square', 0.12);
    });
    /* Distorted buzz underneath */
    scheduleNote(ctx, 55, t, 0.6, 'sawtooth', 0.08);
  }
}

/* =========================================================
   CONFETTI
   ========================================================= */
function spawnConfetti() {
  const zone   = document.getElementById('confettiZone');
  const colors = ['#fb7185','#fbbf24','#34d399','#60a5fa','#f0abfc','#818cf8','#ff9eb5'];
  const emojis = ['🎉','🎊','✨','💝','🌟','🎈','🎀'];

  zone.innerHTML = '';

  for (let i = 0; i < 55; i++) {
    const el = document.createElement('div');
    el.classList.add('conf-bit');

    if (Math.random() > 0.58) {
      el.textContent  = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.background = 'none';
      el.style.fontSize   = (0.9 + Math.random() * 0.7) + 'rem';
      el.style.width = 'auto';
      el.style.height = 'auto';
      el.style.borderRadius = '0';
    } else {
      el.style.width  = (8 + Math.random() * 7) + 'px';
      el.style.height = (8 + Math.random() * 7) + 'px';
      el.style.background     = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius   = Math.random() > .5 ? '50%' : '2px';
    }

    el.style.left              = Math.random() * 100 + '%';
    el.style.top               = '-30px';
    el.style.animationDuration = (1.4 + Math.random() * 2.2) + 's';
    el.style.animationDelay    = (Math.random() * 0.6) + 's';
    el.style.transform         = `rotate(${Math.random() * 360}deg)`;

    zone.appendChild(el);
  }
}

/* Sparkle ring around revealed gift */
function addSparkleRing() {
  const ring   = document.getElementById('sparkleRing');
  const sparks = ['✨','⭐','💫','🌟','✨'];
  ring.innerHTML = '';
  sparks.forEach((s, i) => {
    const span = document.createElement('span');
    span.textContent = s;
    const angle = (i / sparks.length) * 360;
    span.style.cssText = `
      left: 50%; top: 50%;
      transform-origin: 0 0;
      transform: rotate(${angle}deg) translateX(55px);
      animation: orbitSpark ${2.5 + i * .2}s linear infinite;
      animation-delay: ${i * 0.12}s;
    `;
    ring.appendChild(span);
  });
}

/* =========================================================
   PARTICLES BACKGROUND
   ========================================================= */
function buildParticles() {
  const bg    = document.getElementById('particles-bg');
  const icons = ['✨','🌸','💫','🎂','🎀','💝','🥳','🎊','🌷','🦋'];

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.left              = Math.random() * 100 + '%';
    p.style.animationDuration = (7 + Math.random() * 9) + 's';
    p.style.animationDelay    = (Math.random() * 6) + 's';
    p.style.fontSize          = (0.75 + Math.random() * 0.85) + 'rem';
    bg.appendChild(p);
  }
}

/* =========================================================
   DOM HELPERS
   ========================================================= */
function setQuby(mood) {
  document.getElementById('qubyChar').innerHTML = QUBY[mood] || QUBY.default;
}

function setBubble(text) {
  const b = document.getElementById('speechBubble');
  b.style.animation = 'none';
  void b.offsetWidth; /* reflow */
  b.style.animation = 'fadeUpIn .35s ease';
  document.getElementById('speechText').textContent = text;
}

/* =========================================================
   OPEN GIFT BOX
   ========================================================= */
function openGift() {
  if (giftOpened) return;
  giftOpened = true;

  playOpenSound();

  const stage  = document.getElementById('giftStage');
  const hint   = document.getElementById('tapHint');
  const surp   = document.getElementById('giftSurprise');
  const row    = document.getElementById('actionRow');
  const note   = document.getElementById('bdayNote');

  /* Set sticker image based on gift type */
  const sticker = document.getElementById('surpriseSticker');
  sticker.src = GIFT_IMAGES[selectedType] || 'gift-flowers.png';
  sticker.alt = selectedType.replace('-', ' & ');

  /* Trigger lid fly animation */
  stage.classList.add('opening');

  setTimeout(() => {
    hint.style.display = 'none';
    surp.classList.add('popped');
    addSparkleRing();

    /* Show note */
    note.classList.add('show');

    /* Show buttons */
    row.classList.add('show');
  
    /* Fire pending balloons if money was entered before box opened */
    if (window._pendingBalloons) {
      window._pendingBalloons = false;
      setTimeout(launchBalloons, 600);
    }
  }, 640);
}

/* =========================================================
   ACCEPT
   ========================================================= */
function onAccept() {
  playBirthdaySong();

  /* Celebration quby */
  const cq  = document.getElementById('celebQuby');
  const msg = document.getElementById('celebMsg');
  cq.innerHTML = QUBY.celebrate;

  if (urlData.name) {
    msg.textContent = `Happy Birthday, ${urlData.name}! 🎂 You are so loved! 💝`;
  } else {
    msg.textContent = "incredibly special! 💝 Happy Birthday! 🎂";
  }

  spawnConfetti();
  document.getElementById('celebOverlay').classList.add('show');

  /* Update main UI */
  setQuby('celebrate');
  setBubble('🎉 YAY!! Thank you for accepting! Happy Birthday! 🎂💝');
}

/* =========================================================
   REJECT
   ========================================================= */
function onReject() {
  if (rejectCount >= REJECT_STEPS.length) return;

  const step = REJECT_STEPS[rejectCount];

  setBubble(step.speech);
  setQuby(step.mood);
  playRejectSound(rejectCount);

  /* Shake the reject button */
  const btn = document.getElementById('rejectBtn');
  btn.classList.add('do-shake');
  setTimeout(() => btn.classList.remove('do-shake'), 520);

  /* Error glitch effect on last rejection */
  if (step.mood === 'error') {
    const quby = document.getElementById('qubyChar');
    const wrap = document.querySelector('.app-wrap');
    quby.classList.add('do-glitch');
    wrap.classList.add('do-glitch');
    setTimeout(() => {
      quby.classList.remove('do-glitch');
      wrap.classList.remove('do-glitch');
    }, 1600);
  }

  rejectCount++;

  /* Disable after all rejections used */
  if (rejectCount >= REJECT_STEPS.length) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
  }
}

/* =========================================================
   SHARE MODAL
   ========================================================= */
function openShareModal() {
  document.getElementById('shareModalVeil').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeShareModal() {
  document.getElementById('shareModalVeil').classList.remove('show');
  document.body.style.overflow = '';
}

function generateLink() {
  const name  = document.getElementById('recipientInput').value.trim();
  const rawNote = document.getElementById('noteInput').value.trim();
  const note  = rawNote || DEFAULT_NOTE;
  const currency = document.getElementById('shareCurrencySelect').value;
  const amount   = document.getElementById('shareAmountInput').value.trim();

  const url = new URL(window.location.href.split('?')[0]);
  if (name)  url.searchParams.set('name', name);
  url.searchParams.set('gift', selectedType);
  url.searchParams.set('note', note);
  if (currency && amount && !isNaN(amount) && Number(amount) > 0) {
    url.searchParams.set('currency', currency);
    url.searchParams.set('amount', parseFloat(amount).toFixed(2));
  }

  const box = document.getElementById('shareUrlBox');
  box.value = url.toString();

  const res = document.getElementById('shareResult');
  res.classList.add('show');
  box.select();
}

function copyLink() {
  const box = document.getElementById('shareUrlBox');
  box.select();
  box.setSelectionRange(0, 99999);

  const ok = document.getElementById('copyOk');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(box.value)
      .then(() => { ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 2200); })
      .catch(() => fallbackCopy(box, ok));
  } else {
    fallbackCopy(box, ok);
  }
}

function fallbackCopy(box, ok) {
  try {
    document.execCommand('copy');
    ok.classList.add('show');
    setTimeout(() => ok.classList.remove('show'), 2200);
  } catch(e) { console.warn('Copy failed', e); }
}

/* =========================================================
   URL PARAMS — READ SHARED GIFT
   ========================================================= */
function parseURL() {
  const p = new URLSearchParams(window.location.search);
  return {
    name: p.get('name') || '',
    gift: p.get('gift') || 'cake-flowers',
    note: p.get('note') || DEFAULT_NOTE,
    currency: p.get('currency') || '',
    amount:   p.get('amount')   || ''
  };
}

function applySharedGift() {
const isSharedLink = !!window.location.search;
 
  if (!isSharedLink) return; /* plain visit — sender view, widget stays visible */
 
  /* ── Recipient view — hide the "Did you send?" widget entirely ── */
  document.getElementById('didSendWidget').classList.add('hidden');
 
  if (!urlData.name && urlData.note === DEFAULT_NOTE &&
      urlData.gift === 'cake-flowers' &&
      !window.location.search) return; /* no params */

  if (urlData.name) {
    const banner = document.getElementById('recipientBanner');
    document.getElementById('recipientNameDisplay').textContent = urlData.name;
    banner.classList.add('show');
  }

  selectedType = urlData.gift;
  document.getElementById('noteText').textContent = urlData.note;

/* ── If sender included a money amount, queue balloon auto-launch ── */
  if (urlData.currency && urlData.amount && Number(urlData.amount) > 0) {
    const formatted = urlData.currency + parseFloat(urlData.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    document.getElementById('balloonMsgLeft').textContent  = 'Just sent you ' + formatted + ' 💸';
    document.getElementById('balloonMsgRight').textContent = 'Enjoy your birthday and have fun 🥳';
    window._pendingBalloons = true;
  }
}

/* =========================================================
   GIFT TYPE TILE SELECTION (modal)
   ========================================================= */
function bindTiles() {
  document.querySelectorAll('.gift-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      document.querySelectorAll('.gift-tile').forEach(t => t.classList.remove('active'));
      tile.classList.add('active');
      selectedType = tile.dataset.type;
    });

    /* keyboard */
    tile.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); }
    });
  });
}

/* =========================================================
   PAYMENT MODAL
   ========================================================= */
function openPaymentModal() {
  initAudio(); /* unblock audio context on user gesture */
  document.getElementById('payModalVeil').classList.add('show');
  document.body.style.overflow = 'hidden';
}
 
function closePaymentModal() {
  document.getElementById('payModalVeil').classList.remove('show');
  document.body.style.overflow = '';
}
 
/* =========================================================
   MONEY AMOUNT MODAL
   ========================================================= */
function openMoneyModal() {
  document.getElementById('moneyModalVeil').classList.add('show');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('moneyInput').focus(), 300);
}
 
function closeMoneyModal() {
  document.getElementById('moneyModalVeil').classList.remove('show');
  document.body.style.overflow = '';
}
 
/* =========================================================
   DID YOU SEND — YES / NO
   ========================================================= */
function onDidSendYes() {
  openMoneyModal();
}
 
function onDidSendNo() {
  /* No money sent — hide the widget and do nothing with balloons */
  document.getElementById('didSendWidget').classList.add('hidden');
}
 
/* =========================================================
   MONEY OK — confirm amount, show balloons
   ========================================================= */
function onMoneyOk() {
  const select   = document.getElementById('currencySelect');
  const symbol   = select.value;
  const amount   = document.getElementById('moneyInput').value.trim();
 
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById('moneyInput').style.borderColor = '#ef4444';
    document.getElementById('moneyInput').focus();
    setTimeout(() => {
      document.getElementById('moneyInput').style.borderColor = '';
    }, 1000);
    return;
  }
 
  const formatted = symbol + parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
 
  closeMoneyModal();
  document.getElementById('didSendWidget').classList.add('hidden');
 
  /* Update balloon messages */
  document.getElementById('balloonMsgLeft').textContent  = 'Just sent you ' + formatted + ' 💸';
  document.getElementById('balloonMsgRight').textContent = 'Enjoy your birthday and have fun 🥳';
 
  /* Launch balloons only if gift is already opened, else queue */
  if (giftOpened) {
    launchBalloons();
  } else {
    window._pendingBalloons = true;
  }
}
 
/* =========================================================
   BALLOON LAUNCH + POP
   ========================================================= */
function playBalloonPop(delay) {
  setTimeout(() => {
    const ctx = initAudio();
    const t   = ctx.currentTime + 0.02;
    /* Sharp transient burst */
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    src.buffer = buf;
    filt.type  = 'bandpass';
    filt.frequency.value = 800;
    filt.Q.value = 0.5;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(1.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    src.start(t);
    src.stop(t + 0.12);
  }, delay);
}
 
function launchBalloons() {
  const leftBalloon  = document.getElementById('balloonLeft');
  const rightBalloon = document.getElementById('balloonRight');
  const wrap         = document.getElementById('balloonWrap');
 
  /* Make wrap interactive for a moment */
  wrap.style.pointerEvents = 'none';
 
  /* Rise up */
  leftBalloon.classList.add('risen');
  setTimeout(() => rightBalloon.classList.add('risen'), 200);
 
  /* Pop left balloon after 3.2s */
  setTimeout(() => {
    leftBalloon.classList.add('popped');
    playBalloonPop(0);
  }, 3200);
 
  /* Pop right balloon 400ms after left */
  setTimeout(() => {
    rightBalloon.classList.add('popped');
    playBalloonPop(0);
  }, 3600);
}

/* =========================================================
   INIT
   ========================================================= */
function init() {
  /* Preload gift sticker images */
  Object.values(GIFT_IMAGES).forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  /* Read URL */
  urlData = parseURL();
  applySharedGift();

  /* Background particles */
  buildParticles();

  /* Default Quby */
  setQuby('default');

  /* Gift box click */
  document.getElementById('giftStage').addEventListener('click', onAcceptInteractionGate);

  /* Buttons */
  document.getElementById('acceptBtn').addEventListener('click', onAccept);
  document.getElementById('rejectBtn').addEventListener('click', onReject);

  /* Share FAB */
  document.getElementById('shareBtn').addEventListener('click', openShareModal);
  document.getElementById('closeShareModal').addEventListener('click', closeShareModal);

  /* Close modal by clicking backdrop */
  document.getElementById('shareModalVeil').addEventListener('click', e => {
    if (e.target === document.getElementById('shareModalVeil')) closeShareModal();
  });

  /* Generate link */
  document.getElementById('genLinkBtn').addEventListener('click', generateLink);
  document.getElementById('copyBtn').addEventListener('click', copyLink);

  /* Celebration close */
  document.getElementById('celebClose').addEventListener('click', () => {
    document.getElementById('celebOverlay').classList.remove('show');
  });

  /* Gift tiles */
  bindTiles();

  /* Send 💸 FAB */
  document.getElementById('sendBtn').addEventListener('click', openPaymentModal);
  document.getElementById('closePayModal').addEventListener('click', closePaymentModal);
  document.getElementById('payModalVeil').addEventListener('click', e => {
    if (e.target === document.getElementById('payModalVeil')) closePaymentModal();
  });
 
  /* Did you send? widget */
  document.getElementById('dsSendYes').addEventListener('click', onDidSendYes);
  document.getElementById('dsSendNo').addEventListener('click', onDidSendNo);

  /* Money amount modal */
  document.getElementById('closeMoneyModal').addEventListener('click', closeMoneyModal);
  document.getElementById('moneyModalVeil').addEventListener('click', e => {
    if (e.target === document.getElementById('moneyModalVeil')) closeMoneyModal();
  });
  document.getElementById('moneyOkBtn').addEventListener('click', onMoneyOk);
  document.getElementById('moneyInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') onMoneyOk();
  });

  /* Keyboard ESC closes all modals */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeShareModal();
      closePaymentModal();
      closeMoneyModal();
    }
  });
}

/* We wrap the gift-open in a gate so audio context is always
   created on user interaction */
function onAcceptInteractionGate() {
  openGift();
}

document.addEventListener('DOMContentLoaded', init);