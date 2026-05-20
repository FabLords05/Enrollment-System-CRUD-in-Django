import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

export default function StudentProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('students/'),
        api.get('courses/')
      ]);
      setCourses(coursesRes.data || []);
      const matched = studentsRes.data.find((s: any) => s.email?.toLowerCase() === user?.email?.toLowerCase());
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

  const handleChangePassword = async () => {
    const { old_password, new_password, confirm_password } = passwordForm;

    // Validation: ensure all fields are filled
    if (!old_password || !new_password || !confirm_password) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    // Validation: ensure new password matches confirmation
    if (new_password !== confirm_password) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }

    // Validation: ensure new password is different from old password
    if (old_password === new_password) {
      Alert.alert('Error', 'New password must be different from your current password.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.post('change-password/', {
        old_password,
        new_password,
      });

      Alert.alert('Success', 'Your password has been updated successfully.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to change password. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'Log Out', onPress: () => logout(), style: 'destructive' },
      ]
    );
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

      {/* Change Password Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity 
          style={styles.changePasswordBtn} 
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.changePasswordBtnTxt}>🔒 Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
      </TouchableOpacity>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isChangingPassword && setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity 
                disabled={isChangingPassword}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your current password"
                secureTextEntry={true}
                editable={!isChangingPassword}
                value={passwordForm.old_password}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, old_password: text })}
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your new password"
                secureTextEntry={true}
                editable={!isChangingPassword}
                value={passwordForm.new_password}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, new_password: text })}
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your new password"
                secureTextEntry={true}
                editable={!isChangingPassword}
                value={passwordForm.confirm_password}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirm_password: text })}
              />

              <View style={styles.modalButtonGroup}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => {
                    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                    setShowPasswordModal(false);
                  }}
                  disabled={isChangingPassword}
                >
                  <Text style={styles.modalCancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, styles.modalSubmitBtn, isChangingPassword && styles.modalBtnDisabled]}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnTxt}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', padding: 16, marginBottom: 16 },
  avatarRow: { alignItems: 'center', marginVertical: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 22, fontWeight: '900', color: COLORS.ustpDarkBlue },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.ustpDarkBlue, marginTop: 8 },
  email: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ustpDarkBlue, marginBottom: 12 },
  editBtn: { backgroundColor: COLORS.grayBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnTxt: { fontSize: 11, fontWeight: '700', color: COLORS.textMain },
  formGroup: { marginTop: 12 },
  label: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 13, color: COLORS.textMain, backgroundColor: '#FFF' },
  disabled: { backgroundColor: '#F3F4F6', color: COLORS.textMuted },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#FFFAEB', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  pendingBadgeIcon: { fontSize: 12, marginRight: 6, color: '#B45309' },
  pendingBadgeText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  changePasswordBtn: { backgroundColor: '#3B82F6', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  changePasswordBtnTxt: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  logoutBtn: { backgroundColor: '#EF4444', marginHorizontal: 14, marginBottom: 20, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ustpDarkBlue },
  modalCloseBtn: { fontSize: 24, color: '#9CA3AF' },
  modalBody: { padding: 16 },
  modalButtonGroup: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalCancelBtn: { backgroundColor: '#E5E7EB' },
  modalCancelBtnTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  modalSubmitBtn: { backgroundColor: '#10B981' },
  modalSubmitBtnTxt: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  modalBtnDisabled: { opacity: 0.6 },
});