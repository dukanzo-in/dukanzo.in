"use client";

import { useState } from "react";
import { Phone, MessageSquare, Mail, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CallUs() {
  const [isOpen, setIsOpen] = useState(false);

  // Configuration for contacts (could be driven by env vars in a real setup)
  const contact = {
    phone: "tel:+919876543210",
    whatsapp: "https://wa.me/919876543210",
    email: "mailto:hello@dukanzo.in"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-background border shadow-xl rounded-xl p-4 w-64 animate-in slide-in-from-bottom-5 fade-in-20">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h4 className="font-bold text-sm">How can we help?</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)} aria-label="Close contact menu">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Link 
              href={contact.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "default" }), "w-full justify-start font-bold")}
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="mr-3 h-4 w-4" /> WhatsApp Dukanzo
            </Link>
            <Link 
              href={contact.phone}
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start font-bold")}
              onClick={() => setIsOpen(false)}
            >
              <Phone className="mr-3 h-4 w-4" /> Call Dukanzo
            </Link>
            <Link 
              href={contact.email}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start font-bold")}
              onClick={() => setIsOpen(false)}
            >
              <Mail className="mr-3 h-4 w-4" /> Send an Enquiry
            </Link>
          </div>
        </div>
      )}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105",
          isOpen ? "bg-muted text-muted-foreground hover:bg-muted" : "bg-primary text-primary-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close contact options" : "Contact Dukanzo"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
}
