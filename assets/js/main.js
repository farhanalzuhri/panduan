// Smooth-scroll for in-page anchors (native behavior + minor offset fix for sticky header)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const y = target.getBoundingClientRect().top + window.scrollY - 70; // account for sticky header
  window.scrollTo({ top: y, behavior: 'smooth' });
});

// IntersectionObserver to reveal elements when entering viewport
const io = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target); // animate once
    }
  }
}, {
  root: null,
  threshold: 0.16,
  rootMargin: '0px 0px -10% 0px',
});

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// === Hanya 1 section aktif di layar ===
const sections = Array.from(document.querySelectorAll('.section'));

const setActive = (el) => {
  sections.forEach(s => s.classList.toggle('is-active', s === el));
};

// inisialisasi: aktifkan section pertama
if (sections.length) setActive(sections[0]);

// observer untuk mencari section yang paling "dominan" di viewport
const secObserver = new IntersectionObserver((entries) => {
  // pilih entry dengan intersectionRatio tertinggi
  let top = null;
  for (const e of entries) {
    if (!top || e.intersectionRatio > top.intersectionRatio) top = e;
  }
  if (top && top.isIntersecting) window.setActive(top.target);
}, {
  threshold: [0.25, 0.5, 0.75],   // cek di beberapa ambang
  rootMargin: '0px 0px -10% 0px'
});

// observe semua section
sections.forEach(s => secObserver.observe(s));
// === Progress indicator ===
const progressBar = document.querySelector('.progress__bar');
const stepsWrap = document.querySelector('.progress-steps');

// Buat dots berdasarkan jumlah section + link ke tiap section
const makeSteps = () => {
  if (!stepsWrap) return;
  stepsWrap.innerHTML = '';
  sections.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = `#${s.id || ''}`; // pastikan tiap section punya id (sudah ada: opening, tahap-1, dst.)
    const step = document.createElement('span');
    step.className = 'step';
    step.textContent = i;
    a.appendChild(step);
    stepsWrap.appendChild(a);
  });
};
makeSteps();

// helper: update progress bar & active dot
const updateProgressUI = (activeIndex) => {
  // lebar bar: 0% di step 1, 100% di step terakhir
  const max = Math.max(1, sections.length - 1);
  const pct = (activeIndex / max) * 100;
  if (progressBar) progressBar.style.width = `${pct}%`;
  // dots
  if (stepsWrap) {
    [...stepsWrap.querySelectorAll('.step')].forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIndex);
    });
  }
};

// panggil sekali saat awal
updateProgressUI(0);

// Hook ke setActive: tambahkan update progress saat section aktif berubah
const _origSetActive = setActive;
const setActiveWithProgress = (el) => {
  const idx = sections.indexOf(el);
  _origSetActive(el);
  if (idx >= 0) updateProgressUI(idx);
};

// ganti referensi setActive yang dipakai observer section
window.setActive = setActiveWithProgress;

// Re-wire observer ke fungsi baru jika perlu
// (Jika di kode sebelumnya dipanggil langsung setActive(), cukup pastikan setelah baris ini, observer memanggil window.setActive)

// === Checklist validation ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checklistForm");
  const nextBtn = document.getElementById("nextBtn");

  if (!form || !nextBtn) return;

  form.addEventListener("change", () => {
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    if (allChecked) {
      nextBtn.classList.remove("disabled");
      nextBtn.removeAttribute("aria-disabled");
    } else {
      nextBtn.classList.add("disabled");
      nextBtn.setAttribute("aria-disabled", "true");
    }
  });
});
