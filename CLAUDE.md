# Luca van Ruiten — Photography Portfolio

Handoff notes for future sessions. Read this before making changes.

## What this is

Static portfolio site for **Luca van Ruiten**, a queer photographer based in Rotterdam (portrait, studio, analog, social documentary). Plain HTML/CSS/JS, **no framework, no dependencies** — on purpose. The hand-written pages have no build step. The one exception is the **blog**, which uses GitHub Pages' built-in Jekyll plus the Pages CMS web editor so the user can post without touching code (see Blog). Deploying is still just a push to `main`.

- **Hosting:** GitHub Pages, custom domain `lucavanruiten.com` (apex, no `www`; `CNAME` file). DNS at Namecheap has both the apex `A` records and a `www` CNAME, so GitHub redirects `www` → apex. All canonical/hreflang/OG URLs, `sitemap.xml` and `robots.txt` use the apex.
- **Status:** live. The rebuild was committed as "NEW WEBSITE" (2026-09-14) on `main`, with small fixes after. Commit or push only when the user asks.
- **Deploys** run through the `Build and deploy` GitHub workflow (`.github/workflows/deploy.yml`), which requires the repo's Settings → Pages → Source to be **GitHub Actions** (not "Deploy from a branch").
- **Languages:** every page exists in English (root) and Dutch (`nl/`), except the blog, which is English only. See Internationalization.

## Structure

```
index.html                  landing: floating hero photos, marquee, statement, 3 project cards
projects.html               overview of all 4 projects
project-queer-scene.html    01 "Dutch Queer Scene and its Beauty" — two sub-galleries (queens + queer)
project-restrained.html     02 "Restrained, but couture" — studio series, 6 images, 3-column grid
project-escape.html         03 "Escape the Skinner Box" — publication, links out to fliphtml5
project-people.html         04 "People" — portrait gallery
dump.html                   "Photo Dump" — 36 photos scattered as a draggable pile
contact.html                About + contact
blog/index.html             blog overview (Jekyll page) — see Blog
404.html                    root-only (there is no nl/404.html); uses absolute paths so it works at any URL depth
about.html, portfolio.html, queens.html, queer.html, people.html,
escape_s_b.html, messy_grid.html
                            redirect stubs for the OLD site's URLs (see below) — also mirrored in nl/
nl/                         Dutch mirror of all 8 content pages + the 7 redirect stubs
css/style.css               all styles, one file
js/main.js                  all behavior, one file (IIFE)
favicon.png                 copy of images/tab_icon.png
robots.txt, sitemap.xml     sitemap: the 16 content URLs (8 EN + 8 NL) with hreflang alternates, plus the blog
                            and every post (added automatically by Jekyll — sitemap.xml has front matter)
feed.xml                    RSS feed of the blog (Jekyll)
CNAME
_config.yml                 Jekyll config (blog permalinks, excluded files)
_layouts/, _includes/       blog templates: blog.html (page shell), post.html, blog-photo.html
_posts/                     blog posts, one .md per post (written through Pages CMS)
_data/blog_photos.json      dimensions of compressed blog photos (written by the workflow)
.pages.yml                  Pages CMS editor config
.github/workflows/deploy.yml, .github/scripts/optimize_blog_photos.py
                            build + deploy, and blog photo compression
.gitignore                  Jekyll build output
.claude/launch.json         local preview servers (see Local dev)
images/                     see Image assets
```

**No templating:** the page loader, nav and footer markup are copy-pasted into every page. If you change one, change it in **all 8 content pages × 2 languages (16 files)**, in `404.html` (loader and nav, no footer, absolute paths), and in `_layouts/blog.html` (root-relative Liquid paths). Grep `class="page-loader"`, `class="site-nav"`, `class="site-footer"`.

Nav: brand "Luca van Ruiten" → home; links Work (`projects.html`), Dump, Blog (`blog/`, `../blog/` from `nl/`), Contact, and the language switch. Footer: animated logo GIF, a brand link home (`.footer-brand__link`), Instagram, email, Contact, and a `© <year>` line (year filled in by JS).

### Redirect stubs (old URLs)

The previous site used different filenames. Each old filename is kept as a tiny page that forwards to its new equivalent via `<meta http-equiv="refresh" content="0">` + `location.replace()`, with a `rel="canonical"` to the target. GitHub Pages can't send real 301s, and Google treats an instant meta refresh as permanent. Mapping (the same in `nl/`, pointing at the `nl/` targets):

