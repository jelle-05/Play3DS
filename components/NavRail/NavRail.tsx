"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./NavRail.css";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    href: "/games",
    label: "Library",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <line x1="18.5" y1="18.5" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
];

export default function NavRail() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => item.href === pathname);

  return (
    <>
      {/* Desktop: vertical nav rail met sliding indicator */}
      <nav className="nav-rail" aria-label="Main navigation">
        <div className="nav-rail-logo" aria-hidden="true">
          <span className="nav-rail-logo-mark">▶</span>
        </div>

        <div
          className="nav-rail-list-wrap"
          style={
            activeIndex >= 0
              ? ({ "--nav-active-index": activeIndex } as React.CSSProperties)
              : undefined
          }
        >
          {/* Sliding indicator — beweegt naar het actieve item */}
          <div
            className={`nav-rail-indicator${activeIndex < 0 ? " nav-rail-indicator--hidden" : ""}`}
            aria-hidden="true"
          />

          <ul className="nav-rail-list" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-item${isActive ? " nav-item--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile: bottom tab bar (ongewijzigd) */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <ul className="bottom-nav-list" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="bottom-nav-item-wrapper">
                <Link
                  href={item.href}
                  className={`bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="bottom-nav-icon">{item.icon}</span>
                  <span className="bottom-nav-label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
