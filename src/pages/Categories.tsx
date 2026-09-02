import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/CategoryCard';
import { SEO } from '@/components/SEO';
import { useCategories, usePromptCountsByCategory } from '@/hooks/usePrompts';
import { Skeleton } from '@/components/ui/skeleton';

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { data: promptCounts = {} } = usePromptCountsByCategory();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Prompt Categories by Tool & Use Case"
        description="Browse AI prompts by category: ChatGPT, Midjourney, Claude, DALL-E, plus writing, coding, marketing, and creative prompts."
        canonical="https://1prompts.com/categories"
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">Categories</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Find the perfect prompt for your favorite AI tool
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-glass text-center">
                  <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
            ) : (
              categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  promptCount={promptCounts[category.id] || 0}
                  index={index}
                />
              ))
            )}
          </div>

          {/* Info Section */}
          <div className="mt-20 card-glass p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're constantly adding new categories and prompts. Let us know what you need
              and we'll work on adding it to our collection.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
