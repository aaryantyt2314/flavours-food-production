'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-brand-cream">My Addresses</h1>
          <p className="text-brand-tan/70 text-sm">Manage your delivery addresses</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Card className="border-brand-tan/20 text-center">
          <CardContent className="p-8">
            <MapPin className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-brand-dark mb-2">No saved addresses</h3>
            <p className="text-muted-foreground mb-4">Add a delivery address for faster checkout</p>
            <Button className="bg-brand-maroon hover:bg-brand-dark text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Address
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
