# 0 to 100 — Carte de la team

Carte interactive des participants **0 to 100** (CCC) et **0 to 40** (MCC) :
photo, ville, jour + mois de naissance, projet. Plus une petite feature rigolote
« **on s'entraîne où ?** » qui calcule le point pile au milieu de deux villes.

## Stack
HTML / CSS / JS vanilla, **zéro build**. Carte via [Leaflet](https://leafletjs.com/)
+ tuiles OpenStreetMap (gratuit, sans clé API). Même famille visuelle « Dark Altitude »
que `calendar-0-to-100`. Prévu pour GitHub Pages.

## Structure
```
index.html            page unique
styles/main.css       thème + carte + feature
scripts/app.js        logique carte, filtres, point milieu
data/participants.js  ← LES DONNÉES (à remplir)
assets/photos/        photos des participants (optionnel)
```

## Remplir les participants
Éditer `data/participants.js`. Un objet par personne :

```js
{ id: "marie-l", name: "Marie L.", city: "Lyon",
  lat: 45.7640, lng: 4.8357,
  birthDay: 14, birthMonth: 3,   // sans l'année (privacy)
  group: "100",                  // "100" = 0 to 100, "40" = 0 to 40
  photo: "assets/photos/marie.jpg" }  // ou "" → pastille initiales
```

- **lat/lng** d'une ville : https://nominatim.openstreetmap.org/ (ou demander à Claude).
- **photo** : déposer le fichier dans `assets/photos/`, mettre le chemin. Vide = initiales.

## La feature « point milieu »
Choix de deux participants → calcul du **point géographique médian** (great-circle
midpoint) + distance de chacun. Affiche un pin sur la carte et la ligne A—milieu—B.
100 % offline, aucun appel réseau.

## Lancer en local
Ouvrir `index.html` dans un navigateur (double-clic suffit).

## Déployer (GitHub Pages)
À configurer quand les vraies données seront en place (cf. `calendar-0-to-100-app`).
