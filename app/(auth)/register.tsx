import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { registerSchema } from '@/utils/validation';
import { RegisterFormData } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await register(data);
      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (error: any) {
      showToast(error.message || 'Registration failed. Please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start ordering</Text>
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Name"
                placeholder="Enter your name"
                icon="person-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="surname"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Surname"
                placeholder="Enter your surname"
                icon="person-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.surname?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="0XX XXX XXXX"
                keyboardType="phone-pad"
                icon="call-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />

          {/* Address Information */}
          <Text style={styles.sectionTitle}>Address</Text>

          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Street Address"
                placeholder="Enter your street address"
                icon="home-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.street?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="City"
                placeholder="Enter your city"
                icon="location-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.city?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="province"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Province"
                placeholder="Enter your province"
                icon="map-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.province?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="postalCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.postalCode?.message}
              />
            )}
          />

          {/* Card Details */}
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.infoText}>
            For testing, you can use fake card details from vccgenerator.org
          </Text>

          <Controller
            control={control}
            name="cardNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                icon="card-outline"
                maxLength={19}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cardNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="cardHolderName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Card Holder Name"
                placeholder="Name on card"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cardHolderName?.message}
              />
            )}
          />

          <View style={styles.row}>
            <Controller
              control={control}
              name="expiryMonth"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Month"
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                  containerStyle={styles.halfInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.expiryMonth?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="expiryYear"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Year"
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                  containerStyle={styles.halfInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.expiryYear?.message}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="cvv"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cvv?.message}
              />
            )}
          />

          {/* Password */}
          <Text style={styles.sectionTitle}>Security</Text>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                icon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                icon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  registerButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#718096',
  },
  linkText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
