import { Link } from 'react-router-dom';
import { Sparkles, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { NewsletterForm } from '@/components/NewsletterForm';

const footerLinks = {
  product: [
    { name: 'Browse Prompts', path: '/browse' },
    { name: 'Categories', path: '/categories' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api' },
    { name: 'Submit Prompt', path: '/submit' },
  ],
  resources: [
    { name: 'Blog', path: '/blog' },
    { name: 'Prompt Engineering Guide', path: '/blog/10-prompt-engineering-techniques' },
    { name: 'Beginner\'s Guide', path: '/blog/beginners-guide-to-ai-prompts' },
    { name: 'Prompt Security', path: '/blog/prompt-security-protecting-ai-workflows' },
  ],
  company: [
    { name: 'About', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refunds' },
    { name: 'Unsubscribe', path: '/unsubscribe' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/1Prompts', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/1prompts', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/1prompts', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@1prompts.com', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <div className="card-glass p-8 md:p-12 mb-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated with <span className="gradient-text">New Prompts</span>
          </h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get weekly curated prompts, tips, and exclusive deals delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                1<span className="gradient-text">Prompts</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              The premium marketplace for AI prompts. Elevate your AI workflow with professionally crafted prompts.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 1Prompts. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ✨ for AI creators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
