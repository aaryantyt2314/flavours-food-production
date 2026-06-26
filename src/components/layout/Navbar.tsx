'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Phone } from 'lucide-react';
import { useCartStore } from '@/context/CartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import CartDrawer from '@/components/cart/CartDrawer';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/reservation', label: 'Reserve Table' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-tan/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between py-1 text-xs text-brand-maroon border-b border-brand-tan/20">
          <div className="flex items-center gap-4">
            <a href="tel:+917817878595" className="flex items-center gap-1 hover:text-brand-dark transition-colors">
              <Phone className="w-3 h-3" /> +91-7817878595
            </a>
            <span className="text-brand-tan">|</span>
            <span>11:00 AM – 10:00 PM (Daily)</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/flavours.food.byakshay" target="_blank" rel="noopener noreferrer" className="hover:text-brand-dark transition-colors">
              Instagram
            </a>
            <span className="text-brand-tan">|</span>
            <a href="https://wa.me/917817878595?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20menu%2Forder." target="_blank" rel="noopener noreferrer" className="hover:text-brand-dark transition-colors">
              WhatsApp
            </a>
          </div>
        </div>

        {/* Main navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-brand-dark leading-tight tracking-tight">FLAVOURS FOOD</h1>
              <p className="text-[10px] text-brand-maroon leading-none">HAPPINESS IS FLAVOURS</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-brand-dark hover:text-brand-maroon hover:bg-brand-tan/20 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-brand-dark hover:text-brand-maroon hover:bg-brand-tan/20">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in-50">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-96">
                <SheetTitle className="text-brand-dark">Your Cart</SheetTitle>
                <CartDrawer />
              </SheetContent>
            </Sheet>

            {/* User */}
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-brand-dark hover:text-brand-maroon hover:bg-brand-tan/20">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-brand-dark hover:text-brand-maroon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-brand-tan/20 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-brand-dark hover:text-brand-maroon hover:bg-brand-tan/20 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-brand-maroon hover:bg-brand-tan/20 rounded-md transition-colors"
              >
                Login / Register
              </Link>
              <a
                href="https://wa.me/917817878595?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20menu%2Forder."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                Chat on WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
