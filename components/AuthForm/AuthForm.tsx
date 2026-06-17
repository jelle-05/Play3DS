"use client";

import { useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import "./AuthForm.css";

const TAB_OPTIONS = [
  { value: "login", label: "Log in" },
  { value: "register", label: "Register" },
];

type AuthTab = "login" | "register";

interface AuthFormProps {
  initialTab?: AuthTab;
}

// Prototype auth form — fields are not wired to any backend yet (Phase 2).
export default function AuthForm({ initialTab = "login" }: AuthFormProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);

  return (
    <div className="auth-form">
      <ToggleSwitch
        options={TAB_OPTIONS}
        value={tab}
        onChange={(v) => setTab(v as AuthTab)}
        className="auth-form__tabs"
      />

      <form className="auth-form__fields" onSubmit={(e) => e.preventDefault()}>
        {tab === "register" && (
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              className="auth-field__input"
              placeholder="your_username"
              autoComplete="username"
            />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="auth-field__input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            className="auth-field__input"
            placeholder="••••••••"
            autoComplete={tab === "login" ? "current-password" : "new-password"}
          />
        </div>

        {tab === "login" && (
          <button type="button" className="auth-form__forgot">
            Forgot password?
          </button>
        )}

        <button type="submit" className="auth-form__submit">
          {tab === "login" ? "Sign In" : "Create Account"}
        </button>

        {tab === "register" && (
          <p className="auth-form__disclaimer">
            By signing up you agree to our Terms of Service.
          </p>
        )}
      </form>

      {/* Prototype notice — auth wordt aan Supabase gekoppeld in Fase 2 */}
      <p className="auth-form__note">Auth not yet active — prototype UI only.</p>
    </div>
  );
}
