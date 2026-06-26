'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore, CartItem } from '@/context/CartStore';
import { Search, Plus, Minus, Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItemData {
  id: string;
  name: string;
  description: string | null;
  prices: string;
  priceLabel: string | null;
  isVeg: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  image: string | null;
  subCategory: string | null;
  category: { id: string; name: string; slug: string };
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  _count: { items: number };
}

function MenuCard({ item }: { item: MenuItemData }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const prices = JSON.parse(item.prices || '{}');
  const tiers = Object.keys(prices);

  const getCartQty = (tier: string) => {
    const cartItem = cartItems.find((i) => i.menuItemId === item.id && i.priceTier === tier);
    return cartItem?.quantity || 0;
  };

  const handleAdd = (tier: string, price: number) => {
    const cartItem: CartItem = {
      menuItemId: item.id,
      name: item.name,
      price,
      priceTier: tier,
      quantity: 1,
      isVeg: item.isVeg,
    };
    addItem(cartItem);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <Card className="overflow-hidden border-brand-tan/20 hover:shadow-md transition-shadow group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Image placeholder */}
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-tan/30 to-brand-maroon/10 flex items-center justify-center shrink-0">
            <span className="text-2xl">
              {item.category?.slug === 'pizzeria' ? '🍕' :
               item.category?.slug === 'dilli-haat-momo' ? '🥟' :
               item.category?.slug === 'tandoori-menu' ? '🔥' :
               item.category?.slug === 'beverages' ? '🥤' :
               item.category?.slug === 'misthaan-bhandaar' ? '🍨' :
               item.category?.slug === 'chinese-cuisine' ? '🥡' :
               item.category?.slug === 'fries-nachos' ? '🍟' :
               item.category?.slug === 'italian-pasta' ? '🍝' :
               item.category?.slug === 'indian-main-course' ? '🍛' :
               item.category?.slug === 'sandwiches' ? '🥪' :
               item.category?.slug === 'panipuri' ? '🫕' : '🍽️'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                <Leaf className={`w-2.5 h-2.5 ${item.isVeg ? 'text-green-600 fill-green-600' : 'text-red-600 fill-red-600'}`} />
              </span>
              <h3 className="font-semibold text-brand-dark text-sm truncate">{item.name}</h3>
              {item.isFeatured && (
                <Badge className="bg-brand-gold text-brand-dark text-[9px] h-4">★</Badge>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
            )}

            {item.subCategory && (
              <p className="text-[10px] text-brand-maroon/60 mb-1">{item.subCategory}</p>
            )}

            {/* Price tiers */}
            <div className="space-y-1.5">
              {tiers.map((tier) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{tier}:</span>
                    <span className="font-bold text-brand-maroon text-sm">₹{prices[tier]}</span>
                  </div>
                  {getCartQty(tier) > 0 ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-brand-maroon/30"
                        onClick={() => updateQuantity(item.id, tier, getCartQty(tier) - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{getCartQty(tier)}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 border-brand-maroon/30"
                        onClick={() => handleAdd(tier, prices[tier])}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-brand-maroon hover:bg-brand-dark text-white h-7 text-xs px-3"
                      onClick={() => handleAdd(tier, prices[tier])}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [] } = useQuery<CategoryData[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const { data: menuItems = [], isLoading } = useQuery<MenuItemData[]>({
    queryKey: ['menu', activeCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
      return fetch(`/api/menu?${params}`).then((r) => r.json());
    },
  });

  const filteredItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.subCategory?.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

  // Group items by subCategory
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItemData[]> = {};
    filteredItems.forEach((item) => {
      const key = item.subCategory || 'main';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-dark py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-brand-cream mb-2">Our Menu</h1>
          <p className="text-brand-tan/70">200+ dishes crafted with love — choose your favorites!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-brand-tan/30 focus:border-brand-maroon"
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-white border border-brand-tan/20 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-brand-maroon data-[state=active]:text-white">
                All
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.slug}
                  value={cat.slug}
                  className="text-xs data-[state=active]:bg-brand-maroon data-[state=active]:text-white"
                >
                  {cat.name} ({cat._count.items})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-lg font-medium text-brand-dark mb-1">No items found</p>
            <p className="text-sm text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([subCat, items]) => (
              <div key={subCat}>
                {subCat !== 'main' && (
                  <h3 className="text-lg font-semibold text-brand-dark mb-3 border-b border-brand-tan/30 pb-2">
                    {subCat}
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPageWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><p>Loading menu...</p></div>}>
      <MenuPageContent />
    </Suspense>
  );
}
