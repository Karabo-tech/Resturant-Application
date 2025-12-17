import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, RegisterFormData, Address, CardDetails } from '@/types';

/**
 * Register a new user with email and password
 */
export const registerUser = async (formData: RegisterFormData): Promise<User> => {
  try {
    // Create Firebase authentication user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: `${formData.name} ${formData.surname}`,
    });

    // Create user document in Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email: formData.email,
      name: formData.name,
      surname: formData.surname,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        country: 'South Africa',
      },
      cardDetails: [
        {
          id: `card_${Date.now()}`,
          cardNumber: formData.cardNumber.slice(-4), // Store only last 4 digits
          cardHolderName: formData.cardHolderName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          isDefault: true,
        },
      ],
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    // Update Firebase Auth email if changed
    if (updates.email && auth.currentUser) {
      await updateEmail(auth.currentUser, updates.email);
    }

    // Update Firebase Auth display name if name changed
    if ((updates.name || updates.surname) && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: `${updates.name} ${updates.surname}`,
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Profile update failed');
  }
};

/**
 * Add card details to user profile
 */
export const addCardDetails = async (
  userId: string,
  cardDetails: Omit<CardDetails, 'id'>
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data() as User;

    const newCard: CardDetails = {
      id: `card_${Date.now()}`,
      ...cardDetails,
    };

    // If this is set as default, unset other defaults
    const updatedCards = cardDetails.isDefault
      ? [...(userData.cardDetails || []).map((c) => ({ ...c, isDefault: false })), newCard]
      : [...(userData.cardDetails || []), newCard];

    await updateDoc(doc(db, 'users', userId), {
      cardDetails: updatedCards,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add card');
  }
};

/**
 * Update address
 */
export const updateAddress = async (userId: string, address: Address): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      address,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update address');
  }
};
