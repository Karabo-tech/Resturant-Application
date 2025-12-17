# Restaurant Food Ordering App 🍔

A modern, full-featured React Native restaurant ordering application built with Expo, TypeScript, and Firebase. This app provides a complete food ordering experience for customers and comprehensive management tools for administrators.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-~54.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.13.0-orange)

## 📱 Features

### Customer Features
- 🏠 **Browse Menu** - View food items organized by categories
- 🍕 **Item Customization** - Customize orders with sides, drinks, extras, and ingredient modifications
- 🛒 **Shopping Cart** - Full cart management with quantity updates and item removal
- 💳 **Secure Checkout** - Select delivery address and payment method
- 👤 **User Profile** - Manage personal information, addresses, and payment cards
- 🔐 **Authentication** - Email/password registration and login

### Admin Features
- 📊 **Dashboard** - View order statistics and revenue analytics
- 📦 **Order Management** - Track and update order status
- 🍽️ **Menu Management** - Add, edit, and delete food items
- 📈 **Analytics** - View sales trends and performance metrics

## 🏗️ Project Structure

```
ResturantApplication/
├── app/                        # Expo Router screens
│   ├── (auth)/                # Authentication screens
│   ├── (customer)/            # Customer screens
│   ├── (admin)/              # Admin screens
│   └── (tabs)/               # Tab navigation
├── components/               # Reusable UI components
│   ├── common/              # Common components
│   ├── food/                # Food-related components
│   └── cart/                # Cart components
├── contexts/                # React Context providers
├── services/                # Firebase & API services
├── types/                   # TypeScript definitions
├── utils/                   # Utility functions
└── constants/              # App constants
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase account

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create Firestore database
   - Update `services/firebase.ts` with your config

3. **Run the app**
   ```bash
   npm start       # Start development server
   npm run android # Run on Android
   npm run ios     # Run on iOS
   npm run web     # Run on web
   ```

📖 **Detailed setup instructions available in [SETUP.md](./SETUP.md)**

## 🎨 Design

This app is designed based on modern UI/UX principles with:
- Clean, intuitive interface
- Orange accent color (#FF6B35) for primary actions
- Card-based layouts for easy content scanning
- Smooth navigation and transitions
- Responsive design for various screen sizes

## 🔧 Tech Stack

### Core
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based routing

### Backend & Database
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - Image storage

### UI & Forms
- **React Native Elements** - UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Expo Vector Icons** - Icon library

### State Management
- **React Context** - Global state (Auth, Cart)
- **AsyncStorage** - Local persistence

## 💰 Currency

The app uses **South African Rand (ZAR)** with the `R` symbol for all pricing.

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.29",
  "react-native": "0.81.5",
  "firebase": "^10.13.0",
  "expo-router": "~6.0.19",
  "react-hook-form": "^7.53.2",
  "zod": "^3.23.8",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "react-native-elements": "^3.4.3",
  "typescript": "~5.9.2"
}
```

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup and configuration
- [Project Summary](./PROJECT_SUMMARY.md) - Complete feature list
- [Command Instructions](./command.md) - Project requirements

## 🧪 Testing

### Test Credentials
Create test accounts through the registration screen. Use fake card details from [VCC Generator](https://www.vccgenerator.org/) for testing payments.

### Creating Admin Account
1. Register a normal user account
2. Go to Firebase Console → Firestore
3. Find the user document and set `role: "admin"`

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore security rules to protect data
- Client-side form validation
- Secure card details storage (last 4 digits only)

## 🎯 Future Enhancements

- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] In-app messaging
- [ ] Rating and review system
- [ ] Loyalty program
- [ ] Multiple payment gateways (Stripe, PayPal)
- [ ] Order history and reordering
- [ ] Advanced search and filters
- [ ] Restaurant operating hours management

## 🤝 Contributing

This is an educational project. Feel free to fork and enhance!

## 📄 License

This project is created for educational purposes as part of CodeTribe training.

## 👨‍💻 Author

Built with ❤️ for South African food lovers

## 🆘 Support

For issues or questions:
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/)

---

**Note:** This application requires proper Firebase configuration to function. Please follow the setup guide in SETUP.md for detailed instructions.
