#!/usr/bin/env python3
"""
Miniatures carrées des photos participants → assets/photos/thumb/<même nom>.jpeg

Les photos sources font souvent 2 300 × 3 000 px (2–3 Mo) pour des avatars de 30 à 96 px :
on génère un carré de 320 px (net sur écran Retina jusqu'à 160 px d'affichage : trombinoscope), recadré au
centre, orientation EXIF appliquée. La photo d'origine reste utilisée par la lightbox.

Usage :  <python avec Pillow> scripts/make_thumbs.py            # ne refait que les manquantes
         <python avec Pillow> scripts/make_thumbs.py --force    # tout regénérer
Pillow n'est pas installé globalement : utiliser p. ex. ~/agents/ShoppingWiz/.venv/bin/python
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

SIZE = 320
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "photos"
DST = SRC / "thumb"
FORCE = "--force" in sys.argv

DST.mkdir(exist_ok=True)
done = skipped = 0
for src in sorted(SRC.iterdir()):
    if not src.is_file() or src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        continue
    dst = DST / (src.stem + ".jpeg")
    if dst.exists() and not FORCE and dst.stat().st_mtime >= src.stat().st_mtime:
        skipped += 1
        continue
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im = ImageOps.fit(im, (SIZE, SIZE), method=Image.LANCZOS, centering=(0.5, 0.4))
        im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    done += 1
    print(f"✓ {src.name} → thumb/{dst.name}")
print(f"{done} générée(s), {skipped} déjà à jour")
