"use client";

import { useState, useActionState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import "./AuthForm.css";

const TAB_OPTIONS = [
  { value: "login", label: "Log in" },
  { value: "register", label: "Register" },
];

type AuthTab = "login" | "register";
const EMPTY: AuthState = {};

interface AuthFormProps {
  initialTab?: AuthTab;
}

export default function AuthForm({ initialTab = "login" }: AuthFormProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);

  const [loginState, loginAction, loginPending] = useActionState(signIn, EMPTY);
  const [regState, regAction, regPending] = useActionState(signUp, EMPTY);

  const isLogin = tab === "login";
  const action = isLogin ? loginAction : regAction;
  const state = isLogin ? loginState : regState;
  const pending = isLogin ? loginPending : regPending;

  return (
    <div className="auth-form">
      <ToggleSwitch
        options={TAB_OPTIONS}
        value={tab}
        onChange={(v) => setTab(v as AuthTab)}
        className="auth-form__tabs"
      />

      <form className="auth-form__fields" action={action}>
        {!isLogin && (
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-username">
              Username
            </label>
            <input
              id="auth-username"
              name="username"
              type="text"
              className="auth-field__input"
              placeholder="your_username"
              autoComplete="username"
              required
            />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            className="auth-field__input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            className="auth-field__input"
            placeholder="••••••••"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {isLogin && (
          <button type="button" className="auth-form__forgot">
            Forgot password?
          </button>
        )}

        {state?.error && <p className="auth-form__error">{state.error}</p>}
        {state?.message && <p className="auth-form__message">{state.message}</p>}

        <button type="submit" className="auth-form__submit" disabled={pending}>
          {pending
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>
    </div>
  );
}
