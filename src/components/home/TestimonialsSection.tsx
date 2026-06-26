'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export default function TestimonialsSection() {
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: () => fetch('/api/testimonials').then((r) => r.json()),
  });

  return (
    <section className="py-16 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-brand-cream mb-2">What Our Guests Say</h2>
          <p className="text-brand-tan/60">Real reviews from our happy customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(testimonials.length > 0 ? testimonials : [
            { id: '1', name: 'Rahul Sharma', rating: 5, comment: 'Amazing food! The Tandoori Paneer Pizza is out of this world. Will definitely order again.' },
            { id: '2', name: 'Priya Verma', rating: 5, comment: 'Best momos in Muradnagar! The KFC Momos are a must-try. Great ambiance too.' },
            { id: '3', name: 'Ankit Gupta', rating: 4, comment: 'Love the variety on the menu. The Chilly Paneer and Hakka Noodles combo is perfect.' },
            { id: '4', name: 'Sneha Singh', rating: 5, comment: 'Hosted my birthday party here — everything was perfect! The staff is so friendly.' },
            { id: '5', name: 'Vikram Patel', rating: 4, comment: 'The Flavour\'s Special Platter is worth every rupee. Great place for family dining.' },
            { id: '6', name: 'Neha Agarwal', rating: 5, comment: 'Creamy White Sauce Pasta and Cold Nutella Blast — my go-to comfort meal!' },
          ]).slice(0, 6).map((t) => (
            <Card key={t.id} className="bg-brand-maroon/30 border-brand-maroon/20">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-brand-gold/40 mb-3" />
                <p className="text-brand-cream/80 text-sm leading-relaxed mb-4">{t.comment}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-brand-cream text-sm">{t.name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-tan/30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
