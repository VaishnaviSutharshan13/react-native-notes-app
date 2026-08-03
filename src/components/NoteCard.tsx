import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Note } from '../types/note';

type NoteCardProps = {
  note: Note;
  accentColor: string;
  onPress: () => void;
  onDelete: () => void;
};

export default function NoteCard({ note, accentColor, onPress, onDelete }: NoteCardProps) {
  const updatedAt = note.updatedAt?.toDate();
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Just now';

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.cardBody}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.topRow, pressed && styles.cardPressed]}
          onPress={onPress}
        >
          <View style={[styles.iconTile, { backgroundColor: `${accentColor}14` }]}>
            <View style={[styles.documentIcon, { borderColor: accentColor }]}>
              <View style={[styles.documentFold, { borderColor: accentColor }]} />
              <View style={[styles.documentLine, { backgroundColor: accentColor }]} />
              <View style={[styles.documentLineShort, { backgroundColor: accentColor }]} />
              <View style={[styles.documentLineTiny, { backgroundColor: accentColor }]} />
            </View>
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title || 'Untitled note'}
            </Text>
            <Text style={styles.content} numberOfLines={3}>
              {note.content || 'No content'}
            </Text>
          </View>
        </Pressable>
        <View style={styles.footer}>
          <Text style={styles.date}>{updatedLabel}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.editButton, pressed && styles.actionPressed]}
              onPress={onPress}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.deleteButton, pressed && styles.actionPressed]}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    elevation: 4,
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#1e293b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardPressed: {
    opacity: 0.72,
  },
  accent: {
    width: 0,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 14,
  },
  iconTile: {
    alignItems: 'center',
    borderRadius: 16,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  documentIcon: {
    borderRadius: 3,
    borderWidth: 2,
    height: 36,
    position: 'relative',
    width: 28,
  },
  documentFold: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    height: 10,
    position: 'absolute',
    right: -2,
    top: -2,
    width: 10,
  },
  documentLine: {
    borderRadius: 2,
    height: 2,
    left: 6,
    position: 'absolute',
    top: 14,
    width: 14,
  },
  documentLineShort: {
    borderRadius: 2,
    height: 2,
    left: 6,
    position: 'absolute',
    top: 20,
    width: 12,
  },
  documentLineTiny: {
    borderRadius: 2,
    height: 2,
    left: 6,
    position: 'absolute',
    top: 26,
    width: 9,
  },
  textGroup: {
    flex: 1,
    marginBottom: 14,
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  content: {
    color: '#526071',
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingLeft: 72,
  },
  date: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  editButton: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editButtonText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '800',
  },
  actionPressed: {
    opacity: 0.68,
  },
});
