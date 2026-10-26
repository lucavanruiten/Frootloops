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
index.html                  landing: name + statement, then 3 project cards
projects.html               overview of all 4 projects
project-queer-scene.html    01 "Dutch Queer Scene and its Beauty" — two sub-galleries (queens + queer)
project-restrained.html     02 "Restrained, but couture" — studio series, 6 images
project-escape.html         03 "Escape the Skinner Box" — publication, links out to fliphtml5
project-people.html         04 "People" — portrait gallery
dump.html                   "Visual Diary" (was "Photo Dump") — 36 loose photos as a contact sheet
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

**No templating:** the nav and footer markup are copy-pasted into every page. If you change one, change it in **all 8 content pages × 2 languages (16 files)**, in `404.html` (nav only, no footer, absolute paths), and in `_layouts/blog.html` (root-relative Liquid paths). Grep `class="site-nav"`, `class="site-footer"`.

Nav: brand "Luca van Ruiten" → home; links Work (`projects.html`), Visual Diary (`dump.html`; NL "Visueel dagboek"), Blog (`blog/`, `../blog/` from `nl/`), Contact, and the language switch. Footer: a brand link home (`.footer-brand__link`), Instagram, email, Contact, and a `© <year>` line (year filled in by JS).

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

## Design system

**"White gallery" design** (2026-10-26, the user's choice "B" out of three proposals): white page, black type, thin grey hairlines, photos large and uncropped, no decorative motion. References the user gave: Foam magazine (foam.org/magazine) and Booooooom. The user found the previous dark, animated design "too playful" and wants to be taken seriously; keep it restrained.

Tokens at the top of `css/style.css`: `--bg #fff`, `--bg-raised #f5f5f4` (image placeholders), `--ink #111`, `--ink-soft #6b6b6b` (labels, dates, captions), `--line #e4e4e4` (hairlines), `--accent #c4161c` (red).

- **Fonts (the user's choice, 2026-10-27):** titles in **Cormorant Garamond** (`--display`, weights 500/600: brand, h1–h3, section and card titles, gallery subheads, quotes), text in **Jost** (`--sans`, 400/500). Cormorant is small for its size, so titles are set larger than a sans would be.
- **Red only on hover/focus:** every link turns `--accent` on hover (global `a:hover` rule); a project card's title turns red when the card is hovered; buttons, lightbox controls and focus outlines use it too. Don't use the red for static text or backgrounds.

- **Removed on purpose (don't bring back unasked):** the floating draggable hero photos, the custom cursor, the page loader, scroll fade-ins (`data-reveal`), View Transitions, the spinning footer logo GIF, the dump page's scattered polaroids, orange accent words, the light/dark toggle (2026-10-19) and the marquee (2026-10-19).
- **No italics.** `em` is `font-style:normal` everywhere (inside headings it just looks like the rest of the title). Serifs are fine now, but only Cormorant Garamond for titles.
- **Header:** sticky, white, name left, links right, 1px line underneath. Current page is underlined (`aria-current="page"`). Phones: a full-screen white menu with one link per row.
- **Home:** `.intro` = a featured photo (`.intro__figure`) with the h1 name, role line and statement beside it on ≥1000px. Below 1000px it stacks; on phones (<600px) the order is name + role, then the photo, then the statement (the user wanted text first, but the whole statement before the photo pushed it too far down; `.intro__copy` gets `display:contents` there so its children can be reordered). The photo is a `<picture>` chosen by the user (2026-10-27): landscape `images/covers/home-landscape-1200/1800.webp` (from `images/queens/uncompressed/5.jpg`) on ≥600px, portrait `images/covers/home-portrait-800/1200.webp` (from `images/queer/UNCOMPRESSED/8.webp`) on phones. Same WebP pipeline as the rest (q82, `-sharp_yuv`). Then "Selected work": `.project-card` tiles.
- **Project cards** (`.project-list` / `.project-card`, also the blog overview): equal tiles (the user asked for one size). Every cover sits in the same 4:5 frame with `object-fit:cover`; underneath: label ("01 — Documentary", the same text as the project page eyebrow), title, one sentence, "View project". 3 across from 760px (home, blog), `.project-list--two` = 2 across (projects page, 4 items), 1 on phones. Restrained's cards use `restrained-portrait.webp` (4:5) so the crop fits.
- **Galleries:** `.gallery-grid` = CSS columns, 2 on desktop, 1 below 700px. The `sizes` attributes on the queer/restrained WebP images match that (`(max-width:700px) 92vw, (max-width:1480px) 46vw, 680px`); update them if the column count changes.
- **Closing blocks** ("Next project", "Back to all projects", "Looking for more?"): `.section.band.next-block` (a hairline on top), link via `.btn` (= text with an underline and arrow, not a box) inside `.next-block__action`.
- **Lightbox:** white background, black controls.
- **No sideways scrolling:** `html` and `body` have `overflow-x:clip` (iOS Safari ignores it on `body` alone). Use `clip`, not `hidden`, on `html`.
- **Never use an uncapped `vh`/`dvh` height above the content:** Googlebot renders in a viewport thousands of pixels tall (an uncapped 100dvh hero hid the name 2,500px down in its render in Oct 2026 while the site didn't rank).
- **Cache-busting:** every page loads `css/style.css?v=…` and `js/main.js?v=…` (the date of the last big change, currently `2026-10-27`; 16 pages + `404.html` + `_layouts/blog.html`). GitHub Pages caches for 10 minutes, so after a change that needs CSS and JS to match, bump the version everywhere.
- Reusable pieces: `.page-hero` (+ `.page-hero--split`, cover beside the intro on ≥900px, hidden below), `.back-link`, `.eyebrow` (small grey label), `.section-title`, `.section-lede`, `.project-card`, `.gallery-grid` / `.grid-item`, `.gallery-subhead`, `.gallery-credit`, `.btn`, `.link-underline` (underline on hover), `.text-credit`, `.photo-credit`, `.cv` (contact page lists).

## JS (`js/main.js`)

Deliberately small since the redesign: one IIFE that fills the footer year (`#year`) and, on `DOMContentLoaded`, runs:
- `initNav()` — the phone menu button (`body.nav-open`, `aria-expanded`).
- `initLightbox()` — one lightbox. Every `[data-lightbox-group]` container is its own prev/next sequence. It opens `img[data-full]` (full-res) while the grid shows the compressed `src`. Clicking the image's parent opens it. Keys: Esc, ←, →.

## Pages & content notes

- **Home** shows three project cards: queer scene (01), restrained (02), People (04). Escape (03) appears only on `projects.html`.
- **Project numbering / next-project chain:** 01 queer scene → 02 restrained → 03 escape → 04 people, with a "Back to all projects" block at the end of People. The eyebrow on each project page ("02 — Studio" etc.) carries the number.
- **Queer scene page:** one mixed gallery (merged at the user's request, 2026-10-27; the old "Drag & Performance" and "Scene & Community" sub-galleries are gone): 28 JPEGs from `images/queens` + 20 WebPs from `images/queer`, one lightbox group `queer-scene`. 36 of the 48 are black and white; the user doesn't want many b/w photos next to each other, so the order was chosen by simulating the 2-column layout: the 12 colour photos (queer 1–4, 6–11, 13, 14) sit evenly spaced and staggered between the columns, never more than 3 b/w in a row (in each column and in the phone's single column). If you add or remove photos, re-check that rule (the column split depends on the photos' heights). One `.gallery-credit` "Featuring …" line names everyone photographed; keep it in sync.
- **Restrained, but couture:** the page text was written by drag queen and model **Licka Lolly (Afif Shafit)**; "my drag persona, Licka" refers to Afif, not Luca. It's credited with `.text-credit` and as a JSON-LD `contributor`. Keep the credit, and keep that text verbatim. The Dutch version, card descriptions, meta and alt text were written by Claude.
- **Escape the Skinner Box:** no embedded animation. A `.publication-cta` button links to `https://online.fliphtml5.com/avfef/mepo/`.
- **Contact:** the bio is the user's own writing; apply their edits directly and don't rewrite their voice. The portrait `images/covers/about-portrait.webp` is credited "Photo by Rik Versteeg" (links to rikversteeg.com).
- **Contact details used site-wide:** `info@lucavanruiten.com`, Instagram `@lucavanruiten_photography`.

### Visual Diary page (`dump.html`) — contact sheet

Renamed from "Photo Dump" to "Visual Diary" / "Visueel dagboek" on 2026-10-27 (nav, titles, eyebrow, JSON-LD, alt texts, the projects page link). The URL stays `dump.html` on purpose: it is indexed and the old `messy_grid.html` stubs point at it; changing it would mean another redirect stub. Class names (`.dump-scatter`, `.dump-item`) are historical.

`dump.html` shows 36 `<figure class="dump-item"><img data-full="..."></figure>` in `.dump-scatter` (the class name is historical) as a calm contact sheet: equal square cells, each photo whole and centred (`object-fit:contain`), 6 columns on ≥1000px, fewer below. Fixed order (the old random shuffle and draggable pile were removed in the redesign). Click opens the lightbox.

## Blog

English only, one fixed post format, written by the user through **Pages CMS** (https://app.pagescms.org — sign in with GitHub, pick this repo, choose "Blog"). Built by GitHub Pages' own Jekyll. Set up 2026-09-30.

**How the pieces fit:**
- `.nojekyll` was removed, so Jekyll now builds the site. Files **without front matter** (every hand-written page, CSS, JS, images) are copied unchanged, so the hand-written pages are *not* Jekyll templates. Don't add front matter to them, and don't convert them unless asked. `_config.yml` excludes `CLAUDE.md` so it isn't published (before the blog it was publicly readable at /CLAUDE.md). Dotfiles (`.pages.yml`, `.github/`, `.claude/`) are never published.
- **Post format** (`.pages.yml` ↔ `_layouts/post.html`): `title`, `date`, `cover` (image), `intro` (plain text, also used as the meta description and on the overview), `sections[]` → `{ text: markdown (rich-text), images: 1–4 photos }`. Filenames are `_posts/YYYY-MM-DD-<title-slug>.md`; URLs are `/blog/<title-slug>/` (`permalink: /blog/:title/`). `future: true`, so a post dated later today still appears.
- **Post layout:** eyebrow link back to Blog, title, date, intro, the cover (full width, never taller than 85vh), then each section: text (max 42rem), then its photos. 1 photo = full width; 2 or 3 = one row; 4 = two rows of two. Photos in a row share one height **without cropping** (each `.post-photo` gets `flex-grow` = its aspect ratio via `--ratio`; each row has `--row-ratio` so it never gets taller than 85vh). On phones (≤600px), 3- and 4-photo sections stack full width. All photos in a post, cover included, are one lightbox group. Alt text is automatic ("Photo N from “title”"); the editor has no alt field, to keep posting simple. Then older/newer post links and an "All posts" button.
- **Overview** (`blog/index.html`) reuses `.project-card` (alternating image/text rows) with the date in place of the project number; empty state "The first post is on its way." The heading copy ("Behind the work.") was written by Claude; the user can change it.
- `_layouts/blog.html` is the shell for all blog pages: meta, OG, JSON-LD (`Blog` / `BlogPosting`), RSS link, and copies of the nav and footer (keep them in sync with the hand-written pages). Its language switch goes to `/nl/`, since there's no Dutch blog, and blog pages carry no hreflang.
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
- `images/covers/`: project card and hero covers, plus the homepage photo (`home-landscape-*`, `home-portrait-*`) (`queer-scene.jpg`, `restrained.webp` 4:3, `restrained-portrait.webp` 4:5, `escape.webp`, `people.webp`, `about-portrait.webp`). Made from real photos with `cwebp`. The `*_cover.png` files inside the project folders are near-blank placeholders; don't use them.
- `images/index_animations/web/`: the 12 photos of the old floating hero. Unused since the 2026-10 redesign; kept until the user decides.
- `images/logo_small-optimised.gif`: the old spinning footer logo, unused since the redesign. `images/tab_icon.png`: favicon source.
- `images/blog/`: blog photos — see Blog. Never hand-edit.
- Unused images (old hero JPEGs, `images/about/`, cursor PNGs, logo sources, the 48MB `book_animation.gif`) were deleted on 2026-09-30 at the user's request.

Cover regeneration: `cwebp -q 82 -resize <width> 0 "<source.jpg>" -o "images/covers/<name>.webp"`

## Local dev / verification

`.claude/launch.json` defines `static-site` (`python3 -m http.server 8642`) and `static-site-verify` (port 8643, for when another session already holds 8642). Gotchas:
1. `http.server` sends no cache headers, so the preview browser can serve a stale `main.js` / `style.css`. Append `?cb=N` to the page URL if a change doesn't show.
2. Lazy images may not have loaded in a screenshot; scroll or set `loading="eager"` from the console first.
3. The Python servers can't render the blog (it shows raw Liquid). Jekyll 3.10 is installed for the system Ruby with `--user-install` (`~/.gem/ruby/2.6.0/bin/jekyll`; several dependencies are pinned to old versions for Ruby 2.6). Build into the scratchpad with `~/.gem/ruby/2.6.0/bin/jekyll build --destination <scratch>/_site`, then serve that folder with `python3 -m http.server --directory …`. A launch.json entry running Jekyll directly fails, because the Browser pane's launcher isn't allowed to read ~/Documents (macOS privacy), and Ruby calls `getcwd`. The user can run `jekyll serve` in their own terminal.
4. To test the photo compression, copy the repo to the scratchpad, drop images into `images/blog/uploads/`, and reference them from a test post. Never add test posts or photos to the real repo.

## SEO notes

- As of 2026-10-08 Google had ~22 pages indexed, but the site didn't rank for "Luca van Ruiten" or even "lucavanruiten". The likely cause was the uncapped hero (see Design system), fixed on 2026-10-08. By 2026-10-20 the site was #1 for the name. The homepage + contact JSON-LD now include a `WebSite` block (site name) and `sameAs` links to Instagram, Cherrydeck and Doka Rotterdam.
- Links to a homepage use `./` / `../` / `nl/`, never `index.html` (changed 2026-10-18). `/index.html` is a duplicate URL that Google lists as "Alternative page with proper canonical tag"; internal links should point at the canonical URL.
- Search Console's "Page with redirect" (the old-URL stubs, `www`, `http`) and "Alternative page with proper canonical tag" are **expected, not errors**. Their "validation failed" just means they still redirect, as intended.

## Known issues / open items

1. Only a single `favicon.png`; no apple-touch-icon or manifest.
2. `.DS_Store` is tracked in git and changes in most commits. Consider removing it and adding it to `.gitignore`.
3. Dutch copy that the user hasn't edited is still Claude's translation. The user has postponed a read-through (2026-09-30), so don't raise it again unprompted.
