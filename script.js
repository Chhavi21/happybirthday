const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const glow = $('.cursor-glow');
document.addEventListener('mousemove', (event) => {
  if (!glow) return;
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const memoryGrid = $('#memoryGrid');
if (memoryGrid) {
  const folder = memoryGrid.dataset.imageFolder || 'assets';
  const count = parseInt(memoryGrid.dataset.imageCount, 10) || 0;

  // Order matters: each image number is tried against these extensions
  // in turn until one actually loads. Covers photos saved as .png/.jpeg/
  // .webp instead of .jpg, AND mixed-case extensions like .JPG — file
  // servers are case-sensitive, so "1.jpg" and "1.JPG" are different files.
  const extensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'webp', 'WEBP'];

  // Optional: captions for specific images, keyed by image number
  const captions = {};

  // Tries each extension for a given image number until one loads.
  // Calls onSuccess(loadedImgEl) or onFail() if none of them exist.
  const loadWithFallback = (basePath, extList, onSuccess, onFail) => {
    let i = 0;
    const tryNext = () => {
      if (i >= extList.length) {
        onFail();
        return;
      }
      const candidate = new Image();
      candidate.onload = () => onSuccess(candidate);
      candidate.onerror = () => {
        i += 1;
        tryNext();
      };
      candidate.src = `${basePath}.${extList[i]}`;
    };
    tryNext();
  };

  for (let i = 1; i <= count; i += 1) {
    const delayClass = `delay-${(i % 3) + 1 === 3 ? 2 : (i % 3)}`; // cycles delay-0/1/2, adjust as you like

    const card = document.createElement('div');
    card.className = `polaroid reveal ${i > 1 ? delayClass : ''}`.trim();

    const photo = document.createElement('div');
    photo.className = 'photo';
    card.appendChild(photo);

    if (captions[i]) {
      const p = document.createElement('p');
      p.textContent = captions[i];
      card.appendChild(p);
    }

    memoryGrid.appendChild(card);

    loadWithFallback(
      `${folder}/${i}`,
      extensions,
      (loadedImg) => {
        // Use a real <img> (not a fixed-height background) so each
        // polaroid's height follows that photo's own aspect ratio.
        const imgEl = document.createElement('img');
        imgEl.src = loadedImg.src;
        imgEl.alt = '';
        imgEl.loading = 'lazy';
        photo.appendChild(imgEl);

        const ratio = loadedImg.naturalWidth / loadedImg.naturalHeight;
        if (ratio < 0.85) {
          card.classList.add('tall');
        } else if (ratio > 1.3) {
          card.classList.add('wide');
        }
      },
      () => {
        // No file exists for this number under any extension — drop
        // the empty placeholder instead of leaving a blank card.
        console.warn(`No image found for ${folder}/${i} (tried: ${extensions.join(', ')})`);
        card.remove();
      }
    );
  }
}

const musicBtn = $('#musicBtn');
const bgMusic = $('#bgMusic');
musicBtn?.addEventListener('click', () => {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {
      console.warn('Background music could not play — check assets/background-music.mp3 exists.');
    });
    musicBtn.classList.add('playing');
    musicBtn.textContent = '♫';
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '♪';
  }
});

// Memories page music
const memoriesSong = $('#memoriesSong');

if (memoriesSong) {
  const tryPlayMemoriesSong = () => {
    memoriesSong.play().catch(() => {
      console.warn('Autoplay was blocked. Waiting for user interaction.');
    });
  };

  // Try to start immediately
  tryPlayMemoriesSong();

  // Fallback if browser blocks autoplay
  const unlockMemoriesSong = () => {
    tryPlayMemoriesSong();

    document.removeEventListener('click', unlockMemoriesSong);
    document.removeEventListener('touchstart', unlockMemoriesSong);
    document.removeEventListener('keydown', unlockMemoriesSong);
  };

  document.addEventListener('click', unlockMemoriesSong, { once: true });
  document.addEventListener('touchstart', unlockMemoriesSong, { once: true });
  document.addEventListener('keydown', unlockMemoriesSong, { once: true });
}

const birthdayDate = new Date('2026-09-06T00:00:00').getTime();
function updateCountdown() {
  const countdown = $('#countdown');
  if (!countdown) return;

  const difference = Math.max(birthdayDate - Date.now(), 0);
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  $('#days').textContent = String(days).padStart(2, '0');
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#mins').textContent = String(minutes).padStart(2, '0');
  $('#secs').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

const cake = $('#birthdayCake') || $('.cake');
const cutCakeBtn = $('.cut-cake-btn');
const cakeStageText = $('#cakeStageText');
const cakeSong = $('#cakeSong');
let cakeAnimationStarted = false;

if (cakeSong) {
  const tryPlaySong = () => cakeSong.play().catch(() => {});

  // Try right away — this works when the page was reached via a click
  // (e.g. the "Cut the Cake" link), since that click carries over as a
  // user gesture. If the browser still blocks it (direct load/refresh,
  // no prior interaction), fall back to starting on the very next tap,
  // click, or keypress anywhere on the page.
  tryPlaySong();

  const unlockSong = () => {
    tryPlaySong();
    document.removeEventListener('click', unlockSong);
    document.removeEventListener('touchstart', unlockSong);
    document.removeEventListener('keydown', unlockSong);
  };
  document.addEventListener('click', unlockSong, { once: true });
  document.addEventListener('touchstart', unlockSong, { once: true });
  document.addEventListener('keydown', unlockSong, { once: true });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

cutCakeBtn?.addEventListener('click', async () => {
  if (!cake || cakeAnimationStarted) return;

  cakeAnimationStarted = true;
  cutCakeBtn.disabled = true;

  cakeStageText.textContent = 'blowing the candles... 🌬️';
  cutCakeBtn.textContent = 'Blowing Candles...';
  cake.classList.add('blow');
  await wait(1500);

  cakeStageText.textContent = ' cake is cutting 🔪';
  cutCakeBtn.textContent = '';
  cake.classList.add('knife-in');
  await wait(1200);

  cakeStageText.textContent = ' into a slice... 🍰';
  cutCakeBtn.textContent = 'Cutting Slice...';
  cake.classList.add('sliced');
  await wait(900);

  cakeStageText.textContent = 'first slice for 🐼 🎉';
  cutCakeBtn.textContent = 'Cake Cut 🎉';

  if (typeof confetti === 'function') {
    confetti({ particleCount: 280, spread: 115, origin: { y: 0.62 } });
  }
});