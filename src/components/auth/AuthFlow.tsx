"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthService } from "@/lib/auth-service";
import { Loader2, Phone, ShieldCheck } from "lucide-react";

type AuthStep = "PHONE" | "OTP";

export function AuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/configure";

  const [step, setStep] = useState<AuthStep>("PHONE");
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
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

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    // Basic validation for Indian phone numbers (10 digits) + country code
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    // Auto prepend +91 if missing and 10 digits entered
    const finalPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
    setFormattedPhone(finalPhone);
    setLoading(true);

    const res = await AuthService.sendOTP(finalPhone);
    
    setLoading(false);
    if (res.success) {
      setStep("OTP");
      setCooldown(60); // 60 seconds cooldown for resend
    } else {
      setError(res.error || "Failed to send OTP.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const res = await AuthService.verifyOTP(formattedPhone, otp);
    setLoading(false);

    if (res.success && res.sessionEstablished) {
      // Create/link customer record in DB could be handled via a Postgres Trigger 
      // on auth.users insert, or we can do it here/in middleware. 
      // Issue #4: "customers table record creation/linking upon first successful OTP verification"
      // We will handle that on the server side via Edge Functions or Webhooks later, 
      // or directly via Supabase client if we had a dedicated API route. 
      // Actually, a database trigger on `auth.users` is standard in Supabase.
      
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(res.error || "Invalid code.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-card rounded-xl border-2 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {step === "PHONE" ? "Welcome" : "Verify Number"}
        </h1>
        <p className="text-muted-foreground">
          {step === "PHONE" 
            ? "Enter your WhatsApp number to continue." 
            : `We sent a code to ${formattedPhone.replace(/(\d{2})(\d{5})(\d{5})/, "$1 ***** $3")}`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-md text-center">
          {error}
        </div>
      )}

      {step === "PHONE" && (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 99999 99999"
                className="pl-10 h-12 text-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send OTP"}
          </Button>
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
              onClick={() => handleSendOTP()} 
              disabled={cooldown > 0 || loading}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline transition-all"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Didn't receive code? Resend"}
            </button>
            <div className="mt-2">
              <button 
                type="button" 
                onClick={() => {
                  setStep("PHONE");
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
    </div>
  );
}
