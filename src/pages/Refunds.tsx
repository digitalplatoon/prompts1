import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Refunds = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Refund Policy"
        description="Learn when 1Prompts issues refunds on digital AI prompt purchases, how to request one, and typical processing timelines."
        canonical="https://1prompts.com/refunds"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 21, 2024</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Digital Products</h2>
            <p className="text-muted-foreground leading-relaxed">
              Due to the nature of digital products, all sales on 1Prompts are generally final. 
              Once a prompt has been delivered to your account, it cannot be returned as it has 
              already been accessed and downloaded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Eligibility for Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may consider refunds in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>The prompt was significantly different from its description</li>
              <li>Technical issues prevented you from accessing the prompt</li>
              <li>Duplicate charges occurred due to a system error</li>
              <li>The prompt was purchased in error (within 24 hours, before viewing)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Refund Request Process</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
              <li>Contact our support team within 7 days of purchase</li>
              <li>Provide your order number and reason for the refund</li>
              <li>Include any relevant screenshots or documentation</li>
              <li>Allow up to 5 business days for review</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Refund Timeline</h2>
            <p className="text-muted-foreground leading-relaxed">
              If your refund is approved, it will be processed within 5-10 business days. 
              The refund will be credited to your original payment method. Please note that 
              your bank may take additional time to reflect the refund in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Non-Refundable Items</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Prompts that have been accessed or downloaded</li>
              <li>Requests made more than 7 days after purchase</li>
              <li>Dissatisfaction with prompt results (AI outputs vary)</li>
              <li>Changes in personal circumstances or preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Chargebacks</h2>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to contact us before initiating a chargeback with your bank. 
              Chargebacks can result in account suspension and additional fees. We are committed 
              to resolving any issues directly and fairly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For refund requests or questions about this policy, please contact us at{" "}
              <a href="mailto:support@1prompts.com" className="text-primary hover:underline">
                support@1prompts.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Refunds;
