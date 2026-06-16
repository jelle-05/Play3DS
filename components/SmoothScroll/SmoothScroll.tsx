"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis();

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
