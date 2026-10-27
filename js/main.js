/* Luca van Ruiten — Photography Portfolio — interactions
   Deliberately small since the 2026-10 "white gallery" redesign: the mobile menu,
   the lightbox and the footer year. No decorative motion. */
(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------- nav (mobile menu) */
  function initNav(){
    const toggle = document.querySelector(".nav-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      // scroll lock on <html>, not <body>: overflow on body would stop the sticky header from sticking
      document.documentElement.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav-links a").forEach((a) => {
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        document.documentElement.classList.remove("nav-open");
      });
    });
  }

  /* -------------------------------------------------- lightbox */
  function initLightbox(){
    const galleries = document.querySelectorAll("[data-lightbox-group]");
    if (!galleries.length) return;

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <div class="lightbox__frame"><img alt=""></div>
      <button class="lightbox__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l16 16M20 4L4 20"/></svg></button>
      <button class="lightbox__prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4l-8 8 8 8"/></svg></button>
      <button class="lightbox__next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 4l8 8-8 8"/></svg></button>
      <div class="lightbox__count"></div>
      <div class="lightbox__loader" aria-hidden="true"></div>
    `;
    document.body.appendChild(lb);
    const imgEl = lb.querySelector("img");
    const countEl = lb.querySelector(".lightbox__count");

    let currentList = [];
    let currentIndex = 0;
    let loadingTimer = 0;

    function show(index){
      currentIndex = (index + currentList.length) % currentList.length;
      const item = currentList[currentIndex];
      imgEl.classList.remove("is-shown");
      const src = item.getAttribute("data-full") || item.src;
      // spinner only if loading takes a moment, so cached photos don't flash it
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(() => lb.classList.add("is-loading"), 150);
      const nextImg = new Image();
      nextImg.onload = () => {
        if (item !== currentList[currentIndex]) return; // a newer photo was requested meanwhile
        clearTimeout(loadingTimer);
        lb.classList.remove("is-loading");
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
      lb.classList.remove("is-open", "is-loading");
      clearTimeout(loadingTimer);
      document.body.style.overflow = "";
    }

    galleries.forEach((gallery) => {
      const imgs = Array.from(gallery.querySelectorAll("img[data-full]"));
      imgs.forEach((img, i) => {
        img.parentElement.addEventListener("click", () => open(imgs, i));
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

  /* -------------------------------------------------- init */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initLightbox();
  });
})();
