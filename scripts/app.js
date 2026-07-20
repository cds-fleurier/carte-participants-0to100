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

const markers = new Map(); // id → L.marker
PEOPLE.forEach(p => {
  const m = L.marker([p.lat, p.lng], { icon: personIcon(p) }).bindPopup(popupHtml(p));
  m._group = p.group;
  m.addTo(map);
  markers.set(p.id, m);
});

function fitToVisible() {
  const pts = [];
  markers.forEach(m => { if (map.hasLayer(m)) pts.push(m.getLatLng()); });
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.2));
  else map.setView([45.7, 5.5], 6);
}
fitToVisible();

/* ─── Filtres ──────────────────────────────────────────────────────────────── */
const countEl = document.getElementById('count');
function applyFilter(filter) {
  let n = 0;
  PEOPLE.forEach(p => {
    const m = markers.get(p.id);
    const show = filter === 'all' || p.group === filter;
    if (show) { if (!map.hasLayer(m)) m.addTo(map); n++; }
    else if (map.hasLayer(m)) map.removeLayer(m);
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
