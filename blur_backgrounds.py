# -*- coding: utf-8 -*-
"""
Bild-Verarbeitung fuer toodoo-services
- images/referenzen/originals/          -> Hintergrund verwischen (Galerie)
- images/referenzen/originals/bearbeiten -> Hintergrund komplett entfernen (weiss)
Aufruf: python blur_backgrounds.py
"""
import os, sys
os.environ["PYTHONIOENCODING"] = "utf-8"

from pathlib import Path
from PIL import Image, ImageFilter
from rembg import remove, new_session

SRC_GALLERY  = Path("images/referenzen/originals")
SRC_PRODUCTS = Path("images/referenzen/originals/bearbeiten")
DST_GALLERY  = Path("images/referenzen/gallery")
DST_PRODUCTS = Path("images/referenzen/products")
BLUR_RADIUS  = 28
EDGE_FEATHER = 8
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"}

def process_blur(src, dst, session):
    orig = Image.open(src).convert("RGBA")
    fg   = remove(orig, session=session, post_process_mask=True)
    mask = fg.split()[3].filter(ImageFilter.GaussianBlur(EDGE_FEATHER))
    bg   = orig.convert("RGB").filter(ImageFilter.GaussianBlur(BLUR_RADIUS))
    result = Image.composite(orig, bg.convert("RGBA"), mask)
    dst.with_suffix(".jpg").parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(dst.with_suffix(".jpg"), "JPEG", quality=90, optimize=True)

def process_remove(src, dst, session):
    orig = Image.open(src).convert("RGBA")
    fg   = remove(orig, session=session, post_process_mask=True)
    white = Image.new("RGBA", orig.size, (255, 255, 255, 255))
    result = Image.alpha_composite(white, fg)
    dst.with_suffix(".jpg").parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(dst.with_suffix(".jpg"), "JPEG", quality=92, optimize=True)

def get_images(folder):
    return sorted([f for f in folder.iterdir()
                   if f.is_file() and f.suffix in EXTS and "bearbeiten" not in str(f)])

def main():
    session = new_session("u2net")

    # --- Galerie: Hintergrund verwischen ---
    gallery_imgs = get_images(SRC_GALLERY)
    print(f"Galerie: {len(gallery_imgs)} Bilder (Hintergrund verwischen)")
    for i, src in enumerate(gallery_imgs, 1):
        dst = DST_GALLERY / f"ref_{i:02d}"
        try:
            process_blur(src, dst, session)
            sys.stdout.write(f"  OK: ref_{i:02d}.jpg\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(f"  FEHLER: {src.name}: {str(e)[:80]}\n")
            sys.stdout.flush()

    # --- Produkte: Hintergrund komplett entfernen ---
    product_imgs = get_images(SRC_PRODUCTS)
    print(f"\nProdukte: {len(product_imgs)} Bilder (Hintergrund entfernen)")
    for i, src in enumerate(product_imgs, 1):
        dst = DST_PRODUCTS / f"produkt_{i:02d}"
        try:
            process_remove(src, dst, session)
            sys.stdout.write(f"  OK: produkt_{i:02d}.jpg\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(f"  FEHLER: {src.name}: {str(e)[:80]}\n")
            sys.stdout.flush()

    print("\nFertig!")

if __name__ == "__main__":
    main()
