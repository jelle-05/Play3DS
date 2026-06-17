"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import type { Game } from "@/lib/games";
import GameCard from "@/components/GameCard/GameCard";
import "./GameSlider.css";

interface GameSliderProps {
  games: Game[];
  title?: string;
}

type SliderRoot = HTMLElement & { _sliderDraggable?: Draggable };

/* ── Osmo Supply: Basic GSAP Slider ───────────────────────────────────
   Broncode uit osmo_components/basic_gsap_slider.txt.
   data-attributen en animatielogica zijn ongewijzigd.                  */
function initBasicGSAPSlider() {
  document.querySelectorAll("[data-gsap-slider-init]").forEach((rootEl) => {
    const root = rootEl as SliderRoot;
    if (root._sliderDraggable) root._sliderDraggable.kill();

    const collection = root.querySelector("[data-gsap-slider-collection]") as HTMLElement | null;
    const track = root.querySelector("[data-gsap-slider-list]") as HTMLElement | null;
    const items = Array.from(root.querySelectorAll("[data-gsap-slider-item]")) as HTMLElement[];
    const controls = Array.from(root.querySelectorAll("[data-gsap-slider-control]")) as HTMLElement[];

    if (!collection || !track || !items.length) return;

    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", "Slider");
    collection.setAttribute("role", "group");
    collection.setAttribute("aria-roledescription", "Slides List");
    collection.setAttribute("aria-label", "Slides");
    items.forEach((slide, i) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "Slide");
      slide.setAttribute("aria-label", `Slide ${i + 1} of ${items.length}`);
      slide.setAttribute("aria-hidden", "true");
      slide.setAttribute("aria-selected", "false");
      slide.setAttribute("tabindex", "-1");
    });
    controls.forEach((btn) => {
      const dir = btn.getAttribute("data-gsap-slider-control");
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", dir === "prev" ? "Previous Slide" : "Next Slide");
      (btn as HTMLButtonElement).disabled = true;
      btn.setAttribute("aria-disabled", "true");
    });

    const styles = getComputedStyle(root);
    const statusVar = styles.getPropertyValue("--slider-status").trim();
    let spvVar = parseFloat(styles.getPropertyValue("--slider-spv"));
    const rect = items[0].getBoundingClientRect();
    const marginRight = parseFloat(getComputedStyle(items[0]).marginRight);
    const slideW = rect.width + marginRight;

    if (isNaN(spvVar)) {
      spvVar = collection.clientWidth / slideW;
    }

    const spv = Math.max(1, Math.min(spvVar, items.length));
    const sliderEnabled = statusVar === "on" && spv < items.length;
    root.setAttribute("data-gsap-slider-status", sliderEnabled ? "active" : "not-active");

    if (!sliderEnabled) {
      track.removeAttribute("style");
      track.onmouseenter = null;
      track.onmouseleave = null;
      track.removeAttribute("data-gsap-slider-list-status");
      root.removeAttribute("role");
      root.removeAttribute("aria-roledescription");
      root.removeAttribute("aria-label");
      collection.removeAttribute("role");
      collection.removeAttribute("aria-roledescription");
      collection.removeAttribute("aria-label");
      items.forEach((slide) => {
        slide.removeAttribute("role");
        slide.removeAttribute("aria-roledescription");
        slide.removeAttribute("aria-label");
        slide.removeAttribute("aria-hidden");
        slide.removeAttribute("aria-selected");
        slide.removeAttribute("tabindex");
        slide.removeAttribute("data-gsap-slider-item-status");
      });
      controls.forEach((btn) => {
        (btn as HTMLButtonElement).disabled = false;
        btn.removeAttribute("role");
        btn.removeAttribute("aria-label");
        btn.removeAttribute("aria-disabled");
        btn.removeAttribute("data-gsap-slider-control-status");
      });
      return;
    }

    track.onmouseenter = () => { track.setAttribute("data-gsap-slider-list-status", "grab"); };
    track.onmouseleave = () => { track.removeAttribute("data-gsap-slider-list-status"); };

    const vw = collection.clientWidth;
    const tw = track.scrollWidth;
    const maxScroll = Math.max(tw - vw, 0);
    const minX = -maxScroll;
    const maxX = 0;
    const maxIndex = maxScroll / slideW;
    const full = Math.floor(maxIndex);
    const snapPoints: number[] = [];
    for (let i = 0; i <= full; i++) snapPoints.push(-i * slideW);
    if (full < maxIndex) snapPoints.push(-maxIndex * slideW);

    let activeIndex = 0;
    const setX = gsap.quickSetter(track, "x", "px") as (v: number) => void;
    let collectionRect = collection.getBoundingClientRect();

    function updateStatus(x: number) {
      if (x > maxX || x < minX) return;

      const calcX = x > maxX ? maxX : x < minX ? minX : x;
      let closest = snapPoints[0];
      snapPoints.forEach((pt) => {
        if (Math.abs(pt - calcX) < Math.abs(closest - calcX)) closest = pt;
      });
      activeIndex = snapPoints.indexOf(closest);

      items.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const leftEdge = r.left - collectionRect.left;
        const slideCenter = leftEdge + r.width / 2;
        const inView = slideCenter > 0 && slideCenter < collectionRect.width;
        const status = i === activeIndex ? "active" : inView ? "inview" : "not-active";
        slide.setAttribute("data-gsap-slider-item-status", status);
        slide.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
        slide.setAttribute("aria-hidden", inView ? "false" : "true");
        slide.setAttribute("tabindex", i === activeIndex ? "0" : "-1");
      });

      controls.forEach((btn) => {
        const dir = btn.getAttribute("data-gsap-slider-control");
        const can = dir === "prev" ? activeIndex > 0 : activeIndex < snapPoints.length - 1;
        (btn as HTMLButtonElement).disabled = !can;
        btn.setAttribute("aria-disabled", can ? "false" : "true");
        btn.setAttribute("data-gsap-slider-control-status", can ? "active" : "not-active");
      });
    }

    controls.forEach((btn) => {
      const dir = btn.getAttribute("data-gsap-slider-control");
      btn.addEventListener("click", () => {
        if ((btn as HTMLButtonElement).disabled) return;
        const delta = dir === "next" ? 1 : -1;
        const target = activeIndex + delta;
        gsap.to(track, {
          duration: 0.4,
          x: snapPoints[target],
          onUpdate: () => updateStatus(gsap.getProperty(track, "x") as number),
        });
      });
    });

    root._sliderDraggable = Draggable.create(track, {
      type: "x",
      inertia: true,
      bounds: { minX, maxX },
      throwResistance: 2000,
      dragResistance: 0.05,
      maxDuration: 0.6,
      minDuration: 0.2,
      edgeResistance: 0.75,
      snap: { x: snapPoints },
      onPress() { track.setAttribute("data-gsap-slider-list-status", "grabbing"); collectionRect = collection.getBoundingClientRect(); },
      onDrag() { setX(this.x); updateStatus(this.x); },
      onThrowUpdate() { setX(this.x); updateStatus(this.x); },
      onThrowComplete() { setX(this.endX); updateStatus(this.endX); track.setAttribute("data-gsap-slider-list-status", "grab"); },
      onRelease() { setX(this.x); updateStatus(this.x); track.setAttribute("data-gsap-slider-list-status", "grab"); },
    })[0];

    setX(0);
    updateStatus(0);
  });
}

