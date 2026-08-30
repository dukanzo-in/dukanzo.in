"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthService } from "@/lib/auth-service";
import { Loader2, Phone, ShieldCheck, Lock, UserPlus, LogIn, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthMode = "LOGIN" | "SIGNUP" | "FORGOT_PASSWORD";
type AuthStep = "CREDENTIALS" | "OTP" | "NEW_PASSWORD";

export function AuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/configure";

  const [mode, setMode] = useState<AuthMode>("LOGIN");
  const [step, setStep] = useState<AuthStep>("CREDENTIALS");
  
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Handle countdown for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const formatPhone = (rawPhone: string) => {
    const cleanPhone = rawPhone.replace(/\D/g, "");
    return `+91${cleanPhone}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length < 10) return setError("Please enter a valid phone number.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    const finalPhone = formatPhone(phone);
    setLoading(true);

    const res = await AuthService.login(finalPhone, password);
    setLoading(false);

    if (res.success && res.sessionEstablished) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(res.error || "Invalid phone number or password.");
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (phone.length < 10) return setError("Please enter a valid phone number.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    const finalPhone = formatPhone(phone);
    setFormattedPhone(finalPhone);
    setLoading(true);

    const res = await AuthService.signUp(finalPhone, password);
    setLoading(false);

    if (res.success) {
      setStep("OTP");
      setCooldown(60);
    } else {
      setError(res.error || "Failed to sign up.");
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (phone.length < 10) return setError("Please enter a valid phone number.");
    const finalPhone = formatPhone(phone);
    setFormattedPhone(finalPhone);
    setLoading(true);

    const res = await AuthService.sendOTP(finalPhone);
    setLoading(false);

    if (res.success) {
      setStep("OTP");
      setCooldown(60);
    } else {
      setError(res.error || "Failed to send reset code.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) return setError("Please enter the 6-digit code.");

    setLoading(true);
    const res = await AuthService.verifyOTP(formattedPhone, otp);
    setLoading(false);

    if (res.success && res.sessionEstablished) {
      if (mode === "FORGOT_PASSWORD") {
        setStep("NEW_PASSWORD");
        setPassword("");
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      setError(res.error || "Invalid code.");
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    const res = await AuthService.updatePassword(password);
    setLoading(false);

    if (res.success) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(res.error || "Failed to update password.");
    }
  };

  const resetState = (newMode: AuthMode) => {
    setMode(newMode);
    setStep("CREDENTIALS");
    setError("");
    setOtp("");
    setPassword("");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-card rounded-xl border-2 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {step === "CREDENTIALS" && mode === "LOGIN" && "Welcome Back"}
          {step === "CREDENTIALS" && mode === "SIGNUP" && "Create Account"}
          {step === "CREDENTIALS" && mode === "FORGOT_PASSWORD" && "Reset Password"}
          {step === "OTP" && "Verify Number"}
          {step === "NEW_PASSWORD" && "Set New Password"}
        </h1>
        <p className="text-muted-foreground">
          {step === "CREDENTIALS" && mode === "FORGOT_PASSWORD" && "Enter your WhatsApp number to receive a reset code."}
          {step === "CREDENTIALS" && mode !== "FORGOT_PASSWORD" && "Enter your details to continue."}
          {step === "OTP" && `We sent a code to ${formattedPhone.replace(/(\d{2})(\d{5})(\d{5})/, "$1 ***** $3")}`}
          {step === "NEW_PASSWORD" && "Enter a new secure password for your account."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-md text-center">
          {error}
        </div>
      )}

      {step === "CREDENTIALS" && mode !== "FORGOT_PASSWORD" && (
        <Tabs defaultValue="login" value={mode.toLowerCase()} onValueChange={(v) => resetState(v.toUpperCase() as AuthMode)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-login">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-medium">+91</span>
                  <Input
                    id="phone-login"
                    type="tel"
                    placeholder="99999 99999"
                    className="pl-20 h-12 text-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password-login">Password</Label>
                  <button type="button" onClick={() => resetState("FORGOT_PASSWORD")} className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Login</>}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-signup">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-medium">+91</span>
                  <Input
                    id="phone-signup"
                    type="tel"
                    placeholder="99999 99999"
                    className="pl-20 h-12 text-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Min 6 characters"
                    className="pl-10 h-12 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold mt-2" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><UserPlus className="mr-2 h-5 w-5" /> Create Account</>}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      )}

      {step === "CREDENTIALS" && mode === "FORGOT_PASSWORD" && (
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone-reset">WhatsApp Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-medium">+91</span>
              <Input
                id="phone-reset"
                type="tel"
                placeholder="99999 99999"
                className="pl-20 h-12 text-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Reset Code"}
          </Button>
          <div className="text-center mt-4">
            <button type="button" onClick={() => resetState("LOGIN")} className="text-sm font-medium text-primary hover:underline">
              Back to Login
            </button>
          </div>
        </form>
      )}

      {step === "OTP" && (
        <form onSubmit={handleVerifyOTP} className="space-y-6 flex flex-col items-center">
          <div className="space-y-2 w-full flex flex-col items-center">
            <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
            <div className="flex justify-center">
              <InputOTP 
                id="otp" 
                maxLength={6} 
                value={otp} 
                onChange={setOtp} 
                disabled={loading}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                  <InputOTPSlot index={1} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                  <InputOTPSlot index={2} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                  <InputOTPSlot index={3} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                  <InputOTPSlot index={4} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                  <InputOTPSlot index={5} className="h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading || otp.length !== 6}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><ShieldCheck className="mr-2 h-5 w-5" /> Verify & Continue</>}
          </Button>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => mode === "FORGOT_PASSWORD" ? handleForgotPassword() : handleSignUp()} 
              disabled={cooldown > 0 || loading}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-all"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't receive code? Resend"}
            </button>
            <div className="mt-2">
              <button 
                type="button" 
                onClick={() => {
                  setStep("CREDENTIALS");
                  setOtp("");
                  setError("");
                }} 
                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all"
              >
                Change phone number
              </button>
            </div>
          </div>
        </form>
      )}

      {step === "NEW_PASSWORD" && (
        <form onSubmit={handleSetNewPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="Min 6 characters"
                className="pl-10 h-12 text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading || password.length < 6}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Update Password & Login"}
          </Button>
        </form>
      )}
    </div>
  );
}