| old | → new |
|---|---|
| about.html | contact.html |
| portfolio.html | projects.html |
| queens.html, queer.html | project-queer-scene.html |
| people.html | project-people.html |
| escape_s_b.html | project-escape.html |
| messy_grid.html | dump.html |

Don't add these to `sitemap.xml`, and don't delete them. They keep old links and search results working.

## Internationalization (EN / NL)

- `nl/` holds a full, separately crawlable copy of every page (needed for SEO; Google indexes language versions by URL). Dutch pages reference shared assets one level up (`../css/style.css`, `../js/main.js`, `../images/...`). Links between Dutch pages stay inside `nl/`.
- **Language switcher:** a `.lang-switch` link ("NL" / "EN", with `hreflang` + `lang` attributes) at the end of `.nav-links`, pointing at the exact counterpart page.
- **Every content page carries:** meta description, author, robots (`index, follow`; the 404 page is `noindex, follow`), a self-referencing canonical, `hreflang` alternates for `en`, `nl` and `x-default` (x-default = the English URL), Open Graph (`og:locale` `en_NL` / `nl_NL`), Twitter card tags, and JSON-LD (`Person` on index/contact, `CollectionPage` on projects, `ImageGallery` on the gallery pages and dump, `Book` on escape; restrained adds a `contributor`).
- **Adding a page** means: an EN page + an NL page, switcher links both ways, canonical/hreflang on both, two `sitemap.xml` entries with alternates, and nav/footer links if it's a main section.
- Dutch copy was originally translated by Claude. The user has since edited some of it themselves (e.g. `nl/contact.html`). The user's own wording is authoritative, in either language.
- JS-generated UI text (the theme toggle label) is English on both language versions.

## Design system

All colors are CSS variables at the top of `css/style.css`. Retheming normally means changing just two:

```css
:root{
  --bg: #040000;      /* dark by default */
  --accent: #fa550e;  /* orange */
  /* --bg-raised, --accent-deep, --accent-soft are derived with color-mix() */
}
```

- **Light mode** (`html.light-mode`, near the bottom of `style.css`) restores the original warm palette (`--bg:#f6f2ec`, `--ink:#1e1a17`) but **hardcodes its own accent `#ff46ac` (pink)**. Switching to light mode therefore also changes the accent from orange to pink. **This is intended** (confirmed by the user, 2026-09-30); don't make light mode follow `:root`'s accent.
- **Fonts:** Space Grotesk (headlines, labels, nav) + Inter (body), via a Google Fonts `@import`. The user rejected serifs: don't add serif or italic styling.
- **No italics anywhere.** `<em>` in headings (`.hero-name em`, `.section-title em`) is styled `font-style:normal` in the accent color + bold. That's the site's emphasis style.
- **Page transitions:** native View Transitions API (`<meta name="view-transition" content="same-origin">` in each `<head>` + the `lvr-page-out` / `lvr-page-in` keyframes). No JS; unsupported browsers just navigate normally.
- **Page loader** (`.page-loader`, the first element in `<body>`): text + CSS only, so it appears instantly even on a slow connection, and hides on `window.load`.
- **Custom cursor:** dot + ring, `mix-blend-mode:difference`, only on `(hover:hover) and (pointer:fine)`. There the native cursor is hidden (`*{cursor:none !important}`). Touch devices keep the system cursor.
- **Hero height is capped** (`min(100dvh, 1400px)`, `950px` on phones). Googlebot renders pages in a viewport thousands of pixels tall. With a plain `100dvh` hero, Google's render (Search Console → URL Inspection → screenshot, 2026-10-08) showed an empty black page with the name 2,500px down, while the site wasn't ranking even for "Luca van Ruiten". Never use an uncapped `vh`/`dvh` height for anything above the content.
- The fixed `.site-nav` also relies on `mix-blend-mode:difference` for legibility. That's why hero photos are kept out from behind it (see JS).
- Reusable pieces: `.page-hero` (+ `.page-hero--split` with `__copy` / `__figure`, which puts a cover image beside the intro on ≥900px and hides it below that), `.section-title`, `.section-lede`, `.eyebrow`, `.project-card`, `.gallery-grid` (CSS-columns masonry: 4 → 3 → 2 → 1 columns; `.gallery-grid--three` = 3 columns on desktop), `.grid-item`, `.btn` / `.btn--accent`, `.link-underline`, `.band` (raised background section), `.text-credit`, `.gallery-credit`, `.photo-credit`, `[data-reveal]`.

## JS (`js/main.js`)

One IIFE. `siteBase` is derived from the script's own URL at load, so the asset paths JS builds (the hero photos) work from root pages, `nl/` pages and `file://`. Use it for any new JS-built asset path, rather than hardcoding a path from the site root or relative to the page.

