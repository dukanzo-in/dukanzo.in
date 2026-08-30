import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  const tiers = [
    {
      name: "Basic",
      price: "₹500",
      description: "Essential web presence for small businesses.",
      features: ["Up to 5 Pages", "2 Revisions", "Mobile Responsive", "Contact Form"],
      buttonText: "Choose Basic",
      popular: false,
    },
    {
      name: "Standard",
      price: "₹1,000",
      description: "Professional website with dynamic features.",
      features: ["Up to 10 Pages", "5 Revisions", "Custom UI/UX", "CMS Integration", "SEO Optimization"],
      buttonText: "Choose Standard",
      popular: true,
    },
    {
      name: "Premium",
      price: "₹2,500",
      description: "Custom advanced application with high performance.",
      features: ["Unlimited Pages", "Unlimited Revisions", "E-Commerce", "Custom Backend", "Priority Support"],
      buttonText: "Choose Premium",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your digital journey. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <Card key={index} className={`relative flex flex-col ${tier.popular ? 'border-primary border-2 shadow-xl scale-105 z-10' : 'border-2'}`}>
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="h-10">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-black">{tier.price}</span>
                  <span className="text-muted-foreground">/project</span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={`/configure?tier=${tier.name.toLowerCase()}`} className={buttonVariants({ variant: tier.popular ? "default" : "outline", className: "w-full" })}>
                  {tier.buttonText}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
