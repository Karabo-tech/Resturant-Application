import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FoodCategory } from '@/types';

interface CategoryTabProps {
  category: FoodCategory;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({
  category,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});
