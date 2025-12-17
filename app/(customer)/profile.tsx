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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { 
  updateAddress, 
  addCardDetails, 
  deleteCardDetails, 
  setDefaultCard 
} from '@/services/auth.service';
import { Address, CardDetails } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showCardManagementModal, setShowCardManagementModal] = useState(false);

  // Edit profile form
  const [editProfile, setEditProfile] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });

  // Edit address form
  const [editAddress, setEditAddress] = useState<Address>({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
  });

  // New card form
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });

  // Initialize forms when modals open
  useEffect(() => {
    if (showEditProfileModal && user) {
      setEditProfile({
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [showEditProfileModal, user]);

  useEffect(() => {
    if (showEditAddressModal && user?.address) {
      setEditAddress(user.address);
    }
  }, [showEditAddressModal, user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!editProfile.name || !editProfile.surname || !editProfile.email || !editProfile.phone) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editProfile.email)) {
      showToast('Invalid email address', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name: editProfile.name,
        surname: editProfile.surname,
        email: editProfile.email,
        phone: editProfile.phone,
      });
      await refreshUser();
      setShowEditProfileModal(false);
      showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    if (!editAddress.street || !editAddress.city || !editAddress.province || !editAddress.postalCode) {
      showToast('Please fill in all address fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateAddress(user.uid, editAddress);
      await refreshUser();
      setShowEditAddressModal(false);
      showToast('Address updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!user) return;

    if (!newCard.cardNumber || !newCard.cardHolderName || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      showToast('Please fill in all card details', 'error');
      return;
    }

    if (!/^[0-9]{13,19}$/.test(newCard.cardNumber)) {
      showToast('Invalid card number', 'error');
      return;
    }

    if (!/^(0[1-9]|1[0-2])$/.test(newCard.expiryMonth)) {
      showToast('Invalid expiry month (use 01-12)', 'error');
      return;
    }

    if (!/^20[2-9][0-9]$/.test(newCard.expiryYear)) {
      showToast('Invalid expiry year', 'error');
      return;
    }

    if (!/^[0-9]{3,4}$/.test(newCard.cvv)) {
      showToast('Invalid CVV', 'error');
      return;
    }

    try {
      setLoading(true);
      await addCardDetails(user.uid, {
        cardNumber: newCard.cardNumber.slice(-4),
        cardHolderName: newCard.cardHolderName,
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        isDefault: newCard.isDefault,
      });
      await refreshUser();
      setShowAddCardModal(false);
      showToast('Card added successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to add card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;

    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await deleteCardDetails(user.uid, cardId);
            await refreshUser();
            showToast('Card deleted successfully', 'success');
          } catch (error: any) {
            showToast(error.message || 'Failed to delete card', 'error');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await setDefaultCard(user.uid, cardId);
      await refreshUser();
      showToast('Default card updated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to set default card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await logout();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-circle-outline" size={80} color="#CBD5E0" />
          <Text style={styles.notLoggedInText}>You are not logged in</Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0)}
            {user.surname.charAt(0)}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user.name} {user.surname}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
            <Ionicons name="create-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>{user.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <TouchableOpacity onPress={() => setShowEditAddressModal(true)}>
            <Ionicons name="create-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>
            {user.address.street}, {user.address.city}, {user.address.province},{' '}
            {user.address.postalCode}
          </Text>
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={() => setShowAddCardModal(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        {user.cardDetails && user.cardDetails.length > 0 ? (
          <>
            {user.cardDetails.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <Ionicons name="card-outline" size={20} color="#718096" />
                <View style={styles.cardItemInfo}>
                  <Text style={styles.cardText}>
                    •••• {card.cardNumber}
                  </Text>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => setShowCardManagementModal(true)}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#718096" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noCardsText}>No payment methods added</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowEditProfileModal(true)}
        >
          <Ionicons name="create-outline" size={20} color="#718096" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="time-outline" size={20} color="#718096" />
          <Text style={styles.menuText}>Order History</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
        </TouchableOpacity>
        {user.role === 'admin' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(admin)/dashboard')}
          >
            <Ionicons name="stats-chart-outline" size={20} color="#718096" />
            <Text style={styles.menuText}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        )}
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="danger"
        loading={loading}
        style={styles.logoutButton}
      />

      <View style={styles.version}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Name"
                placeholder="Enter your name"
                value={editProfile.name}
                onChangeText={(text) => setEditProfile({ ...editProfile, name: text })}
                icon="person-outline"
              />
              <Input
                label="Surname"
                placeholder="Enter your surname"
                value={editProfile.surname}
                onChangeText={(text) => setEditProfile({ ...editProfile, surname: text })}
                icon="person-outline"
              />
              <Input
                label="Email"
                placeholder="Enter your email"
                value={editProfile.email}
                onChangeText={(text) => setEditProfile({ ...editProfile, email: text })}
                keyboardType="email-address"
                icon="mail-outline"
              />
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={editProfile.phone}
                onChangeText={(text) => setEditProfile({ ...editProfile, phone: text })}
                keyboardType="phone-pad"
                icon="call-outline"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowEditProfileModal(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        visible={showEditAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Address</Text>
              <TouchableOpacity onPress={() => setShowEditAddressModal(false)}>
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
                onPress={() => setShowEditAddressModal(false)}
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

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
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

      {/* Card Management Modal */}
      <Modal
        visible={showCardManagementModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCardManagementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Cards</Text>
              <TouchableOpacity onPress={() => setShowCardManagementModal(false)}>
                <Ionicons name="close" size={24} color="#2D3748" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {user?.cardDetails?.map((card) => (
                <View key={card.id} style={styles.cardManagementItem}>
                  <View style={styles.cardManagementInfo}>
                    <Ionicons name="card-outline" size={24} color="#718096" />
                    <View style={styles.cardManagementDetails}>
                      <Text style={styles.cardManagementText}>•••• {card.cardNumber}</Text>
                      <Text style={styles.cardManagementSubtext}>{card.cardHolderName}</Text>
                      {card.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.cardManagementActions}>
                    {!card.isDefault && (
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleSetDefaultCard(card.id)}
                      >
                        <Ionicons name="star-outline" size={20} color="#FF6B35" />
                        <Text style={styles.cardActionText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.cardActionButton, styles.cardDeleteButton]}
                      onPress={() => handleDeleteCard(card.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                      <Text style={styles.cardDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setShowCardManagementModal(false)}
                style={styles.modalButtonFull}
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
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInText: {
    fontSize: 18,
    color: '#718096',
    marginTop: 16,
    marginBottom: 24,
  },
  signInButton: {
    width: 200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#718096',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 12,
    flex: 1,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  noCardsText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    marginTop: 16,
  },
  version: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
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
  defaultBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardManagementItem: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardManagementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardManagementDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardManagementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  cardManagementSubtext: {
    fontSize: 14,
    color: '#718096',
  },
  cardManagementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F3',
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 6,
  },
  cardDeleteButton: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  cardDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53E3E',
    marginLeft: 6,
  },
});
