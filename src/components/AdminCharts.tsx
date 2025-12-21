import { useEffect, useState } from 'react';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  purchases: number;
}

interface UserGrowthData {
  date: string;
  users: number;
}

export function AdminCharts() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Get last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Fetch purchases for revenue chart
      const { data: purchases, error: purchaseError } = await supabase
        .from('purchased_prompts')
        .select('price, purchased_at')
        .gte('purchased_at', thirtyDaysAgo.toISOString())
        .order('purchased_at', { ascending: true });

      if (purchaseError) throw purchaseError;

      // Fetch profiles for user growth
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (profileError) throw profileError;

      // Process revenue data by day
      const revenueByDay = new Map<string, { revenue: number; purchases: number }>();
      
      // Initialize all 30 days
      for (let i = 30; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        revenueByDay.set(date, { revenue: 0, purchases: 0 });
      }

      // Aggregate purchases
      purchases?.forEach((p) => {
        const date = format(parseISO(p.purchased_at), 'yyyy-MM-dd');
        const existing = revenueByDay.get(date) || { revenue: 0, purchases: 0 };
        revenueByDay.set(date, {
          revenue: existing.revenue + Number(p.price),
          purchases: existing.purchases + 1,
        });
      });

      // Process user growth data
      const usersByDay = new Map<string, number>();
      
      // Initialize all 30 days
      for (let i = 30; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        usersByDay.set(date, 0);
      }

      // Count new users per day
      profiles?.forEach((p) => {
        const date = format(parseISO(p.created_at), 'yyyy-MM-dd');
        const existing = usersByDay.get(date) || 0;
        usersByDay.set(date, existing + 1);
      });

      // Convert to arrays for charts
      const revenueArray: RevenueData[] = Array.from(revenueByDay.entries()).map(([date, data]) => ({
        date: format(parseISO(date), 'MMM dd'),
        revenue: data.revenue,
        purchases: data.purchases,
      }));

      // Calculate cumulative users
      let cumulativeUsers = 0;
      const userArray: UserGrowthData[] = Array.from(usersByDay.entries()).map(([date, count]) => {
        cumulativeUsers += count;
        return {
          date: format(parseISO(date), 'MMM dd'),
          users: cumulativeUsers,
        };
      });

      setRevenueData(revenueArray);
      setUserGrowthData(userArray);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Chart */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Over Time
          </CardTitle>
          <CardDescription>Daily revenue for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            User Growth
          </CardTitle>
          <CardDescription>Cumulative user registrations over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [value, 'Total Users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Purchases Chart */}
      <Card className="card-glass md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Purchases
          </CardTitle>
          <CardDescription>Number of purchases per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [value, 'Purchases']}
                />
                <Bar
                  dataKey="purchases"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
