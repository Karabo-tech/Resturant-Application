import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem, FoodItem } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@restaurant_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveCart();
    }
  }, [cart, isLoaded]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Validate the cart structure to ensure items is an array
        if (parsedCart && Array.isArray(parsedCart.items)) {
          setCart({
            items: parsedCart.items,
            total: parsedCart.total || 0,
            itemCount: parsedCart.itemCount || 0,
          });
        } else {
          // If the structure is invalid, reset to empty cart
          console.warn('Invalid cart structure in storage, resetting cart');
          setCart({
            items: [],
            total: 0,
            itemCount: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // On error, ensure cart has valid structure
      setCart({
        items: [],
        total: 0,
        itemCount: 0,
      });
    } finally {
      setIsLoaded(true);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const calculateSubtotal = (item: CartItem): number => {
    let subtotal = item.foodItem.price;

    // Add extras
    item.selectedExtras.forEach((extraId) => {
      const extra = item.foodItem.extras?.find((e) => e.id === extraId);
      if (extra) {
        subtotal += extra.price;
      }
    });

    // Add drink if not included
    if (item.selectedDrink) {
      const drink = item.foodItem.drinkOptions?.find((d) => d.id === item.selectedDrink);
      if (drink) {
        subtotal += drink.price;
      }
    }

    // Add ingredient additions
    item.ingredientModifications.added.forEach((ingredientId) => {
      const ingredient = item.foodItem.ingredients?.find((i) => i.id === ingredientId);
      if (ingredient) {
        subtotal += ingredient.price;
      }
    });

    return subtotal * item.quantity;
  };

  const addToCart = (item: CartItem) => {
    const itemWithSubtotal = {
      ...item,
      subtotal: calculateSubtotal(item),
    };

    setCart((prevCart) => {
      const newItems = [...prevCart.items, itemWithSubtotal];
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.id !== itemId);
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    });
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates };
          return {
            ...updatedItem,
            subtotal: calculateSubtotal(updatedItem),
          };
        }
        return item;
      });

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    });
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.itemCount;
  };

  const getCartTotal = () => {
    if (!cart) return 0;
    return cart.total;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartItemCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
