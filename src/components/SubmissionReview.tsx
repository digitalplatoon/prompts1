import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryName } from '@/data/categories';

interface Submission {
  id: string;
  title: string;
  description: string;
  prompt_content: string;
  category: string;
  tags: string[];
  suggested_price: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null };
}

export function SubmissionReview() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from('submitted_prompts')
        .select(`
          *,
          profiles:user_id (display_name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data?.map(s => ({
        ...s,
        profile: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
      })) || [];

      setSubmissions(formatted);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const submission = submissions.find(s => s.id === id);
      if (!submission) throw new Error('Submission not found');

      const { error } = await supabase
        .from('submitted_prompts')
        .update({
          status,
          admin_notes: adminNotes || null,
        })
        .eq('id', id);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-submission-notification', {
          body: {
            userId: submission.user_id,
            promptTitle: submission.title,
            status,
            adminNotes: adminNotes || undefined,
          },
        });
        console.log('Notification email sent');
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: status === 'approved' ? 'Prompt Approved!' : 'Prompt Rejected',
        description: status === 'approved'
          ? 'The prompt has been approved and the submitter has been notified.'
          : 'The submission has been rejected and the submitter has been notified.',
      });

      setSelectedSubmission(null);
      setAdminNotes('');
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? `${cat.icon} ${cat.name}` : id;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Prompt Submissions
          </CardTitle>
          <CardDescription>Review and manage user-submitted prompts</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {filter === 'all' ? '' : filter} submissions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {submission.title}
                      </TableCell>
                      <TableCell>{getCategoryName(submission.category)}</TableCell>
                      <TableCell>{submission.profile?.display_name || 'Anonymous'}</TableCell>
                      <TableCell className="text-primary font-medium">
                        ${submission.suggested_price.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setAdminNotes(submission.admin_notes || '');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.title}</DialogTitle>
            <DialogDescription>
              Review the submission details below
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>{' '}
                  <span className="font-medium">{getCategoryName(selectedSubmission.category)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Suggested Price:</span>{' '}
                  <span className="font-medium text-primary">${selectedSubmission.suggested_price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted By:</span>{' '}
                  <span className="font-medium">{selectedSubmission.profile?.display_name || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>

              {selectedSubmission.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSubmission.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-muted-foreground text-sm">{selectedSubmission.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Full Prompt Content</h4>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedSubmission.prompt_content}
                </div>
              </div>

              {selectedSubmission.status === 'pending' && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Admin Notes (optional)</h4>
                    <Textarea
                      placeholder="Add notes for the submitter..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleReview(selectedSubmission.id, 'approved')}
                      disabled={processing}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReview(selectedSubmission.id, 'rejected')}
                      disabled={processing}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedSubmission.admin_notes && selectedSubmission.status !== 'pending' && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
                  <p className="text-muted-foreground text-sm bg-muted/50 rounded-lg p-3">
                    {selectedSubmission.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
