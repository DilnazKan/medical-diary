import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth';

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Health</Text>
      <Text style={styles.subtitle}>What would you like to do?</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/diary')}>
        <Text style={styles.cardIcon}>📓</Text>
        <Text style={styles.cardTitle}>Log Symptoms</Text>
        <Text style={styles.cardDesc}>Record how you feel today</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/records')}>
        <Text style={styles.cardIcon}>🏥</Text>
        <Text style={styles.cardTitle}>Medical Records</Text>
        <Text style={styles.cardDesc}>Store your test results and visits</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/search')}>
        <Text style={styles.cardIcon}>🔍</Text>
        <Text style={styles.cardTitle}>Health Search</Text>
        <Text style={styles.cardDesc}>Find trusted scientific papers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#888' },
  logoutBtn: { marginTop: 16, padding: 16, alignItems: 'center' },
  logoutText: { color: '#999', fontSize: 15 },
});
