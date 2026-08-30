import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-primary py-24 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl mb-6">
          Ready to Step Into the Digital World?
        </h2>
        <p className="mx-auto max-w-2xl text-xl opacity-90 mb-10">
          Get started with Dukanzo today. Our experts are ready to build a powerful web presence for your business.
        </p>
        <Link href="/configure" className={buttonVariants({ variant: "secondary", size: "lg", className: "h-14 px-8 text-lg font-semibold text-primary" })}>
          Start Your Project Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
