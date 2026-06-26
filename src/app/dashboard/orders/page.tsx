'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';

interface Order {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; price: number; priceTier: string; quantity: number }[];
}

const statusColors: Record<string, string> = {
  'Placed': 'bg-yellow-100 text-yellow-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'Preparing': 'bg-orange-100 text-orange-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  'Ready': 'bg-green-100 text-green-800',
  'Completed': 'bg-green-200 text-green-900',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('flavours-user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        fetchOrders(u.id);
      } catch {}
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-brand-cream hover:bg-brand-maroon/30">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-cream">My Orders</h1>
            <p className="text-brand-tan/70 text-sm">Track and manage your orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {orders.length === 0 ? (
          <Card className="border-brand-tan/20 text-center">
            <CardContent className="p-8">
              <Package className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Place your first order from our menu!</p>
              <Link href="/menu">
                <Button className="bg-brand-maroon hover:bg-brand-dark text-white">Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-brand-tan/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-brand-dark">
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline" className={order.paymentStatus === 'paid' ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} {item.priceTier !== 'Regular' ? `(${item.priceTier})` : ''} x{item.quantity}
                        </span>
                        <span className="text-brand-dark">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-brand-tan/20 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold text-brand-dark">Total</span>
                    <span className="font-bold text-brand-maroon">₹{order.total}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
