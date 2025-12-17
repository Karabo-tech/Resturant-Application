import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
            <Stack.Screen name="(auth)/register" options={{ title: 'Register' }} />
            <Stack.Screen name="(customer)/item-detail" options={{ headerShown: false }} />
            <Stack.Screen name="(customer)/cart" options={{ title: 'Cart' }} />
            <Stack.Screen name="(customer)/checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="(customer)/profile" options={{ title: 'Profile' }} />
            <Stack.Screen name="(admin)/dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
