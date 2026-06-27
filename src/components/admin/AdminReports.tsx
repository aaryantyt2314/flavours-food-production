'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

interface ReportData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalPaidRevenue: number;
    avgOrderValue: number;
    paidOrdersCount: number;
  };
  revenueChart: { date: string; revenue: number; orders: number }[];
  statusChart: { status: string; count: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  categoryChart: { category: string; count: number }[];
  paymentChart: { method: string; count: number }[];
}

const COLORS = ['#8B5A2B', '#E8C99B', '#D4A04A', '#2D7A3A', '#C41E3A', '#3D1F0E', '#6B4226', '#FFD700'];
const STATUS_COLORS: Record<string, string> = {
  'Placed': '#EAB308', 'Confirmed': '#3B82F6', 'Preparing': '#F97316',
  'Out for Delivery': '#8B5CF6', 'Ready': '#22C55E', 'Completed': '#16A34A', 'Cancelled': '#EF4444',
};

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchReports();
    });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load reports</div>;
  }

  const { summary, revenueChart, statusChart, topItems, categoryChart, paymentChart } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-brand-dark">{summary.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-brand-dark">₹{summary.totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-xl font-bold text-brand-dark">₹{summary.avgOrderValue}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid Orders</p>
              <p className="text-xl font-bold text-brand-dark">{summary.paidOrdersCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8C99B" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E8C99B' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8B5A2B" strokeWidth={2} name="Revenue (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#D4A04A" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No order data yet. Charts will appear once orders are placed.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {statusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No order data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="method"
                    label={({ method, count }) => `${method}: ${count}`}
                  >
                    {paymentChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No payment data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topItems.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8C99B" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#8B5A2B" name="Qty Sold" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8C99B" />
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]}>
                    {categoryChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No category data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
