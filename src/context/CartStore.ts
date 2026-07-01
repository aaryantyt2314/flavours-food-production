import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CART_VERSION = 2;
const CART_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  priceTier: string;
  quantity: number;
  image?: string;
  isVeg: boolean;
}

interface CartState {
  cartVersion: number;
  lastUpdated: number;
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string, priceTier: string) => void;
  updateQuantity: (menuItemId: string, priceTier: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const isCartStale = (lastUpdated: number) => Date.now() - lastUpdated > CART_EXPIRY_MS;

const createEmptyCartState = (): Pick<CartState, 'items' | 'cartVersion' | 'lastUpdated'> => ({
  items: [],
  cartVersion: CART_VERSION,
  lastUpdated: Date.now(),
});

const clearExpiredCartIfNeeded = (set: (state: Pick<CartState, 'items' | 'cartVersion' | 'lastUpdated'>) => void, get: () => CartState) => {
  const state = get();

  if (state.items.length > 0 && isCartStale(state.lastUpdated)) {
    set(createEmptyCartState());
    return true;
  }

  return false;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...createEmptyCartState(),
      addItem: (item) => {
        clearExpiredCartIfNeeded(set, get);
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId && i.priceTier === item.priceTier
          );
          const lastUpdated = Date.now();

          if (existing) {
            return {
              cartVersion: CART_VERSION,
              lastUpdated,
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId && i.priceTier === item.priceTier
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return {
            cartVersion: CART_VERSION,
            lastUpdated,
            items: [...state.items, item],
          };
        });
      },
      removeItem: (menuItemId, priceTier) => {
        clearExpiredCartIfNeeded(set, get);
        set((state) => ({
          cartVersion: CART_VERSION,
          lastUpdated: Date.now(),
          items: state.items.filter(
            (i) => !(i.menuItemId === menuItemId && i.priceTier === priceTier)
          ),
        }));
      },
      updateQuantity: (menuItemId, priceTier, quantity) => {
        clearExpiredCartIfNeeded(set, get);
        set((state) => ({
          cartVersion: CART_VERSION,
          lastUpdated: Date.now(),
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.menuItemId === menuItemId && i.priceTier === priceTier)
                )
              : state.items.map((i) =>
                  i.menuItemId === menuItemId && i.priceTier === priceTier
                    ? { ...i, quantity }
                    : i
                ),
        }));
      },
      clearCart: () => set(createEmptyCartState()),
      getTotal: () => {
        if (clearExpiredCartIfNeeded(set, get)) {
          return 0;
        }

        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      getItemCount: () => {
        if (clearExpiredCartIfNeeded(set, get)) {
          return 0;
        }

        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: 'flavours-cart',
      version: CART_VERSION,
      migrate: (persistedState, version) => {
        if (version < CART_VERSION) {
          return createEmptyCartState();
        }

        return persistedState as Partial<CartState>;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.items.length && state.lastUpdated && isCartStale(state.lastUpdated)) {
          state.clearCart();
        }
      },
    }
  )
);

if (typeof window !== 'undefined') {
  const cartWindow = window as Window & {
    __cartStoreExpiryInterval?: number | ReturnType<typeof window.setInterval>;
  };

  if (!cartWindow.__cartStoreExpiryInterval) {
    cartWindow.__cartStoreExpiryInterval = window.setInterval(() => {
      const state = useCartStore.getState();

      if (state.items.length > 0 && isCartStale(state.lastUpdated)) {
        useCartStore.setState(createEmptyCartState());
      }
    }, 60 * 60 * 1000);
  }
}
