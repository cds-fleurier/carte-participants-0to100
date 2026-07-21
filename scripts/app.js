/* ────────────────────────────────────────────────────────────────────────────
   0 to 100 — Carte de la team
   Vanilla JS + Leaflet. Aucun build, aucune clé API.
   ──────────────────────────────────────────────────────────────────────────── */

const PEOPLE = (window.PARTICIPANTS || []).filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const groupLabel = g => (g === '40' ? '0 to 40' : '0 to 100');

function initials(name) {
  const words = String(name).trim().split(/\s+/);
  const first = words[0]?.[0] || '?';
  const last  = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function birthdayText(p) {
  if (!p.birthDay || !p.birthMonth) return '';
  return `🎂 ${p.birthDay} ${MONTHS[p.birthMonth - 1] || ''}`;
}

// Distance haversine en km
function haversineKm(a, b) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Point milieu géographique (great-circle midpoint)
function midpoint(a, b) {
  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;
  const lat1 = toRad(a.lat), lng1 = toRad(a.lng);
  const lat2 = toRad(b.lat), dLng = toRad(b.lng - a.lng);
  const Bx = Math.cos(lat2) * Math.cos(dLng);
  const By = Math.cos(lat2) * Math.sin(dLng);
  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) ** 2 + By ** 2)
  );
  const lng3 = lng1 + Math.atan2(By, Math.cos(lat1) + Bx);
  return { lat: toDeg(lat3), lng: toDeg(lng3) };
}

/* ─── Carte ────────────────────────────────────────────────────────────────── */
const map = L.map('map', { scrollWheelZoom: false, attributionControl: true });

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© OpenStreetMap',
}).addTo(map);

function personIcon(p) {
  // Pin propre : initiales sur pastille colorée par projet (pas de photo — illisible à cette taille)
  const cls = p.group === '40' ? 'pin pin--40' : 'pin';
  return L.divIcon({ className: '', html: `<div class="${cls}">${initials(p.name)}</div>`, iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -24] });
}

function popupHtml(p) {
  const chipCls = p.group === '40' ? 'chip chip--40' : 'chip chip--100';
  const bday = birthdayText(p);
  const ringCls = p.group === '40' ? 'pop-photo pop-photo--40' : 'pop-photo';
  const photo = p.photo
    ? `<img class="${ringCls}" src="${p.photo}" alt="${p.name}" loading="lazy">`
    : '';
  return `
    ${photo}
    <div class="pop-name">${p.name}</div>
    <div class="pop-city">${p.city || ''}</div>
    <div class="pop-meta">
      <span class="${chipCls}">${groupLabel(p.group)}</span>
      ${bday ? `<span class="chip">${bday}</span>` : ''}
    </div>`;
}

