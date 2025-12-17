import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem, CartItem } from '@/types';
import { getFoodItemById } from '@/services/food.service';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { formatCurrency } from '@/utils/currency';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [item, setItem] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<string[]>([]);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      if (typeof itemId === 'string') {
        const foodItem = await getFoodItemById(itemId);
        setItem(foodItem);
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleSide = (sideId: string) => {
    const maxSelection = item?.sideOptions?.[0]?.maxSelection || 2;
    if (selectedSides.includes(sideId)) {
      setSelectedSides(selectedSides.filter((id) => id !== sideId));
    } else if (selectedSides.length < maxSelection) {
      setSelectedSides([...selectedSides, sideId]);
    }
  };

  const toggleExtra = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter((id) => id !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const toggleIngredient = (ingredientId: string, isRemoval: boolean) => {
    if (isRemoval) {
      if (removedIngredients.includes(ingredientId)) {
        setRemovedIngredients(removedIngredients.filter((id) => id !== ingredientId));
      } else {
        setRemovedIngredients([...removedIngredients, ingredientId]);
      }
    } else {
      if (addedIngredients.includes(ingredientId)) {
        setAddedIngredients(addedIngredients.filter((id) => id !== ingredientId));
      } else {
        setAddedIngredients([...addedIngredients, ingredientId]);
      }
    }
  };

  const calculateTotal = () => {
    if (!item) return 0;
    let total = item.price;

    // Add extras
    selectedExtras.forEach((extraId) => {
      const extra = item.extras?.find((e) => e.id === extraId);
      if (extra) total += extra.price;
    });

    // Add drink if not included
    if (selectedDrink) {
      const drink = item.drinkOptions?.find((d) => d.id === selectedDrink);
      if (drink) total += drink.price;
    }

    // Add ingredient additions
    addedIngredients.forEach((ingredientId) => {
      const ingredient = item.ingredients?.find((i) => i.id === ingredientId);
      if (ingredient) total += ingredient.price;
    });

    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem: CartItem = {
      id: `${item.id}_${Date.now()}`,
      foodItem: item,
      quantity,
      selectedSides,
      selectedDrink,
      selectedExtras,
      ingredientModifications: {
        removed: removedIngredients,
        added: addedIngredients,
      },
      subtotal: calculateTotal(),
    };

    addToCart(cartItem);
    Alert.alert('Success', 'Item added to cart!', [
      { text: 'Continue Shopping', onPress: () => router.back() },
      { text: 'View Cart', onPress: () => router.push('/(customer)/cart') },
    ]);
  };

  if (loading || !item) {
    return <Loading fullScreen message="Loading item..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Image */}
        <Image source={{ uri: item.image }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Item Info */}
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={24} color="#FF6B35" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Side Options */}
          {item.sideOptions && item.sideOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Choose Sides (Max {item.sideOptions[0].maxSelection})
              </Text>
              {item.sideOptions.map((side) => (
                <TouchableOpacity
                  key={side.id}
                  style={[
                    styles.optionItem,
                    selectedSides.includes(side.id) && styles.optionItemSelected,
                  ]}
                  onPress={() => toggleSide(side.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSides.includes(side.id) && styles.optionTextSelected,
                    ]}
                  >
                    {side.name}
                  </Text>
                  {selectedSides.includes(side.id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Drink Options */}
          {item.drinkOptions && item.drinkOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Drink</Text>
              {item.drinkOptions.map((drink) => (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.optionItem,
                    selectedDrink === drink.id && styles.optionItemSelected,
                  ]}
                  onPress={() => setSelectedDrink(drink.id)}
                >
                  <View style={styles.optionLeft}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedDrink === drink.id && styles.optionTextSelected,
                      ]}
                    >
                      {drink.name}
                    </Text>
                    {drink.price > 0 && (
                      <Text style={styles.optionPrice}>
                        +{formatCurrency(drink.price)}
                      </Text>
                    )}
                  </View>
                  {selectedDrink === drink.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Extras */}
          {item.extras && item.extras.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Extras</Text>
              {item.extras.map((extra) => (
                <TouchableOpacity
                  key={extra.id}
                  style={[
                    styles.optionItem,
                    selectedExtras.includes(extra.id) && styles.optionItemSelected,
                  ]}
                  onPress={() => toggleExtra(extra.id)}
                >
                  <View style={styles.optionLeft}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedExtras.includes(extra.id) && styles.optionTextSelected,
                      ]}
                    >
                      {extra.name}
                    </Text>
                    <Text style={styles.optionPrice}>
                      +{formatCurrency(extra.price)}
                    </Text>
                  </View>
                  {selectedExtras.includes(extra.id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customize Ingredients</Text>
              {item.ingredients.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <View style={styles.ingredientActions}>
                    {ingredient.removable && (
                      <TouchableOpacity
                        style={[
                          styles.ingredientButton,
                          removedIngredients.includes(ingredient.id) &&
                            styles.ingredientButtonActive,
                        ]}
                        onPress={() => toggleIngredient(ingredient.id, true)}
                      >
                        <Text
                          style={[
                            styles.ingredientButtonText,
                            removedIngredients.includes(ingredient.id) &&
                              styles.ingredientButtonTextActive,
                          ]}
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                    {ingredient.addable && (
                      <TouchableOpacity
                        style={[
                          styles.ingredientButton,
                          addedIngredients.includes(ingredient.id) &&
                            styles.ingredientButtonActive,
                        ]}
                        onPress={() => toggleIngredient(ingredient.id, false)}
                      >
                        <Text
                          style={[
                            styles.ingredientButtonText,
                            addedIngredients.includes(ingredient.id) &&
                              styles.ingredientButtonTextActive,
                          ]}
                        >
                          Add {ingredient.price > 0 && `(+${formatCurrency(ingredient.price)})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatCurrency(calculateTotal())}</Text>
        </View>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#E2E8F0',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginHorizontal: 32,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  optionLeft: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  ingredientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ingredientButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  ingredientButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  ingredientButtonText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  ingredientButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#718096',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  addButton: {
    paddingHorizontal: 32,
  },
});
