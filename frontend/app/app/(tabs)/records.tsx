import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { api } from '../../services/api';

const RECORD_TYPES = ['Lab Result', 'Doctor Visit', 'Imaging', 'Prescription', 'Vaccination', 'Other'];

type Record = {
  id: string;
  title: string;
  record_type: string;
  visit_date: string | null;
  doctor_name: string | null;
  clinic_name: string | null;
  notes: string | null;
};

export default function RecordsScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');

  // Form fields
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState('Doctor Visit');
  const [visitDate, setVisitDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getRecords();
      setRecords(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async () => {
    if (!title) return Alert.alert('Error', 'Title is required.');
    setSubmitting(true);
    try {
      await api.createRecord({
        title,
        record_type: recordType,
        visit_date: visitDate || null,
        doctor_name: doctorName || null,
        clinic_name: clinicName || null,
        notes: notes || null,
      });
      setShowForm(false);
      resetForm();
      loadRecords();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setRecordType('Doctor Visit');
    setVisitDate('');
    setDoctorName('');
    setClinicName('');
    setNotes('');
  };

  const filtered = filterType === 'All' ? records : records.filter(r => r.record_type === filterType);

  const typeColor: Record<string, string> = {
    'Lab Result': '#5B8FF9',
    'Doctor Visit': '#5AD8A6',
    'Imaging': '#F6BD16',
    'Prescription': '#E86452',
    'Vaccination': '#6DC8EC',
    'Other': '#aaa',
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {['All', ...RECORD_TYPES].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, filterType === type && styles.filterChipActive]}
            onPress={() => setFilterType(type)}>
            <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4A90D9" />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No records yet. Tap "+ Add" to get started.</Text>
          ) : (
            filtered.map(record => (
              <View key={record.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: (typeColor[record.record_type] || '#aaa') + '22' }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColor[record.record_type] || '#aaa' }]}>{record.record_type}</Text>
                  </View>
                  {record.visit_date && (
                    <Text style={styles.cardDate}>
                      {new Date(record.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                </View>
                <Text style={styles.cardTitle}>{record.title}</Text>
                {record.doctor_name && <Text style={styles.cardMeta}>Dr. {record.doctor_name}</Text>}
                {record.clinic_name && <Text style={styles.cardMeta}>{record.clinic_name}</Text>}
                {record.notes && <Text style={styles.cardNotes}>{record.notes}</Text>}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add record modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Record</Text>
            <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Blood test results" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {RECORD_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.filterChip, recordType === t && styles.filterChipActive]}
                    onPress={() => setRecordType(t)}>
                    <Text style={[styles.filterChipText, recordType === t && styles.filterChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Visit date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-01-15" value={visitDate} onChangeText={setVisitDate} />

            <Text style={styles.label}>Doctor name</Text>
            <TextInput style={styles.input} placeholder="Dr. Smith" value={doctorName} onChangeText={setDoctorName} />

            <Text style={styles.label}>Clinic / Hospital</Text>
            <TextInput style={styles.input} placeholder="City General Hospital" value={clinicName} onChangeText={setClinicName} />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Any additional details..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Record</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4A90D9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  filterScroll: { maxHeight: 48 },
  filterRow: { paddingHorizontal: 20, gap: 8, alignItems: 'center', paddingBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterChipActive: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { fontSize: 12, fontWeight: '600' },
  cardDate: { fontSize: 12, color: '#999' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#666', marginBottom: 2 },
  cardNotes: { fontSize: 13, color: '#888', marginTop: 6, lineHeight: 20 },
  modalRoot: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },
  cancelText: { fontSize: 16, color: '#4A90D9' },
  label: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#f8f9fa' },
  submitBtn: { backgroundColor: '#4A90D9', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
