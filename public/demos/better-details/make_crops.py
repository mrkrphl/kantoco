"""Better Details sample: crops + ONE shared grade for every image.
Run from /workspace/kantoco-clients/better-details/:  python3 crops/make_crops.py
Sources: src/NN-big.{jpg,png} downloaded from the FB photo CDN URLs in
/workspace/kantoco-outreach/2026-10-08/contact-sheets/betterdetails.json (NN = index in that json).

shared_grade() = "graphite" grade for a car-film shop (not Alonday's paper grade):
  1. highlight shoulder: soft roll-off above 0.72 so blown bay panels / ceiling lights land <= 236, no clipping
  2. blacks kept deep but not crushed: floor at 7/255, gentle S-curve in the mids for gloss
  3. warmth: highlights +2% R / -2.5% B (keeps white bays from going hospital-blue), shadows neutral
  4. saturation x0.88 except reds (330-20 deg) kept at x1.0 so tail lights and their chevron stay brand red
  5. unsharp mask after resize: radius 1.1, 70%, threshold 2 (light, no halos on panel edges)
No CSS filters on the page: the grade is baked here.
"""
from PIL import Image, ImageFilter
import numpy as np, json, os

S = 'src/'; O = 'crops/'
os.makedirs(O, exist_ok=True)

def shared_grade(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    # 1. highlight shoulder per channel (preserves hue in near-whites)
    k, top = 0.72, 236 / 255
    hi = a > k
    a = np.where(hi, k + (top - k) * (1 - np.exp(-(a - k) / (top - k) * 1.15)), a)
    # 2. floor + gentle S-curve around 0.45
    a = 7 / 255 + a * (1 - 7 / 255)
    a = a + 0.06 * np.sin((a - 0.08) * np.pi / 0.84) * (a > 0.08) * (a < 0.92)
    # 3. warm the highlights only
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    w = np.clip((lum - 0.45) / 0.4, 0, 1)
    a = a * (1 + w * np.array([0.02, 0.0, -0.025]))
    a = np.clip(a, 0, top)
    img = Image.fromarray((a * 255 + .5).astype(np.uint8))
    # 4. saturation x0.88, reds protected
    hsv = np.asarray(img.convert('HSV')).astype(np.float32)
    h = hsv[..., 0] / 255 * 360
    red = np.clip(1 - np.maximum(0, np.minimum(np.abs(h - 355), np.minimum(h + 5, 365 - h)) - 20) / 15, 0, 1)
    red = np.where((h >= 330) | (h <= 20), 1.0, red)
    hsv[..., 1] *= (0.88 + 0.12 * red)
    img = Image.fromarray(hsv.clip(0, 255).astype(np.uint8), 'HSV').convert('RGB')
    # 5. unsharp
    img = img.filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=2))
    # 6. final ceiling: sharpening overshoot and HSV round-trip can poke past the shoulder; cap at 238
    return Image.fromarray(np.minimum(np.asarray(img), 238).astype(np.uint8))

def redact(im, box, src_box):
    """Remove a plate / conduction sticker: clone the glass patch from just below it, feathered edges.
    box is in SOURCE px; converted to crop coords. Result: unreadable, no visible grey block."""
    l, t, r, b = box; ox, oy = src_box[0], src_box[1]
    rb = (l - ox, t - oy, r - ox, b - oy); h = rb[3] - rb[1]
    patch = im.crop((rb[0], rb[3] + 4, rb[2], rb[3] + 4 + h)).filter(ImageFilter.GaussianBlur(2))
    mask = Image.new('L', patch.size, 0); mask.paste(255, (4, 4, patch.width - 4, patch.height - 4))
    im.paste(patch, rb[:2], mask.filter(ImageFilter.GaussianBlur(3))); return im

JOBS = [
 # name,                 source,         box (l,t,r,b) source px, export (w,h), redact boxes (source px)
 ('plate-16x9',          '00-big.png',   (0, 140, 1537, 1004),   (1536, 864), []),   # native: 1537 px is all there is
 ('plate-16x9-1x',       '00-big.png',   (0, 140, 1537, 1004),   (1120, 630), []),
 ('plate-mobile-4x5',    '00-big.png',   (40, 0, 858, 1023),     (816, 1020), []),
 ('svc-2-coating-4x5',   '01-big.jpg',   (200, 0, 1428, 1535),   (896, 1120), []),
 ('svc-1-ppf-4x5',       '28-big.jpg',   (137, 0, 1229, 1366),   (896, 1120), []),
 ('svc-3-tint-4x5',      '02-big.jpg',   (240, 0, 1468, 1535),   (896, 1120), []),
 ('work-1-macan-badge-1x1', '12-big.jpg', (0, 0, 1535, 1535),    (1280, 1280), []),
 ('work-2-macan-front-1x1', '10-big.jpg', (0, 0, 960, 960),      (896, 896),  [(364, 110, 432, 141)]),  # yellow conduction sticker blurred
 ('work-2-macan-front-4x5', '10-big.jpg', (96, 0, 864, 960),     (768, 960),  [(364, 110, 432, 141)]),  # mobile only
]

if __name__ == '__main__':
    meta = {}
    for name, src, box, size, red in JOBS:
        im = Image.open(S + src).convert('RGB').crop(box)
        for rb in red: im = redact(im, rb, box)
        if im.size != size: im = im.resize(size, Image.LANCZOS)
        im = shared_grade(im)
        im.save(O + name + '.jpg', quality=85, optimize=True, progressive=True)
        im.save(O + name + '.webp', quality=82, method=6)
        a = np.asarray(im); L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
        meta[name] = {'src': S + src, 'box': box, 'out': im.size,
                      'scale': round(size[0] / (box[2] - box[0]), 3), 'redact': red,
                      'max_channel': int(a.max()), 'pct_luma_ge_236': round(float((L >= 236).mean() * 100), 3)}
        print(name, meta[name])
    json.dump(meta, open(O + 'crops.json', 'w'), indent=1)
