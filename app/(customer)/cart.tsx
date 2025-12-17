import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartItem, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to checkout. Would you like to login or continue as guest?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }

    router.push('/(customer)/checkout');
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: clearCart,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#CBD5E0" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some delicious items to get started
        </Text>
        <Button
          title="Browse Menu"
          onPress={() => router.back()}
          style={styles.browseButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={(quantity) =>
              updateCartItem(item.id, { quantity })
            }
            onRemove={() => handleRemoveItem(item.id)}
            onEdit={() => {
              // Navigate to item detail for editing
              router.push(`/(customer)/item-detail?itemId=${item.foodItem.id}`);
            }}
          />
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(cart.total)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>{formatCurrency(0)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(cart.total)}</Text>
        </View>

        <Button
          title={`Checkout (${cart.itemCount} items)`}
          onPress={handleCheckout}
          style={styles.checkoutButton}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  browseButton: {
    width: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  summary: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#718096',
  },
  summaryValue: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  checkoutButton: {
    marginTop: 16,
  },
});
