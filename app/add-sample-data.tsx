import { Button } from '@/components/common/Button';
import { db } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

// Sample food items data
const sampleFoodItems = [
  // Burgers
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
  },
  {
    name: "Chicken Burger",
    description: "Grilled chicken breast with lettuce, mayo, and pickles",
    price: 79.99,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500",
    available: true,
    sideOptions: [
      { id: "side1", name: "Chips", maxSelection: 2 },
      { id: "side2", name: "Salad", maxSelection: 2 }
    ],
    drinkOptions: [
      { id: "drink1", name: "Coke 330ml", price: 0 },
      { id: "drink2", name: "Sprite 330ml", price: 0 }
    ],
    extras: [
      { id: "extra1", name: "Extra Cheese", price: 15 },
      { id: "extra2", name: "Bacon", price: 20 }
    ],
    ingredients: [
      { id: "ing1", name: "Lettuce", removable: true, addable: false, price: 0 },
      { id: "ing2", name: "Mayo", removable: true, addable: false, price: 0 }
    ],
  },
  
  // Mains
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
  },
  {
    name: "Grilled Salmon",
    description: "Fresh salmon fillet with herbs and lemon butter sauce",
    price: 135.00,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    available: true,
    sideOptions: [
      { id: "side1", name: "Vegetables", maxSelection: 1 },
      { id: "side2", name: "Mashed Potatoes", maxSelection: 1 }
    ],
    drinkOptions: [
      { id: "drink1", name: "Water", price: 0 },
      { id: "drink2", name: "Wine", price: 45 }
    ],
    extras: [
      { id: "extra1", name: "Extra Sauce", price: 15 }
    ],
    ingredients: [],
  },

  // Starters
  {
    name: "Chicken Wings",
    description: "Crispy chicken wings with your choice of sauce",
    price: 65.00,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500",
    available: true,
    sideOptions: [
      { id: "side1", name: "BBQ Sauce", maxSelection: 1 },
      { id: "side2", name: "Hot Sauce", maxSelection: 1 },
      { id: "side3", name: "Honey Mustard", maxSelection: 1 }
    ],
    drinkOptions: [
      { id: "drink1", name: "Coke", price: 0 },
      { id: "drink2", name: "Beer", price: 35 }
    ],
    extras: [
      { id: "extra1", name: "Extra Wings", price: 40 }
    ],
    ingredients: [],
  },
  {
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls with sweet chili sauce",
    price: 45.00,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [
      { id: "drink1", name: "Water", price: 0 }
    ],
    extras: [],
    ingredients: [],
  },

  // Desserts
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten chocolate center",
    price: 55.00,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
    available: true,
    sideOptions: [
      { id: "side1", name: "Vanilla Ice Cream", maxSelection: 1 },
      { id: "side2", name: "Whipped Cream", maxSelection: 1 }
    ],
    drinkOptions: [
      { id: "drink1", name: "Coffee", price: 25 }
    ],
    extras: [],
    ingredients: [],
  },
  {
    name: "Cheesecake",
    description: "Creamy New York style cheesecake with berry compote",
    price: 60.00,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [
      { id: "drink1", name: "Coffee", price: 25 },
      { id: "drink2", name: "Tea", price: 20 }
    ],
    extras: [],
    ingredients: [],
  },

  // Beverages
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 35.00,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [],
    extras: [],
    ingredients: [],
  },
  {
    name: "Cappuccino",
    description: "Classic Italian coffee with steamed milk foam",
    price: 30.00,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [],
    extras: [
      { id: "extra1", name: "Extra Shot", price: 10 }
    ],
    ingredients: [],
  },

  // Alcohols
  {
    name: "Red Wine",
    description: "Premium South African red wine",
    price: 85.00,
    category: "Alcohols",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [],
    extras: [],
    ingredients: [],
  },
  {
    name: "Craft Beer",
    description: "Local craft beer selection",
    price: 45.00,
    category: "Alcohols",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500",
    available: true,
    sideOptions: [],
    drinkOptions: [],
    extras: [],
    ingredients: [],
  }
];

export default function AddSampleDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const addSampleData = async () => {
    try {
      setLoading(true);
      setProgress('Starting to add sample food items...');
      
      let count = 0;
      for (const item of sampleFoodItems) {
        const itemWithTimestamps = {
          ...item,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await addDoc(collection(db, 'foodItems'), itemWithTimestamps);
        count++;
        setProgress(`Added ${count}/${sampleFoodItems.length}: ${item.name}`);
      }
      
      Alert.alert(
        'Success!',
        `Successfully added ${sampleFoodItems.length} food items to Firestore!`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add sample data');
      console.error('Error adding sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Sample Food Items</Text>
      <Text style={styles.subtitle}>
        This will add {sampleFoodItems.length} sample food items to your Firestore database
      </Text>
      
      {progress ? (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      ) : null}

      <Button
        title="Add Sample Data"
        onPress={addSampleData}
        loading={loading}
        style={styles.button}
      />
      
      <Button
        title="Go Back"
        onPress={() => router.back()}
        variant="outline"
        style={styles.button}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
  button: {
    marginBottom: 16,
  },
});
