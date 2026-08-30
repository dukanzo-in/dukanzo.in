import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "How long does it take to build a website?",
      answer: "A basic website typically takes 1-2 weeks. More complex applications like e-commerce or custom portals can take 3-6 weeks depending on requirements.",
    },
    {
      question: "Will my website work on mobile devices?",
      answer: "Absolutely. We build with a mobile-first approach ensuring your website looks and works perfectly on smartphones, tablets, and desktops.",
    },
    {
      question: "Do I need to write the content?",
      answer: "You can provide your own content, or we can assist you with copywriting. Our Guided Requirement Builder will help you structure everything we need.",
    },
    {
      question: "What happens after the website is launched?",
      answer: "We offer ongoing support and maintenance packages. Even without a package, we ensure you have full ownership and access to everything we build.",
    },
    {
      question: "Can I upgrade my tier later?",
      answer: "Yes, you can easily scale up from Basic to Standard or Premium as your business grows.",
    },
  ];

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
        </div>
        
        <div className="mx-auto max-w-3xl">
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
