import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string, priceTier: string) => void;
  updateQuantity: (menuItemId: string, priceTier: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId && i.priceTier === item.priceTier
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId && i.priceTier === item.priceTier
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (menuItemId, priceTier) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.menuItemId === menuItemId && i.priceTier === priceTier)
          ),
        })),
      updateQuantity: (menuItemId, priceTier, quantity) =>
        set((state) => ({
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
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'flavours-cart',
    }
  )
);
