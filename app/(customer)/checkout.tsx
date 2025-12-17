import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/order.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { formatCurrency } from '@/utils/currency';
import { Order } from '@/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(user?.address);
  const [selectedCard, setSelectedCard] = useState(
    user?.cardDetails?.find((card) => card.isDefault) || user?.cardDetails?.[0]
  );

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || !selectedCard) {
      Alert.alert('Error', 'Please complete all required information');
      return;
    }

    try {
      setLoading(true);

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        userDetails: {
          name: user.name,
          surname: user.surname,
          phone: user.phone,
          email: user.email,
        },
        items: cart.items,
        total: cart.total,
        deliveryAddress: selectedAddress,
        paymentMethod: selectedCard,
        status: 'pending',
      };

      const orderId = await createOrder(orderData);

      Alert.alert(
        'Order Placed!',
        `Your order #${orderId.slice(0, 8)} has been placed successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please login to checkout</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Delivery Address */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        {selectedAddress && (
          <View style={styles.addressContent}>
            <Ionicons name="location-outline" size={24} color="#718096" />
            <View style={styles.addressText}>
              <Text style={styles.addressLine}>{selectedAddress.street}</Text>
              <Text style={styles.addressLine}>
                {selectedAddress.city}, {selectedAddress.province}
              </Text>
              <Text style={styles.addressLine}>{selectedAddress.postalCode}</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Payment Method */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        {selectedCard && (
          <View style={styles.cardContent}>
            <Ionicons name="card-outline" size={24} color="#718096" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardText}>•••• {selectedCard.cardNumber}</Text>
              <Text style={styles.cardSubtext}>
                {selectedCard.cardHolderName}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Order Summary */}
      <Card>
        <Text style={styles.cardTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({cart.itemCount})</Text>
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
      </Card>

      <Button
        title="Place Order"
        onPress={handlePlaceOrder}
        loading={loading}
        style={styles.placeOrderButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginTop: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    marginLeft: 12,
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
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
  placeOrderButton: {
    marginTop: 16,
  },
});
