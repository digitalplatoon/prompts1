import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCategories, type PromptCategory } from '@/lib/db/prompts';
import { toast } from 'sonner';
import { AdminPromptForm } from './AdminPromptForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Star, Search, Loader2 } from 'lucide-react';

interface PromptRow {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  preview: string;
  category_id: string | null;
  price_cents: number;
  tags: string[] | null;
  usage_instructions: string[] | null;
  example_outputs: string[] | null;
  status: string | null;
  is_featured: boolean | null;
  created_at: string;
}

// Columns admins fetch for the list view. full_prompt is intentionally excluded
// (revoked at the column level) and loaded on demand via a secure RPC when editing.
const ADMIN_LIST_COLUMNS =
  'id, title, slug, short_description, preview, category_id, price_cents, tags, usage_instructions, example_outputs, status, is_featured, created_at';

export function AdminPromptManager() {
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prompts')
      .select(ADMIN_LIST_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load prompts');
      console.error(error);
    } else {
      setPrompts((data as PromptRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
    getCategories().then(setCategories);
  }, []);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return prompts.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [prompts, statusFilter, search]);

  const handleEdit = async (p: PromptRow) => {
    setLoadingEdit(true);
    // Fetch full_prompt via admin-only RPC (column is not directly readable)
    const { data, error } = await supabase.rpc('get_admin_prompt_full', { p_prompt_id: p.id });
    setLoadingEdit(false);
    if (error) {
      toast.error('Failed to load prompt content');
      return;
    }
    const fullPrompt = (data as any)?.[0]?.full_prompt ?? '';
    setEditingPrompt({
      id: p.id,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      preview: p.preview,
      full_prompt: fullPrompt,
      category_id: p.category_id,
      price_cents: p.price_cents,
      tags: p.tags || [],
      usage_instructions: p.usage_instructions || [],
      example_outputs: p.example_outputs || [],
      status: p.status || 'draft',
      is_featured: p.is_featured || false,
    });
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingPrompt(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('prompts').delete().eq('id', deleteId);
    if (error) {
      toast.error('Failed to delete prompt');
    } else {
      toast.success('Prompt deleted');
      fetchPrompts();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Card className="card-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompt Management</CardTitle>
              <CardDescription>Create, edit, and manage all prompts</CardDescription>
            </div>
            <Button onClick={handleNew} className="gap-1">
              <Plus className="w-4 h-4" /> New Prompt
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No prompts found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                      <TableCell>{p.category_id ? categoryMap[p.category_id] || '—' : '—'}</TableCell>
                      <TableCell className="text-primary font-medium">${(p.price_cents / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(p.status)}>{p.status || 'draft'}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <AdminPromptForm
        open={formOpen}
        onOpenChange={setFormOpen}
        prompt={editingPrompt}
        onSaved={fetchPrompts}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The prompt and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
