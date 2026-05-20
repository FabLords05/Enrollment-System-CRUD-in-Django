/**
 * StudentDashboardScreen.tsx
 * 
 * Mobile student dashboard - mirrors web StudentDashboardPage.tsx
 * Displays enrollment status, financial balance, schedule, and curriculum load.
 */

import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  program_enrolled: string;
  year_level: string;
  enrollment_status: string;
  section?: number | null;
}

interface Section {
  id: number;
  name: string;
}

interface SubjectMaster {
  id: number;
  code: string;
  title?: string;
  name?: string;
  units?: number;
}

interface Offering {
  id: number;
  subject: number;
  subject_title?: string;
  subject_code?: string;
  subject_units?: number;
  section: number;
  days?: string;
  start_time?: string;
  end_time?: string;
}

interface DashboardSubject {
  id: number;
  code: string;
  title: string;
  units: number;
  days: string;
}

export default function StudentDashboardScreen() {
  const { user, loading: authLoading } = useContext(AuthContext) || { loading: true };
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Profile & Academic Data
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sectionName, setSectionName] = useState('Unassigned');
  const [mySubjects, setMySubjects] = useState<DashboardSubject[]>([]);

  // Calculated Stats
  const [totalUnits, setTotalUnits] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [activeDaysCount, setActiveDaysCount] = useState(0);

  useEffect(() => {
    // Only fetch when auth state is settled and we have a user
    if (!authLoading && user?.email) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, sectionsRes, offeringsRes, subjectsRes] = await Promise.all([
        api.get<StudentProfile[]>('students/'),
        api.get<Section[]>('sections/'),
        api.get<Offering[]>('offerings/'),
        api.get<SubjectMaster[]>('subjects/'),
      ]);

      // Identify the logged-in student
      const myData = studentsRes.data.find(
        s => s.email?.toLowerCase() === user?.email?.toLowerCase()
      );
      if (!myData) {
        setLoading(false);
        return;
      }
      setProfile(myData);

      // Resolve Section Name
      if (myData.section) {
        const sec = sectionsRes.data.find(s => s.id === myData.section);
        if (sec) setSectionName(sec.name);
      }

      // Resolve Offerings linked to the student's section
      const sectionOfferings = offeringsRes.data.filter(
        off => off.section === myData.section
      );
      const enrolledSubjects = sectionOfferings.map(off => {
        const subj = subjectsRes.data.find(s => s.id === off.subject);
        return {
          id: off.id,
          code: off.subject_code || subj?.code || `SUBJ-${off.subject}`,
          title: off.subject_title || subj?.title || subj?.name || 'Untitled Subject',
          units: off.subject_units ?? subj?.units ?? 0,
          days: off.days || '',
        };
      });
      setMySubjects(enrolledSubjects);

      const units = enrolledSubjects.reduce((sum, sub) => sum + sub.units, 0);
      setTotalUnits(units);

      // Calculate Financial Balance
      if (myData.enrollment_status === 'ASSESSED' || myData.enrollment_status === 'PAID') {
        const tuition = units * 400;
        const fixedFees = 3550; // Administrative + misc fees
        setOutstandingBalance(tuition + fixedFees);
      } else {
        setOutstandingBalance(0);
      }

      // Calculate Unique Days active in schedule
      const activeDays = new Set<string>();
      enrolledSubjects.forEach(s => {
        const d = (s.days || '').toUpperCase();
        if (d.includes('M')) activeDays.add('Mon');
        if (d.includes('T') && !d.includes('H')) activeDays.add('Tue');
        if (d.includes('W')) activeDays.add('Wed');
        if (d.includes('H')) activeDays.add('Thu');
        if (d.includes('F')) activeDays.add('Fri');
        if (d.includes('S')) activeDays.add('Sat');
      });
      setActiveDaysCount(activeDays.size);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Determine status badge styling
  const getStatusStyle = () => {
    switch (profile?.enrollment_status) {
      case 'ENROLLED':
        return { bg: COLORS.emeraldBg, text: COLORS.emerald };
      case 'ASSESSED':
        return { bg: COLORS.purpleBg, text: COLORS.purple };
      case 'PAID':
        return { bg: COLORS.purpleBg, text: COLORS.purple };
      default:
        return { bg: COLORS.ustpGoldLight, text: COLORS.ustpGold };
    }
  };

  const statusStyle = getStatusStyle();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.ustpBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>
            Hi, {profile?.first_name || 'Student'} 👋
          </Text>
          <Text style={styles.meta}>
            {sectionName} | SY 2025-2026
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.ustpBlue}
          />
        }
      >
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>EduTrack Student Console</Text>
          <Text style={styles.bannerText}>
            Real-time tracking of academic loads, financial ledgers, and enrollment status.
          </Text>
        </View>

        {/* Stats Grid - Row 1 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Loaded Subjects</Text>
            <Text style={styles.statValue}>{mySubjects.length} Classes</Text>
            <Text style={styles.statSub}>{totalUnits} Units loaded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Account Balance</Text>
            <Text style={[styles.statValue, { color: outstandingBalance > 0 ? COLORS.red : COLORS.emerald }]}>
              ₱{outstandingBalance.toLocaleString()}
            </Text>
            <Text style={styles.statSub}>
              {outstandingBalance > 0 ? 'Pending payment' : 'All cleared'}
            </Text>
          </View>
        </View>

        {/* Stats Grid - Row 2 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Schedule Matrix</Text>
            <Text style={[styles.statValue, { color: COLORS.purple }]}>
              {activeDaysCount} Days
            </Text>
            <Text style={styles.statSub}>Weekly lecture timeline</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Portal Status</Text>
            <Text style={[styles.statValue, { color: statusStyle.text }]}>
              {profile?.enrollment_status || 'ADVISING'}
            </Text>
            <Text style={styles.statSub}>Processing lifecycle stage</Text>
          </View>
        </View>

        {/* Registered Curriculum Load Section */}
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Registered Curriculum Load</Text>

          {mySubjects.length > 0 ? (
            mySubjects.map((subject, idx) => (
              <View
                key={subject.id}
                style={[
                  styles.subjectRow,
                  idx < mySubjects.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.grayBg },
                ]}
              >
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>{subject.code}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={styles.subjectTitle} numberOfLines={1}>
                    {subject.title}
                  </Text>
                  <Text style={styles.subjectDays}>{subject.days || 'TBA'}</Text>
                </View>
                <Text style={styles.unitsTag}>{subject.units}u</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No subjects enrolled yet.</Text>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: COLORS.g50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top Header
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ustpDarkBlue,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Scroll View
  scrollView: {
    flex: 1,
    paddingHorizontal: 14,
  },

  // Welcome Banner
  banner: {
    backgroundColor: COLORS.ustpDarkBlue,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  bannerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    lineHeight: 18,
  },

  // Stats Grid
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ustpBlue,
    marginTop: 6,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Curriculum Load Card
  cardBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 14,
    marginBottom: 20,
  },
  cardBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.ustpDarkBlue,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayBg,
    paddingBottom: 10,
    marginBottom: 12,
  },

  // Subject Rows
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  codeTag: {
    backgroundColor: COLORS.blueBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  codeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.ustpBlue,
  },
  subjectTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  subjectDays: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unitsTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  // Empty State
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});