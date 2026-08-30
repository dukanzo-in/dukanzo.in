export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Tier",
      description: "Select the service package that fits your business needs and budget.",
    },
    {
      number: "02",
      title: "Tell Us What You Want",
      description: "Complete our guided requirement builder so we understand your exact vision.",
    },
    {
      number: "03",
      title: "We Build It",
      description: "Our experts design and develop your website while keeping you in the loop.",
    },
    {
      number: "04",
      title: "Launch & Grow",
      description: "Your digital presence goes live, fast, secure, and ready for customers.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, transparent process from idea to launch.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-muted z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-black text-primary-foreground mb-6 shadow-xl ring-8 ring-background">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
