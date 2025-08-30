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
// --- CHANGE 1: Import useRouter for navigation ---
import { useRouter } from 'expo-router';
// --- CHANGE 2: Import Firebase auth ---
import { auth } from '../firebaseConfig'; // Make sure the path is correct
import { signInWithEmailAndPassword } from 'firebase/auth';


export default function Login() {
  // --- CHANGE 3: Use the useRouter hook ---
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});

  // --- CHANGE 4: Add state for loading and Firebase errors ---
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');


  // --- Validation (No changes needed here) ---
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

  // --- CHANGE 5: Update handleSubmit with Firebase logic ---
  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    setFirebaseError(''); // Reset previous errors

    if (hasErrors) return;

    setLoading(true);
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigate to Home on success, replacing the login screen in the stack
      router.replace('/Home');

    } catch (err) {
      console.error('Firebase Login Error:', err.code);
      // Provide user-friendly error messages
      if (err.code === 'auth/invalid-credential') {
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card (No changes needed) */}
        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Login</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Please enter your details to continue
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Email (No changes needed) */}
          <FieldLabel label="Email" required />
          <TextInput
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
            placeholder="name@example.com"
            placeholderTextColor="#8AA6B1"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              touched.email && errors.email ? styles.inputError : null,
            ]}
          />
          <FieldError show={touched.email} message={errors.email} />

          {/* Password (No changes needed) */}
          <FieldLabel label="Password" required />
          <TextInput
            value={password}
            onChangeText={setPassword}
            onBlur={() => markTouched('password')}
            placeholder="Enter your password"
            placeholderTextColor="#8AA6B1"
            secureTextEntry
            style={[
              styles.input,
              touched.password && errors.password ? styles.inputError : null,
            ]}
          />
          <FieldError show={touched.password} message={errors.password} />

          {/* --- CHANGE 6: Display Firebase error message --- */}
          {firebaseError ? <Text style={styles.firebaseError}>{firebaseError}</Text> : null}

          {/* --- CHANGE 7: Update Submit button state --- */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.submitBtnPressed,
              (hasErrors || loading) ? styles.submitBtnDisabled : null,
            ]}
            disabled={hasErrors || loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Logging In...' : 'Log In'}
            </Text>
          </Pressable>

          {/* --- CHANGE 8: Update Register link navigation --- */}
          <Pressable
            onPress={() => router.push('/')} // Navigates to index route
            style={({ pressed }) => [
              styles.loginLink,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.loginText}>
              Don’t have an account?{' '}
              <Text style={styles.loginTextAccent}>Register</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper Components (No changes needed)
function FieldLabel({ label, required }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.req}>*</Text>}
      </Text>
    </View>
  );
}

function FieldError({ show, message }) {
  if (!show || !message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

// --- CHANGE 9: Add style for Firebase error ---
const COLORS = {
  bg: '#0F2027',
  bg2: '#203A43',
  accent: '#2BC0E4',
  accent2: '#29C184',
  text: '#E8F1F2',
  textMuted: '#A7C4CB',
  surface: '#12252D',
  surfaceSoft: '#17333D',
  error: '#FF6B6B',
  outline: '#2A4B55',
};

const styles = StyleSheet.create({
  //... (all your existing styles)
  firebaseError: {
    marginTop: 10,
    marginBottom: 6,
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    padding: 20,
    paddingTop: 28,
  },
  headerCard: {
    backgroundColor: COLORS.bg2,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.outline,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  labelRow: {
    marginTop: 12,
    marginBottom: 6,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  req: { color: COLORS.accent2 },
  input: {
    backgroundColor: COLORS.surfaceSoft,
    color: COLORS.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.outline,
    fontSize: 15,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: 6,
    color: COLORS.error,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: '#58D5E9',
    shadowColor: '#1EB6D8',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  submitBtnPressed: {
    transform: [{ scale: 0.99 }],
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#041E22',
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  loginLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  loginTextAccent: {
    color: COLORS.accent2,
    fontWeight: '700',
  },
  footerSpace: { height: 24 },
});