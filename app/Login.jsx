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
} from 'react-native';
import { useRouter } from 'expo-router';

// --- Import Firebase Auth ---
import { auth } from '../firebaseConfig'; // Make sure the path is correct
import { signInWithEmailAndPassword } from 'firebase/auth';

// --- NEW: Import Axios and AsyncStorage ---
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- NEW: Define your Spring Boot API URL ---
const API_URL = Platform.OS === 'ios' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');

  // --- Validation (No changes) ---
  const isEmailValid = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  const errors = useMemo(() => {
    return {
      email:
        email.trim().length === 0
          ? 'Email is required'
          : !isEmailValid(email)
          ? 'Enter a valid email address'
          : '',
      password:
        password.trim().length === 0
          ? 'Password is required'
          : password.length < 6
          ? 'Password must be at least 6 characters'
          : '',
    };
  }, [email, password]);

  const hasErrors = Object.values(errors).some((e) => e);

  // --- Updated handleSubmit with 3-step logic ---
  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    setFirebaseError(''); // Reset previous errors

    if (hasErrors) return;

    setLoading(true);

    try {
      // ---------------------------------------------
      // 🚀 STEP 1: Authenticate with Firebase
      // ---------------------------------------------
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Get the email from the successful login
      const loggedInEmail = userCredential.user.email;
      
      // ---------------------------------------------
      // 🚀 STEP 2: Fetch Employee Data from MySQL (via Spring Boot)
      // ---------------------------------------------
      console.log(`Firebase login successful. Fetching data for: ${loggedInEmail}`);
      
      // Call your new endpoint
      const response = await axios.get(`${API_URL}/api/employees/by-email`, {
        params: { email: loggedInEmail }
      });

      // Get the full employee object from your MySQL database
      const employeeData = response.data;
      console.log(`Found MySQL employee: ${employeeData.name} (ID: ${employeeData.id})`);
      
      // ---------------------------------------------
      // 🚀 STEP 3: Save the MySQL ID AND NAME
      // ---------------------------------------------
      
      await AsyncStorage.setItem('@employee_id', employeeData.id.toString());
      
      // --- THIS IS THE UPDATED/ADDED LINE ---
      await AsyncStorage.setItem('@employee_name', employeeData.name);

      // Navigate to Home on complete success
      router.replace('/Home');

    } catch (err) {
      console.error('Login Error:', err);
      
      if (err.isAxiosError) {
        // This is an error from your Spring Boot server
        console.error("Axios Error:", err.response?.data); // Use ?.data for safety
        setFirebaseError('Failed to find your employee record in our system.');
      } else if (err.code === 'auth/invalid-credential') {
        // This is a Firebase error
        setFirebaseError('Invalid email or password. Please try again.');
      } else {
        setFirebaseError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const markTouched = (key) =>
    setTouched((t) => ({ ...t, [key]: true }));

  // --- JSX (No Changes) ---
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Modern Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🔐</Text>
            </View>
            <Text style={styles.appTitle}>Welcome Back</Text>
            <Text style={styles.appSubtitle}>Sign in to continue</Text>
          </View>
        </View>

        {/* Modern Form Card */}
        <View style={styles.formCard}>
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Email" required />
            <View style={[
              styles.inputContainer,
              touched.email && errors.email ? styles.inputContainerError : null,
            ]}>
              <Text style={styles.inputIcon}>📧</Text>
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
                editable={!loading}
              />
            </View>
            <FieldError show={touched.email} message={errors.email} />
          </View>

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <FieldLabel label="Password" required />
            <View style={[
              styles.inputContainer,
              touched.password && errors.password ? styles.inputContainerError : null,
            ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                onBlur={() => markTouched('password')}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                secureTextEntry
                style={styles.textInput}
                editable={!loading}
              />
            </View>
            <FieldError show={touched.password} message={errors.password} />
          </View>

          {/* Firebase Error Display */}
          {firebaseError ? (
            <View style={styles.firebaseErrorContainer}>
              <Text style={styles.firebaseError}>⚠️ {firebaseError}</Text>
            </View>
          ) : null}

          {/* Modern Submit Button */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !loading && styles.submitButtonPressed,
              (hasErrors || loading) && styles.submitButtonDisabled,
            ]}
            disabled={hasErrors || loading}
          >
            <View style={styles.submitContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.spinner} />
                  <Text style={styles.submitText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Sign In</Text>
              )}
            </View>
          </Pressable>

          {/* Register Link */}
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.registerLinkContainer,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account?{' '}
              <Text style={styles.registerLinkAccent}>Register</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Helper Components (No Changes) ---
function FieldLabel({ label, required }) {
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>
        {label} {required && <Text style={styles.requiredText}>*</Text>}
      </Text>
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

// --- Styles (No Changes) ---
const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#8B5CF6',
  accent: '#10B981',
  
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#334155',
  surfaceLight: '#475569',
  
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textPlaceholder: '#64748B',
  
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  border: '#374151',
  borderLight: '#4B5563',
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 20,
    paddingTop: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },

  // Header Section
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
  },

  logoIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 2,
    borderColor: `${COLORS.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  logoEmoji: {
    fontSize: 32,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  appSubtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Form Card
  formCard: {
    backgroundColor: `${COLORS.surface}F0`,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },

  // Field Styles
  fieldContainer: {
    marginBottom: 20,
  },

  labelContainer: {
    marginBottom: 8,
  },

  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  requiredText: {
    color: COLORS.error,
    fontWeight: '700',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.backgroundSecondary}E6`,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${COLORS.border}60`,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
  },

  inputContainerError: {
    borderColor: COLORS.error,
    shadowOpacity: 0.3,
    shadowColor: COLORS.error,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 12,
    opacity: 0.7,
  },

  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
    paddingHorizontal: 0,
  },

  // Submit Button
  submitButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },

  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0.1,
  },

  submitContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },

  // Register Link
  registerLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },

  registerLinkText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  registerLinkAccent: {
    color: COLORS.secondary,
    fontWeight: '700',
  },

  // Firebase Error
  firebaseErrorContainer: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: `${COLORS.error}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
  },

  firebaseError: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Error Display
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },

  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },

  footerSpace: {
    height: 20,
  },
});