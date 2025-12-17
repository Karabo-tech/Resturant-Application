import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { FoodItem, FoodCategory } from '@/types';

const FOOD_COLLECTION = 'foodItems';

/**
 * Get all food items
 */
export const getAllFoodItems = async (): Promise<FoodItem[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, FOOD_COLLECTION), orderBy('name'))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodItem[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch food items');
  }
};

/**
 * Get food items by category
 */
export const getFoodItemsByCategory = async (
  category: FoodCategory
): Promise<FoodItem[]> => {
  try {
    const q = query(
      collection(db, FOOD_COLLECTION),
      where('category', '==', category),
      where('available', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodItem[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch food items');
  }
};

/**
 * Get a single food item by ID
 */
export const getFoodItemById = async (id: string): Promise<FoodItem | null> => {
  try {
    const docSnapshot = await getDoc(doc(db, FOOD_COLLECTION, id));
    if (!docSnapshot.exists()) {
      return null;
    }
    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as FoodItem;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch food item');
  }
};

/**
 * Create a new food item (Admin only)
 */
export const createFoodItem = async (
  foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, FOOD_COLLECTION), {
      ...foodItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create food item');
  }
};

/**
 * Update a food item (Admin only)
 */
export const updateFoodItem = async (
  id: string,
  updates: Partial<FoodItem>
): Promise<void> => {
  try {
    await updateDoc(doc(db, FOOD_COLLECTION, id), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update food item');
  }
};

/**
 * Delete a food item (Admin only)
 */
export const deleteFoodItem = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, FOOD_COLLECTION, id));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete food item');
  }
};

/**
 * Get available categories with item counts
 */
export const getCategoriesWithCounts = async (): Promise<
  { category: FoodCategory; count: number }[]
> => {
  try {
    const allItems = await getAllFoodItems();
    const categoryCounts = new Map<FoodCategory, number>();

    allItems.forEach((item) => {
      if (item.available) {
        categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
      }
    });

    return Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch categories');
  }
};
