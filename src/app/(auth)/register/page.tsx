"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but sign-in failed. Try logging in.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal/[0.06] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-purple-accent/[0.03] rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-scale-up">
        <div className="glass rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="text-teal font-extrabold text-3xl tracking-[3px]">WAY</span>
              <span className="text-white font-extrabold text-3xl tracking-[3px]">MAKER</span>
            </div>
            <p className="text-slate-gray text-sm">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-gray/80 pl-0.5">Full name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-gray/80 pl-0.5">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-gray/80 pl-0.5">Password</label>
              <Input
                type="password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-sm font-semibold"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-gray mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-teal hover:text-teal-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
