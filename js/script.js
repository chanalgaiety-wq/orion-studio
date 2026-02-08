// Year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile menu
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

if (burger && nav) {
  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (target.tagName === "A") {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

// Modal video
const modal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");

function openModalVideo(src) {
  if (!modal || !modalVideo) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  modalVideo.src = src;
  modalVideo.currentTime = 0;
  modalVideo.muted = false;
  modalVideo.volume = 1;

  modalVideo.play().catch(() => {});
}

function closeModalVideo() {
  if (!modal || !modalVideo) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
}


document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModalVideo();
});

// Player
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const curTime = document.getElementById("curTime");
const durTime = document.getElementById("durTime");
const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const coversWrap = document.getElementById("covers");

const tracks = [
  { title: "ANDIYA", artist: "Club Mix", cover: "img/cover_andiya.jpg", src: "audio/andiya.mp3" },
  { title: "Aşkımızdan", artist: "Single", cover: "img/cover_askimizdan.jpg", src: "audio/askimizdan_icelim.mp3" },
  { title: "Моя Муза", artist: "South Ice feat.", cover: "img/cover_muza.jpg", src: "audio/muza.mp3" },
  { title: "Steps To God", artist: "Project", cover: "img/cover_steps.jpg", src: "audio/steps_to_god.mp3" },
  { title: "ELLO", artist: "Release", cover: "img/cover_tesen.jpg", src: "audio/tesen_mir.mp3" },
  { title: "SEYRAN", artist: "Live", cover: "img/cover_yaryar.jpg", src: "audio/yar_yar.mp3" },
];

let currentIndex = 0;
let isPlaying = false;

function formatTime(sec) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setActiveCover() {
  if (!coversWrap) return;
  [...coversWrap.querySelectorAll(".cover")].forEach((el, i) => {
    el.classList.toggle("is-active", i === currentIndex);
  });
}

function loadTrack(index) {
  currentIndex = (index + tracks.length) % tracks.length;
  const t = tracks[currentIndex];

  if (playerCover) playerCover.src = t.cover;
  if (playerTitle) playerTitle.textContent = t.title;
  if (playerArtist) playerArtist.textContent = t.artist;

  if (audio) {
    audio.src = t.src;
    audio.load();
  }

  if (seek) seek.value = 0;
  if (curTime) curTime.textContent = "0:00";
  if (durTime) durTime.textContent = "0:00";
  setActiveCover();
}

function play() {
  if (!audio) return;
  audio.play().then(() => {
    isPlaying = true;
    if (playBtn) playBtn.textContent = "❚❚";
  }).catch(() => {
    isPlaying = false;
    if (playBtn) playBtn.textContent = "▶";
  });
}

function pause() {
  if (!audio) return;
  audio.pause();
  isPlaying = false;
  if (playBtn) playBtn.textContent = "▶";
}

function togglePlay() {
  if (!audio) return;
  if (isPlaying) pause();
  else play();
}

function next() {
  loadTrack(currentIndex + 1);
  if (isPlaying) play();
}

function prev() {
  loadTrack(currentIndex - 1);
  if (isPlaying) play();
}

function renderCovers() {
  if (!coversWrap) return;

  coversWrap.innerHTML = tracks.map((t, i) => `
    <button class="cover" type="button" data-index="${i}" aria-label="Включить ${t.title}">
      <img src="${t.cover}" alt="Обложка ${t.title}">
    </button>
  `).join("");

  coversWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".cover");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    loadTrack(idx);
    play();
  });
}

if (audio) {
  audio.addEventListener("loadedmetadata", () => {
    if (durTime) durTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!seek) return;
    const value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seek.value = String(value);
    if (curTime) curTime.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    next();
  });
}

if (seek && audio) {
  seek.addEventListener("input", () => {
    if (!audio.duration) return;
    const pct = Number(seek.value) / 100;
    audio.currentTime = pct * audio.duration;
  });
}

if (playBtn) playBtn.addEventListener("click", togglePlay);
if (nextBtn) nextBtn.addEventListener("click", next);
if (prevBtn) prevBtn.addEventListener("click", prev);

renderCovers();
loadTrack(0);

// === Peek carousel (studio) ===
(function initStudioCarousel(){
  const root = document.getElementById("studioCarousel");
  if (!root) return;

  const track = root.querySelector(".carousel__track");
  const slides = Array.from(root.querySelectorAll(".carousel__slide"));
  const dotsWrap = root.querySelector(".carousel__dots");
  const prev = root.querySelector(".carousel__nav--prev");
  const next = root.querySelector(".carousel__nav--next");

  if (!track || slides.length === 0 || !dotsWrap || !prev || !next) return;

  let active = 0;

  function centerTo(i){
    active = (i + slides.length) % slides.length;

    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === active));

    const dots = Array.from(dotsWrap.querySelectorAll(".carousel__dot"));
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === active));

    const target = slides[active];
    const left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left, behavior: "smooth" });
  }

  // dots
  dotsWrap.innerHTML = slides.map((_, i) =>
    `<button class="carousel__dot" type="button" aria-label="Слайд ${i+1}"></button>`
  ).join("");

  dotsWrap.querySelectorAll(".carousel__dot").forEach((dot, i) => {
    dot.addEventListener("click", () => centerTo(i));
  });

  slides.forEach((s, i) => s.addEventListener("click", () => centerTo(i)));

  prev.addEventListener("click", () => centerTo(active - 1));
  next.addEventListener("click", () => centerTo(active + 1));

  // старт со 2-го, чтобы были края слева/справа
  const startIndex = slides.length >= 3 ? 1 : 0;
  centerTo(startIndex);
})();






// ===== LEAD MODAL (open/close + submit) =====
(function initLeadModal(){
  const leadModal = document.getElementById('leadModal');
  if (!leadModal) return;

  function openLeadModal() {
    leadModal.classList.add('is-open');
    leadModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLeadModal() {
    leadModal.classList.remove('is-open');
    leadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // open / close buttons
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-lead-open]');
    if (openBtn) {
      e.preventDefault();
      openLeadModal();
      return;
    }

    const closeBtn = e.target.closest('[data-lead-close]');
    if (closeBtn) {
      e.preventDefault();
      closeLeadModal();
    }
  });

  // ESC closes lead modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLeadModal();
  });

  // submit form (если форма есть)
  const leadForm = leadModal.querySelector('[data-lead-form]');
  if (!leadForm) return;

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = leadForm.querySelector('button[type="submit"]');
    const originalText = btn?.textContent;

    btn?.setAttribute('disabled', 'disabled');
    if (btn) btn.textContent = 'Отправляем...';

    const formData = new FormData(leadForm);
    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      channel: (formData.get('channel') || '').toString().trim(),
      hp: (formData.get('hp') || '').toString().trim(),
      page: location.pathname
    };

    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Send failed');

      if (btn) btn.textContent = 'Готово ✅';
      leadForm.reset();

      setTimeout(() => {
        closeLeadModal();
        if (btn) btn.textContent = originalText || 'Оставить заявку';
      }, 800);

    } catch (err) {
      console.error(err);
      alert('Не получилось отправить заявку. Напишите нам в Telegram 🙏');
      if (btn) btn.textContent = originalText || 'Оставить заявку';
    } finally {
      btn?.removeAttribute('disabled');
    }
  });
})();




