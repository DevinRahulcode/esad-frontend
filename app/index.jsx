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
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Import axios

// --- IMPORTANT: CONFIGURE YOUR BACKEND URL ---
// If you are using an Android emulator, your PC's localhost is typically 10.0.2.2
const API_BASE_URL = 'http://10.0.2.2:8080';
// If you are using a physical device, replace '10.0.2.2' with your computer's IP address.
// Make sure your device and computer are on the same Wi-Fi network.

export default function RegisterForm() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(null); // 'Male' | 'Female' | 'Other'

  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State to handle loading

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

    setIsLoading(true); // Start loading

    // The payload must match the Spring Boot Employee model
    const payload = {
      name: name.trim(),
      address: address.trim(),
      nic: nic.trim(),
      email: email.trim(),
      // Your Spring Enum likely uses uppercase names (e.g., MALE, FEMALE)
      gender: gender.toUpperCase(),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/add`, payload);
      
      // Check for a successful response (status code 200-299)
      if (response.status === 200) {
        console.log('Registration successful:', response.data);
        Alert.alert(
          'Success!',
          'Your account has been created successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        // Handle other successful but unexpected status codes
        Alert.alert('Error', `An unexpected server response: ${response.status}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'An unknown error occurred. Please try again.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server Error: ${error.response.status}. Please try again later.`;
      } else if (error.request) {
        // The request was made but no response was received (e.g., network error)
        errorMessage = 'Could not connect to the server. Please check your network and the API URL.';
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false); // Stop loading, regardless of outcome
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
        {/* Header Card (No changes) */}
        <View style={styles.headerCard}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Register</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
                Please fill in your details to continue
            </Text>
        </View>

        {/* Form Card (No changes except Submit button) */}
        <View style={styles.card}>
          {/* Full Name */}
          <FieldLabel label="Full name" required />
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => markTouched('name')}
            placeholder="e.g., Devin Rahul"
            placeholderTextColor="#8AA6B1"
            style={[
              styles.input,
              touched.name && errors.name ? styles.inputError : null,
            ]}
            returnKeyType="next"
            editable={!isLoading} // Disable input when loading
          />
          <FieldError show={touched.name} message={errors.name} />

          {/* Address */}
          <FieldLabel label="Address" required />
          <TextInput
            value={address}
            onChangeText={setAddress}
            onBlur={() => markTouched('address')}
            placeholder="Street, City, Postal Code"
            placeholderTextColor="#8AA6B1"
            style={[
              styles.input,
              styles.multiline,
              touched.address && errors.address ? styles.inputError : null,
            ]}
            multiline
            textAlignVertical="top"
            numberOfLines={3}
            editable={!isLoading}
          />
          <FieldError show={touched.address} message={errors.address} />

          {/* NIC */}
          <FieldLabel label="NIC" required hint="Old (9 digits + V/X) or new (12 digits)" />
          <TextInput
            value={nic}
            onChangeText={(v) => setNic(v.replace(/\s/g, ''))}
            onBlur={() => markTouched('nic')}
            placeholder="123456789V or 200012345678"
            placeholderTextColor="#8AA6B1"
            style={[
              styles.input,
              touched.nic && errors.nic ? styles.inputError : null,
            ]}
            autoCapitalize="characters"
            editable={!isLoading}
          />
          <FieldError show={touched.nic} message={errors.nic} />

          {/* Email */}
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
            editable={!isLoading}
          />
          <FieldError show={touched.email} message={errors.email} />

          {/* Gender */}
          <FieldLabel label="Gender" required />
          <View style={styles.segment}>
            {['Male', 'Female', 'Other'].map((g) => {
              const selected = gender === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => {
                    if (isLoading) return; // Prevent changing while loading
                    setGender(g);
                    markTouched('gender');
                  }}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    selected && styles.segmentItemSelected,
                    pressed && !isLoading && styles.segmentItemPressed,
                  ]}
                  android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selected && styles.segmentTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <FieldError show={touched.gender} message={errors.gender} />

          {/* --- UPDATED: Submit button with loading state --- */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && !isLoading && styles.submitBtnPressed,
              (hasErrors || isLoading) ? styles.submitBtnDisabled : null,
            ]}
            disabled={hasErrors || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#041E22" />
            ) : (
              <Text style={styles.submitText}>
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Login link (No changes) */}
          
          <Pressable
            onPress={() => {
              navigation.navigate('Login');
            }}
            style={({ pressed }) => [
              styles.loginLink,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextAccent}>Log in</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper Components (No changes needed here)
function FieldLabel({ label, required, hint }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.req}>*</Text>}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function FieldError({ show, message }) {
  if (!show || !message) return null;
  return <Text style={styles.error}>{message}</Text>;
}


// Styles (Unchanged)
const COLORS = {
  bg: '#0F2027',           // deep blue-green
  bg2: '#203A43',          // gradient feel (darker)
  accent: '#2BC0E4',       // bright blue
  accent2: '#29C184',      // mint green
  text: '#E8F1F2',
  textMuted: '#A7C4CB',
  surface: '#12252D',      // card background
  surfaceSoft: '#17333D',
  error: '#FF6B6B',
  outline: '#2A4B55',
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
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
  multiline: { minHeight: 92 },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: 6,
    color: COLORS.error,
    fontSize: 12,
  },
  segment: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.surfaceSoft,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentItemSelected: {
    backgroundColor: COLORS.accent2,
  },
  segmentItemPressed: {
    opacity: 0.9,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: '#07211B',
    fontWeight: '800',
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
    backgroundColor: '#a7c4cb', // A muted color for disabled state
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