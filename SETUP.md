# Restaurant Food Ordering App - Setup Guide

## Overview
This is a comprehensive React Native food ordering application built with Expo, TypeScript, and Firebase. The app allows customers to browse menus, customize orders, manage carts, and place orders, while admins can manage food items and view analytics.

## Project Structure

```
ResturantApplication/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── (customer)/              # Customer-facing screens
│   │   ├── item-detail.tsx     # Food item detail with customization
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── checkout.tsx        # Checkout and payment
│   │   └── profile.tsx         # User profile management
│   ├── (admin)/                 # Admin screens
│   │   └── dashboard.tsx       # Admin dashboard with analytics
│   ├── (tabs)/                  # Tab navigation
│   │   ├── index.tsx           # Home screen with food menu
│   │   ├── explore.tsx         # Profile tab
│   │   └── _layout.tsx         # Tab navigation layout
│   └── _layout.tsx             # Root layout with providers
├── components/                   # Reusable components
│   ├── common/                  # Common UI components
│   │   ├── Button.tsx          # Custom button component
│   │   ├── Input.tsx           # Form input component
│   │   ├── Card.tsx            # Card container component
│   │   └── Loading.tsx         # Loading indicator
│   ├── food/                    # Food-related components
│   │   ├── FoodCard.tsx        # Food item card
│   │   └── CategoryTab.tsx     # Category tab component
│   └── cart/                    # Cart-related components
│       └── CartItemCard.tsx    # Cart item display
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx         # Authentication state management
│   └── CartContext.tsx         # Shopping cart state management
├── services/                     # API and service layer
│   ├── firebase.ts             # Firebase configuration
│   ├── auth.service.ts         # Authentication services
│   ├── food.service.ts         # Food item CRUD operations
│   └── order.service.ts        # Order management
├── types/                        # TypeScript type definitions
│   └── index.ts                # All app types and interfaces
├── utils/                        # Utility functions
│   ├── currency.ts             # Currency formatting (ZAR)
│   └── validation.ts           # Form validation schemas
└── constants/                    # App constants
    └── theme.ts                # Theme colors and styles
```

## Features

### Customer Features
1. **Browse Menu** - View food items by category (Burgers, Mains, Starters, Desserts, Beverages, Alcohols)
2. **Item Customization** - Customize orders with:
   - Side options (choose 1-2 sides)
   - Drink options
   - Extras (additional items)
   - Ingredient modifications (add/remove)
   - Quantity selection
3. **Shopping Cart** - Add, edit, remove items, and view cart total
4. **Checkout** - Select delivery address, payment method, and place orders
5. **User Profile** - Manage personal info, addresses, and payment cards
6. **Authentication** - Email/password registration and login

### Admin Features
1. **Dashboard** - View order statistics and revenue
2. **Order Management** - View and update order status
3. **Food Item Management** - Add, edit, delete menu items
4. **Analytics** - View sales data and trends

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase account

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the configuration object

### Step 3: Configure Firebase

Edit `services/firebase.ts` and replace the configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Firestore Security Rules

Set up your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Food items collection
    match /foodItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 5: Add Sample Data

Add sample food items to Firestore manually or through the admin interface:

```javascript
// Example food item
{
  name: "Classic Burger",
  description: "Juicy beef patty with lettuce, tomato, and cheese",
  price: 89.99,
  category: "Burgers",
  image: "https://example.com/burger.jpg",
  available: true,
  sideOptions: [
    { id: "side1", name: "Chips", maxSelection: 2 },
    { id: "side2", name: "Salad", maxSelection: 2 }
  ],
  drinkOptions: [
    { id: "drink1", name: "Coke", price: 0 },
    { id: "drink2", name: "Sprite", price: 0 }
  ],
  extras: [
    { id: "extra1", name: "Extra Cheese", price: 15 },
    { id: "extra2", name: "Bacon", price: 20 }
  ],
  ingredients: [
    { id: "ing1", name: "Lettuce", removable: true, addable: false, price: 0 },
    { id: "ing2", name: "Tomato", removable: true, addable: true, price: 5 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Step 6: Run the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Testing

### Test Accounts

Create test accounts through the registration screen. Use fake card details from [VCC Generator](https://www.vccgenerator.org/) for testing.

### Creating Admin Account

To make a user an admin, manually update the Firestore document:

1. Go to Firebase Console → Firestore
2. Find the user document in the `users` collection
3. Edit the document and set `role: "admin"`

## Key Dependencies

- **expo**: ~54.0.29 - Expo framework
- **react-native**: 0.81.5 - React Native core
- **firebase**: ^10.13.0 - Firebase SDK
- **expo-router**: ~6.0.19 - File-based routing
- **react-hook-form**: ^7.53.2 - Form management
- **zod**: ^3.23.8 - Schema validation
- **@react-native-async-storage/async-storage**: ^2.1.0 - Local storage
- **react-native-elements**: ^3.4.3 - UI components

## Color Theme

- Primary: `#FF6B35` (Orange)
- Background: `#F7FAFC` (Light Gray)
- Text Primary: `#2D3748` (Dark Gray)
- Text Secondary: `#718096` (Medium Gray)
- Success: `#48BB78` (Green)
- Danger: `#E53E3E` (Red)

## Currency

The app uses South African Rand (ZAR) with the `R` symbol. All prices are formatted using the `formatCurrency` utility function.

## Troubleshooting

### Firebase Connection Issues
- Ensure your Firebase config is correct
- Check that authentication is enabled
- Verify Firestore security rules

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### iOS Specific Issues
```bash
# Install pods
cd ios && pod install && cd ..
```

## Development Tips

1. **Hot Reload**: Press `r` in the terminal to reload the app
2. **Debug Menu**: 
   - iOS: Cmd + D
   - Android: Cmd + M (Mac) or Ctrl + M (Windows/Linux)
3. **Inspect Network**: Use React Native Debugger or Flipper

## Production Deployment

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/)
