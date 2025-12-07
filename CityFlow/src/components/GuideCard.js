import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GuideCard({ data }) {
  if (!data) return null;

  return (
    <View style={styles.card}>
      {/* HEADER CARD */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
          <View style={styles.badge}>
            <Ionicons name="time-outline" size={12} color="#555" />
            <Text style={styles.badgeText}>{data.duration}</Text>
          </View>
        </View>
        <Ionicons name="map-outline" size={40} color="#28a745" style={{opacity: 0.8}} />
      </View>

      <Text style={styles.description}>{data.description}</Text>
      
      <View style={styles.divider} />

      {/* TIMELINE (ITINERARIUL VIZUAL) */}
      <View style={styles.timelineContainer}>
        {data.stops.map((stop, index) => (
          <View key={index} style={styles.stopRow}>
            {/* Coloana Stângă: Ora și Linia */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{stop.time}</Text>
              
              {/* Bulina colorată */}
              <View style={[styles.dot, { backgroundColor: stop.color }]}>
                <Ionicons name={stop.icon} size={10} color="#FFF" />
              </View>
              
              {/* Linia verticală (nu o desenăm la ultimul element) */}
              {index !== data.stops.length - 1 && <View style={styles.line} />}
            </View>

            {/* Coloana Dreaptă: Detalii */}
            <View style={styles.infoColumn}>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <Text style={styles.stopInfo}>{stop.info}</Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Am scos butonul de Save - Cardul se termină aici */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    paddingBottom: 10, // Ajustat padding-ul de jos
    marginVertical: 10,
    marginLeft: 5,
    maxWidth: '92%',
    alignSelf: 'flex-start',
    elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '800', color: '#333' },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, color: '#555', marginLeft: 4, fontWeight: '600' },
  description: { fontSize: 13, color: '#444', fontStyle: 'italic', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 15 },
  
  timelineContainer: { marginLeft: 0 },
  stopRow: { flexDirection: 'row', marginBottom: 20 },
  timeColumn: { alignItems: 'center', width: 50, marginRight: 10 },
  timeText: { fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 4 },
  
  dot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  line: { width: 2, backgroundColor: '#E0E0E0', position: 'absolute', top: 35, bottom: -15, zIndex: 1 },
  
  infoColumn: { flex: 1, justifyContent: 'flex-start', paddingTop: 0 },
  stopTitle: { fontSize: 14, fontWeight: '700', color: '#000' },
  stopInfo: { fontSize: 12, color: '#666', marginTop: 2 },
});