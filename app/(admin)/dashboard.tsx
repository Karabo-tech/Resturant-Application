import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOrders } from '@/services/order.service';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { formatCurrency } from '@/utils/currency';
import { Order } from '@/types';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;

    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#2D3748" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="receipt-outline" size={32} color="#FF6B35" />
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="cash-outline" size={32} color="#48BB78" />
          <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color="#ED8936" />
          <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color="#4299E1" />
          <Text style={styles.statValue}>{stats.completedOrders}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push('/(admin)/manage-items')}
        >
          <Ionicons name="restaurant-outline" size={24} color="#FF6B35" />
          <Text style={styles.actionText}>Manage Food Items</Text>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push('/(admin)/manage-orders')}
        >
          <Ionicons name="list-outline" size={24} color="#FF6B35" />
          <Text style={styles.actionText}>Manage Orders</Text>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="bar-chart-outline" size={24} color="#FF6B35" />
          <Text style={styles.actionText}>View Analytics</Text>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E0" />
        </TouchableOpacity>
      </Card>

      {/* Recent Orders */}
      <Card>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {orders.slice(0, 5).map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
              <Text style={styles.orderCustomer}>
                {order.userDetails.name} {order.userDetails.surname}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderAmount}>{formatCurrency(order.total)}</Text>
              <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  status_pending: {
    backgroundColor: '#ED8936',
  },
  status_confirmed: {
    backgroundColor: '#4299E1',
  },
  status_preparing: {
    backgroundColor: '#9F7AEA',
  },
  status_ready: {
    backgroundColor: '#48BB78',
  },
  status_delivered: {
    backgroundColor: '#38B2AC',
  },
  status_cancelled: {
    backgroundColor: '#E53E3E',
  },
});
