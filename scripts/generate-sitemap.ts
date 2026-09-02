// Dynamic Sitemap Generator
// Run with: npx tsx scripts/generate-sitemap.ts

const BASE_URL = 'https://1prompts.com';

// Blog posts (mirrors src/data/blogPosts.ts)
const blogPosts = [
  { slug: 'future-of-ai-prompts-2024' },
  { slug: '10-prompt-engineering-techniques' },
  { slug: 'how-we-built-our-prompt-marketplace' },
  { slug: 'beginners-guide-to-ai-prompts' },
  { slug: 'psychology-behind-effective-prompts' },
  { slug: 'case-study-company-x-content-output' },
  { slug: 'prompt-security-protecting-ai-workflows' },
];

// Static pages
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/browse', priority: '0.9', changefreq: 'daily' },
  { path: '/categories', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/api', priority: '0.7', changefreq: 'monthly' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly' },
  { path: '/security', priority: '0.5', changefreq: 'monthly' },
  { path: '/submit-prompt', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/refunds', priority: '0.3', changefreq: 'yearly' },
];

function generateUrl(loc: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap(): string {
  const urls: string[] = [];

  // Add static pages
  urls.push('  <!-- Main Pages -->');
  for (const page of staticPages) {
    urls.push(generateUrl(page.path, page.changefreq, page.priority));
  }

  // Note: Prompt detail pages should be generated dynamically from the database
  // using slug-based URLs: /prompt/{slug}
  // For now, run `npx tsx scripts/generate-sitemap.ts` and manually add prompt URLs
  // after querying: SELECT slug FROM prompts WHERE status = 'published';

  // Add blog posts
  urls.push('\n  <!-- Blog Posts -->');
  for (const post of blogPosts) {
    urls.push(generateUrl(`/blog/${post.slug}`, 'monthly', '0.7'));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// Generate and output sitemap
const sitemap = generateSitemap();
console.log(sitemap);
console.log('\n\n--- Copy the above XML to public/sitemap.xml ---');
