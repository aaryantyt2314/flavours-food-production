'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Profile updated!');
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
                <Input id="name" name="name" className="border-brand-tan/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" className="border-brand-tan/30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="border-brand-tan/30" />
              </div>
              <Button type="submit" className="bg-brand-maroon hover:bg-brand-dark text-white">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
