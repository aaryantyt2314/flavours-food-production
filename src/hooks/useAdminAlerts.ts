'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const POLL_INTERVAL = 8000; // 8 seconds

interface MinimalOrder {
  id: string;
  total: number;
  customerName: string;
  createdAt: string;
  status: string;
}

interface MinimalReservation {
  id: string;
  name: string;
  partySize: number;
  time: string;
  createdAt: string;
}

export function useAdminAlerts(
  activeSection: string,
  initialOrders?: { id: string; createdAt: string | Date }[] | null,
  initialReservations?: { id: string; createdAt: string | Date }[] | null,
  onNewAlert?: () => void
) {
  const { data: session, status } = useSession();

  // Mute preference state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_alerts_muted') === 'true';
    }
    return false;
  });

  // Browser Audio autoplay unlocked state
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Badge count states
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [unreadReservations, setUnreadReservations] = useState(0);

  // Last seen tracking states
  const [lastSeenOrderId, setLastSeenOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_last_seen_order_id');
    }
    return null;
  });
  const [lastSeenOrderTime, setLastSeenOrderTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_last_seen_order_time');
    }
    return null;
  });

  const [lastSeenReservationId, setLastSeenReservationId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_last_seen_reservation_id');
    }
    return null;
  });
  const [lastSeenReservationTime, setLastSeenReservationTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_last_seen_reservation_time');
    }
    return null;
  });

  // Try to unlock audio implicitly on mount
  useEffect(() => {
    const audio = new Audio('/sounds/notification.wav');
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        setAudioUnlocked(true);
      })
      .catch(() => {
        setAudioUnlocked(false);
      });
  }, []);

  // Initialize last seen states based on initial loaded data if not already set
  useEffect(() => {
    if (!lastSeenOrderTime && initialOrders !== undefined) {
      if (initialOrders && initialOrders.length > 0) {
        const newest = initialOrders[0];
        const newestTime = new Date(newest.createdAt).toISOString();
        setLastSeenOrderId(newest.id);
        setLastSeenOrderTime(newestTime);
        localStorage.setItem('admin_last_seen_order_id', newest.id);
        localStorage.setItem('admin_last_seen_order_time', newestTime);
      } else if (initialOrders) {
        const now = new Date().toISOString();
        setLastSeenOrderTime(now);
        localStorage.setItem('admin_last_seen_order_time', now);
      }
    }
  }, [initialOrders, lastSeenOrderTime]);

  useEffect(() => {
    if (!lastSeenReservationTime && initialReservations !== undefined) {
      if (initialReservations && initialReservations.length > 0) {
        const newest = initialReservations[0];
        const newestTime = new Date(newest.createdAt).toISOString();
        setLastSeenReservationId(newest.id);
        setLastSeenReservationTime(newestTime);
        localStorage.setItem('admin_last_seen_reservation_id', newest.id);
        localStorage.setItem('admin_last_seen_reservation_time', newestTime);
      } else if (initialReservations) {
        const now = new Date().toISOString();
        setLastSeenReservationTime(now);
        localStorage.setItem('admin_last_seen_reservation_time', now);
      }
    }
  }, [initialReservations, lastSeenReservationTime]);

  // Reset badge count when viewing corresponding section
  useEffect(() => {
    if (activeSection === 'orders') {
      setUnreadOrders(0);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'reservations') {
      setUnreadReservations(0);
    }
  }, [activeSection]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('admin_alerts_muted', String(next));
      return next;
    });
  }, []);

  const unlockAudio = useCallback(async () => {
    const audio = new Audio('/sounds/notification.wav');
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      setAudioUnlocked(true);
      toast.success('Audio notifications enabled!');
    } catch (err) {
      console.error('Failed to unlock audio:', err);
      toast.error('Could not enable audio alerts. Please interact with the page first.');
    }
  }, []);

  const playSound = useCallback(() => {
    if (isMuted) return;
    const audio = new Audio('/sounds/notification.wav');
    audio.play().catch((err) => {
      console.warn('Autoplay blocked or audio play failed:', err);
    });
  }, [isMuted]);

  // Poll for new orders
  const { data: newOrders } = useQuery<MinimalOrder[]>({
    queryKey: ['admin-new-orders', lastSeenOrderTime],
    queryFn: async () => {
      if (!lastSeenOrderTime) return [];
      const res = await fetch(`/api/orders?since=${encodeURIComponent(lastSeenOrderTime)}`);
      if (!res.ok) throw new Error('Failed to fetch new orders');
      return res.json();
    },
    enabled: status === 'authenticated' && session?.user?.role === 'admin' && !!lastSeenOrderTime,
    refetchInterval: POLL_INTERVAL,
  });

  // Process new orders
  useEffect(() => {
    if (newOrders && newOrders.length > 0) {
      const unseenOrders = newOrders.filter((o) => o.id !== lastSeenOrderId);
      if (unseenOrders.length > 0) {
        playSound();

        const sorted = [...unseenOrders].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sorted.forEach((order) => {
          toast(`New order #${order.id.slice(-4)} — ₹${order.total}`);
        });

        if (activeSection !== 'orders') {
          setUnreadOrders((prev) => prev + sorted.length);
        }

        const newest = sorted[sorted.length - 1];
        const newestTime = new Date(newest.createdAt).toISOString();
        setLastSeenOrderId(newest.id);
        setLastSeenOrderTime(newestTime);
        localStorage.setItem('admin_last_seen_order_id', newest.id);
        localStorage.setItem('admin_last_seen_order_time', newestTime);

        if (onNewAlert) {
          onNewAlert();
        }
      }
    }
  }, [newOrders, lastSeenOrderId, activeSection, playSound, onNewAlert]);

  // Poll for new reservations
  const { data: newReservations } = useQuery<MinimalReservation[]>({
    queryKey: ['admin-new-reservations', lastSeenReservationTime],
    queryFn: async () => {
      if (!lastSeenReservationTime) return [];
      const res = await fetch(`/api/reservations?since=${encodeURIComponent(lastSeenReservationTime)}`);
      if (!res.ok) throw new Error('Failed to fetch new reservations');
      return res.json();
    },
    enabled: status === 'authenticated' && session?.user?.role === 'admin' && !!lastSeenReservationTime,
    refetchInterval: POLL_INTERVAL,
  });

  // Process new reservations
  useEffect(() => {
    if (newReservations && newReservations.length > 0) {
      const unseenRes = newReservations.filter((r) => r.id !== lastSeenReservationId);
      if (unseenRes.length > 0) {
        playSound();

        const sorted = [...unseenRes].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sorted.forEach((res) => {
          toast(`New reservation — ${res.name}, ${res.partySize} guests, ${res.time}`);
        });

        if (activeSection !== 'reservations') {
          setUnreadReservations((prev) => prev + sorted.length);
        }

        const newest = sorted[sorted.length - 1];
        const newestTime = new Date(newest.createdAt).toISOString();
        setLastSeenReservationId(newest.id);
        setLastSeenReservationTime(newestTime);
        localStorage.setItem('admin_last_seen_reservation_id', newest.id);
        localStorage.setItem('admin_last_seen_reservation_time', newestTime);

        if (onNewAlert) {
          onNewAlert();
        }
      }
    }
  }, [newReservations, lastSeenReservationId, activeSection, playSound, onNewAlert]);

  return {
    unreadOrders,
    unreadReservations,
    isMuted,
    toggleMute,
    audioUnlocked,
    unlockAudio,
  };
}
