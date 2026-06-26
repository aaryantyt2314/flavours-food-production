'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/context/CartStore';
import { ShoppingBag, MapPin, CreditCard, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('flavours-user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const subtotal = getTotal();
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}&total=${subtotal}`);
      const data = await res.json();
      if (res.ok) {
        setDiscount(data.discount);
        toast.success(`Coupon applied! You save ₹${data.discount}`);
      } else {
        toast.error(data.error || 'Invalid coupon');
        setDiscount(0);
      }
    } catch {
      toast.error('Failed to validate coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const orderData = {
      userId: user?.id || null,
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        priceTier: i.priceTier,
        quantity: i.quantity,
      })),
      subtotal,
      discount,
      total,
      couponCode: discount > 0 ? couponCode : null,
      address: {
        street: form.get('address'),
        city: form.get('city'),
        pincode: form.get('pincode'),
      },
      notes: form.get('notes'),
      paymentMethod: 'cod',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="w-20 h-20 text-brand-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been received and will be prepared shortly. 
              You can track your order status in your dashboard.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/menu')} variant="outline" className="border-brand-maroon/30 text-brand-maroon">
                Order More
              </Button>
              {user && (
                <Button onClick={() => router.push('/dashboard/orders')} className="bg-brand-maroon hover:bg-brand-dark text-white">
                  View Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <ShoppingBag className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-dark mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items from our menu first!</p>
            <Button onClick={() => router.push('/menu')} className="bg-brand-maroon hover:bg-brand-dark text-white">
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-brand-cream">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Delivery Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-brand-tan/20">
                <CardHeader>
                  <CardTitle className="text-brand-dark flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-brand-maroon" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input id="address" name="address" required placeholder="House no, street, area" className="border-brand-tan/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue="Muradnagar" className="border-brand-tan/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" placeholder="201206" className="border-brand-tan/30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Any special instructions..." className="border-brand-tan/30" rows={2} />
                  </div>
                </CardContent>
              </Card>

              {/* Coupon */}
              <Card className="border-brand-tan/20">
                <CardHeader>
                  <CardTitle className="text-brand-dark flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5 text-brand-maroon" />
                    Apply Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="border-brand-tan/30"
                    />
                    <Button type="button" variant="outline" className="border-brand-maroon/30 text-brand-maroon" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Try: WELCOME10, FLAT50, FLAVOUR20</p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-brand-tan/20 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-brand-dark flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-brand-maroon" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.menuItemId}-${item.priceTier}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.name} {item.priceTier !== 'Regular' ? `(${item.priceTier})` : ''} x{item.quantity}
                      </span>
                      <span className="font-medium text-brand-dark shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-brand-green">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-brand-green font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold text-brand-dark">Total</span>
                    <span className="text-xl font-bold text-brand-maroon">₹{total}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-maroon hover:bg-brand-dark text-white h-12 text-base mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order — ₹${total}`
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Payment: Cash on Delivery (Razorpay online payment coming soon)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
