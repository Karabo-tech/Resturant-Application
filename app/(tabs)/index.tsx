import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodItem, FoodCategory } from '@/types';
import { getAllFoodItems } from '@/services/food.service';
import { FoodCard } from '@/components/food/FoodCard';
import { CategoryTab } from '@/components/food/CategoryTab';
import { Loading } from '@/components/common/Loading';
import { useCart } from '@/contexts/CartContext';

const categories: FoodCategory[] = [
  'Burgers',
  'Mains',
  'Starters',
  'Desserts',
  'Beverages',
  'Alcohols',
];

export default function HomeScreen() {
  const router = useRouter();
  const { getCartItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFoodItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, foodItems, searchQuery]);

  const loadFoodItems = async () => {
    try {
      const items = await getAllFoodItems();
      setFoodItems(items);
    } catch (error) {
      console.error('Error loading food items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterItems = () => {
    let items = foodItems.filter((item) => item.available);
    
    // Filter by category
    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(items);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFoodItems();
  };

  const handleItemPress = (itemId: string) => {
    router.push(`/(customer)/item-detail?itemId=${itemId}`);
  };

  if (loading) {
    return <Loading fullScreen message="Loading menu..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome!</Text>
          <Text style={styles.subtitle}>What would you like to order?</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(customer)/cart')}
        >
          <Ionicons name="cart-outline" size={28} color="#2D3748" />
          {getCartItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#A0AEC0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <CategoryTab
            category={'All' as FoodCategory}
            isActive={selectedCategory === 'All'}
            onPress={() => setSelectedCategory('All')}
          />
          {categories.map((category) => (
            <CategoryTab
              key={category}
              category={category}
              isActive={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'All Items' : selectedCategory}
        </Text>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.itemsContainer}
          renderItem={({ item }) => (
            <FoodCard item={item} onPress={() => handleItemPress(item.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color="#CBD5E0" />
              <Text style={styles.emptyStateText}>No items available</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B35"
            />
          }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#2D3748',
    outlineStyle: 'none',
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  itemsSection: {
    flex: 1,
    paddingTop: 16,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
  },
});