Init order on `DOMContentLoaded`: `initPageLoader`, `initShuffle`, `initDumpScatter`, `initCursor`, `initNav`, `initReveal`, `initHeroImages`, `initHeroFloat`, `initLightbox`, `initThemeToggle`.

- `initPageLoader()` — hides the loader on `load`, with a 400ms minimum display time and a 5s safety timeout.
- `initCursor()` — hover targets are `a, button, .grid-item, [data-cursor]`. `data-cursor="Label"` shows a label in the ring.
- `initNav()` — hides the nav on scroll-down; mobile hamburger (`body.nav-open`).
- `initReveal()` — IntersectionObserver fade-up for `[data-reveal]`, staggered per parent.
- `initHeroImages()` — **generates** the landing-page hero photos (`.hero-float` is empty in the HTML). Constants at the top: `HERO_IMAGE_COUNT_DESKTOP` (currently 12) and `HERO_IMAGE_COUNT_MOBILE` (currently 9), both **experimentation knobs the user changes themselves** (check the file rather than trusting this number), plus `HERO_PORTRAIT_COUNT = 8` / `HERO_LANDSCAPE_COUNT = 4` and `HERO_MOBILE_BREAKPOINT = 780`. Photos come from `images/index_animations/web/portrait-1..8.webp` (600×900) and `landscape-1..4.webp` (900×600). Each frame draws from the pool matching its shape, so photos are never cropped the wrong way. Placement is a jittered loose grid, pushed out of a keep-clear box measured from the real `.hero-content`, and clamped below the nav's bottom edge. To add hero photos, keep them exactly 2:3 or 3:2 and bump the matching count.
- `initHeroFloat()` — physics for the hero photos: organic wander, a spring back to the resting spot (`maxRadius`), darting away from the cursor, drag-and-throw, a continuous push away from the name/subtitle box, and a push down out from behind the nav. The tunables are at the top of the function (the user has asked for tuning several times; adjust constants, don't rewrite). **On phones** it's deliberately calmer: a smaller radius and wander, and the text push is off (mobile photos are semi-transparent via `.float-img--mobile`, so they may drift behind the name). `.hero-float` has `isolation:isolate` so a dragged photo (`z-index:5`) can never render above `.hero-content`; don't remove it. Reduced motion: no wander, drag still works.
- `initLightbox()` — one lightbox. Every `[data-lightbox-group]` container is its own prev/next sequence. It opens `img[data-full]` (full-res) while the grid shows the compressed `src`. Keys: Esc, ←, →.
- `initShuffle()` + `initDumpScatter()` — see Dump page. The shuffle must run before the scatter.
- `initThemeToggle()` — injects the floating `.theme-toggle` pill (bottom-right) and stores `lvr-theme` = `"light"` / `"dark"` in localStorage.

## Pages & content notes

- **Home** shows three project cards: 01 queer scene, 02 restrained, 03 People (Escape appears only on `projects.html`).
- **Project numbering / next-project chain:** 01 queer scene → 02 restrained → 03 escape → 04 people, with a "Back to all projects" block at the end of People. The eyebrow on each project page ("02 — Studio" etc.) carries the number.
- **Queer scene page:** two sub-galleries, "Drag & Performance" (`images/queens`, JPEG) and "Scene & Community" (`images/queer`, 20 WebP photos with descriptive alt text). Each has a `.gallery-credit` "Featuring …" line naming the people photographed; keep those in sync if you add or remove photos. Don't merge the two grids without asking.
- **Restrained, but couture:** the page text was written by drag queen and model **Licka Lolly (Afif Shafit)**; "my drag persona, Licka" refers to Afif, not Luca. It's credited with `.text-credit` and as a JSON-LD `contributor`. Keep the credit, and keep that text verbatim. The Dutch version, card descriptions, meta and alt text were written by Claude.
- **Escape the Skinner Box:** no embedded animation. A `.publication-cta` button links to `https://online.fliphtml5.com/avfef/mepo/`.
- **Contact:** the bio is the user's own writing; apply their edits directly and don't rewrite their voice. The portrait `images/covers/about-portrait.webp` is credited "Photo by Rik Versteeg" (links to rikversteeg.com).
- **Contact details used site-wide:** `info@lucavanruiten.com`, Instagram `@lucavanruiten_photography`.

### Dump page — scattered pile

`dump.html` is deliberately chaotic (the user: the rest of the site is neat, the dump can be messy). `.dump-scatter` holds 36 `<figure class="dump-item"><img data-full="..."></figure>`.
- On every load, `initShuffle()` randomizes the DOM order, then `initDumpScatter()` gives each item a random size, aspect ratio, jittered grid position, rotation (±13°) and z-index, written as inline styles (rotation goes through the `--r` custom property, so `.dump-item:hover` can straighten it in CSS). There are three size tiers (<480, <780, desktop). There's no seed and no recompute on resize.
- Every item is drag-and-throw, clamped to the stage, and coasts to a stop on its own short `requestAnimationFrame` loop; there's no idle animation. A dropped item goes on top (`topZ` counter starting at 100, below the nav's 500). A drag past 6px sets `data-suppress-click` so the lightbox doesn't open.
- Polaroid-frame look: `--frame-bg`, `--frame-shadow`, `--frame-shadow-hover` in `:root` and in `html.light-mode`. Keep both in sync.

