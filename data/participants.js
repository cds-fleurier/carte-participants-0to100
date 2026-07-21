/* ────────────────────────────────────────────────────────────────────────────
   Données participants 0 to 100 / 0 to 40
   ────────────────────────────────────────────────────────────────────────────
   Un objet par personne. Champs :
     id        : identifiant unique court (kebab-case), ex. "marie-l"
     name      : prénom + initiale ou prénom NOM (affiché sur la carte)
     city      : nom de la ville (affiché)
     lat, lng  : coordonnées de la ville (obligatoire pour placer le pin)
     birthDay  : jour de naissance  (1–31)  — SANS l'année (choix privacy)
     birthMonth: mois de naissance  (1–12)
     group     : "100"  → projet 0 to 100 (CCC)
                 "40"   → projet 0 to 40  (MCC)
     photo     : chemin ou URL de la photo. Optionnel.
                 → si absent, un pastille avec les initiales est générée.

   Coordonnées géocodées via Nominatim (code postal → bon lieu).
   Pour ajouter quelqu'un : demande-moi les lat/lng à partir de la ville + CP.
   ──────────────────────────────────────────────────────────────────────────── */

window.PARTICIPANTS = [
  { id: "charles",  name: "Charles",  city: "Suresnes",  lat: 48.8709, lng: 2.2256, birthDay: 10, birthMonth: 5, group: "100", photo: "assets/photos/charles.jpeg" },
  { id: "philippe", name: "Philippe", city: "Colombier", lat: 45.3380, lng: 4.5991, birthDay: 28, birthMonth: 5, group: "100", photo: "assets/photos/philippe.jpeg" },
  { id: "milene",   name: "Milène",   city: "Toulouse",  lat: 43.6045, lng: 1.4442, birthDay: 3,  birthMonth: 4,  group: "40",  photo: "assets/photos/milene.jpeg" },
  { id: "katia",    name: "Katia",    city: "Champdieu", lat: 45.6461, lng: 4.0467, birthDay: 14, birthMonth: 10, group: "40",  photo: "assets/photos/Katia.jpeg" },
  { id: "lise",     name: "Lise",     city: "Saint-Laurent-du-Pont", lat: 45.3876, lng: 5.7345, birthDay: 17, birthMonth: 4, group: "100", photo: "assets/photos/lise.jpeg" },
  { id: "blandine", name: "Blandine", city: "Saint-Just-Saint-Rambert", lat: 45.4995, lng: 4.2424, birthDay: 25, birthMonth: 2, group: "100", photo: "assets/photos/blandine.jpeg" },
  { id: "myriam",   name: "Myriam",   city: "Aiglun",    lat: 44.0509, lng: 6.1442, birthDay: 22, birthMonth: 3, group: "100", photo: "assets/photos/myriam.jpeg" },
  { id: "alice",    name: "Alice",    city: "Ignaux",    lat: 42.7319, lng: 1.8400, birthDay: 1,  birthMonth: 7, group: "100", photo: "assets/photos/alice.jpeg" },
  { id: "jb",       name: "JB",       city: "Saint-Étienne", lat: 45.4401, lng: 4.3873, birthDay: 25, birthMonth: 8, group: "100", photo: "assets/photos/JB.jpeg" },
  { id: "marina",   name: "Marina",   city: "Malvalette", lat: 45.3545, lng: 4.1584, birthDay: 11, birthMonth: 8, group: "40",  photo: "assets/photos/Marina.jpeg" },
  { id: "wadie",    name: "Wadie",    city: "Montagny",   lat: 45.6284, lng: 4.7471, birthDay: 22, birthMonth: 3, group: "100", photo: "assets/photos/Wadie.jpeg" },
  { id: "mick",     name: "Mick",     city: "Saint-Étienne", lat: 45.4401, lng: 4.3873, birthDay: 20, birthMonth: 6, group: "100", photo: "assets/photos/Mick.jpeg" },
  { id: "antoine",  name: "Antoine",  city: "Saint-Étienne", lat: 45.4401, lng: 4.3873, birthDay: 19, birthMonth: 1, group: "100", photo: "assets/photos/Antoine.jpeg" },
  { id: "thierry",  name: "Thierry",  city: "Trévoux",    lat: 45.9412, lng: 4.7735, birthDay: 17, birthMonth: 3, group: "100", photo: "assets/photos/Thierry.jpeg" },
  { id: "fatiha",   name: "Fatiha",   city: "La Gresle",  lat: 46.0751, lng: 4.2816, birthDay: 6, birthMonth: 2, group: "100", photo: "assets/photos/Fatiha.jpeg" },
  { id: "kevin",    name: "Kevin",    city: "Monistrol-sur-Loire", lat: 45.2926, lng: 4.1728, birthDay: 5, birthMonth: 11, group: "100", photo: "assets/photos/Kevin.jpeg" },
  { id: "gautier",  name: "Gautier",  city: "Saint-Julien-en-Genevois", lat: 46.1445, lng: 6.0812, birthDay: 9, birthMonth: 10, group: "100", photo: "assets/photos/Gautier.jpeg" },
  { id: "josselin", name: "Josselin", city: "Beauzac",   lat: 45.2593, lng: 4.0993, birthDay: 3,  birthMonth: 3, group: "40",  photo: "assets/photos/Josselin.jpeg" },
  { id: "julien-c", name: "Julien C", city: "Beaugency", lat: 47.7779, lng: 1.6312, birthDay: 23, birthMonth: 8, group: "40",  photo: "assets/photos/JulienC.jpeg" },
  { id: "laure",    name: "Laure",    city: "Chambœuf",  lat: 45.5772, lng: 4.3208, birthDay: 16, birthMonth: 6, group: "100", photo: "assets/photos/Laure.jpg" },
  { id: "jonathan", name: "Jonathan", city: "Saint-Étienne", lat: 45.4401, lng: 4.3873, birthDay: 19, birthMonth: 2, group: "40",  photo: "assets/photos/Jonathan.jpeg" },
  { id: "marine",   name: "Marine",   city: "Bayonne",   lat: 43.4945, lng: -1.4737, birthDay: 5,  birthMonth: 1, group: "100", photo: "assets/photos/Marine.jpeg" },
  { id: "arthur",   name: "Arthur",   city: "La Grand-Croix", lat: 45.5035, lng: 4.5684, birthDay: 14, birthMonth: 6, group: "100", photo: "assets/photos/Arthur.jpeg" },
  { id: "ben",      name: "Ben",      city: "La Fouillouse", lat: 45.5010, lng: 4.3157, birthDay: 6, birthMonth: 3, group: "40",  photo: "assets/photos/Ben.jpeg" },
  { id: "pauline",  name: "Pauline",  city: "Saint-Héand", lat: 45.5296, lng: 4.3753, birthDay: 26, birthMonth: 2, group: "40",  photo: "assets/photos/Pauline.jpeg" },
];
