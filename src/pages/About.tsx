import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, Target, Heart, Zap } from 'lucide-react';

const values = [
  {
    icon: Sparkles,
    title: 'Quality First',
    description: 'Every prompt is carefully crafted and tested to ensure exceptional results.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    description: 'We focus on prompts that deliver tangible, measurable outcomes.',
  },
  {
    icon: Heart,
    title: 'Community-Focused',
    description: 'Built by creators, for creators. Your success is our success.',
  },
  {
    icon: Zap,
    title: 'Continuous Innovation',
    description: 'Constantly evolving with the latest AI developments and techniques.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="gradient-text">1Prompts</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We're on a mission to democratize AI productivity by providing premium,
              professionally crafted prompts that help creators, businesses, and developers
              unlock the full potential of AI tools.
            </p>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="card-glass">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                1Prompts was founded in 2024 by a team of AI enthusiasts and content creators
                who recognized a gap in the market. While AI tools were becoming increasingly
                powerful, most users weren't getting optimal results due to poorly structured prompts.
              </p>
              <p className="text-muted-foreground">
                We set out to create a marketplace where anyone could access expertly crafted
                prompts that consistently deliver exceptional outcomes. Today, we serve over
                50,000 creators worldwide with a library of 10,000+ premium prompts.
              </p>
            </div>
            <div className="card-glass">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                To empower everyone to harness the full potential of AI through thoughtfully
                designed prompts. We believe that the right prompt can transform a good AI
                output into an exceptional one.
              </p>
              <p className="text-muted-foreground">
                Whether you're a marketer looking for the perfect campaign copy, a developer
                seeking code review assistance, or an artist exploring new creative horizons,
                we have prompts tailored to your needs.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Our <span className="gradient-text">Values</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="card-glass text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Team CTA */}
          <div className="card-glass p-12 text-center gradient-bg-subtle">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to Join Our Team?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              We're always looking for passionate individuals who share our vision for
              democratizing AI productivity. Check out our open positions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