// Regroupement des pins proches (clustering) — indispensable dès qu'une zone
// concentre beaucoup de participants (ex. la Loire).
const cluster = L.markerClusterGroup({
  maxClusterRadius: 44,
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 1.4,
  iconCreateFunction(c) {
    const kids = c.getAllChildMarkers();
    const has100 = kids.some(m => m._group === '100');
    const has40  = kids.some(m => m._group === '40');
    const mod = (has100 && has40) ? 'cluster-pin--mix'
              : has40 ? 'cluster-pin--40'
              : 'cluster-pin--100';
    const n = c.getChildCount();
    return L.divIcon({
      className: '',
      html: `<div class="cluster-pin ${mod}">${n}</div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });
  },
}).addTo(map);

const markers = new Map(); // id → L.marker
PEOPLE.forEach(p => {
  const m = L.marker([p.lat, p.lng], { icon: personIcon(p) }).bindPopup(popupHtml(p));
  m._group = p.group;
  cluster.addLayer(m);
  markers.set(p.id, m);
});

function fitToVisible() {
  const pts = [];
  markers.forEach(m => { if (cluster.hasLayer(m)) pts.push(m.getLatLng()); });
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.2));
  else map.setView([45.7, 5.5], 6);
}
fitToVisible();

/* ─── Prochains anniversaires ──────────────────────────────────────────────── */
function nextBirthday(p) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let d = new Date(now.getFullYear(), p.birthMonth - 1, p.birthDay);
  if (d < today) d = new Date(now.getFullYear() + 1, p.birthMonth - 1, p.birthDay);
  return { date: d, days: Math.round((d - today) / 86400000) };
}
function daysLabel(days) {
  if (days === 0) return "aujourd'hui 🎉";
  if (days === 1) return 'demain !';
  if (days <= 7)  return `dans ${days} jours`;
  return `dans ${days} jours`;
}
function avatarHtml(p, cls) {
  return p.photo
    ? `<img class="${cls}" src="${p.photo}" alt="${p.name}" loading="lazy">`
    : `<div class="${cls}">${initials(p.name)}</div>`;
}

(function renderBirthdays() {
  const withBday = PEOPLE.filter(p => p.birthDay && p.birthMonth)
    .map(p => ({ p, ...nextBirthday(p) }))
    .sort((a, b) => a.days - b.days);
  if (!withBday.length) return;

  const nextEl = document.getElementById('bday-next');
  const listEl = document.getElementById('bday-list');

  const top = withBday[0];
  const modClass =
    (top.days === 0 ? ' bday-next--today' : '') +
    (top.p.group === '40' ? ' bday-next--40' : '');
  nextEl.className = 'bday-next' + modClass;
  nextEl.innerHTML = `
    ${avatarHtml(top.p, 'bday-ava')}
    <div class="bday-info">
      <span class="bday-name">${top.p.name}</span>
      <span class="bday-when">${daysLabel(top.days)}</span>
      <span class="bday-date">${top.p.birthDay} ${MONTHS[top.p.birthMonth - 1]} · ${top.p.city}</span>
    </div>`;

  listEl.innerHTML = withBday.slice(1).map(({ p, days }) => `
    <div class="bday-row">
      <span class="r-name">${p.name}</span>
      <span class="r-date">${p.birthDay} ${MONTHS[p.birthMonth - 1]}</span>
      <span class="r-days">${days === 0 ? "aujourd'hui" : 'dans ' + days + ' j'}</span>
    </div>`).join('');
})();

/* ─── Trombinoscope ────────────────────────────────────────────────────────── */
const rosterGrid = document.getElementById('roster-grid');
const rcards = new Map(); // id → élément carte

PEOPLE.slice()
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  .forEach(p => {
    const card = document.createElement('div');
    card.className = 'rcard' + (p.group === '40' ? ' rcard--40' : '');
    card.dataset.group = p.group;
    const visual = p.photo
      ? `<img class="rcard-photo" src="${p.photo}" alt="${p.name}" loading="lazy" data-id="${p.id}">`
      : `<div class="rcard-nophoto">${initials(p.name)}</div>`;
    const bday = birthdayText(p);
    card.innerHTML = `
      ${visual}
      <div class="rcard-body">
        <div class="rcard-name">${p.name}</div>
        <div class="rcard-city">${p.city || ''} · ${groupLabel(p.group)}</div>
        ${bday ? `<div class="rcard-bday">${bday}</div>` : ''}
      </div>`;
    rosterGrid.appendChild(card);
    rcards.set(p.id, card);
  });

/* ─── Lightbox ─────────────────────────────────────────────────────────────── */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCap = document.getElementById('lightbox-cap');

function openLightbox(p) {
  if (!p || !p.photo) return;
  lbImg.src = p.photo;
  lbImg.alt = p.name;
  lbCap.innerHTML = `${p.name}<small>${p.city || ''} · ${groupLabel(p.group)}${birthdayText(p) ? ' · ' + birthdayText(p) : ''}</small>`;
  lightbox.hidden = false;
}
function closeLightbox() { lightbox.hidden = true; lbImg.src = ''; }

rosterGrid.addEventListener('click', e => {
  const img = e.target.closest('.rcard-photo');
  if (!img) return;
  openLightbox(PEOPLE.find(p => p.id === img.dataset.id));
});
lightbox.addEventListener('click', e => {
  if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

/* ─── Filtres ──────────────────────────────────────────────────────────────── */
const countEl = document.getElementById('count');
function applyFilter(filter) {
  let n = 0;
  PEOPLE.forEach(p => {
    const m = markers.get(p.id);
    const show = filter === 'all' || p.group === filter;
    if (show) { if (!cluster.hasLayer(m)) cluster.addLayer(m); n++; }
    else if (cluster.hasLayer(m)) cluster.removeLayer(m);
    const card = rcards.get(p.id);
    if (card) card.classList.toggle('is-hidden', !show);
  });
  countEl.textContent = `${n} participant${n > 1 ? 's' : ''}`;
  fitToVisible();
}

document.querySelectorAll('.seg').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    applyFilter(btn.dataset.filter);
  });
});
applyFilter('all');

/* ─── Feature « point de rendez-vous » ─────────────────────────────────────── */
const selA = document.getElementById('meet-a');
const selB = document.getElementById('meet-b');
const resultEl = document.getElementById('meet-result');

function fillSelect(sel, placeholder) {
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    PEOPLE.slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      .map(p => `<option value="${p.id}">${p.name} — ${p.city}</option>`)
      .join('');
}
fillSelect(selA, '— toi —');
fillSelect(selB, '— ton binôme —');

let meetLayer = null; // groupe des éléments dessinés (ligne + pin milieu)

function clearMeet() {
  if (meetLayer) { map.removeLayer(meetLayer); meetLayer = null; }
}

function showMeet() {
  const a = PEOPLE.find(p => p.id === selA.value);
  const b = PEOPLE.find(p => p.id === selB.value);

  clearMeet();
  resultEl.hidden = false;

  if (!a || !b) {
    resultEl.innerHTML = `<p class="warn">Choisis deux personnes 👆</p>`;
    return;
  }
  if (a.id === b.id) {
    resultEl.innerHTML = `<p class="warn">Faut un binôme différent de toi 😉</p>`;
    return;
  }

  const mid = midpoint(a, b);
  const dA = haversineKm(a, mid);
  const dB = haversineKm(b, mid);
  const total = haversineKm(a, b);

  // Dessin : ligne A—milieu—B + pin milieu
  const meetIcon = L.divIcon({ className: '', html: `<div class="pin--meet">📍</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  meetLayer = L.layerGroup([
    L.polyline([[a.lat, a.lng], [mid.lat, mid.lng], [b.lat, b.lng]], {
      color: '#ffffff', weight: 2, opacity: 0.5, dashArray: '4 6',
    }),
    L.marker([mid.lat, mid.lng], { icon: meetIcon })
      .bindPopup(`<div class="pop-name">Point milieu</div><div class="pop-city">pile entre ${a.city} et ${b.city}</div>`),
  ]).addTo(map);

  map.fitBounds(L.latLngBounds([[a.lat, a.lng], [b.lat, b.lng], [mid.lat, mid.lng]]).pad(0.25));

  resultEl.innerHTML = `
    <div class="rdv">${mid.lat.toFixed(4)}, ${mid.lng.toFixed(4)}
      <small>· le point pile au milieu</small></div>
    <div class="legs">
      <div class="leg"><b>${a.name}</b><span>${a.city} → ${Math.round(dA)} km</span></div>
      <div class="leg"><b>${b.name}</b><span>${b.city} → ${Math.round(dB)} km</span></div>
    </div>
    <p class="meet-sub" style="margin-top:10px">Soit ${Math.round(total)} km entre vous deux — chacun fait la moitié du chemin.</p>`;
}

document.getElementById('meet-go').addEventListener('click', showMeet);
