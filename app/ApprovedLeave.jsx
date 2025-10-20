import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, 
  SafeAreaView, RefreshControl 
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:8080"; // Android emulator

const ApprovedLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      // 1️⃣ Get logged-in employee ID from AsyncStorage
      const id = await AsyncStorage.getItem("@employee_id");
      if (!id) {
        console.warn("No employee ID found");
        setLeaves([]);
        return;
      }
      setEmployeeId(id);

      // 2️⃣ Fetch leaves for this employee
      const response = await axios.get(`${API_URL}/leave/employee/${id}`);

      // 3️⃣ Filter only APPROVED leaves and sort by latest
      const approvedLeaves = response.data
        .filter((leave) => leave.status === "APPROVED")
        .sort((a, b) => new Date(b.leaveDate) - new Date(a.leaveDate));

      setLeaves(approvedLeaves);
    } catch (error) {
      console.error("Failed to fetch approved leaves", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days from now
  const getDaysFromNow = (dateString) => {
    const leaveDate = new Date(dateString);
    const today = new Date();
    const diffTime = leaveDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === -1) return "Yesterday";
    return `${Math.abs(diffDays)} days ago`;
  };

  // Header component
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <MaterialCommunityIcons name="calendar-check" size={32} color="#10B981" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Approved Leave</Text>
          <Text style={styles.subtitle}>
            {leaves.length} {leaves.length === 1 ? 'request' : 'requests'} approved
          </Text>
        </View>
      </View>
    </View>
  );

  // Render each approved leave item
  const renderItem = ({ item }) => (
    <View style={styles.leaveItem}>
      <View style={styles.leaveItemHeader}>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#10B981" />
          <View style={styles.dateInfo}>
            <Text style={styles.leaveDate}>{formatDate(item.leaveDate)}</Text>
            <Text style={styles.relativeDateText}>{getDaysFromNow(item.leaveDate)}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
          <Text style={styles.statusText}>APPROVED</Text>
        </View>
      </View>
      
      <View style={styles.reasonContainer}>
        <MaterialCommunityIcons name="text-box-outline" size={18} color={COLORS.textMuted} />
        <Text style={styles.leaveReason}>{item.reason}</Text>
      </View>
      
      <View style={styles.approvalInfo}>
        <MaterialCommunityIcons name="account-check" size={16} color={COLORS.textMuted} />
        <Text style={styles.approvalText}>Approved by HR Department</Text>
      </View>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading approved leaves...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-check-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Approved Leave</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any approved leave requests yet.{"\n"}
        Once your requests are approved, they'll appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          leaves.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 60,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    backgroundColor: `${COLORS.surface}F0`,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
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

  // Leave Item Styles
  leaveItem: {
    backgroundColor: `${COLORS.surface}F0`,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaveItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  leaveDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  relativeDateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leaveReason: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 22,
    flex: 1,
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}40`,
  },
  approvalText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 8,
    fontStyle: 'italic',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ApprovedLeave;