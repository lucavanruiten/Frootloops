/* Luca van Ruiten — Photography Portfolio — interactions */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  // Site root, derived from this script's own URL (e.g. ".../js/main.js" -> ".../").
  // Captured synchronously here (document.currentScript is only reliable during
  // the script's initial execution, not later inside a DOMContentLoaded callback)
  // so asset paths built from it work regardless of how deep the current page
  // sits (root pages, nl/ pages, a subpath deploy) or whether it's opened over
  // file:// directly rather than a server — a root-relative "/images/..." path
  // resolves against the filesystem root under file://, which breaks silently.
  const siteBase = document.currentScript
    ? document.currentScript.src.replace(/js\/main\.js(\?.*)?$/, "")
    : "";

  document.documentElement.classList.add("js");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------- page loader */
  function initPageLoader(){
    const loader = document.querySelector(".page-loader");
    if (!loader) return;

    const minDuration = 400; // avoid a flash-then-hide on fast connections
    const start = performance.now();
    let hidden = false;

    function hide(){
      if (hidden) return;
      hidden = true;
      const wait = Math.max(0, minDuration - (performance.now() - start));
      setTimeout(() => {
        loader.classList.add("is-hidden");
        loader.addEventListener("transitionend", () => loader.remove(), { once: true });
      }, wait);
    }

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    setTimeout(hide, 5000); // safety net in case a resource never settles
  }

  /* -------------------------------------------------- custom cursor */
  function initCursor(){
    if (!canHover) return;
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    const ringLabel = document.createElement("span");
    ring.appendChild(ringLabel);
    document.body.append(dot, ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    }, { passive: true });

    function loop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    const hoverables = document.querySelectorAll("a, button, .grid-item, [data-cursor]");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-active");
        ringLabel.textContent = el.getAttribute("data-cursor") || "";
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-active");
      });
    });
  }

  /* -------------------------------------------------- nav */
  function initNav(){
    const nav = document.querySelector(".site-nav");
    if (!nav) return;
    let lastY = window.scrollY;

    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (document.body.classList.contains("nav-open")) { lastY = y; return; }
      if (y > lastY && y > 160) nav.classList.add("nav-hidden");
      else nav.classList.remove("nav-hidden");
      lastY = y;
    }, { passive: true });

    const toggle = document.querySelector(".nav-toggle");
    if (toggle){
      toggle.addEventListener("click", () => {
        document.body.classList.toggle("nav-open");
      });
      document.querySelectorAll(".nav-links a").forEach((a) => {
        a.addEventListener("click", () => document.body.classList.remove("nav-open"));
      });
    }
  }

  /* -------------------------------------------------- scroll reveal */
  function initReveal(){
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)){
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const groups = new Map();
    items.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((list) => {
      list.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i, 10) * 55}ms`;
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------- hero image generation */
  // Experimental knob: how many photos float on the landing-page hero.
  // Desktop and mobile are deliberately separate — the same big number on a
  // phone screen gets cramped fast. The source photos (8 portrait + 4 landscape,
  // from Dutch Queer Scene and its Beauty) are looped to fill whatever count you
  // set; at 12 on desktop every photo shows exactly once.
  const HERO_PORTRAIT_COUNT = 8;   // images/index_animations/web/portrait-1..8.webp  (600×900)
  const HERO_LANDSCAPE_COUNT = 4;  // images/index_animations/web/landscape-1..4.webp (900×600)
  const HERO_IMAGE_COUNT_DESKTOP = 12;
  const HERO_IMAGE_COUNT_MOBILE = 9;
  const HERO_MOBILE_BREAKPOINT = 780; // matches this page's other mobile breakpoints

  function initHeroImages(){
    const hero = document.querySelector(".hero-float");
    if (!hero) return;

    // Two shuffled pools, so a landscape photo never gets squeezed into a tall
    // frame (or the reverse) — each frame draws from the pool matching its shape
    const shuffled = (kind, length) => {
      const list = Array.from({ length }, (_, i) => `${siteBase}images/index_animations/web/${kind}-${i + 1}.webp`);
      for (let i = list.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    };
    const portraits = shuffled("portrait", HERO_PORTRAIT_COUNT);
    const landscapes = shuffled("landscape", HERO_LANDSCAPE_COUNT);
    let portraitIndex = 0, landscapeIndex = 0;

    const isMobile = window.innerWidth <= HERO_MOBILE_BREAKPOINT;
    const count = isMobile ? HERO_IMAGE_COUNT_MOBILE : HERO_IMAGE_COUNT_DESKTOP;

    // a loose grid of resting spots (wider than tall, like the hero itself),
    // each nudged with random jitter so it doesn't read as a rigid grid —
    // same idea as the dump page's scatter, tuned for a lighter, airier hero
    const cols = Math.max(1, Math.round(Math.sqrt(count * 1.7)));
    const rows = Math.ceil(count / cols);
    const cellW = 100 / cols;
    const cellH = 100 / rows;

    // keep a clear band down the middle for the name/subtitle — the original
    // hand-placed f1..f9 images were positioned to leave this gap rather than
    // covering it, and a plain grid across the full 0-90% range loses that.
    // Rather than just steering the grid cell away from this box (which a
    // wide image or a large jitter step can still poke into), each image's
    // actual footprint is checked against it below and pushed clear if needed
    // — a guarantee, not just a statistical tendency. The box itself is
    // measured from the real .hero-content element rather than guessed as a
    // fixed percentage: a hardcoded box was tried first and came out
    // narrower than the actual text (the name's font-size is clamped and
    // stops growing past a wide viewport, but that only made the mismatch
    // worse) — measuring it directly is correct at any viewport size and
    // survives future copy changes.
    let keepClear = { top: 28, bottom: 72, left: 28, right: 72 }; // fallback if .hero-content is missing
    const heroEl = document.querySelector(".hero");
    const contentEl = document.querySelector(".hero-content");
    if (heroEl && contentEl){
      const heroRect = heroEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();
      const pad = 4; // extra breathing room, in percentage points of the hero's own size
      keepClear = {
        top: Math.max(0, ((contentRect.top - heroRect.top) / heroRect.height) * 100 - pad),
        bottom: Math.min(100, ((contentRect.bottom - heroRect.top) / heroRect.height) * 100 + pad),
        left: Math.max(0, ((contentRect.left - heroRect.left) / heroRect.width) * 100 - pad),
        right: Math.min(100, ((contentRect.right - heroRect.left) / heroRect.width) * 100 + pad),
      };
    }

    const sizeTemplates = isMobile
      ? [[26, 2 / 3], [24, 3 / 2], [22, 1]]
      : [[17, 2 / 3], [13, 2 / 3], [18, 3 / 2], [14, 2 / 3], [15, 2 / 3], [12, 2 / 3], [13, 3 / 2], [18, 3 / 2], [11, 2 / 3]];

    // .site-nav is position:fixed and reads its color via mix-blend-mode:difference
    // (see initCursor()'s comment on the same trick for why — it's what keeps the
    // nav legible against both themes and any photo without hardcoding a color for
    // each). That only holds up if the strip directly behind the nav is the plain
    // hero background; a photo there makes the blended color unpredictable per
    // pixel instead of a clean invert, reading as muddy/low-contrast. .hero-float
    // covers the full hero including that strip (padding-top on .hero only shifts
    // .hero-content, not this absolutely-positioned layer), so nothing here stopped
    // an image from landing at top:0% until now — this measures the nav's real
    // rendered height and keeps every image's top edge below it, the same
    // "guarantee, not a statistical tendency" approach as the text keep-clear box.
    let navBottomPct = 0;
    const navEl = document.querySelector(".site-nav");
    if (heroEl && navEl){
      const heroRect = heroEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      navBottomPct = ((navRect.bottom - heroRect.top) / heroRect.height) * 100 + 2; // +2 for breathing room
    }

    for (let i = 0; i < count; i++){
      const row = Math.floor(i / cols);
      const col = i % cols;
      const [sizeVw, aspect] = sizeTemplates[i % sizeTemplates.length];
      let top = Math.min(Math.max(row * cellH + (Math.random() - 0.5) * cellH * 0.6, 0), 90);
      let left = Math.min(Math.max(col * cellW + (Math.random() - 0.5) * cellW * 0.6, 0), 90);

      // sizeVw/left/right are already % of the hero's width (it's full-bleed),
      // but height needs converting from vw to a % of the hero's height
      const heightPct = (((sizeVw / 100) * window.innerWidth) / aspect / window.innerHeight) * 100;
      const overlapsText = left + sizeVw > keepClear.left && left < keepClear.right
        && top + heightPct > keepClear.top && top < keepClear.bottom;
      if (overlapsText){
        // push along whichever axis actually has room — a portrait image
        // taller than the top/bottom margin (or a wide one taller than the
        // side margins) can't be pushed clear on its "preferred" axis, and
        // clamping that failed push back on-screen would just leave it
        // overlapping again, which is the bug this fallback avoids
        const canFitLeft = keepClear.left - sizeVw >= 0;
        const canFitRight = keepClear.right + sizeVw <= 100;
        const canFitTop = keepClear.top - heightPct >= 0;
        const canFitBottom = keepClear.bottom + heightPct <= 100;
        const dx = (left + sizeVw / 2) - (keepClear.left + keepClear.right) / 2;
        const dy = (top + heightPct / 2) - (keepClear.top + keepClear.bottom) / 2;
        const preferHorizontal = Math.abs(dx) > Math.abs(dy);

        let placed = false;
        if (preferHorizontal){
          if (dx >= 0 && canFitRight){ left = keepClear.right; placed = true; }
          else if (dx < 0 && canFitLeft){ left = keepClear.left - sizeVw; placed = true; }
        } else {
          if (dy >= 0 && canFitBottom){ top = keepClear.bottom; placed = true; }
          else if (dy < 0 && canFitTop){ top = keepClear.top - heightPct; placed = true; }
        }
        if (!placed){
          if (canFitRight) left = keepClear.right;
          else if (canFitLeft) left = keepClear.left - sizeVw;
          else if (canFitBottom) top = keepClear.bottom;
          else if (canFitTop) top = keepClear.top - heightPct;
          // else: the image is too big for any margin at this viewport size —
          // leave it be rather than force an even worse position
        }
        left = Math.min(Math.max(left, 0), 90);
        top = Math.min(Math.max(top, 0), 90);
      }

      // final, unconditional clamp — applies whether or not the text check
      // above ran, since a plain grid cell can land at top:0% same as a
      // pushed-away one
      if (top < navBottomPct) top = navBottomPct;

      const rot = (Math.random() * 14 - 7).toFixed(1);

      const fig = document.createElement("figure");
      fig.className = isMobile ? "float-img float-img--mobile" : "float-img";
      fig.setAttribute("data-cursor", "Drag");
      fig.style.top = top.toFixed(1) + "%";
      fig.style.left = left.toFixed(1) + "%";
      fig.style.width = sizeVw + "vw";
      fig.style.minWidth = isMobile ? "100px" : "130px";
      fig.style.aspectRatio = String(aspect);
      fig.style.rotate = rot + "deg";

      const img = document.createElement("img");
      img.src = aspect > 1
        ? landscapes[landscapeIndex++ % landscapes.length]
        : portraits[portraitIndex++ % portraits.length];   // square mobile frames use portraits too
      img.alt = "";
      fig.appendChild(img);
      hero.appendChild(fig);
    }
  }

  /* -------------------------------------------------- hero float */
  function initHeroFloat(){
    const hero = document.querySelector(".hero-float");
    if (!hero) return;
    const imgs = Array.from(hero.querySelectorAll(".float-img"));
    if (!imgs.length) return;

    // Phones get a calmer, looser version: the name fills most of a phone-width hero, so
    // constantly pushing images away from it (plus 200px of wander on a ~375px screen)
    // shoved every image out of frame within seconds. Mobile images are already
    // semi-transparent (.float-img--mobile), so there they may simply drift behind the
    // text, and they stay much closer to their resting spot.
    const isMobile = window.innerWidth <= HERO_MOBILE_BREAKPOINT;
    const maxRadius = isMobile ? 45 : 200;      // how far an image may drift from its resting spot
    const wanderStrength = isMobile ? 22 : 46;  // how eagerly it curves off in a new direction
    const headingDrift = 0.05;  // how quickly its heading curves — small = smooth loops
    const textPushStrength = isMobile ? 0 : 260; // how hard an image is steered away from the name/subtitle (off on phones)
    const textPushMargin = 20;    // px of buffer added around the text box before pushing starts
    const navPushStrength = 260;  // how hard an image is steered out from behind the fixed nav
    const navPushMargin = 12;     // px of buffer below the nav before pushing starts
    const kickRadius = 140;     // how close the cursor must get to "touch" an image
    const kickStrength = 100;   // how hard it darts away when touched
    const damping = 0.988;
    const flingCap = 1400;      // top speed after a drag-release throw

    const items = imgs.map((el) => {
      const heading = Math.random() * Math.PI * 2;
      // resting center in page coordinates, captured before any translate is
      // applied — lets the per-frame loop track each image's live position
      // (restX + item.x, restY + item.y) without a getBoundingClientRect
      // call every frame for every image, which matters once there are
      // dozens of them
      const restRect = el.getBoundingClientRect();
      const item = {
        el,
        x: 0, y: 0,
        vx: Math.cos(heading) * 8,
        vy: Math.sin(heading) * 8,
        heading,
        lastKick: 0,
        dragging: false,
        restX: restRect.left + restRect.width / 2,
        restY: restRect.top + restRect.height / 2,
        halfW: restRect.width / 2,
        halfH: restRect.height / 2,
      };

      // grab & throw: works with mouse, touch and pen alike
      el.addEventListener("pointerdown", (e) => {
        item.dragging = true;
        item.vx = 0; item.vy = 0;
        item.lastPX = e.clientX;
        item.lastPY = e.clientY;
        item.lastPT = performance.now();
        el.setPointerCapture(e.pointerId);
        el.style.zIndex = 5;
        e.preventDefault();
      });
      el.addEventListener("pointermove", (e) => {
        if (!item.dragging) return;
        const now = performance.now();
        const dt = Math.max((now - item.lastPT) / 1000, 1 / 120);
        const dx = e.clientX - item.lastPX;
        const dy = e.clientY - item.lastPY;
        item.x += dx;
        item.y += dy;
        item.vx = dx / dt;
        item.vy = dy / dt;
        item.lastPX = e.clientX;
        item.lastPY = e.clientY;
        item.lastPT = now;
        el.style.translate = `${item.x.toFixed(1)}px ${item.y.toFixed(1)}px`;
      });
      const release = () => {
        if (!item.dragging) return;
        item.dragging = false;
        el.style.zIndex = "";
        const speed = Math.hypot(item.vx, item.vy);
        if (speed > flingCap){
          item.vx = (item.vx / speed) * flingCap;
          item.vy = (item.vy / speed) * flingCap;
        }
        item.heading = Math.atan2(item.vy, item.vx);
      };
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);

      return item;
    });

    if (reduceMotion) return; // ambient wander/kick stays off; dragging above still works

    // the name/subtitle's box, in the same page coordinates as restX/restY —
    // ambient wander (up to maxRadius away from a resting spot) can otherwise
    // carry an image across it over time even when initHeroImages() placed it
    // clear to start with, which is what "steer clear of the text" needs to
    // account for, not just initial placement
    const contentEl = document.querySelector(".hero-content");
    let textBox = null;
    if (contentEl){
      const r = contentEl.getBoundingClientRect();
      textBox = {
        left: r.left - textPushMargin, right: r.right + textPushMargin,
        top: r.top - textPushMargin, bottom: r.bottom + textPushMargin,
      };
      textBox.cx = (textBox.left + textBox.right) / 2;
      textBox.cy = (textBox.top + textBox.bottom) / 2;
    }

    // the fixed nav's own bottom edge, in the same page coordinates — same
    // reasoning as initHeroImages()'s navBottomPct (see the comment there):
    // .site-nav relies on mix-blend-mode:difference for legible text against
    // any background, which only produces a clean, readable color when what's
    // behind it is the plain hero background, not a photo. initHeroImages()
    // keeps every image's *starting* position clear of the strip below the
    // nav; this keeps it clear as wander/drag carries it around afterwards.
    // Unlike textBox this only needs a bottom edge — the nav spans the full
    // viewport width, so there's no horizontal direction that escapes it.
    const navEl = document.querySelector(".site-nav");
    const navBottom = navEl ? navEl.getBoundingClientRect().bottom + navPushMargin : 0;

    const pointer = { x: -9999, y: -9999, active: false };
    if (canHover){
      window.addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      }, { passive: true });
      window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
    }

    let last = performance.now();
    function frame(now){
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      items.forEach((item) => {
        if (item.dragging) return; // pointermove handler already drives this one

        // organic wander: heading slowly curves at random, like a lazy current
        item.heading += (Math.random() - 0.5) * headingDrift;
        item.vx += Math.cos(item.heading) * wanderStrength * dt;
        item.vy += Math.sin(item.heading) * wanderStrength * dt;

        // steer clear of the name/subtitle: a continuous push away from its
        // box (not just a one-off kick) for as long as the image's current
        // position — resting spot plus wherever wander/a throw has carried
        // it — is inside it, so this holds even mid-drift, not only at load
        if (textBox && textPushStrength){
          const cx = item.restX + item.x;
          const cy = item.restY + item.y;
          // rectangle-vs-rectangle, not point-vs-rectangle — a large image
          // whose center sits just outside the box can still have an edge
          // inside it, which a center-only check would miss entirely
          const overlapsBox = cx + item.halfW > textBox.left && cx - item.halfW < textBox.right
            && cy + item.halfH > textBox.top && cy - item.halfH < textBox.bottom;
          if (overlapsBox){
            const away = Math.atan2(cy - textBox.cy, cx - textBox.cx);
            item.vx += Math.cos(away) * textPushStrength * dt;
            item.vy += Math.sin(away) * textPushStrength * dt;
          }
        }

        // steer clear of the fixed nav: straight down only, never sideways —
        // the nav spans the full viewport width, so a horizontal nudge (what
        // the atan2-based push above uses for the text box) would never
        // actually clear it
        if (navBottom){
          const top = item.restY + item.y - item.halfH;
          if (top < navBottom){
            item.vy += navPushStrength * dt;
          }
        }

        // touch interaction: dart off in a new direction when the cursor gets close
        if (pointer.active){
          const rect = item.el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const dist = Math.hypot(dx, dy);
          const radius = kickRadius + Math.max(rect.width, rect.height) / 2;
          if (dist < radius && now - item.lastKick > 550){
            item.lastKick = now;
            const away = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.8;
            item.heading = away;
            item.vx += Math.cos(away) * kickStrength;
            item.vy += Math.sin(away) * kickStrength;
          }
        }

        // integrate position
        item.x += item.vx * dt;
        item.y += item.vy * dt;

        // soft spring back once it strays too far from its resting spot
        const dist0 = Math.hypot(item.x, item.y);
        if (dist0 > maxRadius){
          const pull = (dist0 - maxRadius) * 2.4;
          item.vx -= (item.x / dist0) * pull * dt;
          item.vy -= (item.y / dist0) * pull * dt;
        }

        item.vx *= damping;
        item.vy *= damping;

        item.el.style.translate = `${item.x.toFixed(1)}px ${item.y.toFixed(1)}px`;
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* -------------------------------------------------- lightbox */
  function initLightbox(){
    const galleries = document.querySelectorAll("[data-lightbox-group]");
    if (!galleries.length) return;

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <div class="lightbox__frame"><img alt=""></div>
      <button class="lightbox__close" aria-label="Close" data-cursor="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg></button>
      <button class="lightbox__prev" aria-label="Previous" data-cursor="Prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4l-8 8 8 8"/></svg></button>
      <button class="lightbox__next" aria-label="Next" data-cursor="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4l8 8-8 8"/></svg></button>
      <div class="lightbox__count"></div>
    `;
    document.body.appendChild(lb);
    const imgEl = lb.querySelector("img");
    const countEl = lb.querySelector(".lightbox__count");

    let currentList = [];
    let currentIndex = 0;

    function show(index){
      currentIndex = (index + currentList.length) % currentList.length;
      const item = currentList[currentIndex];
      imgEl.classList.remove("is-shown");
      const src = item.getAttribute("data-full") || item.src;
      const nextImg = new Image();
      nextImg.onload = () => {
        imgEl.src = src;
        imgEl.alt = item.alt || "";
        requestAnimationFrame(() => imgEl.classList.add("is-shown"));
      };
      nextImg.src = src;
      countEl.textContent = `${currentIndex + 1} / ${currentList.length}`;
    }

    function open(list, index){
      currentList = list;
      document.body.style.overflow = "hidden";
      lb.classList.add("is-open");
      show(index);
    }
    function close(){
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    galleries.forEach((gallery) => {
      const imgs = Array.from(gallery.querySelectorAll("img[data-full]"));
      imgs.forEach((img, i) => {
        const figure = img.parentElement;
        if (!figure.hasAttribute("data-cursor")) figure.setAttribute("data-cursor", "View");
        figure.addEventListener("click", () => {
          if (figure.dataset.suppressClick === "1"){
            delete figure.dataset.suppressClick;
            return; // a drag just ended on this item — don't also open the lightbox
          }
          open(imgs, i);
        });
      });
    });

    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    lb.querySelector(".lightbox__prev").addEventListener("click", () => show(currentIndex - 1));
    lb.querySelector(".lightbox__next").addEventListener("click", () => show(currentIndex + 1));

    window.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  /* -------------------------------------------------- shuffle (dump page) */
  function initShuffle(){
    const grid = document.querySelector(".dump .dump-scatter");
    if (!grid) return;
    const items = Array.from(grid.children);
    for (let i = items.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach((el) => grid.appendChild(el));
  }

  /* -------------------------------------------------- scattered pile (dump page) */
  function initDumpScatter(){
    const stage = document.querySelector(".dump-scatter");
    if (!stage) return;
    const items = Array.from(stage.children);
    if (!items.length) return;

    // aspect ratios [w,h] a print might be cropped to — deliberately varied, not a fixed grid
    const aspects = [[3,4],[4,3],[1,1],[2,3],[3,2],[4,5],[5,4]];
    const vw = window.innerWidth;
    // fewer, bigger columns on small screens — a phone-width column grid at desktop's cell
    // size produced tiny, barely-overlapping thumbnails, so each tier gets its own target
    // cell width, size range and jitter (jitter scales with the tier too, for real overlap)
    const tier = vw < 480 ? { cell:190, cellH:230, sizeMin:0.85, sizeMax:1.35, jitter:0.65 }
      : vw < 780 ? { cell:220, cellH:240, sizeMin:0.78, sizeMax:1.25, jitter:0.6 }
      : { cell:260, cellH:250, sizeMin:0.62, sizeMax:1.12, jitter:0.55 };
    const stageWidth = stage.clientWidth;
    const cols = Math.max(2, Math.min(6, Math.round(stageWidth / tier.cell)));
    const cellW = stageWidth / cols;
    const cellH = tier.cellH;
    const rows = Math.ceil(items.length / cols);
    const stageHeight = Math.round(rows * cellH + cellH * 0.25);
    stage.style.height = stageHeight + "px";

    const placed = items.map((el, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const [aw, ah] = aspects[Math.floor(Math.random() * aspects.length)];
      const w = Math.round(cellW * (tier.sizeMin + Math.random() * (tier.sizeMax - tier.sizeMin)));
      const h = Math.round(w * (ah / aw));
      const cx = col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * tier.jitter;
      const cy = row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * tier.jitter;
      const left = Math.round(Math.min(Math.max(cx - w / 2, 0), stageWidth - w));
      const top = Math.round(Math.min(Math.max(cy - h / 2, 0), stageHeight - h));
      const rot = (Math.random() * 26 - 13).toFixed(1);
      const z = 1 + Math.floor(Math.random() * items.length);

      el.style.width = w + "px";
      el.style.height = h + "px";
      el.style.left = left + "px";
      el.style.top = top + "px";
      el.style.setProperty("--r", rot + "deg");
      el.style.zIndex = z;

      return { el, left, top, w, h, z };
    });

    placed.forEach(({ el }, i) => {
      setTimeout(() => el.classList.add("is-placed"), i * 12);
    });

    // grab-and-throw, same feel as the hero float — but no idle wander here:
    // dozens of prints animating at rest would fight the page instead of the cursor.
    let topZ = 100; // above every base pile z-index (1..items.length), below the nav's 500
    placed.forEach(({ el, left, top, w, h }) => {
      const item = { x: 0, y: 0, vx: 0, vy: 0, dragging: false, moved: false, startX: 0, startY: 0 };
      const damping = 0.9;
      const flingCap = 1600;

      function clamp(){
        const minX = -left, maxX = stageWidth - w - left;
        const minY = -top, maxY = stageHeight - h - top;
        if (item.x < minX){ item.x = minX; item.vx = 0; }
        if (item.x > maxX){ item.x = maxX; item.vx = 0; }
        if (item.y < minY){ item.y = minY; item.vy = 0; }
        if (item.y > maxY){ item.y = maxY; item.vy = 0; }
      }

      el.addEventListener("pointerdown", (e) => {
        item.dragging = true;
        item.moved = false;
        item.startX = e.clientX; item.startY = e.clientY;
        item.lastPX = e.clientX; item.lastPY = e.clientY;
        item.lastPT = performance.now();
        item.vx = 0; item.vy = 0;
        el.setPointerCapture(e.pointerId);
        el.style.zIndex = ++topZ; // bring to front of the pile while held
        e.preventDefault();
      });

      el.addEventListener("pointermove", (e) => {
        if (!item.dragging) return;
        const now = performance.now();
        const dt = Math.max((now - item.lastPT) / 1000, 1 / 120);
        const dx = e.clientX - item.lastPX;
        const dy = e.clientY - item.lastPY;
        item.x += dx; item.y += dy;
        item.vx = dx / dt; item.vy = dy / dt;
        item.lastPX = e.clientX; item.lastPY = e.clientY; item.lastPT = now;
        if (!item.moved && Math.hypot(e.clientX - item.startX, e.clientY - item.startY) > 6) item.moved = true;
        clamp();
        el.style.translate = `${item.x.toFixed(1)}px ${item.y.toFixed(1)}px`;
      });

      const release = () => {
        if (!item.dragging) return;
        item.dragging = false;
        // stays on top of the pile where it was dropped, rather than sinking back to its
        // original random z — matches how picking up a real print and setting it down works
        if (item.moved) el.dataset.suppressClick = "1";

        const speed = Math.hypot(item.vx, item.vy);
        if (speed > flingCap){
          item.vx = (item.vx / speed) * flingCap;
          item.vy = (item.vy / speed) * flingCap;
        }
        if (reduceMotion) return;

        let last = performance.now();
        function coast(now){
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          item.x += item.vx * dt;
          item.y += item.vy * dt;
          item.vx *= damping; item.vy *= damping;
          clamp();
          el.style.translate = `${item.x.toFixed(1)}px ${item.y.toFixed(1)}px`;
          if (Math.hypot(item.vx, item.vy) > 4) requestAnimationFrame(coast);
        }
        requestAnimationFrame(coast);
      };
      el.addEventListener("pointerup", release);
      el.addEventListener("pointercancel", release);
    });
  }

  /* -------------------------------------------------- dark / light theme toggle */
  function initThemeToggle(){
    const STORAGE_KEY = "lvr-theme";
    const root = document.documentElement;
    if (localStorage.getItem(STORAGE_KEY) === "light") root.classList.add("light-mode");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("data-cursor", "Toggle");
    const label = () => root.classList.contains("light-mode") ? "☀️ Light mode" : "\u{1F319} Dark mode";
    btn.textContent = label();

    btn.addEventListener("click", () => {
      const isLight = root.classList.toggle("light-mode");
      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
      btn.textContent = label();
    });

    document.body.appendChild(btn);
  }

  /* -------------------------------------------------- init */
  document.addEventListener("DOMContentLoaded", () => {
    initPageLoader();
    initShuffle();
    initDumpScatter();
    initCursor();
    initNav();
    initReveal();
    initHeroImages();
    initHeroFloat();
    initLightbox();
    initThemeToggle();
  });
})();
