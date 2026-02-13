import { useState, useEffect, KeyboardEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCategories, type PromptCategory } from '@/lib/db/prompts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';

interface PromptData {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  preview: string;
  full_prompt: string;
  category_id: string | null;
  price_cents: number;
  tags: string[];
  usage_instructions: string[];
  example_outputs: string[];
  status: string;
  is_featured: boolean;
}

interface AdminPromptFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: PromptData | null;
  onSaved: () => void;
}

const emptyForm: PromptData = {
  title: '',
  slug: '',
  short_description: '',
  preview: '',
  full_prompt: '',
  category_id: null,
  price_cents: 0,
  tags: [],
  usage_instructions: [],
  example_outputs: [],
  status: 'draft',
  is_featured: false,
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminPromptForm({ open, onOpenChange, prompt, onSaved }: AdminPromptFormProps) {
  const [form, setForm] = useState<PromptData>(emptyForm);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const isEditing = !!prompt?.id;

  useEffect(() => {
    if (open) {
      getCategories().then(setCategories);
      if (prompt) {
        setForm(prompt);
        setPriceDisplay((prompt.price_cents / 100).toFixed(2));
        setSlugManuallyEdited(true);
      } else {
        setForm(emptyForm);
        setPriceDisplay('');
        setSlugManuallyEdited(false);
      }
    }
  }, [open, prompt]);

  const updateField = <K extends keyof PromptData>(key: K, value: PromptData[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !slugManuallyEdited) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const handlePriceChange = (val: string) => {
    setPriceDisplay(val);
    const cents = Math.round(parseFloat(val || '0') * 100);
    setForm(prev => ({ ...prev, price_cents: isNaN(cents) ? 0 : cents }));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !form.tags.includes(tag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const validate = (): string | null => {
    if (form.title.length < 3) return 'Title must be at least 3 characters';
    if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) return 'Slug must be URL-safe (lowercase letters, numbers, hyphens)';
    if (!form.short_description) return 'Short description is required';
    if (!form.preview) return 'Preview is required';
    if (!form.full_prompt) return 'Full prompt is required';
    if (!form.category_id) return 'Category is required';
    if (form.price_cents <= 0) return 'Price must be greater than 0';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        short_description: form.short_description,
        preview: form.preview,
        full_prompt: form.full_prompt,
        category_id: form.category_id,
        price_cents: form.price_cents,
        tags: form.tags,
        usage_instructions: form.usage_instructions,
        example_outputs: form.example_outputs,
        status: form.status,
        is_featured: form.is_featured,
      };

      if (isEditing) {
        const { error } = await supabase.from('prompts').update(payload).eq('id', prompt!.id!);
        if (error) throw error;
        toast.success('Prompt updated');
      } else {
        const { error } = await supabase.from('prompts').insert(payload);
        if (error) throw error;
        toast.success('Prompt created');
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Prompt' : 'New Prompt'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Ultimate Blog Post Generator" />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={e => { setSlugManuallyEdited(true); updateField('slug', e.target.value); }}
              placeholder="ultimate-blog-post-generator"
              className="font-mono text-sm"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <Label>Short Description *</Label>
            <Textarea value={form.short_description} onChange={e => updateField('short_description', e.target.value)} rows={2} />
          </div>

          {/* Preview */}
          <div className="space-y-1">
            <Label>Preview *</Label>
            <Textarea value={form.preview} onChange={e => updateField('preview', e.target.value)} rows={3} placeholder="Public preview snippet shown to browsers" />
          </div>

          {/* Full Prompt */}
          <div className="space-y-1">
            <Label>Full Prompt * (sold content)</Label>
            <Textarea
              value={form.full_prompt}
              onChange={e => updateField('full_prompt', e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="The complete prompt content buyers receive..."
            />
          </div>

          {/* Category + Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select value={form.category_id || ''} onValueChange={val => updateField('category_id', val)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Price (USD) *</Label>
              <Input type="number" step="0.01" min="0.01" value={priceDisplay} onChange={e => handlePriceChange(e.target.value)} placeholder="9.99" />
            </div>
          </div>

          {/* Status + Featured row */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={val => updateField('status', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={form.is_featured} onCheckedChange={val => updateField('is_featured', val)} />
              <Label>Featured</Label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {form.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter"
            />
          </div>

          {/* Usage Instructions */}
          <div className="space-y-1">
            <Label>Usage Instructions (one per line)</Label>
            <Textarea
              value={(form.usage_instructions || []).join('\n')}
              onChange={e => updateField('usage_instructions', e.target.value.split('\n').filter(Boolean))}
              rows={3}
              placeholder="Step 1: Copy the prompt&#10;Step 2: Paste into ChatGPT"
            />
          </div>

          {/* Example Outputs */}
          <div className="space-y-1">
            <Label>Example Outputs (one per line)</Label>
            <Textarea
              value={(form.example_outputs || []).join('\n')}
              onChange={e => updateField('example_outputs', e.target.value.split('\n').filter(Boolean))}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
