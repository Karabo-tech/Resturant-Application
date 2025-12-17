# 🚀 Installation & Running Guide

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo
- Firebase SDK
- Form libraries (React Hook Form, Zod)
- UI components
- Navigation libraries
- And more...

### 2. Configure Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "Restaurant-App")
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Click "Save"

#### Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Select a location (closest to your users)
5. Click "Enable"

#### Set Security Rules
Go to **Rules** tab and paste:

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

#### Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (</>)
4. Register your app
5. Copy the `firebaseConfig` object

#### Update Your Code
Open `services/firebase.ts` and replace with your config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Add Sample Food Items

Go to Firestore and create a `foodItems` collection with sample items:

```javascript
// Document 1
{
  name: "Classic Beef Burger",
  description: "Juicy beef patty with fresh lettuce, tomato, cheese, and our special sauce",
  price: 89.99,
  category: "Burgers",
  image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
  available: true,
  sideOptions: [
    { id: "side1", name: "Chips", maxSelection: 2 },
    { id: "side2", name: "Salad", maxSelection: 2 },
    { id: "side3", name: "Onion Rings", maxSelection: 2 }
  ],
  drinkOptions: [
    { id: "drink1", name: "Coke 330ml", price: 0 },
    { id: "drink2", name: "Sprite 330ml", price: 0 },
    { id: "drink3", name: "Fanta 330ml", price: 0 }
  ],
  extras: [
    { id: "extra1", name: "Extra Cheese", price: 15 },
    { id: "extra2", name: "Bacon", price: 20 },
    { id: "extra3", name: "Avocado", price: 18 }
  ],
  ingredients: [
    { id: "ing1", name: "Lettuce", removable: true, addable: false, price: 0 },
    { id: "ing2", name: "Tomato", removable: true, addable: true, price: 5 },
    { id: "ing3", name: "Onions", removable: true, addable: false, price: 0 }
  ],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

// Document 2
{
  name: "Chicken Stir-Fry",
  description: "Tender chicken strips with mixed vegetables in a savory sauce",
  price: 95.00,
  category: "Mains",
  image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500",
  available: true,
  sideOptions: [
    { id: "side1", name: "Rice", maxSelection: 1 },
    { id: "side2", name: "Noodles", maxSelection: 1 }
  ],
  drinkOptions: [
    { id: "drink1", name: "Water", price: 0 },
    { id: "drink2", name: "Juice", price: 15 }
  ],
  extras: [
    { id: "extra1", name: "Extra Chicken", price: 30 },
    { id: "extra2", name: "Extra Vegetables", price: 20 }
  ],
  ingredients: [],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

// Add more items for other categories...
```

### 4. Run the Application

#### Development Mode
```bash
npm start
```

Then choose your platform:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

#### Specific Platform Commands
```bash
# Android
npm run android

# iOS  
npm run ios

# Web
npm run web
```

### 5. Test the Application

#### Create Test Account
1. Open the app
2. Click "Sign Up"
3. Fill in the registration form with test data
4. Use fake card from [VCC Generator](https://www.vccgenerator.org/)
5. Complete registration

#### Test Customer Flow
1. Browse food items
2. Select an item
3. Customize it (sides, drinks, extras)
4. Add to cart
5. Go to cart
6. Proceed to checkout
7. Place order

#### Create Admin Account
1. Register a normal account
2. Go to Firebase Console → Firestore
3. Open the `users` collection
4. Find your user document
5. Edit and change `role: "customer"` to `role: "admin"`
6. Logout and login again
7. Go to Profile tab → Admin Dashboard

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 8081
npx kill-port 8081
```

### Clear Cache
```bash
# Clear Expo cache
npx expo start -c

# Or
npm start -- --reset-cache
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Firebase Connection Issues
1. Check your internet connection
2. Verify Firebase config in `services/firebase.ts`
3. Ensure Authentication and Firestore are enabled
4. Check Firebase Console for any errors

### iOS Specific
```bash
cd ios
pod install
cd ..
```

## Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] Browse food items
- [ ] Filter by category
- [ ] View item details
- [ ] Customize order
- [ ] Add to cart
- [ ] View cart
- [ ] Update cart quantities
- [ ] Remove cart items
- [ ] Checkout
- [ ] Place order
- [ ] View profile
- [ ] Logout
- [ ] Admin can access dashboard
- [ ] Admin can view orders

## Environment Variables (Optional)

For production, consider using environment variables:

Create `.env` file:
```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Need Help?

- Check [SETUP.md](./SETUP.md) for detailed configuration
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for feature overview
- See [command.md](./command.md) for project requirements

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure Firebase
3. ✅ Add sample data
4. ✅ Run the app
5. ✅ Test all features
6. 🎨 Customize design (optional)
7. 📱 Deploy to app stores (optional)

---

**Happy Coding! 🚀**
