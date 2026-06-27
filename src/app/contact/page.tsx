'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      subject: form.get('subject'),
      message: form.get('message'),
    };

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Message sent successfully!');
      } else {
        toast.error('Failed to send message');
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
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Message Sent!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for reaching out. We&apos;ll get back to you soon. For urgent inquiries, call us at +91-7817878595.
            </p>
            <Button onClick={() => setSubmitted(false)} className="bg-brand-maroon hover:bg-brand-dark text-white">
              Send Another Message
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
          <h1 className="text-3xl font-bold text-brand-cream mb-2">Contact Us</h1>
          <p className="text-brand-tan/70">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-4">
            {[
              { icon: MapPin, title: 'Visit Us', desc: 'Pillar No. 834, Ground Floor, Near IGL CNG Pump, AsalatNagar, Muradnagar, Uttar Pradesh' },
              { icon: Phone, title: 'Call Us', desc: '+91-7817878595' },
              { icon: Mail, title: 'Email Us', desc: 'flavoursfood2023@gmail.com' },
              { icon: Clock, title: 'Opening Hours', desc: '11:00 AM – 10:00 PM (Daily)' },
            ].map((item) => (
              <Card key={item.title} className="border-brand-tan/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-brand-maroon mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-brand-dark">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Map */}
            <Card className="border-brand-tan/20 overflow-hidden">
              <iframe
                src="https://www.google.com/maps?q=28.7509479,77.4932956&z=17&output=embed"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Flavours Food Location"
              />
            </Card>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <Card className="border-brand-tan/20">
              <CardHeader>
                <CardTitle className="text-brand-dark flex items-center gap-2">
                  <Send className="w-5 h-5 text-brand-maroon" />
                  Send a Message
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
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required placeholder="your@email.com" className="border-brand-tan/30" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+91-XXXXXXXXXX" className="border-brand-tan/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="How can we help?" className="border-brand-tan/30" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      placeholder="Tell us what you need..."
                      className="border-brand-tan/30"
                      rows={5}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-maroon hover:bg-brand-dark text-white h-12"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
