import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product) => {
        set((state) => {
            const existingItem = state.items.find((item) => item.product.id === product.id);
            if (existingItem) {
                // Determine raw max product quantity/stock. Assume product.stockQuantity. 
                // Defaulting to 99 if undefined just to be safe.
                const maxStock = product.stockQuantity ?? 99;

                if (existingItem.quantity >= maxStock) {
                    // We cannot add more than the stock available.
                    return state;
                }

                return {
                    items: state.items.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }

            // Also check initial addition against stock
            const maxStock = product.stockQuantity ?? 99;
            if (maxStock <= 0) return state; // out of stock

            return { items: [...state.items, { product, quantity: 1 }] };
        });
    },

    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter((item) => item.product.id !== productId)
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => {
            if (quantity <= 0) {
                return { items: state.items.filter((item) => item.product.id !== productId) };
            }
            return {
                items: state.items.map((item) => {
                    if (item.product.id === productId) {
                        const maxStock = item.product.stockQuantity ?? 99;
                        const validQuantity = Math.min(quantity, maxStock);
                        return { ...item, quantity: validQuantity };
                    }
                    return item;
                })
            };
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },

    getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
    }
}));
