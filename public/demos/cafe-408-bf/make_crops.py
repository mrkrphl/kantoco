"""Cafe 408 BF crops. One shared grade ("daylight crema") + light unsharp on every shipped file.
Run from cafe-408-bf/:  python3 crops/make_crops.py
Sources: src/fb/ (their public Facebook photos, downloaded from the CDN URLs in
kantoco-outreach/2026-10-08/contact-sheets/cafe408.json; FB serves them as squares except 00)."""
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np, json, os
P = 'src/fb/'; O = 'crops/'
os.makedirs(O, exist_ok=True)

def shared_grade(im):
    """Identical for every file. Their feed is cool white/concrete; nudge it toward daylight paper (#F2EEE8)
    without going orange: sat x0.93, R x1.025 / B x0.955, small shadow lift, soft shoulder so max out = 242."""
    im = ImageEnhance.Color(im.convert('RGB')).enhance(0.93)
    a = np.asarray(im).astype(np.float32) / 255.0
    a[..., 0] *= 1.025; a[..., 2] *= 0.955
    a = np.clip(a, 0, 1.03)
    x = a + 0.03 * (1 - a) ** 3                     # +~8/255 at black, fades out by midtones
    knee, top = 0.70, 0.95                          # 0.95 = 242/255; keeps cup whites from clipping
    over = np.clip(x - knee, 0, None); span = 1.03 + 0.03 - knee
    shoulder = knee + (top - knee) * (1 - np.exp(-3.0 * over / span)) / (1 - np.exp(-3.0))
    x = np.where(x > knee, shoulder, x)
    return Image.fromarray(np.clip(x * 255 + 0.5, 0, 255).astype(np.uint8))

def sharpen(im):
    """Light unsharp after the resize, before the grade (so the shoulder still caps any halo)."""
    return im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=55, threshold=2))

JOBS = [
 # name, source file, box (l,t,r,b) in source px, export width (never above box width)
 ('plate-16x9',          '00-211425105159240.jpg',  (0, 0, 2046, 1151),    2046),
 ('plate-16x9-1x',       '00-211425105159240.jpg',  (0, 0, 2046, 1151),    1120),
 ('plate-mobile-4x5',    '00-211425105159240.jpg',  (560, 0, 1481, 1151),   921),
 ('counter-1-coffee-1x1','10-1050984287869980.jpg', (0, 0, 998, 998),        896),
 ('counter-2-matcha-1x1','09-1056602400641502.jpg', (200, 280, 1204, 1284),  896),
 ('counter-3-plates-1x1','05-1068233746145034.jpg', (0, 0, 1638, 1638),      896),
 ('counter-4-sandwich-1x1','25-933356076299469.jpg',(0, 0, 1536, 1536),      896),
 ('visit-shadow-2x1',    '11-1050984277869981.jpg', (0, 0, 1080, 540),      1080),
]

meta = {}
for name, src, box, w in JOBS:
    im = Image.open(P + src).convert('RGB').crop(box)
    bw = im.width
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im = shared_grade(sharpen(im))
    im.save(O + name + '.jpg', quality=85, optimize=True, progressive=True)
    im.save(O + name + '.webp', quality=82, method=6)
    a = np.asarray(im); L = 0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2]
    meta[name] = {'src': 'src/fb/' + src, 'fbid': src[3:].split('.')[0], 'box': box, 'out': im.size,
                  'scale': round(im.width / bw, 3), 'max_channel': int(a.max()),
                  'pct_luma_ge_250': round(float((L >= 250).mean() * 100), 3)}
    print(name, meta[name])
json.dump(meta, open(O + 'crops.json', 'w'), indent=1)
