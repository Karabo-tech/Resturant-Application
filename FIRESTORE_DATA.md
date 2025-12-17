# Firestore Sample Data - foodItems Collection

## How to Add This Data

### Option 1: Using Firebase Console (Manual)

Go to Firebase Console → Firestore Database → Start Collection → Collection ID: `foodItems`

Then add each document below by clicking "Add document"

### Option 2: Using Browser Console (Automated)

1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the code at the bottom of this file
5. Press Enter

---

## Document 1: Classic Beef Burger

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 2: Chicken Burger

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 3: Chicken Stir-Fry

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 4: Grilled Salmon

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 5: Chicken Wings

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 6: Spring Rolls

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 7: Chocolate Lava Cake

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 8: Cheesecake

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 9: Fresh Orange Juice

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 10: Cappuccino

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 11: Red Wine

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Document 12: Craft Beer

```javascript
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
  createdAt: new Date(),
  updatedAt: new Date()
}
```

---

## ⚡ EASIEST METHOD: Use In-App Tool

Instead of adding manually, just navigate to:
```
http://localhost:8081/add-sample-data
```

Click the button and all 12 items will be added automatically in 10 seconds!

---

## All Items Summary

| Category | Items | Count |
|----------|-------|-------|
| Burgers | Classic Beef Burger, Chicken Burger | 2 |
| Mains | Chicken Stir-Fry, Grilled Salmon | 2 |
| Starters | Chicken Wings, Spring Rolls | 2 |
| Desserts | Chocolate Lava Cake, Cheesecake | 2 |
| Beverages | Fresh Orange Juice, Cappuccino | 2 |
| Alcohols | Red Wine, Craft Beer | 2 |
| **TOTAL** | | **12 items** |

All prices are in South African Rand (R).
