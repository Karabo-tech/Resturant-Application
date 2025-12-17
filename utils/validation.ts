import { z } from 'zod';

// South African phone number validation
export const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;

// Card validation
export const cardNumberRegex = /^[0-9]{13,19}$/;
export const cvvRegex = /^[0-9]{3,4}$/;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Invalid South African phone number'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  cardNumber: z.string().regex(cardNumberRegex, 'Invalid card number'),
  cardHolderName: z.string().min(3, 'Card holder name is required'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string().regex(/^20[2-9][0-9]$/, 'Invalid year'),
  cvv: z.string().regex(cvvRegex, 'Invalid CVV'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid South African phone number'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
});

// Food item schema
export const foodItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.enum(['Burgers', 'Mains', 'Starters', 'Desserts', 'Beverages', 'Alcohols']),
  image: z.string().url('Invalid image URL'),
  available: z.boolean(),
});
