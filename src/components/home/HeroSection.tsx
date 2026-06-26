'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-maroon to-brand-dark min-h-[85vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-brand-gold blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-brand-tan blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-red blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-full text-sm font-medium">
              <UtensilsCrossed className="w-4 h-4" />
              Muradnagar&apos;s Favorite Restaurant
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Flavours <span className="text-brand-gold">Food</span>
            </h1>
            <p className="text-xl sm:text-2xl text-brand-tan font-light">
              Unlimited choice under one roof
            </p>
            <p className="text-base text-brand-cream/70 max-w-lg mx-auto md:mx-0">
              From crispy fries to sizzling tandoori, from authentic momos to gourmet pizzas — 
              experience a world of flavors crafted with love, served with a smile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link href="/menu">
                <Button size="lg" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark font-semibold text-base px-8 h-12">
                  Order Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/reservation">
                <Button size="lg" variant="outline" className="border-brand-tan/50 text-brand-cream hover:bg-brand-tan/10 font-semibold text-base px-8 h-12">
                  Reserve Table
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 justify-center md:justify-start pt-4">
              {[
                { value: '200+', label: 'Dishes' },
                { value: '13', label: 'Categories' },
                { value: '4.5', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-brand-gold">{stat.value}</p>
                  <p className="text-xs text-brand-cream/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-maroon/50 flex items-center justify-center border-2 border-brand-gold/30">
                <div className="w-64 h-64 rounded-full bg-brand-dark/80 flex items-center justify-center border border-brand-gold/20">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-brand-red flex items-center justify-center mb-3 shadow-lg shadow-brand-red/30">
                      <span className="text-3xl">🍜</span>
                    </div>
                    <p className="text-white font-bold text-lg">FLAVOURS</p>
                    <p className="text-brand-gold text-sm">FOOD</p>
                    <p className="text-brand-cream/50 text-xs mt-1">Happiness is Flavours</p>
                  </div>
                </div>
              </div>
              {/* Floating items */}
              <div className="absolute top-0 right-0 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                <span className="text-4xl">🍕</span>
              </div>
              <div className="absolute bottom-10 left-0 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>
                <span className="text-4xl">🥟</span>
              </div>
              <div className="absolute top-20 left-0 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
                <span className="text-3xl">☕</span>
              </div>
              <div className="absolute bottom-0 right-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
                <span className="text-3xl">🍨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
