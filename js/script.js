const API_URL = '[api.nasa.gov](https://api.nasa.gov/planetary/apod)';
const API_KEY = 'DEMO_KEY'; // optional: swap in your own free key

const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// ---------- Random space fact ----------
const facts = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin over 600 times per second.',
  'Saturn is less dense than water, so it would float.',
  'Sunlight takes about 8 minutes and 20 seconds to reach Earth.',
  'Footprints on the Moon can last millions of years because there is no wind.',
  'A teaspoon of neutron star material would weigh about a billion tons.',
  'Jupiter’s Great Red Spot is a storm larger than Earth.',
  'There are more stars in the universe than grains of sand on Earth’s beaches.'
];
const factBox = document.createElement('section');
factBox.className = 'space-fact';
factBox.innerHTML = `<strong>🚀 Did You Know?</strong> ${facts[Math.floor(Math.random() * facts.length)]}`;
gallery.parentNode.insertBefore(factBox, gallery);

// ---------- Modal ----------
const modal = document.createElement('div');
modal.className = 'modal';
modal.hidden = true;
modal.innerHTML = `
  <div class="modal-content" role="dialog" aria-modal="true">
    <button class="modal-close" aria-label="Close">&times;</button>
    <div class="modal-media"></div>
    <h2 class="modal-title"></h2>
    <p class="modal-date"></p>
    <p class="modal-explanation"></p>
  </div>`;
document.body.appendChild(modal);

function closeModal() {
  modal.hidden = true;
  modal.querySelector('.modal-media').innerHTML = ''; // stops videos
  document.body.style.overflow = '';
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
modal.querySelector('.modal-close').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function openModal(item) {
  const media = modal.querySelector('.modal-media');
  if (item.media_type === 'video') {
    const embeddable = /youtube\.com|youtu\.be|vimeo\.com/.test(item.url);
    media.innerHTML = embeddable
      ? `<iframe src="${item.url}" allowfullscreen></iframe>`
      : `<a href="${item.url}" target="_blank" rel="noopener">▶ Watch this video</a>`;
  } else {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    media.innerHTML = '';
    media.appendChild(img);
  }
  modal.querySelector('.modal-title').textContent = item.title;
  modal.querySelector('.modal-date').textContent = item.date;
  modal.querySelector('.modal-explanation').textContent = item.explanation;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

// ---------- Gallery ----------
function renderGallery(items) {
  gallery.innerHTML = '';
  if (!items.length) {
    gallery.innerHTML = '<p class="message">No photos found for that range.</p>';
    return;
  }
  items.forEach(item => {
    const isVideo = item.media_type === 'video';
    const thumb = isVideo ? item.thumbnail_url : item.url;
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.tabIndex = 0;

    const mediaHTML = thumb
      ? `<img alt="" loading="lazy">`
      : `<div class="video-placeholder">▶ Video</div>`;
    card.innerHTML = `${mediaHTML}<h3></h3><p></p>`;
    const img = card.querySelector('img');
    if (img) { img.src = thumb; img.alt = item.title; }
    card.querySelector('h3').textContent = item.title;
    card.querySelector('p').textContent = item.date + (isVideo ? ' · 🎬 Video' : '');

    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(item); });
    gallery.appendChild(card);
  });
}

async function getImages() {
  const start = startInput.value;
  const end = endInput.value;
  if (!start || !end) {
    gallery.innerHTML = '<p class="message">Please choose both a start and end date.</p>';
    return;
  }
  if (start > end) {
    gallery.innerHTML = '<p class="message">Start date must be before end date.</p>';
    return;
  }

  gallery.innerHTML = '<p class="message">🔄 Loading space photos…</p>';
  button.disabled = true;
  try {
    const res = await fetch(`${API_URL}?api_key=${API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`);
    if (!res.ok) throw new Error(`NASA API error (${res.status})`);
    const data = await res.json();
    renderGallery(data.reverse());
  } catch (err) {
    gallery.innerHTML = `<p class="message">⚠️ Couldn’t load photos. ${err.message}</p>`;
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', getImages);