function debounceOnWidthChange(fn: () => void, ms: number) {
  let last = window.innerWidth;
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth !== last) {
        last = window.innerWidth;
        fn();
      }
    }, ms);
  };
}

export default function GameSlider({ games, title = "Now Playing" }: GameSliderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    gsap.registerPlugin(Draggable, InertiaPlugin);
    initBasicGSAPSlider();

    const debouncedResize = debounceOnWidthChange(initBasicGSAPSlider, 200);
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      document.querySelectorAll("[data-gsap-slider-init]").forEach((rootEl) => {
        const r = rootEl as SliderRoot;
        if (r._sliderDraggable) r._sliderDraggable.kill();
      });
    };
  }, []);

  return (
    <div className="game-slider-wrap">
      {title && <h2 className="game-slider-title">{title}</h2>}

      <div
        aria-label="Game slider"
        data-gsap-slider-init=""
        role="region"
        aria-roledescription="carousel"
        className="gsap-slider"
      >
        <div data-gsap-slider-collection="" className="gsap-slider__collection">
          <div data-gsap-slider-list="" className="gsap-slider__list">
            {games.map((game) => (
              <div key={game.id} data-gsap-slider-item="" className="gsap-slider__item">
                <GameCard game={game} href={`/games/${game.slug ?? game.id}`} />
              </div>
            ))}
          </div>
        </div>
        <div data-gsap-slider-controls="" className="gsap-slider__controls">
          <button data-gsap-slider-control="prev" className="gsap-slider__control" aria-label="Previous slide">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button data-gsap-slider-control="next" className="gsap-slider__control" aria-label="Next slide">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
