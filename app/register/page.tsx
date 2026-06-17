import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
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
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">
            Start tracking your Nintendo 3DS journey — it&apos;s free.
          </p>
        </div>

        <AuthForm initialTab="register" />

        <p className="auth-card__alt">
          Already have an account?{" "}
          <Link href="/login" className="auth-card__alt-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
