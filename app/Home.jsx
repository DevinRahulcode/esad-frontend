import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://10.0.2.2:8080/leave"; // Replace with your backend URL

// Reusable Card component
const Card = ({ title, icon, onPress, gradient = false }) => (
  <Pressable
    style={({ pressed }) => [
      styles.card,
      gradient && styles.cardGradient,
      pressed && styles.cardPressed,
    ]}
    onPress={onPress}
  >
    <View style={styles.cardIconContainer}>{icon}</View>
    <Text style={styles.cardText}>{title}</Text>
    <View style={styles.cardArrow}>
      <MaterialCommunityIcons name="arrow-right" size={16} color="#94A3B8" />
    </View>
  </Pressable>
);

export default function Home() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const router = useRouter();

  const fetchLeaveCounts = async () => {
    try {
      const id = await AsyncStorage.getItem("@employee_id");
      if (!id) return;

      const response = await axios.get(`${API_URL}/employee/${id}/counts`);
      setApprovedCount(response.data.approved || 0);
      setRejectedCount(response.data.rejected || 0);
    } catch (error) {
      console.error("Error fetching leave counts:", error);
    }
  };

  useEffect(() => {
    fetchLeaveCounts();
  }, []);

  // Logout function
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Do you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/Login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.headerText}>Employee Dashboard</Text>
            </View>
            <Pressable style={styles.profileIcon} onPress={handleLogout}>
              <MaterialCommunityIcons name="account-circle" size={40} color="#3B82F6" />
            </Pressable>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{approvedCount}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
    
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{rejectedCount}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardContainer}>
            <Link href="/Leave" asChild>
              <Card
                title="Apply Leave"
                icon={<MaterialCommunityIcons name="calendar-edit" size={32} color="#3B82F6" />}
                gradient={true}
              />
            </Link>
            <Link href="/Attendance" asChild>
              <Card
                title="Mark Attendance"
                icon={<MaterialIcons name="fingerprint" size={32} color="#10B981" />}
              />
            </Link>
            <Link href="/Payslip" asChild>
              <Card
                title="View Payslip"
                icon={<MaterialCommunityIcons name="file-document-outline" size={32} color="#8B5CF6" />}
              />
            </Link>
            <Link href="/Profile" asChild>
              <Card
                title="My Profile"
                icon={<MaterialCommunityIcons name="account-edit" size={32} color="#F59E0B" />}
              />
            </Link>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Attendance Marked</Text>
                <Text style={styles.activityTime}>Today, 9:00 AM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons name="calendar-check" size={16} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Leave Approved</Text>
                <Text style={styles.activityTime}>Yesterday, 2:30 PM</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons name="file-check" size={16} color="#8B5CF6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payslip Generated</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// COLORS and STYLES remain the same
const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  welcomeSection: { flex: 1 },
  welcomeText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  headerText: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  profileIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${COLORS.primary}20`, alignItems: 'center', justifyContent: 'center' },
  statsContainer: { flexDirection: 'row', backgroundColor: `${COLORS.surface}E6`, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: `${COLORS.border}60`, marginHorizontal: 16 },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16, letterSpacing: -0.3 },
  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: `${COLORS.surface}F0`, borderRadius: 20, padding: 20, width: '48%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6, position: 'relative' },
  cardGradient: { backgroundColor: `${COLORS.primary}15` },
  cardPressed: { transform: [{ scale: 0.97 }], shadowOpacity: 0.05 },
  cardIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${COLORS.backgroundSecondary}80`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  cardArrow: { position: 'absolute', top: 16, right: 16, opacity: 0.6 },
  activityContainer: { backgroundColor: `${COLORS.surface}F0`, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${COLORS.border}30` },
  activityIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${COLORS.backgroundSecondary}80`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 2 },
  activityTime: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
});
