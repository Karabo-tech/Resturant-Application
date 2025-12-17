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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setLoading(true);
      await logout();
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1000);
    } catch (error: any) {
      showToast(error.message || 'Failed to logout', 'error');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>{user.phone}</Text>
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
          <TouchableOpacity>
            <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
        {user.cardDetails?.map((card) => (
          <View key={card.id} style={styles.cardItem}>
            <Ionicons name="card-outline" size={20} color="#718096" />
            <Text style={styles.cardText}>
              •••• {card.cardNumber} {card.isDefault && '(Default)'}
            </Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Account</Text>
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
      
      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmColor="#E53E3E"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
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
  cardText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 12,
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
});
