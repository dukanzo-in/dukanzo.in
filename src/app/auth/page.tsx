import { AuthFlow } from "@/components/auth/AuthFlow";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "Authenticate | Dukanzo",
  description: "Secure login to Dukanzo.",
};

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4">
        <Suspense fallback={<div className="w-full max-w-md mx-auto p-6 md:p-8 bg-card rounded-xl border-2 shadow-sm text-center">Loading...</div>}>
          <AuthFlow />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
