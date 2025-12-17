import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  getAllFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from '@/services/food.service';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency } from '@/utils/currency';
import { FoodItem, FoodCategory } from '@/types';

export default function ManageItemsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FoodCategory | 'All'>('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Burgers' as FoodCategory,
    available: true,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getAllFoodItems();
      setItems(allItems);
    } catch (error: any) {
      showToast(error.message || 'Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Burgers',
      available: true,
    });
    setModalVisible(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      available: item.available,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    try {
      setLoading(true);
      const itemData = {
        name: formData.name,
        description: formData.description,
        price,
        image: formData.image || 'https://via.placeholder.com/300',
        category: formData.category,
        available: formData.available,
        sideOptions: [],
        drinkOptions: [],
        extras: [],
        ingredients: [],
      };

      if (editingItem) {
        await updateFoodItem(editingItem.id, itemData);
        showToast('Item updated successfully', 'success');
      } else {
        await createFoodItem(itemData);
        showToast('Item created successfully', 'success');
      }

      setModalVisible(false);
      await loadItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to save item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      await deleteFoodItem(itemToDelete.id);
      showToast('Item deleted successfully', 'success');
      setDeleteConfirmVisible(false);
      setItemToDelete(null);
      await loadItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item: FoodItem) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const toggleAvailability = async (item: FoodItem) => {
    try {
      await updateFoodItem(item.id, { available: !item.available });
      showToast(
        `Item ${!item.available ? 'enabled' : 'disabled'} successfully`,
        'success'
      );
      await loadItems();
    } catch (error: any) {
      showToast(error.message || 'Failed to update availability', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Array<FoodCategory | 'All'> = [
    'All',
    'Burgers',
    'Mains',
    'Starters',
    'Desserts',
    'Beverages',
    'Alcohols',
  ];

  if (loading) {
    return <Loading fullScreen message="Loading items..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Food Items</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              filterCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setFilterCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                filterCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {filteredItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No items found</Text>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleAvailability(item)}
                  >
                    <Ionicons
                      name={item.available ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={item.available ? '#48BB78' : '#E53E3E'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                  >
                    <Ionicons name="create-outline" size={24} color="#4299E1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => confirmDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#E53E3E" />
                  </TouchableOpacity>
                </View>
              </View>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#2D3748" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Name *"
                placeholder="Enter item name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Input
                label="Description"
                placeholder="Enter description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <Input
                label="Price *"
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />

              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChangeText={(text) => setFormData({ ...formData, image: text })}
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {(['Burgers', 'Mains', 'Starters', 'Desserts', 'Beverages', 'Alcohols'] as FoodCategory[]).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categorySelectorChip,
                        formData.category === cat && styles.categorySelectorChipActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categorySelectorText,
                          formData.category === cat && styles.categorySelectorTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.availabilityToggle}
                onPress={() => setFormData({ ...formData, available: !formData.available })}
              >
                <Text style={styles.availabilityLabel}>Available</Text>
                <Ionicons
                  name={formData.available ? 'checkbox' : 'square-outline'}
                  size={28}
                  color={formData.available ? '#FF6B35' : '#CBD5E0'}
                />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={editingItem ? 'Update' : 'Create'}
                onPress={handleSave}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="#E53E3E"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setItemToDelete(null);
        }}
      />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
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
  itemCard: {
    marginBottom: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  itemDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categorySelectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  categorySelectorChipActive: {
    backgroundColor: '#FF6B35',
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  categorySelectorTextActive: {
    color: '#FFFFFF',
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginTop: 8,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    flex: 1,
  },
});
