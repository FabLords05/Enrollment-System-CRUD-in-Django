import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

export default function StudentProfileScreen() {
  const auth = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    (async () => {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('students/'),
        api.get('courses/')
      ]);
      setCourses(coursesRes.data || []);
      const matched = studentsRes.data.find((s: any) => s.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
      if (matched) {
        setProfile(matched);
        setForm({ first_name: matched.first_name || '', last_name: matched.last_name || '', phone: matched.phone || '' });
      }
    })();
  }, []);

  const handlePatchSave = async () => {
    try {
      await api.patch(`students/${profile.id}/`, form);
      setProfile({ ...profile, ...form });
      setEditing(false);
      Alert.alert("Success", "EduTrack profile records updated!");
    } catch (e) { Alert.alert("Error", "Failed synchronizing fields."); }
  };

  const course = courses.find(c => c.id === Number(profile?.program_enrolled));
  const courseLabel = course ? `${course.code} — ${course.name}` : 'Unassigned';
  const studentIdValue = profile?.student_id?.trim();
  const showPendingStudentId = !studentIdValue || /pending/i.test(studentIdValue);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: COLORS.ustpGold }]}><Text style={styles.avatarTxt}>S</Text></View>
          <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => editing ? handlePatchSave() : setEditing(true)}>
            <Text style={styles.editBtnTxt}>{editing ? '💾 Save' : '✏️ Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Student Profile Code</Text>
          {showPendingStudentId ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeIcon}>⏳</Text>
              <Text style={styles.pendingBadgeText}>Verification Pending</Text>
            </View>
          ) : (
            <TextInput style={[styles.input, styles.disabled]} value={studentIdValue || ''} editable={false} />
          )}
          
          <Text style={styles.label}>Program / Course</Text>
          <TextInput style={[styles.input, styles.disabled]} value={courseLabel} editable={false} />
          
          <Text style={styles.label}>First Name</Text>
          <TextInput style={[styles.input, !editing && styles.disabled]} value={form.first_name} onChangeText={t => setForm({...form, first_name: t})} editable={editing} />
          
          <Text style={styles.label}>Last Name</Text>
          <TextInput style={[styles.input, !editing && styles.disabled]} value={form.last_name} onChangeText={t => setForm({...form, last_name: t})} editable={editing} />
          
          <Text style={styles.label}>Contact Reference Number</Text>
          <TextInput style={[styles.input, !editing && styles.disabled]} value={form.phone} onChangeText={t => setForm({...form, phone: t})} editable={editing} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', padding: 16, marginBottom: 30 },
  avatarRow: { alignItems: 'center', marginVertical: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '900', color: COLORS.ustpDarkBlue },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.ustpDarkBlue, marginTop: 8 },
  email: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ustpDarkBlue },
  editBtn: { backgroundColor: COLORS.grayBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnTxt: { fontSize: 11, fontWeight: '700', color: COLORS.textMain },
  formGroup: { marginTop: 12 },
  label: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 13, color: COLORS.textMain, backgroundColor: '#FFF' },
  disabled: { backgroundColor: '#F3F4F6', color: COLORS.textMuted },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#FFFAEB', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  pendingBadgeIcon: { fontSize: 12, marginRight: 6, color: '#B45309' },
  pendingBadgeText: { fontSize: 12, fontWeight: '700', color: '#B45309' }
});