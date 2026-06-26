'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string | null;
  image: string;
  category: string | null;
}

export default function GalleryPage() {
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['gallery'],
    queryFn: () => fetch('/api/gallery').then((r) => r.json()),
  });

  const placeholderImages = [
    { id: '1', title: 'Warm Interior', image: '', category: 'interior' },
    { id: '2', title: 'Booth Seating', image: '', category: 'interior' },
    { id: '3', title: 'Bar Counter', image: '', category: 'interior' },
    { id: '4', title: 'Dining Area', image: '', category: 'interior' },
    { id: '5', title: 'Chef Special', image: '', category: 'food' },
    { id: '6', title: 'Pizza Making', image: '', category: 'food' },
    { id: '7', title: 'Party Setup', image: '', category: 'events' },
    { id: '8', title: 'Celebration', image: '', category: 'events' },
  ];

  const displayImages = images.length > 0 ? images : placeholderImages;

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-brand-cream mb-2">Gallery</h1>
          <p className="text-brand-tan/70">A glimpse into the Flavours Food experience</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayImages.map((img, i) => (
              <Card key={img.id} className="overflow-hidden border-brand-tan/20 group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-brand-tan/30 to-brand-maroon/10 flex items-center justify-center relative">
                  <div className="text-center p-4">
                    <Camera className="w-8 h-8 text-brand-maroon/40 mx-auto mb-2" />
                    <p className="text-sm text-brand-maroon/60 font-medium">{img.title || 'Gallery Image'}</p>
                    {img.category && (
                      <p className="text-xs text-brand-maroon/40 capitalize">{img.category}</p>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8 p-6 bg-white rounded-xl border border-brand-tan/20">
          <p className="text-brand-dark font-semibold mb-1">Real photos coming soon!</p>
          <p className="text-sm text-muted-foreground">
            We&apos;re updating our gallery with beautiful shots of our restaurant, food, and events. 
            In the meantime, visit us to experience it in person!
          </p>
        </div>
      </div>
    </div>
  );
}
