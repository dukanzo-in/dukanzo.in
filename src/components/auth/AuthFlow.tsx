"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import { Mail, Lock, LogIn, UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

type Mode = "LOGIN" | "SIGNUP" | "FORGOT_PASSWORD" | "EMAIL_SENT";

export function AuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/configure";

  const [mode, setMode] = useState<Mode>("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const res = await AuthService.loginWithEmail(email, password);
    setLoading(false);
    if (res.success && res.sessionEstablished) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(res.error || "Login failed.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const res = await AuthService.signUpWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      setMode("EMAIL_SENT");
    } else {
      setError(res.error || "Sign up failed.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email.");
    setLoading(true);
    const res = await AuthService.sendPasswordReset(email);
    setLoading(false);
    if (res.success) {
      setMode("EMAIL_SENT");
    } else {
      setError(res.error || "Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-black tracking-tight">
            Dukanzo<span className="text-primary">.</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-2xl shadow-lg p-8">

          {/* Email Sent Success */}
          {mode === "EMAIL_SENT" && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your inbox!</h2>
              <p className="text-muted-foreground mb-6">
                We sent an email to <strong className="text-foreground">{email}</strong>.<br />
                Click the link inside to continue.
              </p>
              <button
                onClick={() => reset("LOGIN")}
                className="text-sm text-primary font-medium hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Login */}
          {mode === "LOGIN" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => reset("FORGOT_PASSWORD")} className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Sign In
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button onClick={() => reset("SIGNUP")} className="text-primary font-semibold hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}

          {/* Sign Up */}
          {mode === "SIGNUP" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Create account</h2>
                <p className="text-muted-foreground text-sm mt-1">Get started with Dukanzo today.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">{error}</div>}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password (min 6 chars)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => reset("LOGIN")} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Forgot Password */}
          {mode === "FORGOT_PASSWORD" && (
            <>
              <button onClick={() => reset("LOGIN")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Reset password</h2>
                <p className="text-muted-foreground text-sm mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              </div>
              {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">{error}</div>}
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
