import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getAllOrders } from '@/services/order.service';
import { getAllFoodItems } from '@/services/food.service';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { formatCurrency } from '@/utils/currency';
import { Order, FoodItem, FoodCategory } from '@/types';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  categoryDistribution: {
    category: FoodCategory;
    count: number;
    revenue: number;
  }[];
  ordersPerStatus: {
    status: string;
    count: number;
  }[];
  recentTrend: {
    date: string;
    count: number;
    revenue: number;
  }[];
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.replace('/(tabs)');
      return;
    }
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [orders, foodItems] = await Promise.all([
        getAllOrders(),
        getAllFoodItems(),
      ]);

      // Filter orders by time range
      const filteredOrders = filterOrdersByTimeRange(orders, timeRange);

      // Calculate analytics
      const analyticsData = calculateAnalytics(filteredOrders, foodItems);
      setAnalytics(analyticsData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTimeRange = (
    orders: Order[],
    range: '7d' | '30d' | 'all'
  ): Order[] => {
    if (range === 'all') return orders;

    const now = new Date();
    const daysAgo = range === '7d' ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate;
    });
  };

  const calculateAnalytics = (
    orders: Order[],
    foodItems: FoodItem[]
  ): AnalyticsData => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top selling items
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemSales.get(item.foodItem.id) || {
          name: item.foodItem.name,
          quantity: 0,
          revenue: 0,
        };
        itemSales.set(item.foodItem.id, {
          name: item.foodItem.name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });
    const topSellingItems = Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate category distribution
    const categoryStats = new Map<FoodCategory, { count: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.foodItem.category;
        const existing = categoryStats.get(category) || { count: 0, revenue: 0 };
        categoryStats.set(category, {
          count: existing.count + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });
    const categoryDistribution = Array.from(categoryStats.entries()).map(
      ([category, stats]) => ({
        category,
        ...stats,
      })
    );

    // Calculate orders per status
    const statusStats = new Map<string, number>();
    orders.forEach((order) => {
      statusStats.set(order.status, (statusStats.get(order.status) || 0) + 1);
    });
    const ordersPerStatus = Array.from(statusStats.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // Calculate recent trend (last 7 days)
    const now = new Date();
    const recentTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });
      recentTrend.push({
        date: dateStr,
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
      });
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topSellingItems,
      categoryDistribution,
      ordersPerStatus,
      recentTrend,
    };
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#ED8936',
      confirmed: '#4299E1',
      preparing: '#9F7AEA',
      ready: '#48BB78',
      delivered: '#38B2AC',
      cancelled: '#E53E3E',
    };
    return colors[status] || '#718096';
  };

  const getCategoryColor = (index: number): string => {
    const colors = ['#FF6B35', '#4299E1', '#48BB78', '#9F7AEA', '#ED8936', '#38B2AC'];
    return colors[index % colors.length];
  };

  if (loading) {
    return <Loading fullScreen message="Loading analytics..." />;
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics}>
          <Ionicons name="refresh" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Time Range Filter */}
      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '7d' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('7d')}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === '7d' && styles.timeRangeTextActive,
            ]}
          >
            Last 7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '30d' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('30d')}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === '30d' && styles.timeRangeTextActive,
            ]}
          >
            Last 30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === 'all' && styles.timeRangeButtonActive]}
          onPress={() => setTimeRange('all')}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === 'all' && styles.timeRangeTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Ionicons name="receipt-outline" size={32} color="#FF6B35" />
            <Text style={styles.metricValue}>{analytics.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Ionicons name="cash-outline" size={32} color="#48BB78" />
            <Text style={styles.metricValue}>{formatCurrency(analytics.totalRevenue)}</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </Card>

          <Card style={styles.metricCard}>
            <Ionicons name="trending-up-outline" size={32} color="#4299E1" />
            <Text style={styles.metricValue}>
              {formatCurrency(analytics.averageOrderValue)}
            </Text>
            <Text style={styles.metricLabel}>Avg Order</Text>
          </Card>
        </View>

        {/* Recent Trend */}
        <Card>
          <Text style={styles.sectionTitle}>Recent Trend (Last 7 Days)</Text>
          <View style={styles.chartContainer}>
            {analytics.recentTrend.map((day, index) => {
              const maxRevenue = Math.max(...analytics.recentTrend.map((d) => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: Math.max(height, 4) }]} />
                  </View>
                  <Text style={styles.chartLabel}>{day.date}</Text>
                  <Text style={styles.chartValue}>{day.count}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          {analytics.topSellingItems.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
          ) : (
            analytics.topSellingItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View style={[styles.rankBadge, { backgroundColor: getCategoryColor(index) }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.listItemName}>{item.name}</Text>
                    <Text style={styles.listItemSubtext}>{item.quantity} sold</Text>
                  </View>
                </View>
                <Text style={styles.listItemValue}>{formatCurrency(item.revenue)}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Category Distribution */}
        <Card>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          {analytics.categoryDistribution.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
          ) : (
            analytics.categoryDistribution.map((cat, index) => {
              const maxRevenue = Math.max(...analytics.categoryDistribution.map((c) => c.revenue));
              const percentage = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0;
              return (
                <View key={cat.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                    <Text style={styles.categoryValue}>{formatCurrency(cat.revenue)}</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(index),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categorySubtext}>{cat.count} items sold</Text>
                </View>
              );
            })
          )}
        </Card>

        {/* Orders by Status */}
        <Card>
          <Text style={styles.sectionTitle}>Orders by Status</Text>
          {analytics.ordersPerStatus.length === 0 ? (
            <Text style={styles.emptyText}>No data available</Text>
          ) : (
            analytics.ordersPerStatus.map((stat) => (
              <View key={stat.status} style={styles.statusItem}>
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(stat.status) },
                    ]}
                  />
                  <Text style={styles.statusName}>
                    {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                  </Text>
                </View>
                <View style={styles.statusRight}>
                  <Text style={styles.statusCount}>{stat.count}</Text>
                  <Text style={styles.statusPercentage}>
                    {((stat.count / analytics.totalOrders) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
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
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    width: (width - 48) / 3,
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  listItemSubtext: {
    fontSize: 12,
    color: '#718096',
  },
  listItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categorySubtext: {
    fontSize: 12,
    color: '#718096',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  statusPercentage: {
    fontSize: 12,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});
