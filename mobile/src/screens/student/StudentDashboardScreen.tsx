import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';
import StatCard from '../../components/StatCard';

export default function StudentDashboardScreen() {
  const auth = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>({ profile: null, secName: 'Unassigned', subjects: [], totalUnits: 0, balance: 0, activeDays: 0 });

  const loadMetrics = async () => {
    try {
      const [stu, sec, sub] = await Promise.all([api.get('students/'), api.get('sections/'), api.get('subjects/')]);
      const active = stu.data.find((s: any) => s.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
      if (!active) return;

      const secObj = sec.data.find((s: any) => s.id === active.section);
      const subjectsFiltered = sub.data.filter((s: any) => s.secId === active.section);
      const unitsCount = subjectsFiltered.reduce((sum: number, s: any) => sum + s.units, 0);
      
      setData({
        profile: active,
        secName: secObj ? (secObj.name || secObj.nm) : 'Unassigned',
        subjects: subjectsFiltered,
        totalUnits: unitsCount,
        balance: active.enrollment_status === 'ASSESSED' ? (unitsCount * 400) + 3550 : 0,
        activeDays: new Set(subjectsFiltered.map((s: any) => s.days)).size
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadMetrics(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadMetrics(); setRefreshing(false); };

  const statusStyle = data.profile?.enrollment_status === 'ENROLLED' ? { text: COLORS.emerald, bg: COLORS.emeraldBg } :
                      data.profile?.enrollment_status === 'ASSESSED' ? { text: COLORS.purple, bg: COLORS.purpleBg } : { text: COLORS.ustpGold, bg: '#FFFBEB' };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Hi, {data.profile?.first_name || 'Student'} 👋</Text>
          <Text style={styles.meta}>{data.secName} | SY 2025-2026</Text>
        </View>
      </View>

      <ScrollView style={{ padding: 14 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.ustpBlue} />}>
        <View style={[styles.banner, { backgroundColor: COLORS.ustpDarkBlue }]}>
          <Text style={styles.bannerTitle}>EduTrack Student Console</Text>
          <Text style={styles.bannerText}>Real-time tracking of academic loads, financial ledgers, and structural clear status windows.</Text>
        </View>

        <View style={styles.row}>
          <StatCard label="Loaded Subjects" value={`${data.subjects.length} Classes`} sub={`${data.totalUnits} Units loaded`} textColor={COLORS.ustpBlue} />
          <StatCard label="Account Balance" value={`₱${data.balance.toLocaleString()}`} sub={data.balance > 0 ? "Pending payment" : "All cleared"} textColor={data.balance > 0 ? COLORS.red : COLORS.emerald} />
        </View>

        <View style={[styles.row, { marginTop: 12 }]}>
          <StatCard label="Schedule Matrix" value={`${data.activeDays} Days`} sub="Weekly lecture timeline" textColor={COLORS.purple} />
          <StatCard label="Portal Status" value={data.profile?.enrollment_status || 'ADVISING'} sub="Processing lifecycle stage" textColor={statusStyle.text} bgColor={statusStyle.bg} />
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Registered Curriculum Load</Text>
          {data.subjects.map((s: any) => (
            <View key={s.id} style={styles.subRow}>
              <Text style={styles.subCode}>{s.nm.split(' - ')[0]}</Text>
              <Text numberOfLines={1} style={styles.subName}>{s.nm.split(' - ')[1] || s.nm}</Text>
              <Text style={styles.subUnits}>{s.units}u</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topHeader: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: COLORS.border },
  greeting: { fontSize: 16, fontWeight: '800', color: COLORS.ustpDarkBlue },
  meta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  banner: { padding: 16, borderRadius: 12, marginBottom: 14 },
  bannerTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  bannerText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 12 },
  cardBox: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginTop: 14, marginBottom: 30 },
  cardBoxTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ustpDarkBlue, borderBottomWidth: 1, borderColor: COLORS.grayBg, paddingBottom: 6, marginBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  subCode: { fontSize: 10, fontWeight: '700', color: COLORS.ustpBlue, backgroundColor: COLORS.blueBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  subName: { flex: 1, fontSize: 12, color: COLORS.textMain, marginLeft: 8 },
  subUnits: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted }
});