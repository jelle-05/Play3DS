import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// E-mailbevestiging / magic link callback. Werkt zodra de Supabase e-mailtemplate
// linkt naar {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
// (zie SETUP.md). Tot die tijd gebruikt Supabase de standaard verify-redirect.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Could not confirm email", request.url)
  );
}
