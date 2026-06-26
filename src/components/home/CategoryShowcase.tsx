'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, CalendarDays, ChefHat, PartyPopper } from 'lucide-react';

const categories = [
  { name: 'Fries & Nachos', emoji: '🍟', count: 17, slug: 'fries-nachos' },
  { name: 'The Pizzeria', emoji: '🍕', count: 18, slug: 'pizzeria' },
  { name: 'Dilli Haat Momo', emoji: '🥟', count: 10, slug: 'dilli-haat-momo' },
  { name: 'Chinese Cuisine', emoji: '🥡', count: 31, slug: 'chinese-cuisine' },
  { name: 'Tandoori Menu', emoji: '🔥', count: 28, slug: 'tandoori-menu' },
  { name: 'Italian Pasta', emoji: '🍝', count: 10, slug: 'italian-pasta' },
  { name: 'Indian Main Course', emoji: '🍛', count: 29, slug: 'indian-main-course' },
  { name: 'Beverages', emoji: '🥤', count: 38, slug: 'beverages' },
];

export default function CategoryShowcase() {
  return (
    <section className="py-16 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-brand-dark mb-2">Explore Our Menu</h2>
          <p className="text-muted-foreground">13 categories, 200+ dishes — something for every craving</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/menu?category=${cat.slug}`}
              className="group bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border border-brand-tan/20"
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <h3 className="font-semibold text-brand-dark text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.count}+ items</p>
            </Link>
          ))}
        </div>

        {/* Celebration Banner */}
        <div className="mt-12 bg-gradient-to-r from-brand-maroon to-brand-dark rounded-2xl p-8 text-center">
          <PartyPopper className="w-10 h-10 text-brand-gold mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-brand-cream mb-2">We&apos;re Available for All Parties & Celebrations!</h3>
          <p className="text-brand-tan/70 mb-6 max-w-lg mx-auto">
            Birthdays, anniversaries, corporate events — let us make your special occasion unforgettable with our delicious food and warm hospitality.
          </p>
          <Link href="/reservation">
            <Button size="lg" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark font-semibold">
              <CalendarDays className="w-4 h-4 mr-2" />
              Book Your Event
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
