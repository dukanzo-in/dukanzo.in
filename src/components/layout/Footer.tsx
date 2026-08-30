import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black text-foreground">
                Dukanzo<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional web development for businesses ready to dominate the digital landscape.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Phone className="h-5 w-5" />
                <span className="sr-only">Phone</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <MapPin className="h-5 w-5" />
                <span className="sr-only">Location</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Web Design</Link></li>
              <li><Link href="#" className="hover:text-primary">E-Commerce</Link></li>
              <li><Link href="#" className="hover:text-primary">Custom Applications</Link></li>
              <li><Link href="#" className="hover:text-primary">SEO Optimization</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#portfolio" className="hover:text-primary">Our Work</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dukanzo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
