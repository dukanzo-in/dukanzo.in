import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">
            Come Into <span className="text-primary">Digital.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
            Professional, high-performance web development for businesses that want to stand out. 
            No confusing dashboards, just beautiful results built by experts.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/configure" className={buttonVariants({ variant: "default", size: "lg", className: "h-14 px-8 text-lg font-semibold" })}>
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#portfolio" className={buttonVariants({ variant: "outline", size: "lg", className: "h-14 px-8 text-lg font-semibold border-2" })}>
              View Our Work
            </Link>
          </div>
          <div className="pt-8 text-sm font-medium text-muted-foreground">
            Trusted by 50+ businesses across India.
          </div>
        </div>
      </div>
      
      {/* Decorative abstract elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl">
        <div className="h-[400px] w-[600px] rounded-full bg-primary/40 mix-blend-multiply" />
      </div>
    </section>
  );
}
