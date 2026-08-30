import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Code2, Rocket, Palette } from "lucide-react";

export function Services() {
  const services = [
    {
      title: "Custom Web Design",
      description: "Beautiful, conversion-optimized interfaces tailored to your brand identity.",
      icon: <Palette className="h-10 w-10 text-primary" />,
    },
    {
      title: "Full-Stack Development",
      description: "Robust architectures built on modern tech stacks for speed and reliability.",
      icon: <Code2 className="h-10 w-10 text-primary" />,
    },
    {
      title: "E-Commerce Solutions",
      description: "Secure, scalable online stores designed to maximize your revenue.",
      icon: <Laptop className="h-10 w-10 text-primary" />,
    },
    {
      title: "Performance Optimization",
      description: "Lightning-fast load times and SEO best practices to boost your ranking.",
      icon: <Rocket className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">What We Do</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to establish a powerful digital presence, handled by our expert team.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