## Blog

English only, one fixed post format, written by the user through **Pages CMS** (https://app.pagescms.org — sign in with GitHub, pick this repo, choose "Blog"). Built by GitHub Pages' own Jekyll. Set up 2026-09-30.

**How the pieces fit:**
- `.nojekyll` was removed, so Jekyll now builds the site. Files **without front matter** (every hand-written page, CSS, JS, images) are copied unchanged, so the hand-written pages are *not* Jekyll templates. Don't add front matter to them, and don't convert them unless asked. `_config.yml` excludes `CLAUDE.md` so it isn't published (before the blog it was publicly readable at /CLAUDE.md). Dotfiles (`.pages.yml`, `.github/`, `.claude/`) are never published.
- **Post format** (`.pages.yml` ↔ `_layouts/post.html`): `title`, `date`, `cover` (image), `intro` (plain text, also used as the meta description and on the overview), `sections[]` → `{ text: markdown (rich-text), images: 1–4 photos }`. Filenames are `_posts/YYYY-MM-DD-<title-slug>.md`; URLs are `/blog/<title-slug>/` (`permalink: /blog/:title/`). `future: true`, so a post dated later today still appears.
- **Post layout:** eyebrow link back to Blog, title, date, intro, the cover (full width, never taller than 85vh), then each section: text (max 42rem), then its photos. 1 photo = full width; 2 or 3 = one row; 4 = two rows of two. Photos in a row share one height **without cropping** (each `.post-photo` gets `flex-grow` = its aspect ratio via `--ratio`; each row has `--row-ratio` so it never gets taller than 85vh). On phones (≤600px), 3- and 4-photo sections stack full width. All photos in a post, cover included, are one lightbox group. Alt text is automatic ("Photo N from “title”"); the editor has no alt field, to keep posting simple. Then older/newer post links and an "All posts" button.
- **Overview** (`blog/index.html`) reuses `.project-card` (alternating image/text rows) with the date in place of the project number; empty state "The first post is on its way." The heading copy ("Behind the work.") was written by Claude; the user can change it.
- `_layouts/blog.html` is the shell for all blog pages: meta, OG, JSON-LD (`Blog` / `BlogPosting`), RSS link, and copies of the loader, nav and footer (keep them in sync with the hand-written pages). Its language switch goes to `/nl/`, since there's no Dutch blog, and blog pages carry no hreflang.
- `sitemap.xml` and `feed.xml` add posts automatically.

**Photo pipeline:** Pages CMS uploads originals untouched to `images/blog/uploads/` (`rename: random`). On every push to `main`, the workflow runs `.github/scripts/optimize_blog_photos.py` if that folder has files. For each upload referenced by a post, the script writes `images/blog/<post-slug>/<name>.webp` (2400px long edge, q82) + `<name>-1600.webp` + `<name>-800.webp` (q78; EXIF rotation applied; camera/GPS metadata stripped; `-sharp_yuv`), rewrites the post to point at `<name>.webp`, records `[width, height]` in `_data/blog_photos.json`, deletes the original, and commits "Compress blog photos" back to `main`. Then it builds and deploys, so compressed photos are what go live. Uploads no post references yet are left alone, because Pages CMS commits an upload before the post is saved. `_includes/blog-photo.html` builds the `srcset` from that naming convention, and falls back to the raw file for a photo that hasn't been processed yet (only happens locally).

Known trade-offs: originals still pass through git history (Pages CMS commits them before compression), so the repo grows by roughly the original file sizes per post. Big straight-from-camera files work but bloat the history, so exporting at ~3000px before uploading is kinder. Unused entries in `blog_photos.json` are harmless.

## Image assets

Folder casing is inconsistent on purpose (`compressed` / `COMPRESSED` / the typo `people/COMOPRESSED`). **Don't rename anything.** When adding images, match the casing that folder already uses (`ls` first).

| folder | thumbnails (`src`) | full-res (`data-full`) | format |
|---|---|---|---|
| `images/queens/` | `compressed/N.jpg` | `uncompressed/N.jpg` | JPEG |
| `images/people/` | `COMOPRESSED/N.jpg` | `UNCOMPRESSED/N.jpg` | JPEG |
| `images/messy_grid/` (dump) | `COMPRESSED/N.jpg` | `UNCOMPRESSED/N.jpg` | JPEG |
| `images/queer/` | `COMPRESSED/N-480/800/1200.webp` | `UNCOMPRESSED/N.webp` | WebP + srcset |
| `images/restrained/` | `compressed/N-480/800/1200.webp` | `uncompressed/N.webp` | WebP + srcset |

**WebP convention (use for all new images):** three width variants (480/800/1200, q78). The `<img>` gets `src` = the 800 version, a `srcset` of all three, a `sizes` value matching the masonry breakpoints, and `width`/`height` of the 800 version (`.grid-item img{height:auto}` makes that safe). The lightbox version has a 2400px long edge (q82). Pipeline: decode → `ImageOps.exif_transpose` → LANCZOS resize → `cwebp -q <q> -m 6 -sharp_yuv -metadata none`. `-sharp_yuv` matters: the saturated red/blue work smears without it. The user's full-res originals are kept **outside the repo**; never commit or reference them.

Other images:
- `images/covers/`: project card and hero covers (`queer-scene.jpg`, `restrained.webp` 4:3, `restrained-portrait.webp` 4:5, `escape.webp`, `people.webp`, `about-portrait.webp`). Made from real photos with `cwebp`. The `*_cover.png` files inside the project folders are near-blank placeholders; don't use them.
- `images/index_animations/web/`: the 12 hero photos.
- `images/logo_small-optimised.gif`: footer logo. `images/tab_icon.png`: favicon source.
- `images/blog/`: blog photos — see Blog. Never hand-edit.
- Unused images (old hero JPEGs, `images/about/`, cursor PNGs, logo sources, the 48MB `book_animation.gif`) were deleted on 2026-09-30 at the user's request.

Cover regeneration: `cwebp -q 82 -resize <width> 0 "<source.jpg>" -o "images/covers/<name>.webp"`

## Local dev / verification

`.claude/launch.json` defines `static-site` (`python3 -m http.server 8642`) and `static-site-verify` (port 8643, for when another session already holds 8642). Gotchas:
1. `http.server` sends no cache headers, so the preview browser can serve a stale `main.js` / `style.css`. Append `?cb=N` to the page URL if a change doesn't show.
2. `[data-reveal]` content is `opacity:0` until scrolled into view, so wait or scroll before judging a screenshot.
3. The Python servers can't render the blog (it shows raw Liquid). Jekyll 3.10 is installed for the system Ruby with `--user-install` (`~/.gem/ruby/2.6.0/bin/jekyll`; several dependencies are pinned to old versions for Ruby 2.6). Build into the scratchpad with `~/.gem/ruby/2.6.0/bin/jekyll build --destination <scratch>/_site`, then serve that folder with `python3 -m http.server --directory …`. A launch.json entry running Jekyll directly fails, because the Browser pane's launcher isn't allowed to read ~/Documents (macOS privacy), and Ruby calls `getcwd`. The user can run `jekyll serve` in their own terminal.
4. To test the photo compression, copy the repo to the scratchpad, drop images into `images/blog/uploads/`, and reference them from a test post. Never add test posts or photos to the real repo.

## SEO notes

- As of 2026-10-08 Google had ~22 pages indexed, but the site didn't rank for "Luca van Ruiten" or even "lucavanruiten". The likely cause was the uncapped hero (see Design system), fixed on 2026-10-08. The homepage + contact JSON-LD now include a `WebSite` block (site name) and `sameAs` links to Instagram, Cherrydeck and Doka Rotterdam.
- Search Console's "Page with redirect" (the old-URL stubs, `www`, `http`) and "Alternative page with proper canonical tag" are **expected, not errors**. Their "validation failed" just means they still redirect, as intended.

## Known issues / open items

1. Only a single `favicon.png`; no apple-touch-icon or manifest.
2. `.DS_Store` is tracked in git and changes in most commits. Consider removing it and adding it to `.gitignore`.
3. Dutch copy that the user hasn't edited is still Claude's translation. The user has postponed a read-through (2026-09-30), so don't raise it again unprompted.
