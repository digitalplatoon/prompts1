import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Check, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI prompts",
    features: [
      { name: "5 free prompts per month", included: true },
      { name: "Basic prompt categories", included: true },
      { name: "Community support", included: true },
      { name: "Email support", included: false },
      { name: "Premium prompts", included: false },
      { name: "API access", included: false },
      { name: "Custom prompts", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For professionals who need more power",
    features: [
      { name: "Unlimited prompts", included: true },
      { name: "All prompt categories", included: true },
      { name: "Priority support", included: true },
      { name: "Email support", included: true },
      { name: "Premium prompts", included: true },
      { name: "API access", included: true },
      { name: "Custom prompts", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For teams and organizations at scale",
    features: [
      { name: "Unlimited prompts", included: true },
      { name: "All prompt categories", included: true },
      { name: "Dedicated support", included: true },
      { name: "24/7 phone support", included: true },
      { name: "Premium prompts", included: true },
      { name: "API access", included: true },
      { name: "Custom prompts", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes! We offer a 14-day free trial for the Pro plan. No credit card required to start.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings.",
  },
];

const Pricing = () => {
  // FAQ structured data for rich results
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing - Affordable AI Prompts for Every Budget"
        description="Choose the perfect 1Prompts plan for your needs. Free tier available. Pro plan for professionals. Enterprise solutions for teams. No hidden fees."
        canonical="https://1prompts.com/pricing"
        structuredData={faqStructuredData}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">/{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={tier.name === "Enterprise" ? "/contact" : "/auth"}>
                      {tier.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of professionals using our premium AI prompts.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
