#!/usr/bin/env python3
"""Compress blog photos uploaded through Pages CMS.

Pages CMS stores uploads untouched in images/blog/uploads/. For every upload that a
post in _posts/ refers to, this script writes three WebP versions to
images/blog/<post-slug>/:

    <name>.webp        long edge 2400px (lightbox / full size)
    <name>-1600.webp   1600px wide
    <name>-800.webp    800px wide

It then points the post at <name>.webp, records the full-size dimensions in
_data/blog_photos.json (used by the templates for width/height and row layout),
and deletes the original upload. Uploads that no post refers to yet are left alone:
Pages CMS commits an upload before the post itself is saved.

Same pipeline as the rest of the site: EXIF orientation applied, LANCZOS resize,
cwebp -m 6 -sharp_yuv -metadata none (strips camera and GPS data).

Needs Pillow (+ pillow-heif for iPhone HEIC files, optional) and cwebp on PATH.
Run from the repository root.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

ROOT = Path.cwd()
POSTS = ROOT / "_posts"
OUT_ROOT = ROOT / "images" / "blog"
DATA_FILE = ROOT / "_data" / "blog_photos.json"

FULL_EDGE = 2400
WIDTHS = (1600, 800)
QUALITY_FULL = 82
QUALITY_VARIANT = 78

UPLOAD_RE = re.compile(
    r"/?images/blog/uploads/[^\n\"'\]\[,]+?\.(?:jpe?g|png|webp|heic|heif|tiff?|avif)(?![A-Za-z0-9])",
    re.IGNORECASE,
)


def slugify(text):
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text or "photo"


def post_slug(post_path):
    # 2026-10-01-my-post.md -> my-post
    return re.sub(r"^\d{4}-\d{2}-\d{2}-", "", post_path.stem)


def cwebp(png_path, out_path, quality):
    subprocess.run(
        ["cwebp", "-quiet", "-q", str(quality), "-m", "6", "-sharp_yuv",
         "-metadata", "none", str(png_path), "-o", str(out_path)],
        check=True,
    )


def process(upload, out_dir, name):
    """Write the three WebP versions; return (width, height) of the full-size one."""
    out_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(upload) as im:
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        full = im.copy()
        full.thumbnail((FULL_EDGE, FULL_EDGE), Image.LANCZOS)  # never upscales
        versions = [(full, out_dir / f"{name}.webp", QUALITY_FULL)]
        for w in WIDTHS:
            v = im.copy()
            if v.width > w:
                v = v.resize((w, round(v.height * w / v.width)), Image.LANCZOS)
            versions.append((v, out_dir / f"{name}-{w}.webp", QUALITY_VARIANT))
        with tempfile.TemporaryDirectory() as tmp:
            for img, out, q in versions:
                png = Path(tmp) / "frame.png"
                img.save(png)
                cwebp(png, out, q)
        return full.width, full.height


def main():
    if not POSTS.is_dir():
        return 0
    data = json.loads(DATA_FILE.read_text()) if DATA_FILE.exists() else {}
    done = {}          # upload path (normalised) -> new public path
    to_delete = set()
    changed_posts = 0

    for post in sorted(POSTS.glob("*.md")):
        text = post.read_text(encoding="utf-8")
        matches = sorted(set(UPLOAD_RE.findall(text)), key=len, reverse=True)
        if not matches:
            continue
        slug = post_slug(post)
        out_dir = OUT_ROOT / slug
        new_text = text
        for ref in matches:
            rel = ref.lstrip("/")
            upload = ROOT / rel
            if rel not in done:
                if not upload.is_file():
                    print(f"! {post.name}: {ref} not found, skipped", file=sys.stderr)
                    continue
                name = slugify(upload.stem)
                i = 2
                while (out_dir / f"{name}.webp").exists():
                    name = f"{slugify(upload.stem)}-{i}"
                    i += 1
                width, height = process(upload, out_dir, name)
                public = f"/images/blog/{slug}/{name}.webp"
                data[public] = [width, height]
                done[rel] = public
                to_delete.add(upload)
                print(f"✓ {rel} -> {public} ({width}×{height})")
            new_text = new_text.replace(ref, done[rel])
        if new_text != text:
            post.write_text(new_text, encoding="utf-8")
            changed_posts += 1

    for upload in to_delete:
        upload.unlink()

    if done:
        DATA_FILE.parent.mkdir(exist_ok=True)
        DATA_FILE.write_text(json.dumps(dict(sorted(data.items())), indent=2) + "\n")
    print(f"{len(done)} photo(s) optimised, {changed_posts} post(s) updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
