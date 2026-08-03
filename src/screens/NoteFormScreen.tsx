import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { RootStackParamList } from '../types/note';

type NoteFormScreenProps = NativeStackScreenProps<RootStackParamList, 'NoteForm'>;

export default function NoteFormScreen({ navigation, route }: NoteFormScreenProps) {
  const note = route.params?.note;
  const isEditing = Boolean(note);

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(note?.color ?? '#4f46e5');

  const busy = saving || deleting;

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      Alert.alert('Empty Note', 'Please add a title or content before saving.');
      return;
    }

    setSaving(true);

    try {
      if (note) {
        await updateDoc(doc(db, 'notes', note.id), {
          title: trimmedTitle,
          content: trimmedContent,
          color: selectedColor,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'notes'), {
          title: trimmedTitle,
          content: trimmedContent,
          color: selectedColor,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Unable to save this note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) {
      return;
    }

    setDeleting(true);

    try {
      await deleteDoc(doc(db, 'notes', note.id));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Unable to delete this note. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this note?');

      if (confirmed) {
        handleDelete();
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
        onPress: handleDelete,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>{'<'}</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'Create Note'}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.headerSubtitle}>
            {isEditing ? 'Update your thoughts clearly' : 'Write your thoughts down'}
          </Text>

          <Image
            source={
              isEditing
                ? require('../../assets/edit-note.png')
                : require('../../assets/create-note.png')
            }
            style={styles.formIllustration}
            resizeMode="contain"
          />

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>T</Text>
                <TextInput
                  editable={!busy}
                  onChangeText={setTitle}
                  placeholder="Give your note a title..."
                  placeholderTextColor="#94a3b8"
                  style={styles.titleInput}
                  value={title}
                />
              </View>
              <Text style={styles.counterText}>{title.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Content</Text>
              <View style={styles.contentShell}>
                <Text style={styles.contentIcon}>=</Text>
                <TextInput
                  editable={!busy}
                  multiline
                  onChangeText={setContent}
                  placeholder="Write your note here..."
                  placeholderTextColor="#94a3b8"
                  style={styles.contentInput}
                  textAlignVertical="top"
                  value={content}
                />
              </View>
              <Text style={styles.counterText}>{content.length}/1000</Text>
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorPicker}>
                {['#4f46e5', '#2563eb', '#0891b2', '#7c3aed', '#0f766e'].map((color) => {
                  const selected = selectedColor === color;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selected && styles.selectedColorOption,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
                busy && styles.disabledSaveButton,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveText}>Save Note</Text>
              )}
            </Pressable>

            {isEditing && (
              <View style={styles.editActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={confirmDelete}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.buttonPressed,
                    busy && styles.disabledDeleteButton,
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator color="#dc2626" />
                  ) : (
                    <Text style={styles.deleteText}>Delete Note</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8ff',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 22 : 0,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    maxWidth: Platform.OS === 'web' ? 430 : 700,
    paddingHorizontal: Platform.OS === 'web' ? 18 : 16,
    paddingTop: Platform.OS === 'web' ? 24 : 10,
    paddingBottom: Platform.OS === 'android' ? 48 : 42,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 2,
    height: 34,
    justifyContent: 'center',
    marginTop: 1,
    shadowColor: '#1e293b',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    width: 34,
  },
  backButtonText: {
    color: '#4f46e5',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  headerTextWrap: {
    flex: 1,
    maxWidth: 520,
  },
  headerTitle: {
    color: '#0f172a',
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 34,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
    textAlign: 'center',
  },
  formIllustration: {
    alignSelf: 'center',
    height: Platform.OS === 'web' ? 180 : 150,
    marginBottom: 20,
    width: Platform.OS === 'web' ? 280 : 240,
  },
  formCard: {
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 18,
  },
  colorSection: {
    marginBottom: 22,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    borderColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 4,
    height: 40,
    width: 40,
  },
  selectedColorOption: {
    borderColor: '#0f172a',
    transform: [{ scale: 1.08 }],
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 9,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe4f0',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
  },
  inputIcon: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    color: '#6d5dfc',
    fontSize: 18,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  titleInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 12,
  },
  counterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
    textAlign: 'right',
  },
  contentShell: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: Platform.OS === 'web' ? 210 : 186,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  contentIcon: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    color: '#6d5dfc',
    fontSize: 18,
    fontWeight: '900',
    height: 32,
    lineHeight: 30,
    overflow: 'hidden',
    textAlign: 'center',
    width: 32,
  },
  contentInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 160,
    paddingBottom: 14,
    paddingTop: 0,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    marginTop: 6,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 16,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    flex: 1,
    marginTop: 14,
    minWidth: 160,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteText: {
    color: '#dc2626',
    fontSize: 17,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.78,
  },
  disabledSaveButton: {
    backgroundColor: '#93c5fd',
  },
  disabledDeleteButton: {
    opacity: 0.55,
  },
});
