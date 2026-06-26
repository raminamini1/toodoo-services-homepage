"""
Hintergrund-Verwischung für toodoo-services Referenzfotos
----------------------------------------------------------
Bilder in  →  images/referenzen/originals/
Ergebnis   →  images/referenzen/
Aufruf: python blur_backgrounds.py
"""

import os
from pathlib import Path
from PIL import Image, ImageFilter
from rembg import remove, new_session

SRC = Path("images/referenzen/originals")
DST = Path("images/referenzen")
BLUR_RADIUS = 28          # Stärke der Hintergrund-Unschärfe (höher = stärker)
EDGE_FEATHER = 8          # Weicher Übergang Vordergrund/Hintergrund
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG"}

def process_image(src_path: Path, dst_path: Path, session):
    print(f"  Verarbeite: {src_path.name}")
    orig = Image.open(src_path).convert("RGBA")

    # KI-Maske: transparenter Hintergrund, Vordergrund opak
    fg_rgba = remove(orig, session=session, post_process_mask=True)

    # Maske extrahieren und weich machen
    mask = fg_rgba.split()[3]  # Alpha-Kanal = Vordergrundmaske
    soft_mask = mask.filter(ImageFilter.GaussianBlur(EDGE_FEATHER))

    # Hintergrund stark verwischen
    bg = orig.convert("RGB").filter(ImageFilter.GaussianBlur(BLUR_RADIUS))

    # Vordergrund (scharf) über verwischten Hintergrund legen
    bg_rgba = bg.convert("RGBA")
    result = Image.composite(orig, bg_rgba, soft_mask)

    # Als JPEG speichern
    out_path = dst_path.with_suffix(".jpg")
    result.convert("RGB").save(out_path, "JPEG", quality=90, optimize=True)
    print(f"  ✓ Gespeichert: {out_path.name}")

def main():
    if not SRC.exists():
        SRC.mkdir(parents=True)
        print(f"Ordner erstellt: {SRC}")
        print("Bitte Originalbilder in diesen Ordner legen und Skript erneut starten.")
        return

    images = [f for f in SRC.iterdir() if f.suffix in EXTS]
    if not images:
        print(f"Keine Bilder in {SRC} gefunden.")
        return

    print(f"Starte KI-Hintergrundverwischung für {len(images)} Bilder...")
    session = new_session("u2net")  # KI-Modell wird beim ersten Start heruntergeladen

    for i, img_path in enumerate(sorted(images), 1):
        dst_path = DST / f"ref_{i:02d}"
        try:
            process_image(img_path, dst_path, session)
        except Exception as e:
            print(f"  FEHLER bei {img_path.name}: {e}")

    print(f"\nFertig! {len(images)} Bilder verarbeitet → {DST}")

if __name__ == "__main__":
    main()
