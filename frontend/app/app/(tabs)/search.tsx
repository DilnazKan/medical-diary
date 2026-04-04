import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Linking
} from 'react-native';
import { api } from '../../services/api';

type Paper = {
  pubmed_id: string;
  title: string;
  authors: string[];
  published_date: string;
  source: string;
  url: string;
};

const SUGGESTIONS = [
  'migraine causes', 'vitamin D deficiency', 'anxiety treatment',
  'iron deficiency symptoms', 'sleep apnea', 'thyroid function',
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setError('');
    setResults([]);
    try {
      const data = await api.search(searchQuery.trim());
      setResults(data.results || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaper = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Health Search</Text>
      <Text style={styles.subtitle}>Search scientific papers from PubMed</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. vitamin D deficiency"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()} disabled={loading}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {!searched && (
        <View>
          <Text style={styles.suggestLabel}>Try searching for:</Text>
          <View style={styles.chipRow}>
            {SUGGESTIONS.map(s => (
              <TouchableOpacity
                key={s}
                style={styles.chip}
                onPress={() => {
                  setQuery(s);
                  handleSearch(s);
                }}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView style={styles.results} contentContainerStyle={{ paddingBottom: 40 }}>
        {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#4A90D9" />}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && searched && results.length === 0 && !error && (
          <Text style={styles.emptyText}>No results found. Try a different search.</Text>
        )}

        {results.map(paper => (
          <TouchableOpacity key={paper.pubmed_id} style={styles.card} onPress={() => openPaper(paper.url)}>
            <Text style={styles.cardTitle}>{paper.title}</Text>
            {paper.authors?.length > 0 && (
              <Text style={styles.cardAuthors}>
                {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}
              </Text>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.cardSource}>{paper.source}</Text>
              <Text style={styles.cardDate}>{paper.published_date}</Text>
            </View>
            <Text style={styles.cardLink}>Open on PubMed →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff' },
  searchBtn: { backgroundColor: '#4A90D9', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  suggestLabel: { fontSize: 14, color: '#888', marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  chipText: { fontSize: 13, color: '#4A90D9' },
  results: { flex: 1 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 16 },
  errorText: { textAlign: 'center', color: '#e84040', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', lineHeight: 22, marginBottom: 8 },
  cardAuthors: { fontSize: 13, color: '#666', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardSource: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  cardDate: { fontSize: 12, color: '#888' },
  cardLink: { fontSize: 13, color: '#4A90D9', fontWeight: '500' },
});
