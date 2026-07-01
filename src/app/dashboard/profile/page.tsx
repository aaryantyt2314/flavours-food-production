'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        name: String(form.get('name') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
      };

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      await update({ user: { name: data.name, phone: data.phone } });
      toast.success('Profile updated!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-brand-cream">Edit Profile</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Card className="border-brand-tan/20">
          <CardHeader>
            <CardTitle className="text-brand-dark flex items-center gap-2">
              <User className="w-5 h-5 text-brand-maroon" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" className="border-brand-tan/30" defaultValue={session.user.name || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" className="border-brand-tan/30" defaultValue={session.user.email || ''} disabled readOnly />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="border-brand-tan/30" defaultValue={session.user.phone || ''} />
              </div>
              <Button type="submit" className="bg-brand-maroon hover:bg-brand-dark text-white" disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
