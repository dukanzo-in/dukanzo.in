"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const routes = [
    { name: "Services", href: "#services" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black text-foreground">
            Dukanzo<span className="text-primary">.</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {route.name}
            </Link>
          ))}
          <Link href="/configure" className={buttonVariants({ variant: "default", className: "font-semibold text-primary-foreground" })}>
            Start Your Project
          </Link>
        </nav>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            }
          />
          <SheetContent side="right">
            <div className="flex flex-col space-y-6 pt-10">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="text-lg font-semibold text-foreground/70 transition-colors hover:text-foreground"
                >
                  {route.name}
                </Link>
              ))}
              <Link href="/configure" className={buttonVariants({ variant: "default", className: "w-full font-semibold" })}>
                Start Your Project
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
