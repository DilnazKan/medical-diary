import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { api } from '../../services/api';

type Symptom = { id: string; name: string; category: string };
type SelectedSymptom = { symptom_id?: string; custom_symptom?: string; severity: number; name: string };

export default function DiaryScreen() {
  const [view, setView] = useState<'log' | 'history'>('log');

  // Log form state
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selected, setSelected] = useState<SelectedSymptom[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // History state
  const [entries, setEntries] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Severity picker state
  const [severityModal, setSeverityModal] = useState<SelectedSymptom | null>(null);

  useEffect(() => {
    api.getSymptoms().then((data: Symptom[]) => setSymptoms(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (view === 'history') loadHistory();
  }, [view]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getEntries();
      setEntries(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleSymptom = (s: Symptom) => {
    const exists = selected.find(x => x.symptom_id === s.id);
    if (exists) {
      setSelected(selected.filter(x => x.symptom_id !== s.id));
    } else {
      setSeverityModal({ symptom_id: s.id, severity: 5, name: s.name });
    }
  };

  const addCustomSymptom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const exists = selected.find(x => x.custom_symptom === trimmed);
    if (exists) return;
    setSeverityModal({ custom_symptom: trimmed, severity: 5, name: trimmed });
    setCustomInput('');
  };

  const confirmSeverity = (severity: number) => {
    if (!severityModal) return;
    setSelected([...selected, { ...severityModal, severity }]);
    setSeverityModal(null);
  };

  const removeSymptom = (name: string) => {
    setSelected(selected.filter(x => x.name !== name));
  };

  const handleSubmit = async () => {
    if (!notes && selected.length === 0) {
      return Alert.alert('Empty entry', 'Add some notes or select symptoms first.');
    }
    setSubmitting(true);
    try {
      const payload = selected.map(s => ({
        symptom_id: s.symptom_id,
        custom_symptom: s.custom_symptom,
        severity: s.severity,
      }));
      await api.createEntry(notes, payload);
      setNotes('');
      setSelected([]);
      Alert.alert('Saved!', 'Your diary entry was logged.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [...new Set(symptoms.map(s => s.category))];

  return (
    <View style={styles.root}>
      {/* Tab switcher */}
      <View style={styles.switcher}>
        <TouchableOpacity
          style={[styles.switchBtn, view === 'log' && styles.switchActive]}
          onPress={() => setView('log')}>
          <Text style={[styles.switchText, view === 'log' && styles.switchTextActive]}>Log Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, view === 'history' && styles.switchActive]}
          onPress={() => setView('history')}>
          <Text style={[styles.switchText, view === 'history' && styles.switchTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {view === 'log' ? (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.sectionLabel}>How are you feeling?</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Write notes about today..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.sectionLabel}>Select symptoms</Text>
          {categories.map(cat => (
            <View key={cat} style={styles.categoryBlock}>
              <Text style={styles.categoryLabel}>{cat}</Text>
              <View style={styles.chipRow}>
                {symptoms.filter(s => s.category === cat).map(s => {
                  const isSelected = !!selected.find(x => x.symptom_id === s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleSymptom(s)}>
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{s.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Add custom symptom</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Describe your symptom..."
              value={customInput}
              onChangeText={setCustomInput}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addCustomSymptom}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {selected.length > 0 && (
            <View style={styles.selectedBox}>
              <Text style={styles.sectionLabel}>Selected ({selected.length})</Text>
              {selected.map(s => (
                <View key={s.name} style={styles.selectedRow}>
                  <Text style={styles.selectedName}>{s.name}</Text>
                  <Text style={styles.selectedSeverity}>Severity: {s.severity}/10</Text>
                  <TouchableOpacity onPress={() => removeSymptom(s.name)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Entry</Text>}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {loadingHistory ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#4A90D9" />
          ) : entries.length === 0 ? (
            <Text style={styles.emptyText}>No entries yet. Start logging!</Text>
          ) : (
            entries.map((entry: any) => (
              <View key={entry.id} style={styles.entryCard}>
                <Text style={styles.entryDate}>
                  {new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
                {entry.symptoms?.length > 0 && (
                  <View style={styles.chipRow}>
                    {entry.symptoms.map((s: any, i: number) => (
                      <View key={i} style={styles.chipSmall}>
                        <Text style={styles.chipSmallText}>
                          {s.symptom_name || s.custom_symptom} · {s.severity}/10
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Severity picker modal */}
      <Modal visible={!!severityModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Severity for "{severityModal?.name}"</Text>
            <Text style={styles.modalSubtitle}>1 = mild, 10 = severe</Text>
            <View style={styles.severityRow}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.severityBtn, severityModal?.severity === n && styles.severityBtnActive]}
                  onPress={() => setSeverityModal(prev => prev ? { ...prev, severity: n } : null)}>
                  <Text style={[styles.severityText, severityModal?.severity === n && styles.severityTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={() => confirmSeverity(severityModal?.severity ?? 5)}>
              <Text style={styles.submitText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  switcher: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#e9ecef', borderRadius: 10, padding: 4 },
  switchBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  switchActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  switchText: { fontSize: 14, color: '#888', fontWeight: '500' },
  switchTextActive: { color: '#1a1a2e', fontWeight: '600' },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginTop: 20, marginBottom: 10 },
  textarea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff', minHeight: 100, textAlignVertical: 'top' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff' },
  categoryBlock: { marginBottom: 12 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  chipSelected: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextSelected: { color: '#fff' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addBtn: { backgroundColor: '#4A90D9', borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  selectedBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#e8ecf0' },
  selectedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  selectedName: { flex: 1, fontSize: 14, color: '#1a1a2e' },
  selectedSeverity: { fontSize: 13, color: '#4A90D9', marginRight: 12 },
  removeBtn: { fontSize: 16, color: '#ccc' },
  submitBtn: { backgroundColor: '#4A90D9', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 16 },
  entryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  entryDate: { fontSize: 13, fontWeight: '600', color: '#4A90D9', marginBottom: 6 },
  entryNotes: { fontSize: 15, color: '#333', marginBottom: 10, lineHeight: 22 },
  chipSmall: { backgroundColor: '#f0f6ff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipSmallText: { fontSize: 12, color: '#4A90D9' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  severityBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  severityBtnActive: { backgroundColor: '#4A90D9' },
  severityText: { fontSize: 13, color: '#555' },
  severityTextActive: { color: '#fff', fontWeight: '600' },
});
