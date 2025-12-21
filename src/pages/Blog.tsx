import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const featuredPost = {
  title: "The Future of AI Prompts: Trends to Watch in 2024",
  excerpt: "Discover the emerging trends in AI prompt engineering that are shaping how we interact with large language models. From chain-of-thought prompting to multimodal inputs, learn what's next.",
  category: "Industry Insights",
  author: "Sarah Chen",
  date: "December 20, 2024",
  readTime: "8 min read",
  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
};

const posts = [
  {
    title: "10 Prompt Engineering Techniques Every Developer Should Know",
    excerpt: "Master the art of prompt engineering with these essential techniques that will improve your AI outputs dramatically.",
    category: "Tutorials",
    author: "Alex Rivera",
    date: "December 18, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&q=80",
  },
  {
    title: "How We Built Our Prompt Marketplace",
    excerpt: "A behind-the-scenes look at the technical decisions and challenges we faced building a scalable prompt marketplace.",
    category: "Engineering",
    author: "Marcus Johnson",
    date: "December 15, 2024",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
  },
  {
    title: "From Zero to Pro: A Beginner's Guide to AI Prompts",
    excerpt: "New to AI prompts? This comprehensive guide will take you from complete beginner to confident prompt user.",
    category: "Getting Started",
    author: "Emily Watson",
    date: "December 12, 2024",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
  },
  {
    title: "The Psychology Behind Effective AI Prompts",
    excerpt: "Understanding how language models interpret prompts can help you write better, more effective instructions.",
    category: "Research",
    author: "Dr. James Park",
    date: "December 10, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    title: "Case Study: How Company X 10x'd Their Content Output",
    excerpt: "Learn how a Fortune 500 company used our prompts to dramatically increase their content production efficiency.",
    category: "Case Studies",
    author: "Lisa Thompson",
    date: "December 8, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80",
  },
  {
    title: "Prompt Security: Protecting Your AI Workflows",
    excerpt: "Security best practices for using AI prompts in production environments and protecting sensitive data.",
    category: "Security",
    author: "David Kim",
    date: "December 5, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
  },
];

const categories = ["All", "Tutorials", "Engineering", "Research", "Case Studies", "Industry Insights"];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <BookOpen className="w-3 h-3 mr-1" />
            Our Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Insights & Resources
          </h1>
          <p className="text-xl text-muted-foreground">
            Learn about AI prompts, best practices, and industry trends from our team of experts.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Button className="w-fit">
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {post.category}
                  </Badge>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Load More */}
      <section className="pb-20 px-4">
        <div className="container mx-auto text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for the latest articles, tips, and AI prompt insights.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link to="/">Subscribe to Newsletter</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
