import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Request Submitted | Dukanzo",
  description: "Your Dukanzo website requirements have been submitted successfully.",
};

export default async function SuccessPage(props: {
  searchParams: Promise<{ id?: string }>
}) {
  const searchParams = await props.searchParams;
  const requestId = searchParams.id || "DUK-UNKNOWN";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/10 py-16 px-4 text-center">
        <div className="max-w-xl w-full bg-card rounded-2xl border-2 shadow-sm p-8 md:p-12">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight mb-4">You're all set.</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your website requirements have been successfully sent to the Dukanzo team.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Project Request ID
            </p>
            <p className="text-3xl font-bold font-mono tracking-wider">{requestId}</p>
          </div>

          <p className="text-muted-foreground mb-8 text-sm">
            Our team will review your requirements and contact you shortly to confirm the details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="https://wa.me/919876543210" 
              target="_blank"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "font-bold")}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Us
            </Link>
            <Link 
              href="tel:+919876543210"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-bold border-2")}
            >
              <Phone className="w-4 h-4 mr-2" /> Call Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
