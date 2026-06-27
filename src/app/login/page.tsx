'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace(session.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [router, session, status]);

  if (status === 'authenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: String(form.get('email') || ''),
        password: String(form.get('password') || ''),
      });

      if (result?.ok) {
        toast.success('Login successful!');
      } else {
        toast.error(result?.error || 'Login failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-brand-tan/20">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">FF</span>
          </div>
          <CardTitle className="text-brand-dark text-xl">Welcome Back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your Flavours Food account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" className="border-brand-tan/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" className="border-brand-tan/30" />
            </div>
            <Button type="submit" className="w-full bg-brand-maroon hover:bg-brand-dark text-white h-11" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-maroon font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
