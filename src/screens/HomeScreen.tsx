import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';

import NoteCard from '../components/NoteCard';
import { db } from '../services/firebase';
import { Note, RootStackParamList } from '../types/note';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const notesQuery = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(notesQuery);
      const nextNotes = snapshot.docs.map((noteDocument) => ({
        id: noteDocument.id,
        ...noteDocument.data(),
      })) as Note[];

      setNotes(nextNotes);
    } catch (error) {
      Alert.alert('Error', 'Unable to load notes. Please check your connection and Firebase setup.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchNotes);
    return unsubscribe;
  }, [fetchNotes, navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const confirmDelete = (note: Note) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this note?');

      if (confirmed) {
        handleDelete(note);
      }

      return;
    }

    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDelete(note),
      },
    ]);
  };

  const handleDelete = async (note: Note) => {
    try {
      await deleteDoc(doc(db, 'notes', note.id));
      setNotes((currentNotes) => currentNotes.filter((item) => item.id !== note.id));
    } catch (error) {
      Alert.alert('Error', 'Unable to delete this note. Please try again.');
    }
  };

  const filteredNotes = notes.filter((note) => {
    const queryText = searchTerm.trim().toLowerCase();

    if (!queryText) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(queryText) ||
      note.content.toLowerCase().includes(queryText)
    );
  });

  const accentColors = ['#4f46e5', '#2563eb', '#0891b2', '#7c3aed', '#0f766e'];

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator color="#2563eb" size="large" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredNotes.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.heroRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.greeting}>Good morning, Vaishnavi</Text>
                <Text style={styles.title}>My Notes</Text>
                <Text style={styles.subtitle}>Capture your ideas and stay organized</Text>
              </View>
              <Image
                source={require('../../assets/notes-header.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            <View style={styles.searchBox}>
              <View style={styles.searchIcon}>
                <View style={styles.searchCircle} />
                <View style={styles.searchHandle} />
              </View>
              <TextInput
                autoCapitalize="none"
                onChangeText={setSearchTerm}
                placeholder="Search notes..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                value={searchTerm}
              />
              <Text style={styles.filterIcon}>...</Text>
            </View>

            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>Total Notes</Text>
                <Text style={styles.summaryValue}>{notes.length}</Text>
              </View>
              <View style={styles.summaryChart}>
                <View style={[styles.chartBar, styles.chartBarSmall]} />
                <View style={[styles.chartBar, styles.chartBarMedium]} />
                <View style={[styles.chartBar, styles.chartBarTall]} />
              </View>
            </View>

            {filteredNotes.length > 0 && (
              <Text style={styles.sectionTitle}>All Notes</Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <NoteCard
            accentColor={item.color ?? accentColors[index % accentColors.length]}
            note={item}
            onDelete={() => confirmDelete(item)}
            onPress={() => navigation.navigate('NoteForm', { note: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>NOTES</Text>
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'No matching notes' : 'No notes yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchTerm
                ? 'Try a different title or phrase to find what you need.'
                : 'Start capturing thoughts, plans, and study ideas in one calm place.'}
            </Text>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add note"
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={() => navigation.navigate('NoteForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8ff',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 22 : 0,
  },
  centeredContainer: {
    alignItems: 'center',
    backgroundColor: '#f7f8ff',
    flex: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 22 : 0,
  },
  loadingText: {
    color: '#4b5563',
    fontSize: 15,
    marginTop: 12,
  },
  listContent: {
    alignSelf: 'center',
    maxWidth: Platform.OS === 'web' ? 430 : 700,
    paddingHorizontal: Platform.OS === 'web' ? 18 : 16,
    paddingTop: Platform.OS === 'web' ? 28 : 18,
    paddingBottom: Platform.OS === 'android' ? 132 : 112,
    width: '100%',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  headerArea: {
    marginBottom: 22,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 18,
    minHeight: 128,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 8,
  },
  greeting: {
    color: '#4f46e5',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 46,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 320,
  },
  illustration: {
    height: Platform.OS === 'web' ? 150 : 124,
    marginRight: -10,
    width: Platform.OS === 'web' ? 168 : 136,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e1e7f5',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
    shadowColor: '#1e293b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  searchIcon: {
    height: 22,
    position: 'relative',
    width: 22,
  },
  searchCircle: {
    borderColor: '#334155',
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    left: 1,
    position: 'absolute',
    top: 1,
    width: 14,
  },
  searchHandle: {
    backgroundColor: '#334155',
    borderRadius: 2,
    height: 9,
    left: 14,
    position: 'absolute',
    top: 13,
    transform: [{ rotate: '-45deg' }],
    width: 2,
  },
  filterIcon: {
    color: '#4f46e5',
    fontSize: 18,
    fontWeight: '900',
  },
  searchInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#6d5dfc',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 20,
  },
  summaryLabel: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  summaryChart: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 7,
    height: 72,
    padding: 14,
    width: 96,
  },
  chartBar: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    width: 9,
  },
  chartBarSmall: {
    height: 20,
    opacity: 0.55,
  },
  chartBarMedium: {
    height: 34,
    opacity: 0.75,
  },
  chartBarTall: {
    height: 48,
  },
  sectionTitle: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 2,
    marginTop: 20,
    padding: 28,
    shadowColor: '#1e293b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  emptyIcon: {
    color: '#4f46e5',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 30,
    bottom: Platform.OS === 'android' ? 42 : 28,
    elevation: 5,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: 60,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  addButtonPressed: {
    opacity: 0.78,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
});
