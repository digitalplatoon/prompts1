import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { PromptSubmissionForm } from '@/components/PromptSubmissionForm';
import { FileText } from 'lucide-react';

export default function SubmitPrompt() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Submit Your AI Prompt"
        description="Share your best AI prompts with the 1Prompts community. Submit original prompts and earn from your creativity."
        canonical="https://1prompts.com/submit-prompt"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Submit a Prompt</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Share Your <span className="gradient-text">Creativity</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Submit your best prompts to share with the community. All submissions go through a review process to ensure quality.
            </p>
          </div>

          {/* Guidelines */}
          <div className="card-glass p-6 mb-8">
            <h3 className="font-semibold mb-4">Submission Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Ensure your prompt is original and provides real value
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Include clear placeholders like [TOPIC] for customizable sections
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Write a compelling description that explains the prompt's benefits
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                Add relevant tags to help users discover your prompt
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                Don't submit copyrighted or plagiarized content
              </li>
            </ul>
          </div>

          {/* Submission Form */}
          <PromptSubmissionForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
