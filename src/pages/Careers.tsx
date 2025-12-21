import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, Heart, Laptop, GraduationCap, Users, Sparkles, Coffee, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const benefits = [
  {
    icon: Laptop,
    title: "Remote First",
    description: "Work from anywhere in the world. We're a fully distributed team across 15+ countries.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health, dental, and vision insurance for you and your family.",
  },
  {
    icon: GraduationCap,
    title: "Learning Budget",
    description: "$2,000 annual budget for courses, conferences, and professional development.",
  },
  {
    icon: Plane,
    title: "Unlimited PTO",
    description: "Take the time you need. We trust you to manage your own schedule.",
  },
  {
    icon: Coffee,
    title: "Home Office Setup",
    description: "$1,500 stipend to set up your perfect home office environment.",
  },
  {
    icon: Users,
    title: "Team Retreats",
    description: "Annual all-company retreats to connect and collaborate in person.",
  },
];

const openings = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build beautiful, performant user interfaces for our prompt marketplace.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Shape the future of AI prompt discovery and creation experiences.",
  },
  {
    title: "Machine Learning Engineer",
    department: "AI/ML",
    location: "Remote",
    type: "Full-time",
    description: "Develop ML models for prompt optimization and recommendation systems.",
  },
  {
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Create compelling content that educates and inspires our community.",
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Remote (US)",
    type: "Full-time",
    description: "Help our enterprise customers get the most out of our platform.",
  },
];

const values = [
  {
    title: "Innovation First",
    description: "We push boundaries and embrace new ideas. The AI space moves fast, and so do we.",
  },
  {
    title: "User Obsession",
    description: "Every decision starts with our users. Their success is our success.",
  },
  {
    title: "Radical Transparency",
    description: "We share openly, give honest feedback, and trust each other with information.",
  },
  {
    title: "Continuous Learning",
    description: "We're always learning, growing, and helping each other improve.",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            We're Hiring
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Join Our Mission
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Help us make AI accessible to everyone. We're building the world's largest 
            marketplace for premium AI prompts.
          </p>
          <Button size="lg" asChild>
            <a href="#openings">View Open Positions</a>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50+", label: "Team Members" },
              { value: "15+", label: "Countries" },
              { value: "100K+", label: "Users" },
              { value: "Series A", label: "Funded" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in taking care of our team so they can do their best work.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <benefit.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground">
              Find your next role and join our growing team.
            </p>
          </div>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <p className="text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link to="/contact">Apply Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
          <p className="text-muted-foreground mb-8">
            We're always looking for talented people. Send us your resume and let's chat.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
