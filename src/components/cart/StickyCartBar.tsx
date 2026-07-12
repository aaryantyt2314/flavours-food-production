'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/context/CartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import CartDrawer from '@/components/cart/CartDrawer';

// Checkout already shows the full summary; admin doesn't order.
const HIDDEN_PATHS = ['/checkout', '/admin'];

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

export default function StickyCartBar() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  // Cart state comes from localStorage, so render nothing until mounted to avoid hydration mismatch
  const mounted = useSyncExternalStore(subscribeNoop, getTrue, getFalse);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!mounted || itemCount === 0 || HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto flex items-center justify-between gap-3 rounded-xl bg-brand-maroon text-white shadow-lg shadow-brand-dark/40 px-4 py-2.5 animate-in slide-in-from-bottom-4 fade-in">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-3 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[11px] text-white/80 leading-tight">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                </span>
                <span className="block text-base font-bold leading-tight">₹{total}</span>
              </span>
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-96">
            <SheetTitle className="text-brand-dark">Your Cart</SheetTitle>
            <CartDrawer />
          </SheetContent>
        </Sheet>

        <Link href="/checkout">
          <Button className="bg-white text-brand-maroon hover:bg-brand-cream font-semibold h-9 px-4">
            Checkout <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
