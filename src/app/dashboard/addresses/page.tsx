'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Pencil, Trash2, Home, Building, MapPinned } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string | null;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: 'Home', street: '', city: 'Muradnagar', state: 'Uttar Pradesh', pincode: '' });
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const fetchAddresses = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch {
      console.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && user?.id) {
      queueMicrotask(() => {
        void fetchAddresses(user.id);
      });
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [fetchAddresses, router, status, user]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const url = editId ? `/api/addresses/${editId}` : '/api/addresses';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editId ? 'Address updated!' : 'Address added!');
        setDialogOpen(false);
        setEditId(null);
        setForm({ label: 'Home', street: '', city: 'Muradnagar', state: 'Uttar Pradesh', pincode: '' });
        fetchAddresses(user.id);
      } else {
        toast.error('Failed to save address');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Address deleted');
        fetchAddresses(user.id);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        toast.success('Default address updated');
        fetchAddresses(user.id);
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode || '' });
    setDialogOpen(true);
  };

  const labelIcons: Record<string, any> = { Home, Office: Building, Other: MapPinned };

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-dark py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-cream">My Addresses</h1>
            <p className="text-brand-tan/70 text-sm">Manage your delivery addresses</p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-gold text-brand-dark hover:bg-brand-gold/90" onClick={() => { setEditId(null); setForm({ label: 'Home', street: '', city: 'Muradnagar', state: 'Uttar Pradesh', pincode: '' }); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-brand-dark">{editId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <div className="flex gap-2">
                      {['Home', 'Office', 'Other'].map((l) => {
                        const Icon = labelIcons[l] || MapPin;
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setForm({ ...form, label: l })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                              form.label === l ? 'border-brand-maroon bg-brand-tan/20 text-brand-maroon' : 'border-brand-tan/30 text-muted-foreground hover:border-brand-maroon/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" /> {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input id="street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required placeholder="House no, street, area" className="border-brand-tan/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border-brand-tan/30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border-brand-tan/30" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-brand-maroon hover:bg-brand-dark text-white">
                    {editId ? 'Update Address' : 'Add Address'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : !user ? (
          <Card className="border-brand-tan/20 text-center">
            <CardContent className="p-8">
              <MapPin className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">Please login to manage addresses</h3>
            </CardContent>
          </Card>
        ) : addresses.length === 0 ? (
          <Card className="border-brand-tan/20 text-center">
            <CardContent className="p-8">
              <MapPin className="w-16 h-16 text-brand-tan/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">No saved addresses</h3>
              <p className="text-muted-foreground mb-4">Add a delivery address for faster checkout</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = labelIcons[addr.label] || MapPin;
              return (
                <Card key={addr.id} className={`border-brand-tan/20 ${addr.isDefault ? 'ring-2 ring-brand-maroon/30' : ''}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${addr.isDefault ? 'bg-brand-maroon text-white' : 'bg-brand-tan/30 text-brand-maroon'} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-brand-dark">{addr.label}</span>
                        {addr.isDefault && <span className="text-[10px] bg-brand-maroon text-white px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.street}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <Button variant="ghost" size="sm" className="text-xs text-brand-maroon" onClick={() => handleSetDefault(addr.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(addr)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(addr.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
