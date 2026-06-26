'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Phone, PartyPopper } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-brand-tan/40 to-brand-maroon/20 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-brand-red flex items-center justify-center mb-4 shadow-xl">
                  <span className="text-5xl">🍲</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-dark">FLAVOURS FOOD</h3>
                <p className="text-brand-maroon text-sm mt-1">Happiness is Flavours</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {['🍟', '🍕', '🥟', '🍝', '🔥', '🥤'].map((emoji, i) => (
                    <span key={i} className="text-2xl">{emoji}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">About Flavours Food</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Flavours Food — Muradnagar&apos;s premier dining destination where culinary excellence 
                meets warm hospitality. With over 200 dishes spanning 13 unique categories, from sizzling tandoori 
                delicacies to gourmet pizzas, from authentic Dilli Haat momos to refreshing mocktails, we bring 
                unlimited choice under one roof.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Whether you&apos;re craving crispy fries, a hearty Indian main course, or a decadent dessert, 
                our menu is crafted with love and served with a smile. Every dish is prepared using fresh 
                ingredients and time-honored recipes that celebrate the rich flavors of India and beyond.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-cream/50">
                <Clock className="w-5 h-5 text-brand-maroon mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-brand-dark">Opening Hours</p>
                  <p className="text-xs text-muted-foreground">11:00 AM – 10:00 PM (Daily)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-cream/50">
                <MapPin className="w-5 h-5 text-brand-maroon mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-brand-dark">Location</p>
                  <p className="text-xs text-muted-foreground">Near IGL CNG Pump, Muradnagar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-cream/50">
                <Phone className="w-5 h-5 text-brand-maroon mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-brand-dark">Call Us</p>
                  <p className="text-xs text-muted-foreground">+91-7817878595</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-cream/50">
                <PartyPopper className="w-5 h-5 text-brand-maroon mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-brand-dark">Parties & Events</p>
                  <p className="text-xs text-muted-foreground">Available for all celebrations</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/menu">
                <Button className="bg-brand-maroon hover:bg-brand-dark text-white">
                  Explore Menu
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-brand-maroon/30 text-brand-maroon">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
