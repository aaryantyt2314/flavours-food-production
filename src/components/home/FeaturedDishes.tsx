'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore, CartItem } from '@/context/CartStore';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItemData {
  id: string;
  name: string;
  description: string | null;
  prices: string;
  priceLabel: string | null;
  isVeg: boolean;
  isFeatured: boolean;
  image: string | null;
  subCategory: string | null;
  category: { name: string; slug: string };
}

export default function FeaturedDishes() {
  const addItem = useCartStore((s) => s.addItem);

  const { data: items = [], isLoading } = useQuery<MenuItemData[]>({
    queryKey: ['featured-menu'],
    queryFn: () => fetch('/api/menu?featured=true').then((r) => r.json()),
  });

  const handleAddToCart = (item: MenuItemData) => {
    const prices = JSON.parse(item.prices || '{}');
    const firstTier = Object.keys(prices)[0];
    const firstPrice = prices[firstTier] || 0;

    const cartItem: CartItem = {
      menuItemId: item.id,
      name: item.name,
      price: firstPrice,
      priceTier: firstTier || 'Regular',
      quantity: 1,
      isVeg: item.isVeg,
    };
    addItem(cartItem);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <section className="py-16 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-brand-dark mb-2">Chef&apos;s Picks</h2>
          <p className="text-muted-foreground">Our most loved dishes that keep you coming back</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.slice(0, 8).map((item) => {
              const prices = JSON.parse(item.prices || '{}');
              const firstTier = Object.keys(prices)[0];
              const firstPrice = prices[firstTier];
              return (
                <Card key={item.id} className="overflow-hidden border-brand-tan/30 hover:shadow-lg transition-shadow group">
                  <div className="h-36 bg-gradient-to-br from-brand-tan/30 to-brand-maroon/10 flex items-center justify-center relative">
                    <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform">
                      {item.category?.slug === 'pizzeria' ? '🍕' :
                       item.category?.slug === 'dilli-haat-momo' ? '🥟' :
                       item.category?.slug === 'tandoori-menu' ? '🔥' :
                       item.category?.slug === 'beverages' ? '🥤' :
                       item.category?.slug === 'misthaan-bhandaar' ? '🍨' :
                       item.category?.slug === 'chinese-cuisine' ? '🥡' :
                       item.category?.slug === 'fries-nachos' ? '🍟' :
                       item.category?.slug === 'italian-pasta' ? '🍝' : '🍽️'}
                    </span>
                    <Badge className="absolute top-2 left-2 bg-brand-gold text-brand-dark text-[10px]">
                      <Star className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                    <Badge className={`absolute top-2 right-2 text-[10px] ${item.isVeg ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{item.category?.name}</p>
                    <h3 className="font-semibold text-brand-dark text-sm mb-1 line-clamp-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-brand-maroon">₹{firstPrice}</span>
                      <Button
                        size="sm"
                        className="bg-brand-maroon hover:bg-brand-dark text-white h-8 w-8 p-0"
                        onClick={() => handleAddToCart(item)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/menu">
            <Button variant="outline" className="border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-white px-8">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
