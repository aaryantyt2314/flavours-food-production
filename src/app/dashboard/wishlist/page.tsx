'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore, CartItem } from '@/context/CartStore';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    prices: string;
    isVeg: boolean;
    category: { name: string };
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const addItem = useCartStore((s) => s.addItem);

  const fetchWishlist = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/wishlist?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('flavours-user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        fetchWishlist(u.id);
      } catch {}
    } else {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const handleRemove = async (menuItemId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wishlist?userId=${user.id}&menuItemId=${menuItemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((i) => i.menuItemId !== menuItemId));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const prices = JSON.parse(item.menuItem.prices || '{}');
    const firstTier = Object.keys(prices)[0];
    const firstPrice = prices[firstTier] || 0;
    const cartItem: CartItem = {
      menuItemId: item.menuItemId,
      name: item.menuItem.name,
      price: firstPrice,
      priceTier: firstTier || 'Regular',
      quantity: 1,
      isVeg: item.menuItem.isVeg,
    };
    addItem(cartItem);
    toast.success(`${item.menuItem.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="bg-brand-dark py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-brand-cream">My Wishlist</h1>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-brand-cream">My Wishlist</h1>
          <p className="text-brand-tan/70 text-sm">Your saved favorite dishes</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!user ? (
          <Card className="border-brand-tan/20 text-center">
            <CardContent className="p-8">
              <Heart className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">Please login to view your wishlist</h3>
              <Link href="/login">
                <Button className="bg-brand-maroon hover:bg-brand-dark text-white">Login</Button>
              </Link>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-brand-tan/20 text-center">
            <CardContent className="p-8">
              <Heart className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">Save your favorite dishes to find them easily later</p>
              <Link href="/menu">
                <Button className="bg-brand-maroon hover:bg-brand-dark text-white">Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const prices = JSON.parse(item.menuItem.prices || '{}');
              const firstTier = Object.keys(prices)[0];
              const firstPrice = prices[firstTier];
              return (
                <Card key={item.id} className="border-brand-tan/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-brand-tan/30 to-brand-maroon/10 flex items-center justify-center shrink-0">
                        <Heart className="w-6 h-6 text-brand-red fill-brand-red" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.menuItem.category?.name}</p>
                        <h3 className="font-semibold text-brand-dark text-sm truncate">{item.menuItem.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${item.menuItem.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-[10px]`}>
                            {item.menuItem.isVeg ? 'VEG' : 'NON-VEG'}
                          </Badge>
                          <span className="font-bold text-brand-maroon text-sm">₹{firstPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-brand-maroon hover:bg-brand-dark text-white text-xs h-8"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" /> Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => handleRemove(item.menuItemId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
