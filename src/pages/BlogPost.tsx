import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { TableOfContents, calculateReadingTime } from "@/components/TableOfContents";
import { useCodeBlockCopy } from "@/components/CodeBlock";
import { getBlogPostBySlug, getRelatedPosts, blogPosts } from "@/data/blogPosts";
import { useEffect, useMemo } from "react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];

  // Enable copy button for code blocks
  useCodeBlockCopy();

  // Calculate reading time based on actual content
  const readingTime = useMemo(() => {
    return post ? calculateReadingTime(post.content) : "0 min read";
  }, [post]);

  // Find previous and next posts for navigation
  const currentIndex = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Navbar />
      
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="relative container mx-auto h-full flex items-end pb-12 px-4">
          <div className="max-w-3xl">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog
            </Link>
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.authorAvatar} alt={post.author} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readingTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content with TOC Sidebar */}
      <article className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-12">
            {/* Table of Contents Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents content={post.content} />
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:marker:text-primary
                  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                  prose-table:border prose-table:border-border
                  prose-th:bg-muted prose-th:p-3 prose-th:text-foreground
                  prose-td:p-3 prose-td:border-t prose-td:border-border"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />

              {/* Author and Share Section */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.authorAvatar} alt={post.author} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-muted-foreground">Author</p>
                    </div>
                  </div>
                  <SocialShareButtons title={post.title} url={currentUrl} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Post Navigation */}
      <section className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-between gap-4">
            {prevPost ? (
              <Button
                variant="ghost"
                className="flex-1 justify-start h-auto py-4 text-left"
                onClick={() => navigate(`/blog/${prevPost.slug}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Previous</p>
                  <p className="font-medium truncate">{prevPost.title}</p>
                </div>
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            {nextPost ? (
              <Button
                variant="ghost"
                className="flex-1 justify-end h-auto py-4 text-right"
                onClick={() => navigate(`/blog/${nextPost.slug}`)}
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Next</p>
                  <p className="font-medium truncate">{nextPost.title}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
              </Button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card 
                  key={relatedPost.slug} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                >
                  <div className="aspect-video">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {relatedPost.category}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-lg">{relatedPost.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {relatedPost.author}
                      </span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Explore More Content</h2>
          <p className="text-muted-foreground mb-6">
            Discover more articles about AI prompts, best practices, and industry insights.
          </p>
          <Button asChild size="lg">
            <Link to="/blog">View All Articles</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Simple markdown-like content formatter with heading IDs for TOC
function formatContent(content: string): string {
  const lines = content.split('\n');
  let lineIndex = 0;
  
  return lines.map((line, idx) => {
    lineIndex = idx;
    return line;
  }).join('\n')
    // Headers with IDs for TOC linking
    .replace(/^### (.*$)/gim, (match, p1, offset) => {
      const lineNum = content.substring(0, offset).split('\n').length - 1;
      return `<h3 id="heading-${lineNum}">${p1}</h3>`;
    })
    .replace(/^## (.*$)/gim, (match, p1, offset) => {
      const lineNum = content.substring(0, offset).split('\n').length - 1;
      return `<h2 id="heading-${lineNum}">${p1}</h2>`;
    })
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // Wrap list items
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      if (match.includes('1.')) {
        return `<ol>${match}</ol>`;
      }
      return `<ul>${match}</ul>`;
    })
    // Tables (simple support)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      if (cells.every((cell: string) => cell.match(/^-+$/))) {
        return ''; // Skip separator row
      }
      const tag = match.includes('---') ? 'th' : 'td';
      return `<tr>${cells.map((cell: string) => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupol])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '');
}

export default BlogPost;
