import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = "http://10.0.2.2:8080/api/employees";

const COLORS = {
  primary: "#3B82F6",
  secondary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  background: "#0F172A",
  backgroundSecondary: "#1E293B",
  surface: "#334155",
  surfaceLight: "#475569",
  text: "#F8FAFC",
  textSecondary: "#E2E8F0",
  textMuted: "#94A3B8",
  border: "#374151",
  borderLight: "#4B5563",
};

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert("Error", "No logged-in user found");
        setLoading(false);
        return;
      }

      const email = user.email;
      const response = await axios.get(`${BASE_URL}/by-email?email=${email}`);
      setEmployee(response.data);
      setImage(
        response.data.profileImage
          ? `data:image/jpeg;base64,${response.data.profileImage}`
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      );
    } catch (error) {
      console.error("Error fetching employee:", error);
      Alert.alert("Error", "Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Allow access to upload a photo");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setImage(selected.uri);
      await uploadProfileImage(selected);
    }
  };

  const uploadProfileImage = async (selectedImage) => {
    try {
      if (!employee?.id) {
        Alert.alert("Error", "Employee ID missing");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      await axios.post(`${BASE_URL}/upload-image/${employee.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Profile image updated successfully!");
      fetchEmployeeDetails();
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleEditChange = (key, value) => {
    setUpdatedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const updated = { ...employee, ...updatedFields };
      const response = await axios.put(
        `${BASE_URL}/edit/${employee.id}`,
        updated
      );
      setEmployee(response.data);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text }}>Loading Profile...</Text>
      </View>
    );

  if (!employee)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No profile found</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: image }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.name}>{employee.name}</Text>
      </View>

      {/* Info Cards */}
      {["name", "address", "nic", "email", "gender"].map((field) => (
        <View key={field} style={styles.card}>
          <Text style={styles.label}>{field.toUpperCase()}</Text>
          {editMode ? (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field}`}
              placeholderTextColor={COLORS.textMuted}
              defaultValue={employee[field] || ""}
              onChangeText={(value) => handleEditChange(field, value)}
            />
          ) : (
            <Text style={styles.value}>{employee[field] || "Not provided"}</Text>
          )}
        </View>
      ))}

      {/* Edit / Save Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (editMode) handleSaveChanges();
          else setEditMode(true);
        }}
      >
        <MaterialCommunityIcons
          name={editMode ? "content-save" : "account-edit"}
          size={20}
          color="#fff"
        />
        <Text style={styles.editText}>
          {editMode ? " Save Changes" : " Edit Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingBottom: 40,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerText: {
    fontSize: 26,
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  card: {
    width: "90%",
    backgroundColor: `${COLORS.surface}E6`,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: `${COLORS.borderLight}40`,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
  },
  editButton: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
