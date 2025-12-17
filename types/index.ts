// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  address: Address;
  cardDetails?: CardDetails[];
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CardDetails {
  id: string;
  cardNumber: string; // Last 4 digits only
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

// Food Item Types
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: FoodCategory;
  sideOptions?: SideOption[];
  drinkOptions?: DrinkOption[];
  extras?: Extra[];
  ingredients?: Ingredient[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FoodCategory = 
  | 'Burgers' 
  | 'Mains' 
  | 'Starters' 
  | 'Desserts' 
  | 'Beverages' 
  | 'Alcohols';

export interface SideOption {
  id: string;
  name: string;
  maxSelection: number; // e.g., 1 or 2
}

export interface DrinkOption {
  id: string;
  name: string;
  price: number; // 0 if included
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  removable: boolean;
  addable: boolean;
  price: number; // 0 if free
}

// Cart Types
export interface CartItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  selectedSides: string[];
  selectedDrink?: string;
  selectedExtras: string[];
  ingredientModifications: {
    removed: string[];
    added: string[];
  };
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  userDetails: {
    name: string;
    surname: string;
    phone: string;
    email: string;
  };
  items: CartItem[];
  total: number;
  deliveryAddress: Address;
  paymentMethod: CardDetails;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: Address;
  phone: string;
  email: string;
  openingHours: OpeningHours[];
  logo: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// Analytics Types (for Admin)
export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
  ordersPerDay: {
    date: string;
    count: number;
    revenue: number;
  }[];
  categoryDistribution: {
    category: FoodCategory;
    count: number;
    revenue: number;
  }[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface ProfileUpdateFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: Address;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(customer)/item-detail': { itemId: string };
  '(customer)/cart': undefined;
  '(customer)/checkout': undefined;
  '(customer)/profile': undefined;
  '(admin)/dashboard': undefined;
  '(admin)/manage-items': undefined;
  '(admin)/manage-orders': undefined;
  '(admin)/analytics': undefined;
};
