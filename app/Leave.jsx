import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const BASE_URL = "http://10.0.2.2:8080"; // Change for physical device if needed
const EMPLOYEE_ID = 1; // replace with logged-in user's ID dynamically later

const LeaveCard = ({ title, icon, href, subtitle, color, bgColor }) => {
  return (
    <Link href={href} asChild>
      <Pressable 
        style={({ pressed }) => [
          styles.leaveCard,
          { backgroundColor: bgColor },
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.leaveCardIcon, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.leaveCardTitle}>{title}</Text>
            <Text style={styles.leaveCardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
        </View>
      </Pressable>
    </Link>
  );
};

export default function Leave() {
  const [approved, setApproved] = useState(0);
  const [totalDays, setTotalDays] = useState(30);

  useEffect(() => {
    fetchLeaveCounts();
  }, []);

  const fetchLeaveCounts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/leave/employee/${EMPLOYEE_ID}/counts`);
      setApproved(response.data.approved || 0);
    } catch (error) {
      console.error("Error fetching leave counts:", error);
    }
  };

  const remainingDays = totalDays - approved;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Leave Management</Text>
              <Text style={styles.headerText}>Track Your Time Off</Text>
            </View>
            <View style={styles.profileIcon}>
              <MaterialCommunityIcons name="calendar-account" size={40} color="#3B82F6" />
            </View>
          </View>

          {/* Leave Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{remainingDays}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Leave Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Leave Actions</Text>
          <View style={styles.leaveCardsContainer}>
            <LeaveCard
              title="Request Leave"
              subtitle="Submit a new leave request"
              icon={<MaterialCommunityIcons name="calendar-plus" size={28} color="#3B82F6" />}
              href="/RequestLeave"
              color="#3B82F6"
              bgColor="#3B82F615"
            />

            <LeaveCard
              title="Approved Leave"
              subtitle="View your approved requests"
              icon={<MaterialCommunityIcons name="calendar-check" size={28} color="#10B981" />}
              href="/ApprovedLeave"
              color="#10B981"
              bgColor="#10B98115"
            />

            <LeaveCard
              title="Rejected Leave"
              subtitle="Check rejected applications"
              icon={<MaterialCommunityIcons name="calendar-remove" size={28} color="#EF4444" />}
              href="/RejectedLeave"
              color="#EF4444"
              bgColor="#EF444415"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}40`,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.surface}E6`,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: `${COLORS.border}60`,
    marginHorizontal: 16,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  leaveCardsContainer: {
    gap: 16,
  },
  leaveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}30`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaveCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: `${COLORS.border}20`,
  },
  cardTextContainer: {
    flex: 1,
  },
  leaveCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  leaveCardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardRight: {
    marginLeft: 12,
  },
});
