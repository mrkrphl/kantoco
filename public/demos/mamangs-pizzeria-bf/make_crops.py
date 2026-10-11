"""Mamang's Pizzeria BF Homes: crops + ONE shared grade ("oven grade") for every shipped photo.
Run from mamangs-pizzeria-bf/:  python3 crops/make_crops.py
Order per file: crop -> resize (LANCZOS) -> unsharp mask -> oven_grade() last, so sharpening halos
cannot push past the highlight shoulder. Outputs JPG q85 (progressive) + WebP q82 and crops.json."""
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np, json, os
S = 'src/'; O = 'crops/'
os.makedirs(O, exist_ok=True)

def oven_grade(im):
    """Identical for every file. Warm, appetite-led, no clipped highlights.
    sat x1.06 (food reads, not neon) | warm: R x1.035, G x1.005, B x0.92 |
    gentle S-curve around 0.5 (+6% midtone contrast) | shadow floor lifted +6/255 so char
    blacks do not crush into the page --char | highlight shoulder from 0.70, max out 0.93 (237/255)."""
    im = ImageEnhance.Color(im.convert('RGB')).enhance(1.06)
    a = np.asarray(im).astype(np.float32) / 255.0
    a[..., 0] *= 1.035; a[..., 1] *= 1.005; a[..., 2] *= 0.92
    a = np.clip(a, 0, 1.06)
    a = a + 0.06 * (a - 0.5) * (1 - np.abs(2 * a - 1).clip(0, 1))      # soft S-curve, zero at 0 and 1
    a = a + 0.024 * (1 - a).clip(0, 1) ** 4                              # shadow floor
    knee, top = 0.70, 0.93
    over = np.clip(a - knee, 0, None); span = 1.10 - knee
    sh = knee + (top - knee) * (1 - np.exp(-3.0 * over / span)) / (1 - np.exp(-3.0))
    a = np.where(a > knee, sh, a)
    return Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8))

def sharpen(im, scale):
    """Light unsharp mask. Downsampled files (scale < 0.6) get less, native-size phone files a touch more."""
    if scale < 0.6: return im.filter(ImageFilter.UnsharpMask(radius=0.8, percent=45, threshold=3))
    return im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=60, threshold=3))

JOBS = [
 # name, source file, box (l,t,r,b) in source px, export size (2x of the largest CSS box), source credit key
 ('plate-pizza-1x1',        'maps-02.jpg', (626, 75, 3506, 2955),  (1400, 1400), 'maps-liza'),   # circle r=1440 at the pie centre (2066,1515): edge sits inside the crust, no table shows; 640 css @2x = 1280
 ('plate-pizza-1x1-1x',     'maps-02.jpg', (626, 75, 3506, 2955),  (700, 700),   'maps-liza'),
 ('table-lasagna-6x5',      'fb-07.jpg',   (0, 0, 1254, 1045),     (1254, 1045), 'fb'),          # 640x533 css; 1254 = 1.96x
 ('table-pepperoni-3x2',    'fb-04.jpg',   (0, 533, 1000, 1200),   (1000, 667),  'fb'),          # 448x299 css; 1000 = 2.2x
 ('group-spread-4x5',       'fb-19.jpg',   (0, 0, 1152, 1440),     (1152, 1440), 'fb'),          # 544x680 css; 1152 = 2.1x
 ('visit-storefront-4x5',   'maps-09.jpg', (0, 650, 1880, 3000),   (1200, 1500), 'maps-vheneth'),# 448x560 css; 1200 = 2.7x
]

if __name__ == '__main__':
    meta = {}
    for name, src, box, size, credit in JOBS:
        im = Image.open(S + src).convert('RGB').crop(box)
        scale = size[0] / (box[2] - box[0])
        if im.size != size: im = im.resize(size, Image.LANCZOS)
        im = sharpen(im, scale)
        im = oven_grade(im)
        im.save(O + name + '.jpg', quality=85, optimize=True, progressive=True)
        im.save(O + name + '.webp', quality=82, method=6)
        a = np.asarray(im); Lm = 0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2]
        meta[name] = {'src': 'src/' + src, 'box': box, 'out': list(im.size), 'scale': round(scale, 3), 'credit': credit,
                      'max_channel': int(a.max()), 'pct_luma_ge_250': round(float((Lm >= 250).mean() * 100), 3),
                      'kb_jpg': os.path.getsize(O + name + '.jpg') // 1024, 'kb_webp': os.path.getsize(O + name + '.webp') // 1024}
        print(name, meta[name])
    json.dump(meta, open(O + 'crops.json', 'w'), indent=1)
