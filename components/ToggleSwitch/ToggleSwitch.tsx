"use client";

import React from "react";
import "./ToggleSwitch.css";

export interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleSwitchProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ToggleSwitch({ options, value, onChange, className }: ToggleSwitchProps) {
  const activeIndex = options.findIndex((o) => o.value === value);
  const safeIndex = activeIndex < 0 ? 0 : activeIndex;

  return (
    <div
      data-toggle-init=""
      className={`toggle-switch${className ? ` ${className}` : ""}`}
      style={
        {
          "--toggle-count": options.length,
          "--toggle-active": safeIndex,
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="toggle-switch__bg" />
      {options.map((opt, i) => (
        <button
          key={opt.value}
          data-toggle-btn=""
          {...(i === safeIndex ? { "data-toggle-active": "" } : {})}
          className="toggle-switch__btn"
          aria-pressed={i === safeIndex}
          tabIndex={i === safeIndex ? 0 : -1}
          onClick={() => onChange(opt.value)}
          onKeyDown={(e) => {
            const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!dir) return;
            e.preventDefault();
            const next = (safeIndex + dir + options.length) % options.length;
            onChange(options[next].value);
          }}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
