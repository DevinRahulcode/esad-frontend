import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, 
  SafeAreaView, TouchableOpacity, Alert 
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:8080"; // Android emulator

const COLORS = {
  background: '#0F172A',
  surface: '#334155',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  success: '#10B981',
  primary: '#3B82F6',
  borderLight: '#4B5563',
};

const Payslip = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem("@employee_id");
      if (!id) {
        Alert.alert("Error", "No employee ID found");
        setPayslips([]);
        return;
      }
      setEmployeeId(id);

      const response = await axios.get(`${API_URL}/api/payslips/employee/${id}`);
      setPayslips(response.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslipId, fileName) => {
    try {
      const downloadUrl = `${API_URL}/api/payslips/download/${payslipId}`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(downloadUrl, localUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Downloaded", `File saved at ${uri}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to download payslip");
    }
  };

  const renderPayslip = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.success} />
        <Text style={styles.fileName}>{item.filename}</Text>
      </View>

      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={() => handleDownload(item.id, item.filename)}
      >
        <MaterialCommunityIcons name="download" size={20} color="#fff" />
        <Text style={styles.btnText}>Download</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="file-document-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Payslips Found</Text>
      <Text style={styles.emptySubtitle}>
        You haven't received any payslips yet.{"\n"}
        Once available, you can download them here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.success} />
          <Text style={styles.loadingText}>Loading Payslips...</Text>
        </View>
      ) : (
        <FlatList
          data={payslips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPayslip}
          contentContainerStyle={payslips.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
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
    marginTop: 16,
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 60,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginVertical: 8,
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    flexShrink: 1,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMuted,
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

export default Payslip;
