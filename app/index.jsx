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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RegisterForm() {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(null); // 'Male' | 'Female' | 'Other'

  const [touched, setTouched] = useState({});

  // --- Validation ---
  const isEmailValid = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  // Sri Lanka NIC: old 9 digits + V/v/X/x OR new 12 digits
  const isNicValid = (v) => {
    const val = String(v).trim();
    return /^[0-9]{9}[VvXx]$/.test(val) || /^[0-9]{12}$/.test(val);
  };

  const errors = useMemo(() => {
    return {
      fullName:
        fullName.trim().length === 0
          ? 'Full name is required'
          : fullName.trim().length < 3
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
  }, [fullName, address, nic, email, gender]);

  const hasErrors = Object.values(errors).some((e) => e);

  const handleSubmit = () => {
    // Mark all as touched to reveal validation messages
    setTouched({
      fullName: true,
      address: true,
      nic: true,
      email: true,
      gender: true,
    });

    if (hasErrors) return;

    // Submit payload (demo)
    const payload = {
      fullName: fullName.trim(),
      address: address.trim(),
      nic: nic.trim(),
      email: email.trim(),
      gender,
    };

    // Replace with your API call
    Alert.alert('Success', 'Form submitted!', [{ text: 'OK' }]);
    console.log('Register payload:', payload);
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
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Register</Text>
          </View>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Please fill in your details to continue
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Full Name */}
          <FieldLabel label="Full name" required />
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => markTouched('fullName')}
            placeholder="e.g., Devin Rahul"
            placeholderTextColor="#8AA6B1"
            style={[
              styles.input,
              touched.fullName && errors.fullName ? styles.inputError : null,
            ]}
            returnKeyType="next"
          />
          <FieldError show={touched.fullName} message={errors.fullName} />

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
                    setGender(g);
                    markTouched('gender');
                  }}
                  style={({ pressed }) => [
                    styles.segmentItem,
                    selected && styles.segmentItemSelected,
                    pressed && styles.segmentItemPressed,
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

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.submitBtnPressed,
              hasErrors ? styles.submitBtnDisabled : null,
            ]}
            disabled={hasErrors}
          >
            <Text style={styles.submitText}>
              Create Account
            </Text>
          </Pressable>

          {/* --- Login link --- */}
          <Pressable
            onPress={() => {
              // navigate to your Login screen
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

        {/* Footer */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

const COLORS = {
  bg: '#0F2027',           // deep blue-green
  bg2: '#203A43',          // gradient feel (darker)
  accent: '#2BC0E4',       // bright blue
  accent2: '#29C184',      // mint green
  text: '#E8F1F2',
  textMuted: '#A7C4CB',
  surface: '#12252D',      // card background
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
