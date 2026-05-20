import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../../api/axiosSetup';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

interface ClassOffering {
  id: number;
  subject_code?: string;
  subject_title?: string;
  subject_name?: string;
  subject_units?: number;
  section: number;
  days?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  instructor?: number | null;
  subject?: { id: number; code: string; name: string; units: number };
}
interface Instructor { id: number; nm: string; }

export default function StudentSubjectsScreen() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ClassOffering[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [studentsRes, offRes, instRes] = await Promise.all([
        api.get('students/'),
        api.get<ClassOffering[]>('offerings/'),
        api.get<Instructor[]>('instructors/'),
      ]);
      console.log('User Auth:', user);
      console.log('First Student:', studentsRes.data[0]);
      console.log('Sample Offering:', offRes.data[0]);
      
      setInstructors(instRes.data);
      const userEmail = user?.email?.toLowerCase();
      const myData = studentsRes.data.find(
        (s: any) => {
          const studentEmail = (s.email || s.user?.email)?.toLowerCase?.();
          return studentEmail === userEmail;
        }
      );
      
      if (!myData) {
        console.warn('Student profile not found in API response');
      } else if (myData?.section) {
        setSubjects(offRes.data.filter((o) => o.section === myData.section));
      }
    } catch (err) {
      console.error('Subjects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subjects.filter((o) => {
    const subjectName = (o.subject_title || o.subject?.name || 'Unknown Subject').toLowerCase();
    const subjectCode = (o.subject_code || o.subject?.code || '').toLowerCase();
    const searchLower = search.toLowerCase();
    return subjectName.includes(searchLower) || subjectCode.includes(searchLower);
  });
  const totalUnits = subjects.reduce((a, o) => a + (o.subject_units || o.subject?.units || 0), 0);

  const getInstructor = (id: number | null) =>
    instructors.find((i) => i.id === id)?.nm || 'TBA';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.ustpBlue} />
        <Text style={styles.loadingText}>Loading subjects…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Enrolled Subjects</Text>
          <Text style={styles.headerSub}>
            SY 2026–2027 · 1st Sem · {totalUnits} total units
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Search subjects…"
          placeholderTextColor={Colors.gray300}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {subjects.length === 0
              ? 'No subjects assigned yet. Waiting for Registrar. If this persists, contact support.'
              : 'No subjects match your search.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: o }) => {
            const code = o.subject_code || o.subject?.code || 'N/A';
            const title = o.subject_title || o.subject?.name || 'Unknown Subject';
            const units = o.subject_units || o.subject?.units || 0;
            const startTime = o.start_time || o.st || 'TBA';
            const endTime = o.end_time || o.et || 'TBA';
            const room = o.room || 'TBA';
            const instructor = getInstructor(o.instructor || null);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{code}</Text>
                    </View>
                    <Text style={styles.subjectTitle} numberOfLines={2}>{title}</Text>
                  </View>
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledText}>Enrolled</Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailItem}>👤 {instructor}</Text>
                    <Text style={styles.detailItem}>📚 {units} units</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailItem}>📅 {o.days || 'TBA'}</Text>
                    <Text style={styles.detailItem}>🕐 {startTime} – {endTime}</Text>
                  </View>
                  <Text style={styles.detailItem}>🏫 {room}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: Colors.gray400, fontSize: 14 },

  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.ustpDarkBlue },
  headerSub: { fontSize: 12, color: Colors.gray400, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  search: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.gray700 },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: Colors.blue50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  codeText: { fontSize: 11, fontWeight: '700', color: Colors.ustpBlue, fontFamily: 'monospace' },
  subjectTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray800, maxWidth: 220 },
  enrolledBadge: {
    backgroundColor: Colors.emerald50,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  enrolledText: { fontSize: 11, fontWeight: '700', color: Colors.emerald600 },

  cardDetails: { gap: 4 },
  detailRow: { flexDirection: 'row', gap: 16 },
  detailItem: { fontSize: 12, color: Colors.gray500 },

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray400,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});
