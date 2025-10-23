import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet,
  Alert, SafeAreaView, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_BASE = 'http://10.0.2.2:8080';

export default function Attendance() {
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load logged-in employee
  const loadEmployee = async () => {
    try {
      const id = await AsyncStorage.getItem('@employee_id');
      const name = await AsyncStorage.getItem('@employee_name');
      if (id && name) setEmployee({ employeeId: id, employeeName: name });
      else Alert.alert("Error", "No employee data found. Please log in again.");
    } catch (e) { console.error(e); }
  };

  // Fetch history from backend
  const fetchHistory = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance?employeeId=${encodeURIComponent(employee.employeeId)}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      // Ensure each item has a unique key for FlatList
      const sorted = data
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((item, index) => ({ ...item, key: String(item.id ?? index) }));
      setHistory(sorted);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to fetch attendance history.");
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required.");
        return null;
      }
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location: `Lat: ${location.coords.latitude.toFixed(5)}, Lon: ${location.coords.longitude.toFixed(5)}`
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Add attendance
  const addAttendance = async (type) => {
    if (!employee) return;

    const lastEvent = history[0];
    if (lastEvent && lastEvent.type === type) {
      Alert.alert("Info", `You have already ${type.toLowerCase()}.`);
      return;
    }

    const loc = await getCurrentLocation();
    if (!loc) return;

    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.employeeId,
          employeeName: employee.employeeName,
          type,
          latitude: loc.latitude,
          longitude: loc.longitude,
          location: loc.location,
          note: ''
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      Alert.alert("Success", `You have ${type.toLowerCase()}.`);
      fetchHistory();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save attendance.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  // Formatting helpers
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (ts) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  useEffect(() => { loadEmployee(); }, []);
  useEffect(() => { if (employee) fetchHistory(); }, [employee]);

  if (!employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="fingerprint" size={32} color="#3B82F6" />
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.employeeName}>{employee.employeeName}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
          <Text style={styles.currentTime}>{getCurrentTime()}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => addAttendance('CHECKIN')} style={[styles.button, styles.checkInButton]}>
          <MaterialCommunityIcons name="login" size={24} color="#fff" />
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => addAttendance('CHECKOUT')} style={[styles.button, styles.checkOutButton]}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyHeader}>
        <MaterialCommunityIcons name="history" size={24} color="#F8FAFC" />
        <Text style={styles.historyTitle}>Attendance History</Text>
      </View>
    </View>
  );

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceCard}>
      <View style={[styles.statusIndicator, item.type === 'CHECKIN' ? styles.checkInIndicator : styles.checkOutIndicator]}>
        <MaterialCommunityIcons name={item.type === 'CHECKIN' ? 'login' : 'logout'} size={20} color="#fff" />
      </View>
      <View style={styles.attendanceContent}>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceType}>{item.type === 'CHECKIN' ? 'Check In' : 'Check Out'}</Text>
          <Text style={styles.attendanceTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.attendanceDate}>
          <MaterialCommunityIcons name="calendar" size={14} color="#94A3B8" />
          <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
        </View>
        {item.location && <Text style={styles.attendanceLocation}>{item.location}</Text>}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="clock-outline" size={64} color="#94A3B8" />
      <Text style={styles.emptyTitle}>No Attendance Records</Text>
      <Text style={styles.emptySubtitle}>Your history will appear here. Check in to start.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={history}
        renderItem={renderAttendanceItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[styles.listContent, history.length === 0 && !loading && styles.emptyListContent]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Colors
const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#334155',
  surfaceLight: '#475569',
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  border: '#374151',
  borderLight: '#4B5563',
};

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textMuted, marginTop: 16, fontSize: 16, fontWeight: '500' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: `${COLORS.background}80`, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 60 },
  emptyListContent: { flexGrow: 1 },

  header: { backgroundColor: `${COLORS.surface}F0`, marginHorizontal: 20, marginTop: 20, padding: 24, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: `${COLORS.borderLight}40`, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerText: { marginLeft: 16, flex: 1 },
  welcomeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  employeeName: { color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${COLORS.backgroundSecondary}80`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  currentTime: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 6 },

  buttonContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 32, gap: 16 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  checkInButton: { backgroundColor: COLORS.success },
  checkOutButton: { backgroundColor: COLORS.warning },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8, letterSpacing: 0.3 },

  historyHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: `${COLORS.border}40` },
  historyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 12, letterSpacing: -0.3 },

  attendanceCard: { backgroundColor: `${COLORS.surface}F0`, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: `${COLORS.borderLight}40`, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statusIndicator: { width: 60, justifyContent: 'center', alignItems: 'center' },
  checkInIndicator: { backgroundColor: COLORS.success },
  checkOutIndicator: { backgroundColor: COLORS.warning },
  attendanceContent: { flex: 1, padding: 16, justifyContent: 'space-between' },
  attendanceInfo: { marginBottom: 8 },
  attendanceType: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  attendanceTime: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  attendanceDate: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 6, fontWeight: '500' },
  attendanceLocation: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textSecondary, marginTop: 20, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
