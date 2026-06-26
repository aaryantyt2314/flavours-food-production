'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReservationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email'),
      date: form.get('date'),
      time: form.get('time'),
      partySize: parseInt(form.get('partySize') as string),
      specialRequests: form.get('specialRequests'),
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Reservation submitted successfully!');
      } else {
        toast.error('Failed to submit reservation');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="w-16 h-16 text-brand-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Reservation Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you! We&apos;ll confirm your reservation shortly via phone. 
              For urgent bookings, call us at +91-7817878595.
            </p>
            <Button onClick={() => setSubmitted(false)} className="bg-brand-maroon hover:bg-brand-dark text-white">
              Make Another Reservation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-brand-cream mb-2">Reserve a Table</h1>
          <p className="text-brand-tan/70">Book your dining experience at Flavours Food</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card className="border-brand-tan/20">
          <CardHeader>
            <CardTitle className="text-brand-dark flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-maroon" />
              Table Reservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required placeholder="Your name" className="border-brand-tan/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+91-XXXXXXXXXX" className="border-brand-tan/30" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" className="border-brand-tan/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="date" required className="border-brand-tan/30" />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Select name="time" required>
                    <SelectTrigger className="border-brand-tan/30">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Party Size *</Label>
                  <Select name="partySize" required>
                    <SelectTrigger className="border-brand-tan/30">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 50].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'person' : 'people'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="Birthday celebration, dietary requirements, seating preference..."
                  className="border-brand-tan/30"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-maroon hover:bg-brand-dark text-white h-12 text-base"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Reserve Table'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Clock, title: 'Opening Hours', desc: '11:00 AM – 10:00 PM Daily' },
            { icon: Users, title: 'Party Bookings', desc: 'Available for events up to 50 guests' },
            { icon: CalendarDays, title: 'Advance Booking', desc: 'Book at least 2 hours ahead' },
          ].map((item) => (
            <Card key={item.title} className="text-center p-4 border-brand-tan/20">
              <item.icon className="w-6 h-6 text-brand-maroon mx-auto mb-2" />
              <p className="font-semibold text-sm text-brand-dark">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
