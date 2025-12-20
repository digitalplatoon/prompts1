import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CategoryCard } from '@/components/CategoryCard';
import { categories, prompts } from '@/data/prompts';

const Categories = () => {
  // Count prompts per category
  const categoryStats = categories.map((category) => ({
    ...category,
    count: prompts.filter((p) => p.category === category.id).length,
  }));

  return (
    <div className="min-h-screen bg-background">
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
            {categoryStats.map((category, index) => (
              <div key={category.id} className="card-glass text-center" style={{ animationDelay: `${index * 50}ms` }}>
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110`}
                >
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {category.count} prompts available
                </p>
                <CategoryCard category={category} />
              </div>
            ))}
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
