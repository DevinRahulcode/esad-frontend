import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

// A reusable Card component
const Card = ({ title, icon, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {icon}
      <Text style={styles.cardText}>{title}</Text>
    </Pressable>
  );
};

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>

      <View style={styles.cardContainer}>
        <Card
          title="Apply Leave"
          icon={<MaterialCommunityIcons name="calendar-edit" size={40} color="#3498db" />}
          onPress={() => alert('Navigate to Apply Leave')}
        />
        <Card
          title="Attendance"
          icon={<MaterialIcons name="fingerprint" size={40} color="#2ecc71" />}
          onPress={() => alert('Navigate to Attendance')}
        />
        <Card
          title="Events"
          icon={<MaterialIcons name="event" size={40} color="#e74c3c" />}
          onPress={() => alert('Navigate to Events')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // A light grey background
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', // Two cards per row
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
});