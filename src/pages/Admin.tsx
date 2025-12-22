import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Package,
  Heart,
  Calendar,
  LineChart,
  FileText
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { prompts } from '@/data/prompts';
import { UserManagement } from '@/components/UserManagement';
import { SubscriberManagement } from '@/components/SubscriberManagement';
import { AdminCharts } from '@/components/AdminCharts';
import { SubmissionReview } from '@/components/SubmissionReview';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PurchaseData {
  id: string;
  prompt_id: string;
  user_id: string;
  price: number;
  purchased_at: string;
  profile?: {
    display_name: string | null;
  };
}

interface StatsData {
  totalRevenue: number;
  totalPurchases: number;
  totalUsers: number;
  totalFavorites: number;
}

export default function Admin() {
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalRevenue: 0,
    totalPurchases: 0,
    totalUsers: 0,
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch purchases with profiles
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchased_prompts')
        .select(`
          id,
          prompt_id,
          user_id,
          price,
          purchased_at,
          profiles:user_id (display_name)
        `)
        .order('purchased_at', { ascending: false })
        .limit(50);

      if (purchaseError) throw purchaseError;

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Fetch favorites count
      const { count: favCount, error: favError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      if (favError) throw favError;

      // Calculate stats
      const formattedPurchases = purchaseData?.map(p => ({
        ...p,
        profile: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      })) || [];

      const totalRevenue = formattedPurchases.reduce((sum, p) => sum + Number(p.price), 0);

      setPurchases(formattedPurchases);
      setStats({
        totalRevenue,
        totalPurchases: formattedPurchases.length,
        totalUsers: userCount || 0,
        totalFavorites: favCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPromptTitle = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    return prompt?.title || promptId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin Dashboard"
        description="1Prompts admin dashboard for managing users, subscriptions, analytics, and content submissions."
        noindex={true}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Analytics & <span className="gradient-text">Management</span>
            </h1>
            <p className="text-muted-foreground">
              Overview of purchases, users, and platform activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From all purchases
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Purchases
                </CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalPurchases}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prompts sold
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Registered Users
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active accounts
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Favorites
                </CardTitle>
                <Heart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalFavorites}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Saved prompts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <LineChart className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Submissions
              </TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AdminCharts />
            </TabsContent>

            <TabsContent value="submissions">
              <SubmissionReview />
            </TabsContent>

            <TabsContent value="purchases">
              {/* Recent Purchases Table */}
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recent Purchases
                  </CardTitle>
                  <CardDescription>
                    Latest transactions across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchases yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Prompt</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-medium">
                                {getPromptTitle(purchase.prompt_id)}
                              </TableCell>
                              <TableCell>
                                {purchase.profile?.display_name || 'Anonymous'}
                              </TableCell>
                              <TableCell className="text-primary font-medium">
                                ${Number(purchase.price).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(purchase.purchased_at)}
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
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="subscribers">
              <SubscriberManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
