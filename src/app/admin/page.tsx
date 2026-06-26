'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  LayoutDashboard, UtensilsCrossed, Package, Users, Tag, Image, MessageSquare, BarChart3,
  CreditCard, CalendarDays, ArrowLeft, Plus, Edit, Trash2, Eye, Search, ChefHat
} from 'lucide-react';
import { toast } from 'sonner';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { icon: UtensilsCrossed, label: 'Menu', section: 'menu' },
  { icon: Package, label: 'Orders', section: 'orders' },
  { icon: Users, label: 'Customers', section: 'customers' },
  { icon: Tag, label: 'Coupons', section: 'coupons' },
  { icon: Image, label: 'Banners', section: 'banners' },
  { icon: MessageSquare, label: 'Inquiries', section: 'inquiries' },
  { icon: CalendarDays, label: 'Reservations', section: 'reservations' },
  { icon: BarChart3, label: 'Reports', section: 'reports' },
  { icon: CreditCard, label: 'Payments', section: 'payments' },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const router = useRouter();

  // Data states
  const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, items: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const loadAllData = useCallback(async () => {
    try {
      const [ordersRes, menuRes, customersRes, reservationsRes, inquiriesRes, couponsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/menu'),
        fetch('/api/admin/customers'),
        fetch('/api/reservations'),
        fetch('/api/contacts'),
        fetch('/api/admin/coupons'),
      ]);

      const [ordersData, menuData, customersData, reservationsData, inquiriesData, couponsData] = await Promise.all([
        ordersRes.json(), menuRes.json(), customersRes.json(), reservationsRes.json(), inquiriesRes.json(), couponsRes.json(),
      ]);

      setOrders(ordersData);
      setMenuItems(menuData);
      setCustomers(customersData);
      setReservations(reservationsData);
      setInquiries(inquiriesData);
      setCoupons(couponsData);

      const totalRevenue = ordersData.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      setStats({
        orders: ordersData.length,
        revenue: totalRevenue,
        customers: customersData.length,
        items: menuData.length,
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('flavours-user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'admin') {
          toast.error('Admin access required');
          router.push('/login');
          return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(u);
        loadAllData();
      } catch {}
    } else {
      router.push('/login');
    }
  }, [router, loadAllData]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        toast.success('Order status updated');
        loadAllData();
      }
    } catch {
      toast.error('Failed to update order');
    }
  };

  const toggleMenuAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isAvailable: !isAvailable }),
      });
      if (res.ok) {
        toast.success('Menu item updated');
        loadAllData();
      }
    } catch {
      toast.error('Failed to update menu item');
    }
  };

  const statusColors: Record<string, string> = {
    'Placed': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Preparing': 'bg-orange-100 text-orange-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Ready': 'bg-green-100 text-green-800',
    'Completed': 'bg-green-200 text-green-900',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  if (!user) {
    return <div className="min-h-screen bg-brand-cream flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-dark text-brand-cream min-h-screen">
        <div className="p-4 border-b border-brand-maroon/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
              <span className="text-white font-bold text-xs">FF</span>
            </div>
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <p className="text-[10px] text-brand-tan/60">Flavours Food</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.section}
              onClick={() => setActiveSection(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeSection === item.section
                  ? 'bg-brand-maroon text-white'
                  : 'text-brand-cream/70 hover:bg-brand-maroon/30 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-maroon/50">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-brand-cream/70 hover:text-white w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-dark text-brand-cream">
            <div className="p-4 border-b border-brand-maroon/50 flex items-center justify-between">
              <p className="font-bold">Admin Panel</p>
              <Button variant="ghost" size="icon" className="text-brand-cream" onClick={() => setMobileSidebar(false)}>
                ✕
              </Button>
            </div>
            <nav className="p-2 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => { setActiveSection(item.section); setMobileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    activeSection === item.section ? 'bg-brand-maroon text-white' : 'text-brand-cream/70'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebar(true)}>
              <ChefHat className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-brand-dark capitalize">{activeSection}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-maroon text-white">Admin</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: stats.orders, icon: Package, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: CreditCard, color: 'text-green-600 bg-green-50' },
                  { label: 'Customers', value: stats.customers, icon: Users, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Menu Items', value: stats.items, icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-lg font-bold text-brand-dark">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 10).map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-xs">#{order.id.slice(-8)}</TableCell>
                              <TableCell className="text-sm">{order.user?.name || 'Guest'}</TableCell>
                              <TableCell className="font-semibold">₹{order.total}</TableCell>
                              <TableCell>
                                <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-dark">Order Management</h2>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Placed">Placed</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Preparing">Preparing</SelectItem>
                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {(orderStatusFilter === 'all' ? orders : orders.filter((o: any) => o.status === orderStatusFilter)).map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">#{order.id.slice(-8)}</span>
                            <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>{order.status}</Badge>
                            <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.user?.name || 'Guest'} • {new Date(order.createdAt).toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm font-semibold text-brand-maroon mt-1">₹{order.total}</p>
                          {order.items && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Ready', 'Completed', 'Cancelled'].map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Menu Section */}
          {activeSection === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-dark">Menu Management ({menuItems.length} items)</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Featured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.slice(0, 50).map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.name}</TableCell>
                        <TableCell className="text-xs">{item.category?.name}</TableCell>
                        <TableCell className="text-sm">
                          {(() => {
                            try {
                              const prices = JSON.parse(item.prices || '{}');
                              return Object.entries(prices).map(([k, v]) => `${k}: ₹${v}`).join(' / ');
                            } catch { return '—'; }
                          })()}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleMenuAvailability(item.id, item.isAvailable)}
                            className={`text-xs px-2 py-1 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {item.isAvailable ? 'Yes' : 'No'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isFeatured ? 'default' : 'outline'} className="text-[10px]">
                            {item.isFeatured ? '★' : '—'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <Card>
              <CardHeader>
                <CardTitle>Customers ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {customers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No registered customers yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-sm">{c.email}</TableCell>
                          <TableCell className="text-sm">{c.phone || '—'}</TableCell>
                          <TableCell><Badge variant="outline">{c.role}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coupons Section */}
          {activeSection === 'coupons' && (
            <Card>
              <CardHeader>
                <CardTitle>Coupons ({coupons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono font-bold">{c.code}</TableCell>
                        <TableCell className="capitalize">{c.type}</TableCell>
                        <TableCell>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</TableCell>
                        <TableCell>₹{c.minOrder}</TableCell>
                        <TableCell>{c.usedCount}/{c.usageLimit || '∞'}</TableCell>
                        <TableCell><Badge className={c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Reservations Section */}
          {activeSection === 'reservations' && (
            <Card>
              <CardHeader>
                <CardTitle>Reservations ({reservations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No reservations yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-sm">{r.phone}</TableCell>
                          <TableCell className="text-sm">{r.date}</TableCell>
                          <TableCell className="text-sm">{r.time}</TableCell>
                          <TableCell>{r.partySize}</TableCell>
                          <TableCell><Badge className={r.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{r.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inquiries Section */}
          {activeSection === 'inquiries' && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Inquiries ({inquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No inquiries yet</p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq: any) => (
                      <div key={inq.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">{inq.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{inq.email}</span>
                          </div>
                          <Badge className={inq.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {inq.status}
                          </Badge>
                        </div>
                        {inq.subject && <p className="text-sm font-medium text-brand-dark">{inq.subject}</p>}
                        <p className="text-sm text-muted-foreground">{inq.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(inq.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reports Section */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{stats.orders}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">₹{stats.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">₹{stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0}</p>
                      <p className="text-xs text-muted-foreground">Avg Order Value</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{stats.items}</p>
                      <p className="text-xs text-muted-foreground">Menu Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter((o: any) => o.paymentStatus === 'paid').map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.id.slice(-8)}</TableCell>
                        <TableCell className="font-semibold">₹{o.total}</TableCell>
                        <TableCell>{o.paymentMethod}</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">{o.paymentStatus}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Banners Section */}
          {activeSection === 'banners' && (
            <Card>
              <CardHeader>
                <CardTitle>Banner Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">Banner upload and management coming soon. Use the admin API to manage banners programmatically.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
