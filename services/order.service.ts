import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, CartItem } from '@/types';

const ORDERS_COLLECTION = 'orders';

/**
 * Create a new order
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create order');
  }
};

/**
 * Get orders by user ID
 */
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const docSnapshot = await getDoc(doc(db, ORDERS_COLLECTION, id));
    if (!docSnapshot.exists()) {
      return null;
    }
    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as Order;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch order');
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<void> => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update order status');
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (limitCount: number = 10): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch recent orders');
  }
};
