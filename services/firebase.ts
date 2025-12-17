import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_rZDojJbK7qB02dQwcoFs0vmpOAFOv5E",
  authDomain: "resturant-e152a.firebaseapp.com",
  projectId: "resturant-e152a",
  storageBucket: "resturant-e152a.firebasestorage.app",
  messagingSenderId: "80834731560",
  appId: "1:80834731560:web:45562303764ece13129f1d",
  measurementId: "G-T85WSPPDSY"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };