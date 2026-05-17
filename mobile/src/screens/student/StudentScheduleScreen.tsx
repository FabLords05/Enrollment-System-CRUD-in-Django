import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];
const SLOT_H = 40;

export default function StudentScheduleScreen() {
  const auth = useContext(AuthContext);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    (async () => {
      const [stu, sub] = await Promise.all([api.get('students/'), api.get('subjects/')]);
      const active = stu.data.find((s: any) => s.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
      if (active) setSchedule(sub.data.filter((s: any) => s.secId === active.section));
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 14 }}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.btn, view === 'list' && styles.btnActive]} onPress={() => setView('list')}><Text style={styles.btnText}>☰ List View</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, view === 'grid' && styles.btnActive]} onPress={() => setView('grid')}><Text style={styles.btnText}>⊞ Grid Grid</Text></TouchableOpacity>
      </View>

      <ScrollView>
        {view === 'list' ? (
          <View style={styles.card}>
            {schedule.map((s: any, idx) => (
              <View key={idx} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.code}>{s.nm.split(' - ')[0]}</Text>
                  <Text style={styles.name}>{s.nm.split(' - ')[1] || s.nm}</Text>
                  <Text style={styles.time}>📅 {s.days} ({s.st} - {s.et})</Text>
                </View>
                <Text style={styles.room}>{s.room}</Text>
              </View>
            ))}
          </View>
        ) : (
          <ScrollView horizontal>
            <View style={styles.gridContainer}>
              <View style={styles.gridHeader}><Text style={styles.timeLabel}>Time</Text>{DAYS.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}</View>
              <View style={{ height: TIMES.length * SLOT_H, position: 'relative' }}>
                {TIMES.map((t, i) => (
                  <View key={t} style={[styles.gridRowLine, { top: i * SLOT_H }]}><Text style={styles.rowTimeText}>{t}</Text></View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', backgroundColor: '#E5E7EB', padding: 4, borderRadius: 8, marginBottom: 12 },
  btn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  btnActive: { backgroundColor: '#FFF' },
  btnText: { fontSize: 12, fontWeight: '700', color: COLORS.ustpDarkBlue },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  code: { fontSize: 12, fontWeight: '700', color: COLORS.ustpBlue },
  name: { fontSize: 13, color: COLORS.textMain, marginVertical: 2 },
  time: { fontSize: 11, color: COLORS.textMuted },
  room: { fontSize: 12, fontWeight: '700', color: COLORS.textMain },
  gridContainer: { width: 460, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  gridHeader: { flexDirection: 'row', backgroundColor: COLORS.grayBg, borderBottomWidth: 1, borderColor: COLORS.border },
  timeLabel: { width: 40, textAlign: 'center', fontSize: 10, color: COLORS.textMuted, paddingVertical: 6 },
  dayLabel: { width: 420/6, textAlign: 'center', fontSize: 11, fontWeight: '700', color: COLORS.ustpDarkBlue, paddingVertical: 6 },
  gridRowLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#F3F4F6', height: SLOT_H },
  rowTimeText: { width: 40, fontSize: 9, color: '#9CA3AF', paddingLeft: 4, paddingTop: 2 }
});