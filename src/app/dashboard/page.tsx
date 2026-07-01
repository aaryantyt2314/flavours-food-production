'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, User, Heart, MapPin, LogOut, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';

const statusColors: Record<string, string> = {
  'Placed': 'bg-yellow-100 text-yellow-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'Preparing': 'bg-orange-100 text-orange-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  'Ready': 'bg-green-100 text-green-800',
  'Completed': 'bg-green-200 text-green-900',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const loadRecentOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setRecentOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
        setRecentOrders([]);
      }
    };

    void loadRecentOrders();
  }, [status]);

  const handleLogout = async () => {
    toast.success('Logged out');
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-brand-cream">My Dashboard</h1>
          <p className="text-brand-tan/70 text-sm">Welcome back, {session.user.name}!</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: ShoppingBag, label: 'Order Now', href: '/menu', color: 'bg-brand-maroon' },
            { icon: Package, label: 'My Orders', href: '/dashboard/orders', color: 'bg-brand-dark' },
            { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist', color: 'bg-brand-red' },
            { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses', color: 'bg-brand-green' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="border-brand-tan/20 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-brand-dark">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-brand-tan/20 mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-brand-dark flex items-center gap-2">
              <User className="w-5 h-5 text-brand-maroon" />
              Profile
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium text-brand-dark">{session.user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-brand-dark">{session.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-brand-dark">{session.user.phone || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-tan/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-brand-dark flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-maroon" />
              Recent Orders
            </CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="text-brand-maroon">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Your order history will appear here once you place your first order.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-brand-tan/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-brand-dark">Order #{order.id.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-brand-maroon">₹{order.total}</span>
                      <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
