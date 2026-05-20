import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];
const SLOT_H = 40;
const DAY_WIDTH = 420 / 6; // 70px per day column

// Helper: Convert TimeField (HH:MM:SS) to pixel offset from 7:00 AM
const timeToPixels = (timeString: string): number => {
  if (!timeString) return 0;
  const [hoursStr, minutesStr] = timeString.split(':').slice(0, 2);
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const startHour = 7; // Grid starts at 7:00 AM
  const hoursFromStart = (hours - startHour) + (minutes / 60);
  return Math.max(0, hoursFromStart * SLOT_H);
};

// Helper: Parse day string (e.g., "MWF" or "M, W, F") and return day indices
const parseDays = (daysString: string): number[] => {
  // M=0, T=1, W=2, H=3, F=4, S=5
  const dayMap: { [key: string]: number } = { M: 0, T: 1, W: 2, H: 3, F: 4, S: 5 };
  const dayIndices: number[] = [];
  
  // Handle both "MWF" and "M, W, F" formats
  const cleaned = daysString.replace(/,\s*/g, '').toUpperCase();
  for (const char of cleaned) {
    if (dayMap[char] !== undefined && !dayIndices.includes(dayMap[char])) {
      dayIndices.push(dayMap[char]);
    }
  }
  return dayIndices.sort((a, b) => a - b);
};

export default function StudentScheduleScreen() {
  const auth = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [schedule, setSchedule] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [stu, off] = await Promise.all([api.get('students/'), api.get('offerings/')]);
        console.log('User Auth:', auth?.user);
        console.log('First Student:', stu.data[0]);
        console.log('Sample Offering:', off.data[0]);
        
        const userEmail = auth?.user?.email?.toLowerCase();
        const active = stu.data.find((s: any) => {
          const studentEmail = (s.email || s.user?.email)?.toLowerCase?.();
          return studentEmail === userEmail;
        });
        
        if (!active) {
          console.warn('Student profile not found in API response');
          setNotFound(true);
          return;
        }
        setSchedule(off.data.filter((o: any) => o.section === active.section));
      } catch (err) {
        console.error('Schedule fetch error:', err);
      }
    })();
  }, []);

  if (notFound) {
    return (
      <View style={[styles.centerBox, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.centerTitle}>Schedule Not Available</Text>
        <Text style={styles.centerDesc}>We could not locate your student profile. Please verify your account and try again.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 14 }}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.btn, view === 'list' && styles.btnActive]} onPress={() => setView('list')}><Text style={styles.btnText}>☰ List View</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, view === 'grid' && styles.btnActive]} onPress={() => setView('grid')}><Text style={styles.btnText}>⊞ Grid Grid</Text></TouchableOpacity>
      </View>

      <ScrollView>
        {view === 'list' ? (
          <View style={styles.card}>
            {schedule.length === 0 ? (
              <Text style={styles.emptyText}>No classes scheduled for your section.</Text>
            ) : (
              schedule.map((o: any, idx) => {
                const subjectCode = o.subject_code || o.subject?.code || 'N/A';
                const subjectName = o.subject_title || o.subject?.name || 'Unknown Subject';
                const startTime = o.start_time || o.st || 'TBA';
                const endTime = o.end_time || o.et || 'TBA';
                return (
                  <View key={idx} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.code}>{subjectCode}</Text>
                      <Text style={styles.name}>{subjectName}</Text>
                      <Text style={styles.time}>📅 {o.days || 'TBA'} ({startTime} - {endTime})</Text>
                    </View>
                    <Text style={styles.room}>{o.room || 'TBA'}</Text>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <ScrollView horizontal>
            <View style={styles.gridContainer}>
              <View style={styles.gridHeader}><Text style={styles.timeLabel}>Time</Text>{DAYS.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}</View>
              <View style={{ height: TIMES.length * SLOT_H, position: 'relative' }}>
                {/* Grid background lines */}
                {TIMES.map((t, i) => (
                  <View key={`line-${t}`} style={[styles.gridRowLine, { top: i * SLOT_H }]}><Text style={styles.rowTimeText}>{t}</Text></View>
                ))}
                
                {/* Schedule blocks */}
                {schedule.map((offering: any, idx) => {
                  const startTime = offering.start_time || offering.st || 'TBA';
                  const endTime = offering.end_time || offering.et || 'TBA';
                  const daysString = offering.days || '';
                  
                  if (startTime === 'TBA' || endTime === 'TBA') return null;
                  
                  const topPixel = timeToPixels(startTime);
                  const bottomPixel = timeToPixels(endTime);
                  const blockHeight = Math.max(SLOT_H / 2, bottomPixel - topPixel);
                  const dayIndices = parseDays(daysString);
                  const subjectCode = offering.subject_code || offering.subject?.code || 'N/A';
                  const room = offering.room || 'TBA';
                  
                  return dayIndices.map((dayIdx) => (
                    <View
                      key={`block-${idx}-${dayIdx}`}
                      style={[
                        styles.scheduleBlock,
                        {
                          top: topPixel,
                          height: blockHeight,
                          left: 40 + dayIdx * DAY_WIDTH + 2,
                          width: DAY_WIDTH - 4,
                        },
                      ]}
                    >
                      <Text style={styles.blockCode}>{subjectCode}</Text>
                      <Text style={styles.blockRoom}>{room}</Text>
                    </View>
                  ));
                })}
              </View>
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBox: { padding: 24, backgroundColor: COLORS.blueBg, margin: 20, borderRadius: 12 },
  centerTitle: { fontSize: 16, fontWeight: '800', color: '#2B6CB0', marginBottom: 6 },
  centerDesc: { fontSize: 12, color: '#4A5568', textAlign: 'center', lineHeight: 18 },
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
  rowTimeText: { width: 40, fontSize: 9, color: '#9CA3AF', paddingLeft: 4, paddingTop: 2 },
  emptyText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
  scheduleBlock: {
    position: 'absolute',
    backgroundColor: COLORS.ustpBlue,
    opacity: 0.85,
    borderRadius: 6,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ustpDarkBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockCode: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  blockRoom: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
  },
});