import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm/AuthForm";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-card__brand">
          <span className="auth-card__brand-mark" aria-hidden="true">
            ▶
          </span>
          Play3DS
        </Link>

        <div className="auth-card__head">
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">
            Log in to track your 3DS playthroughs.
          </p>
        </div>

        <AuthForm initialTab="login" />

        <p className="auth-card__alt">
          New to Play3DS?{" "}
          <Link href="/register" className="auth-card__alt-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
