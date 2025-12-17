import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { createOrder } from '@/services/order.service';
import { updateAddress, addCardDetails } from '@/services/auth.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/currency';
import { Order, Address, CardDetails } from '@/types';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(user?.address);
  const [selectedCard, setSelectedCard] = useState<CardDetails | undefined>(
    user?.cardDetails?.find((card) => card.isDefault) || user?.cardDetails?.[0]
  );
  
  // Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Address edit form state
  const [editAddress, setEditAddress] = useState<Address>({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
  });
  
  // New card form state
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });
  
  const DELIVERY_FEE = 50; // R50 delivery fee

  // Show toast when user is not logged in
  useEffect(() => {
    if (!user) {
      showToast('Please login to checkout', 'warning', 3000);
    } else {
      setSelectedAddress(user.address);
      setSelectedCard(user?.cardDetails?.find((card) => card.isDefault) || user?.cardDetails?.[0]);
    }
  }, [user]);
  
  // Initialize edit address when modal opens
  useEffect(() => {
    if (showAddressModal && selectedAddress) {
      setEditAddress(selectedAddress);
    }
  }, [showAddressModal, selectedAddress]);
  
  // Reset new card form when modal opens
  useEffect(() => {
    if (showAddCardModal) {
      setNewCard({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false,
      });
    }
  }, [showAddCardModal]);

  const handleSaveAddress = async () => {
    if (!user) return;
    
    // Validate address fields
    if (!editAddress.street || !editAddress.city || !editAddress.province || !editAddress.postalCode) {
      showToast('Please fill in all address fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await updateAddress(user.uid, editAddress);
      await refreshUser();
      setSelectedAddress(editAddress);
      setShowAddressModal(false);
      showToast('Address updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update address', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectCard = (card: CardDetails) => {
    setSelectedCard(card);
    setShowCardModal(false);
  };
  
  const handleAddCard = async () => {
    if (!user) return;
    
    // Validate card fields
    if (!newCard.cardNumber || !newCard.cardHolderName || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      showToast('Please fill in all card details', 'error');
      return;
    }
    
    // Validate card number (13-19 digits)
    if (!/^[0-9]{13,19}$/.test(newCard.cardNumber)) {
      showToast('Invalid card number', 'error');
      return;
    }
    
    // Validate expiry month (01-12)
    if (!/^(0[1-9]|1[0-2])$/.test(newCard.expiryMonth)) {
      showToast('Invalid expiry month (use 01-12)', 'error');
      return;
    }
    
    // Validate expiry year (20XX format)
    if (!/^20[2-9][0-9]$/.test(newCard.expiryYear)) {
      showToast('Invalid expiry year', 'error');
      return;
    }
    
    // Validate CVV (3-4 digits)
    if (!/^[0-9]{3,4}$/.test(newCard.cvv)) {
      showToast('Invalid CVV', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Add card to user profile
      await addCardDetails(user.uid, {
        cardNumber: newCard.cardNumber.slice(-4), // Store only last 4 digits
        cardHolderName: newCard.cardHolderName,
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        isDefault: newCard.isDefault,
      });
      
      await refreshUser();
      
      // Select the newly added card
      const updatedUser = await refreshUser();
      if (updatedUser?.cardDetails) {
        const addedCard = updatedUser.cardDetails[updatedUser.cardDetails.length - 1];
        setSelectedCard(addedCard);
      }
      
      setShowAddCardModal(false);
      showToast('Card added successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || !selectedCard) {
      showToast('Please complete all required information', 'error');
      return;
    }

    try {
      setLoading(true);

      const orderTotal = cart.total + DELIVERY_FEE;

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        userDetails: {
          name: user.name,
          surname: user.surname,
          phone: user.phone,
          email: user.email,
        },
        items: cart.items,
        total: orderTotal,
        deliveryAddress: selectedAddress,
        paymentMethod: selectedCard,
        status: 'pending',
      };

      const orderId = await createOrder(orderData);

      // Show success toast
      showToast(`Order #${orderId.slice(0, 8)} placed successfully! 🎉`, 'success', 4000);
      
      // Clear cart and navigate after a short delay to show the toast
      setTimeout(() => {
        clearCart();
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      showToast(error.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#CBD5E0" />
          <Text style={styles.notLoggedInTitle}>Login Required</Text>
          <Text style={styles.notLoggedInText}>
            You need to be logged in to proceed with checkout
          </Text>
          <Button
            title="Login"
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={() => setShowAddressModal(true)}>
            <Ionicons name="create-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        {selectedAddress ? (
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
        ) : (
          <TouchableOpacity 
            style={styles.emptyState}
            onPress={() => setShowAddressModal(true)}
          >
            <Text style={styles.emptyStateText}>Add delivery address</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Payment Method */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <TouchableOpacity onPress={() => setShowCardModal(true)}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
        {selectedCard ? (
          <View style={styles.cardContent}>
            <Ionicons name="card-outline" size={24} color="#718096" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardText}>•••• {selectedCard.cardNumber}</Text>
              <Text style={styles.cardSubtext}>
                {selectedCard.cardHolderName}
              </Text>
              <Text style={styles.cardExpiry}>
                Exp: {selectedCard.expiryMonth}/{selectedCard.expiryYear}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.emptyState}
            onPress={() => setShowCardModal(true)}
          >
            <Text style={styles.emptyStateText}>Select payment method</Text>
          </TouchableOpacity>
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
          <Text style={styles.summaryValue}>{formatCurrency(DELIVERY_FEE)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(cart.total + DELIVERY_FEE)}</Text>
        </View>
      </Card>

      <Button
        title="Place Order"
        onPress={handlePlaceOrder}
        loading={loading}
        style={styles.placeOrderButton}
      />

      {/* Address Edit Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Input
                label="Street Address"
                placeholder="Enter street address"
                value={editAddress.street}
                onChangeText={(text) => setEditAddress({ ...editAddress, street: text })}
                icon="home-outline"
              />
              <Input
                label="City"
                placeholder="Enter city"
                value={editAddress.city}
                onChangeText={(text) => setEditAddress({ ...editAddress, city: text })}
                icon="business-outline"
              />
              <Input
                label="Province"
                placeholder="Enter province"
                value={editAddress.province}
                onChangeText={(text) => setEditAddress({ ...editAddress, province: text })}
                icon="map-outline"
              />
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                value={editAddress.postalCode}
                onChangeText={(text) => setEditAddress({ ...editAddress, postalCode: text })}
                icon="mail-outline"
              />
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowAddressModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Save Address"
                onPress={handleSaveAddress}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Card Selection Modal */}
      <Modal
        visible={showCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowCardModal(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {user?.cardDetails && user.cardDetails.length > 0 ? (
                <>
                  {user.cardDetails.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.cardOption,
                        selectedCard?.id === card.id && styles.cardOptionSelected,
                      ]}
                      onPress={() => handleSelectCard(card)}
                    >
                      <View style={styles.cardOptionContent}>
                        <Ionicons 
                          name={selectedCard?.id === card.id ? "radio-button-on" : "radio-button-off"} 
                          size={24} 
                          color={selectedCard?.id === card.id ? "#FF6B35" : "#CBD5E0"} 
                        />
                        <View style={styles.cardOptionInfo}>
                          <Text style={styles.cardOptionText}>•••• {card.cardNumber}</Text>
                          <Text style={styles.cardOptionSubtext}>
                            {card.cardHolderName}
                          </Text>
                          <Text style={styles.cardOptionExpiry}>
                            Exp: {card.expiryMonth}/{card.expiryYear}
                          </Text>
                        </View>
                        {card.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Add New Card Button */}
                  <TouchableOpacity
                    style={styles.addCardButton}
                    onPress={() => {
                      setShowCardModal(false);
                      setShowAddCardModal(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
                    <Text style={styles.addCardButtonText}>Add New Card</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.noCardsContainer}>
                  <Ionicons name="card-outline" size={60} color="#CBD5E0" />
                  <Text style={styles.noCardsText}>No payment methods available</Text>
                  <Text style={styles.noCardsSubtext}>
                    Add a payment method below
                  </Text>
                  <Button
                    title="Add New Card"
                    onPress={() => {
                      setShowCardModal(false);
                      setShowAddCardModal(true);
                    }}
                    style={styles.addCardButtonInline}
                  />
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setShowCardModal(false)}
                style={styles.modalButtonFull}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({ ...newCard, cardNumber: text.replace(/\s/g, '') })}
                keyboardType="numeric"
                maxLength={19}
                icon="card-outline"
              />
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={newCard.cardHolderName}
                onChangeText={(text) => setNewCard({ ...newCard, cardHolderName: text })}
                icon="person-outline"
              />
              <View style={styles.rowInputs}>
                <Input
                  label="Expiry Month"
                  placeholder="MM"
                  value={newCard.expiryMonth}
                  onChangeText={(text) => setNewCard({ ...newCard, expiryMonth: text })}
                  keyboardType="numeric"
                  maxLength={2}
                  containerStyle={styles.halfInput}
                  icon="calendar-outline"
                />
                <Input
                  label="Expiry Year"
                  placeholder="YYYY"
                  value={newCard.expiryYear}
                  onChangeText={(text) => setNewCard({ ...newCard, expiryYear: text })}
                  keyboardType="numeric"
                  maxLength={4}
                  containerStyle={styles.halfInput}
                  icon="calendar-outline"
                />
              </View>
              <Input
                label="CVV"
                placeholder="123"
                value={newCard.cvv}
                onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                icon="lock-closed-outline"
              />
              
              <TouchableOpacity
                style={styles.defaultCheckbox}
                onPress={() => setNewCard({ ...newCard, isDefault: !newCard.isDefault })}
              >
                <Ionicons
                  name={newCard.isDefault ? "checkbox" : "square-outline"}
                  size={24}
                  color={newCard.isDefault ? "#FF6B35" : "#CBD5E0"}
                />
                <Text style={styles.defaultCheckboxText}>Set as default card</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowAddCardModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Card"
                onPress={handleAddCard}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 24,
    marginBottom: 12,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
  },
  registerLink: {
    paddingVertical: 8,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#718096',
  },
  registerLinkBold: {
    fontWeight: '600',
    color: '#FF6B35',
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
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  cardExpiry: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  modalButtonFull: {
    flex: 1,
  },
  cardOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cardOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F3',
  },
  cardOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  cardOptionSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  cardOptionExpiry: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noCardsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCardsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
  },
  noCardsSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    backgroundColor: '#FFF5F3',
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  addCardButtonInline: {
    marginTop: 16,
    width: '100%',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  defaultCheckboxText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },
});
