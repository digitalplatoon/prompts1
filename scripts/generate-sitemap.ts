// Dynamic Sitemap Generator
// Run with: npx tsx scripts/generate-sitemap.ts

const BASE_URL = 'https://1prompts.com';
const TODAY = new Date().toISOString().split('T')[0];

// Prompt data (mirrors src/data/prompts.ts)
const prompts = [
  { id: '1', title: 'Ultimate Blog Post Generator' },
  { id: '2', title: 'Cinematic Scene Generator' },
  { id: '3', title: 'Code Review Assistant' },
  { id: '4', title: 'Marketing Campaign Planner' },
  { id: '5', title: 'Business Plan Generator' },
  { id: '6', title: 'Fantasy World Builder' },
  { id: '7', title: 'Claude Research Assistant' },
  { id: '8', title: 'Product Photography Style' },
];

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
  { path: '/auth', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/refunds', priority: '0.3', changefreq: 'yearly' },
];

function generateUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap(): string {
  const urls: string[] = [];

  // Add static pages
  urls.push('  <!-- Main Pages -->');
  for (const page of staticPages) {
    urls.push(generateUrl(page.path, TODAY, page.changefreq, page.priority));
  }

  // Add prompt detail pages
  urls.push('\n  <!-- Prompt Detail Pages -->');
  for (const prompt of prompts) {
    urls.push(generateUrl(`/prompt/${prompt.id}`, TODAY, 'weekly', '0.7'));
  }

  // Add blog posts
  urls.push('\n  <!-- Blog Posts -->');
  for (const post of blogPosts) {
    urls.push(generateUrl(`/blog/${post.slug}`, TODAY, 'monthly', '0.7'));
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
