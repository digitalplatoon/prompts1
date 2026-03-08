import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Plus } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { categories } from '@/data/categories';

const submissionSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(500, 'Description must be less than 500 characters'),
  promptContent: z.string().trim().min(50, 'Prompt content must be at least 50 characters').max(5000, 'Prompt content must be less than 5000 characters'),
  category: z.string().min(1, 'Please select a category'),
  suggestedPrice: z.number().min(0, 'Price must be positive').max(100, 'Price must be less than $100'),
});

export function PromptSubmissionForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptContent: '',
    category: '',
    suggestedPrice: 0,
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a prompt.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // Validate form
    const validation = submissionSchema.safeParse({
      title: formData.title,
      description: formData.description,
      promptContent: formData.promptContent,
      category: formData.category,
      suggestedPrice: formData.suggestedPrice,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('submitted_prompts').insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        prompt_content: formData.promptContent.trim(),
        category: formData.category,
        tags: formData.tags,
        suggested_price: formData.suggestedPrice,
      });

      if (error) throw error;

      toast({
        title: 'Prompt Submitted!',
        description: 'Your prompt has been submitted for review. We\'ll notify you once it\'s approved.',
      });

      navigate('/my-prompts');
    } catch (error: any) {
      console.error('Error submitting prompt:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glass max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Submit Your Prompt
        </CardTitle>
        <CardDescription>
          Share your prompt with the community. All submissions are reviewed before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Prompt Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Ultimate Blog Post Generator"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe what your prompt does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Prompt Content */}
          <div className="space-y-2">
            <Label htmlFor="promptContent">Full Prompt Content *</Label>
            <Textarea
              id="promptContent"
              placeholder="Enter your complete prompt here..."
              value={formData.promptContent}
              onChange={(e) => setFormData({ ...formData, promptContent: e.target.value })}
              rows={8}
              className={`font-mono text-sm ${errors.promptContent ? 'border-destructive' : ''}`}
            />
            {errors.promptContent && <p className="text-sm text-destructive">{errors.promptContent}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`input-glass w-full ${errors.category ? 'border-destructive' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={formData.tags.length >= 5}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Price */}
          <div className="space-y-2">
            <Label htmlFor="suggestedPrice">Suggested Price ($)</Label>
            <Input
              id="suggestedPrice"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={formData.suggestedPrice || ''}
              onChange={(e) => setFormData({ ...formData, suggestedPrice: parseFloat(e.target.value) || 0 })}
              className={errors.suggestedPrice ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">Set to 0 for a free prompt. Final price may be adjusted during review.</p>
            {errors.suggestedPrice && <p className="text-sm text-destructive">{errors.suggestedPrice}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full btn-gradient" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
