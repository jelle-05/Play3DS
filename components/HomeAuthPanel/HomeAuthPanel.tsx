"use client";

import { useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import "./HomeAuthPanel.css";

const TAB_OPTIONS = [
  { value: "login", label: "Log in" },
  { value: "register", label: "Register" },
];

export default function HomeAuthPanel() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="auth-panel">
      <div className="auth-panel__header">
        <h2 className="auth-panel__title">Welcome to Play3DS</h2>
        <p className="auth-panel__sub">Track your 3DS journey</p>
      </div>

      <ToggleSwitch
        options={TAB_OPTIONS}
        value={tab}
        onChange={(v) => setTab(v as "login" | "register")}
        className="auth-panel__tabs"
      />

      {tab === "login" ? (
        <div className="auth-panel__form">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="auth-field__input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-field__input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <a href="#" className="auth-panel__forgot" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
          <button type="button" className="auth-panel__submit">
            Sign In
          </button>
        </div>
      ) : (
        <div className="auth-panel__form">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-username">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              className="auth-field__input"
              placeholder="your_username"
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              className="auth-field__input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              className="auth-field__input"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button type="button" className="auth-panel__submit">
            Create Account
          </button>
          <p className="auth-panel__disclaimer">
            By signing up you agree to our Terms of Service.
          </p>
        </div>
      )}

      {/* Prototype notice — auth will be wired to Supabase in Phase 1.7 / Phase 2 */}
      <p className="auth-panel__proto-note">
        Auth not yet active — prototype UI only.
      </p>
    </div>
  );
}
