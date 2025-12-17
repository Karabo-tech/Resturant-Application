import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onEdit,
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.foodItem.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.foodItem.name}
          </Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={20} color="#E53E3E" />
          </TouchableOpacity>
        </View>

        {/* Display customizations */}
        {item.selectedSides.length > 0 && (
          <Text style={styles.customization}>
            Sides: {item.selectedSides.join(', ')}
          </Text>
        )}
        {item.selectedDrink && (
          <Text style={styles.customization}>Drink: {item.selectedDrink}</Text>
        )}
        {item.selectedExtras.length > 0 && (
          <Text style={styles.customization}>
            Extras: {item.selectedExtras.join(', ')}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            >
              <Ionicons name="remove" size={18} color="#FF6B35" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Ionicons name="add" size={18} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(item.subtotal)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit Options</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  customization: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  editButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
