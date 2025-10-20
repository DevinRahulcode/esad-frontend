import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

// --- IMPORTANT: CONFIGURE YOUR BACKEND URL ---
const API_BASE_URL = 'http://10.0.2.2:8080';

export default function RegisterForm() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(null);
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // --- Validation (No changes here) ---
  const isEmailValid = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  const isNicValid = (v) => {
    const val = String(v).trim();
    return /^[0-9]{9}[VvXx]$/.test(val) || /^[0-9]{12}$/.test(val);
  };

  const errors = useMemo(() => {
    return {
      name:
        name.trim().length === 0
          ? 'Full name is required'
          : name.trim().length < 3
          ? 'Full name looks too short'
          : '',
      address:
        address.trim().length === 0 ? 'Address is required' : '',
      nic:
        nic.trim().length === 0
          ? 'NIC is required'
          : !isNicValid(nic)
          ? 'Enter a valid NIC (e.g., 123456789V or 200012345678)'
          : '',
      email:
        email.trim().length === 0
          ? 'Email is required'
          : !isEmailValid(email)
          ? 'Enter a valid email address'
          : '',
      gender: !gender ? 'Please select a gender' : '',
    };
  }, [name, address, nic, email, gender]);

  const hasErrors = Object.values(errors).some((e) => e);

  // --- UPDATED: handleSubmit function with API call ---
  const handleSubmit = async () => {
    setTouched({
      name: true,
      address: true,
      nic: true,
      email: true,
      gender: true,
    });

    if (hasErrors) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    setIsLoading(true);

    const payload = {
      name: name.trim(),
      address: address.trim(),
      nic: nic.trim(),
      email: email.trim(),
      gender: gender.toUpperCase(),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/employees/add`, payload);

      if (response.status === 200) {
        console.log('Registration successful:', response.data);
        Alert.alert(
          'Success!',
          'Your account has been created successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', `An unexpected server response: ${response.status}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'An unknown error occurred. Please try again.';

      if (error.response) {
        errorMessage = `Server Error: ${error.response.status}. Please try again later.`;
      } else if (error.request) {
        errorMessage = 'Could not connect to the server. Please check your network and the API URL.';
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const markTouched = (key) =>
    setTouched((t) => ({ ...t, [key]: true }));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compact Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>👤</Text>
            </View>
            <Text style={styles.appTitle}>Employee Registration</Text>
          </View>
        </View>

        {/* Compact Form Card */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Full name" required />
            <View style={[
              styles.inputContainer,
              touched.name && errors.name ? styles.inputContainerError : null,
            ]}>
              <TextInput
                value={name}
                onChangeText={setName}
                onBlur={() => markTouched('name')}
                placeholder="Enter your full name"
                placeholderTextColor="#64748B"
                style={styles.textInput}
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>
            <FieldError show={touched.name} message={errors.name} />
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Address" required />
            <View style={[
              styles.inputContainer,
              styles.multilineContainer,
              touched.address && errors.address ? styles.inputContainerError : null,
            ]}>
              <TextInput
                value={address}
                onChangeText={setAddress}
                onBlur={() => markTouched('address')}
                placeholder="Street, City, Postal Code"
                placeholderTextColor="#64748B"
                style={[styles.textInput, styles.multilineInput]}
                multiline
                textAlignVertical="top"
                numberOfLines={2}
                editable={!isLoading}
              />
            </View>
            <FieldError show={touched.address} message={errors.address} />
          </View>

          {/* NIC */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="NIC" required hint="9 digits + V/X or 12 digits" />
            <View style={[
              styles.inputContainer,
              touched.nic && errors.nic ? styles.inputContainerError : null,
            ]}>
              <TextInput
                value={nic}
                onChangeText={(v) => setNic(v.replace(/\s/g, ''))}
                onBlur={() => markTouched('nic')}
                placeholder="123456789V"
                placeholderTextColor="#64748B"
                style={styles.textInput}
                autoCapitalize="characters"
                editable={!isLoading}
              />
            </View>
            <FieldError show={touched.nic} message={errors.nic} />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Email" required />
            <View style={[
              styles.inputContainer,
              touched.email && errors.email ? styles.inputContainerError : null,
            ]}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onBlur={() => markTouched('email')}
                placeholder="name@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.textInput}
                editable={!isLoading}
              />
            </View>
            <FieldError show={touched.email} message={errors.email} />
          </View>

          {/* Gender Selection */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Gender" required />
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => {
                const selected = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => {
                      if (isLoading) return;
                      setGender(g);
                      markTouched('gender');
                    }}
                    style={[
                      styles.genderOption,
                      selected && styles.genderOptionSelected,
                    ]}
                  >
                    <View style={[
                      styles.genderIndicator,
                      selected && styles.genderIndicatorSelected,
                    ]} />
                    <Text style={[
                      styles.genderText,
                      selected && styles.genderTextSelected,
                    ]}>
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <FieldError show={touched.gender} message={errors.gender} />
          </View>

          {/* Compact Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !isLoading && styles.submitButtonPressed,
              (hasErrors || isLoading) && styles.submitButtonDisabled,
            ]}
            disabled={hasErrors || isLoading}
          >
            <View style={styles.submitContent}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Create Account</Text>
              )}
            </View>
          </Pressable>

          {/* Login Link */}
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.loginLinkContainer,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkAccent}>Sign In</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper Components
function FieldLabel({ label, required, hint }) {
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>
        {label} {required && <Text style={styles.requiredText}>*</Text>}
      </Text>
      {hint && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

function FieldError({ show, message }) {
  if (!show || !message) return null;
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>⚠️ {message}</Text>
    </View>
  );
}

// Compact Color Palette & Styles
const COLORS = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  secondary: '#8B5CF6',
  
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#334155',
  
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textPlaceholder: '#64748B',
  
  error: '#EF4444',
  success: '#10B981',
  
  border: '#374151',
  borderLight: '#4B5563',
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 16,
    paddingTop: 20,
  },

  // Compact Header Section
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
  },

  logoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 2,
    borderColor: `${COLORS.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  logoEmoji: {
    fontSize: 24,
  },

  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Compact Form Card
  formCard: {
    backgroundColor: `${COLORS.surface}E6`,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}60`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  // Compact Field Styles
  fieldContainer: {
    marginBottom: 14,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  requiredText: {
    color: COLORS.error,
    fontWeight: '700',
  },

  hintText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  inputContainer: {
    backgroundColor: `${COLORS.backgroundSecondary}CC`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.border}80`,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },

  inputContainerError: {
    borderColor: COLORS.error,
  },

  textInput: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },

  multilineContainer: {
    paddingVertical: 4,
  },

  multilineInput: {
    minHeight: 50,
    textAlignVertical: 'top',
  },

  // Compact Gender Selection
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.backgroundSecondary}CC`,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.border}80`,
  },

  genderOptionSelected: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },

  genderIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    marginRight: 6,
  },

  genderIndicatorSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  genderTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Compact Submit Button
  submitButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.15,
  },

  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0.1,
  },

  submitContent: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Compact Login Link
  loginLinkContainer: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },

  loginLinkText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  loginLinkAccent: {
    color: COLORS.secondary,
    fontWeight: '700',
  },

  // Compact Error Display
  errorContainer: {
    marginTop: 4,
    paddingHorizontal: 2,
  },

  errorText: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: '500',
  },

  footerSpace: {
    height: 20,
  },
});