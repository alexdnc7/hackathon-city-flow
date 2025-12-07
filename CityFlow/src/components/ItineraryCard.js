import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItineraryCard({ data, onSave }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ {data.title}</Text>
        <TouchableOpacity onPress={onSave}>
          <Ionicons name="bookmark-outline" size={24} color="#28a745" />
        </TouchableOpacity>
      </View>

      {/* Itinerariu text */}
      <Text style={styles.description}>{data.description}</Text>

      {/* Lista cu 3 locuri */}
      <ScrollView style={styles.locationsContainer} nestedScrollEnabled>
        {data.locations && data.locations.map((location, index) => (
          <View key={location.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationNumber}>{index + 1}.</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.locationStats}>
                  <Text style={styles.stat}>📍 {location.distance} km</Text>
                  <Text style={[
                    styles.stat,
                    location.busyness < 30 ? styles.freeLocation : 
                    location.busyness < 60 ? styles.moderateLocation : 
                    styles.busyLocation
                  ]}>
                    👥 {location.busyness}% plin
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Reward info removed per UX request (no coin mentions) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  locationsContainer: {
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#28a745',
    marginRight: 10,
    minWidth: 25,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  locationStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 12,
    color: '#666',
  },
  freeLocation: {
    color: '#28a745',
    fontWeight: '600',
  },
  moderateLocation: {
    color: '#FFA500',
    fontWeight: '600',
  },
  busyLocation: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFB800',
  },
});

