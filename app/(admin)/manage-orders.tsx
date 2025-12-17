import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getAllOrders, updateOrderStatus } from '@/services/order.service';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import { Order, OrderStatus } from '@/types';

export default function ManageOrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');

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
    } catch (error: any) {
      showToast(error.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast('Order status updated successfully', 'success');
      setModalVisible(false);
      await loadOrders();
    } catch (error: any) {
      showToast(error.message || 'Failed to update order status', 'error');
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'All') return true;
    return order.status === filterStatus;
  });

  const statusFilters: Array<OrderStatus | 'All'> = [
    'All',
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled',
  ];

  const statusColors: Record<OrderStatus, string> = {
    pending: '#ED8936',
    confirmed: '#4299E1',
    preparing: '#9F7AEA',
    ready: '#48BB78',
    delivered: '#38B2AC',
    cancelled: '#E53E3E',
  };

  const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
    const icons: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      preparing: 'restaurant-outline',
      ready: 'checkmark-done-outline',
      delivered: 'bicycle-outline',
      cancelled: 'close-circle-outline',
    };
    return icons[status];
  };

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (loading) {
    return <Loading fullScreen message="Loading orders..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <TouchableOpacity onPress={loadOrders}>
          <Ionicons name="refresh" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusFilters.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            {status !== 'All' && (
              <View
                style={[
                  styles.filterDot,
                  { backgroundColor: statusColors[status as OrderStatus] },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {filteredOrders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No orders found</Text>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity key={order.id} onPress={() => openOrderDetail(order)}>
              <Card style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()} •{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[order.status] },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(order.status)}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.customerInfo}>
                    <Ionicons name="person-outline" size={16} color="#718096" />
                    <Text style={styles.customerName}>
                      {order.userDetails.name} {order.userDetails.surname}
                    </Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Ionicons name="call-outline" size={16} color="#718096" />
                    <Text style={styles.customerPhone}>{order.userDetails.phone}</Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.orderItems}>
                    <Ionicons name="restaurant-outline" size={16} color="#718096" />
                    <Text style={styles.orderItemsText}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={28} color="#2D3748" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Order Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Order ID:</Text>
                      <Text style={styles.infoValue}>#{selectedOrder.id.slice(0, 8)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Date:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColors[selectedOrder.status] },
                        ]}
                      >
                        <Ionicons
                          name={getStatusIcon(selectedOrder.status)}
                          size={14}
                          color="#FFFFFF"
                        />
                        <Text style={styles.statusText}>{selectedOrder.status}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Customer Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>
                        {selectedOrder.userDetails.name} {selectedOrder.userDetails.surname}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.userDetails.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.userDetails.phone}</Text>
                    </View>
                  </View>

                  {/* Delivery Address */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.deliveryAddress.street}
                    </Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.deliveryAddress.city},{' '}
                      {selectedOrder.deliveryAddress.province}{' '}
                      {selectedOrder.deliveryAddress.postalCode}
                    </Text>
                    <Text style={styles.addressText}>
                      {selectedOrder.deliveryAddress.country}
                    </Text>
                  </View>

                  {/* Order Items */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.orderItemRow}>
                        <View style={styles.orderItemInfo}>
                          <Text style={styles.orderItemName}>
                            {item.quantity}x {item.foodItem.name}
                          </Text>
                          {item.selectedSides.length > 0 && (
                            <Text style={styles.orderItemMods}>
                              Sides: {item.selectedSides.join(', ')}
                            </Text>
                          )}
                          {item.selectedDrink && (
                            <Text style={styles.orderItemMods}>
                              Drink: {item.selectedDrink}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.orderItemPrice}>
                          {formatCurrency(item.subtotal)}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(selectedOrder.total)}
                      </Text>
                    </View>
                  </View>

                  {/* Status Update Actions */}
                  {getNextStatuses(selectedOrder.status).length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Update Status</Text>
                      {getNextStatuses(selectedOrder.status).map((status) => (
                        <Button
                          key={status}
                          title={`Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                          onPress={() => handleStatusUpdate(selectedOrder.id, status)}
                          variant={status === 'cancelled' ? 'danger' : 'primary'}
                          style={styles.statusButton}
                        />
                      ))}
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#718096',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
    gap: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    color: '#718096',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  orderItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderItemsText: {
    fontSize: 14,
    color: '#718096',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#718096',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  addressText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 4,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  orderItemMods: {
    fontSize: 12,
    color: '#718096',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  statusButton: {
    marginBottom: 8,
  },
});
