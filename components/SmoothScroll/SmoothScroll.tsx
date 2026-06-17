"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";

export default function SmoothScroll() {
  useEffect(() => {
    // Respecteer reduced-motion: dan helemaal geen smooth scroll (native = snelst).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Iets hogere lerp = snappier/minder "zwevend" gevoel.
    const lenis = new Lenis({ lerp: 0.13, wheelMultiplier: 1 });

    // Koppel Lenis aan de GSAP ticker — één RAF-loop voor beide
    function onTick(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0); // voorkomt dat GSAP timing aanpast bij lag

    return () => {
      lenis.destroy();
      gsap.ticker.remove(onTick);
    };
  }, []);

  return null;
}
