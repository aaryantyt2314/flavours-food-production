'use client';

import { useCartStore } from '@/context/CartStore';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-brand-tan/50 mb-4" />
        <h3 className="text-lg font-semibold text-brand-dark mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mb-6">Add some delicious items from our menu!</p>
        <Link href="/menu">
          <Button className="bg-brand-maroon hover:bg-brand-dark text-white">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.menuItemId}-${item.priceTier}`} className="flex gap-3 p-2 rounded-lg bg-muted/50">
            <div className="w-12 h-12 rounded-md bg-brand-tan/30 flex items-center justify-center shrink-0">
              <span className="text-lg">{item.isVeg ? '🟢' : '🔴'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-dark truncate">{item.name}</p>
              {item.priceTier !== 'Regular' && (
                <p className="text-xs text-muted-foreground">{item.priceTier}</p>
              )}
              <p className="text-sm font-semibold text-brand-maroon">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.menuItemId, item.priceTier, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.menuItemId, item.priceTier, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Summary */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-brand-dark">₹{getTotal()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-brand-green font-medium">Free</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-dark">Total</span>
          <span className="text-lg font-bold text-brand-maroon">₹{getTotal()}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-brand-maroon border-brand-maroon/30"
            onClick={clearCart}
          >
            Clear
          </Button>
          <Link href="/checkout" className="flex-1">
            <Button className="w-full bg-brand-maroon hover:bg-brand-dark text-white">
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
