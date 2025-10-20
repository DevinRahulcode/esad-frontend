import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, Platform, FlatList, SafeAreaView 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'ios' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';

const RequestLeave = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reason, setReason] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Fetch employee ID from AsyncStorage and leave history
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsPageLoading(true);
        const id = await AsyncStorage.getItem('@employee_id');
        if (id) {
          setEmployeeId(id);
          await fetchLeaveHistory(id);
        } else {
          Alert.alert("Error", "Employee ID not found. Please log in again.");
        }
      } catch (e) {
        console.error("Failed to load employee data", e);
        Alert.alert("Error", "Failed to load employee data.");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchEmployeeData();
  }, []);

  // --- Fetch leave history for employee
  const fetchLeaveHistory = async (id) => {
    if (!id) return;
    try {
      const response = await axios.get(`${API_URL}/leave/employee/${id}`);
      setLeaves(response.data.sort((a, b) => new Date(b.leaveDate) - new Date(a.leaveDate)));
    } catch (error) {
      console.error("Failed to fetch leave history", error);
      Alert.alert("Error", "Could not load your leave history.");
    }
  };

  // --- Handle date picker
  const handleDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const showDatePicker = () => setShowPicker(true);

  // --- Submit leave
  const submitLeave = async () => {
    if (!employeeId) return Alert.alert("Error", "Employee data not loaded.");
    if (!reason.trim()) return Alert.alert("Error", "Please enter a reason.");

    try {
      await axios.post(`${API_URL}/leave/request/${employeeId}`, {
        leaveDate: date.toISOString().split("T")[0],
        reason,
      });
      Alert.alert("Success", "Leave requested successfully");
      setReason(""); 
      await fetchLeaveHistory(employeeId);
    } catch (error) {
      Alert.alert("Error", "Failed to request leave. Check console.");
      if (error.response) {
        console.error("Server Error Data:", error.response.data);
        console.error("Server Error Status:", error.response.status);
      } else if (error.request) {
        console.error("Network Error:", error.request);
      } else {
        console.error("Axios Error:", error.message);
      }
    }
  };

  // --- Pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeaveHistory(employeeId);
    setIsRefreshing(false);
  };

  // --- Get status icon
  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'check-circle';
      case 'REJECTED': return 'close-circle';
      case 'PENDING': return 'clock-outline';
      default: return 'help-circle';
    }
  };

  // --- Render each leave item
  const LeaveItem = ({ item }) => (
    <View style={styles.leaveItem}>
      <View style={styles.leaveItemLeft}>
        <View style={styles.leaveDateContainer}>
          <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textMuted} />
          <Text style={styles.leaveDate}>{new Date(item.leaveDate).toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</Text>
        </View>
        <Text style={styles.leaveReason}>{item.reason}</Text>
      </View>
      <View style={[styles.statusBadge, styles[item.status.toUpperCase()]]}>
        <MaterialCommunityIcons 
          name={getStatusIcon(item.status)} 
          size={14} 
          color="#fff" 
          style={{ marginRight: 4 }}
        />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  // --- Form header
  const renderFormHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="calendar-plus" size={32} color="#3B82F6" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Request Leave</Text>
            <Text style={styles.subtitle}>Submit your leave application</Text>
          </View>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Select Date</Text>
          <TouchableOpacity style={styles.datePicker} onPress={showDatePicker}>
            <MaterialCommunityIcons name="calendar-outline" size={20} color="#3B82F6" />
            <Text style={styles.dateText}>{date.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reason for Leave</Text>
          <TextInput
            style={styles.input}
            placeholder="Please explain the reason for your leave request..."
            value={reason}
            onChangeText={setReason}
            multiline
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={submitLeave}>
          <MaterialCommunityIcons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Submit Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyHeader}>
        <MaterialCommunityIcons name="history" size={24} color={COLORS.text} />
        <Text style={styles.historyTitle}>Leave History</Text>
      </View>
    </View>
  );

  // --- Show loading spinner
  if (isPageLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  // --- Main render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={leaves}
        renderItem={LeaveItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderFormHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No leave history found</Text>
            <Text style={styles.emptySubtext}>Your leave requests will appear here</Text>
          </View>
        }
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default RequestLeave;

// --- Colors ---
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

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  list: { 
    flex: 1 
  },
  listContent: { 
    paddingBottom: 60 
  },
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: 16,
    fontSize: 16,
  },

  // Header Styles
  header: { 
    backgroundColor: `${COLORS.surface}F0`,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: { 
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: { 
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  // Form Styles
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  datePicker: { 
    backgroundColor: `${COLORS.surface}F0`,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
  },
  dateText: { 
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  input: { 
    backgroundColor: `${COLORS.surface}F0`,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
  },
  button: { 
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { 
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // History Styles
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}40`,
  },
  historyTitle: { 
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
    letterSpacing: -0.3,
  },

  // Leave Item Styles
  leaveItem: { 
    backgroundColor: `${COLORS.surface}F0`,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaveItemLeft: { 
    flex: 1 
  },
  leaveDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveDate: { 
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  leaveReason: { 
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  statusBadge: { 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: { 
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  PENDING: { 
    backgroundColor: COLORS.warning 
  },
  APPROVED: { 
    backgroundColor: COLORS.success 
  },
  REJECTED: { 
    backgroundColor: COLORS.danger 
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: { 
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
  },
});