import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/colors';

import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import StudentSubjectsScreen from '../screens/student/StudentSubjectsScreen';
import StudentScheduleScreen from '../screens/student/StudentScheduleScreen';
import StudentFinanceScreen from '../screens/student/StudentFinanceScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

export default function StudentTabNavigator() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'dashboard' && <StudentDashboardScreen />}
        {activeTab === 'subjects'  && <StudentSubjectsScreen />}
        {activeTab === 'schedule'  && <StudentScheduleScreen />}
        {activeTab === 'finance'   && <StudentFinanceScreen />}
        {activeTab === 'profile'   && <StudentProfileScreen />}
      </View>

      <View style={styles.tabTray}>
        {['dashboard', 'subjects', 'schedule', 'finance', 'profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1, 4)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1 },
  tabTray: { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderColor: COLORS.border, height: 56, paddingBottom: 4 },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabItemActive: { borderTopWidth: 2, borderTopColor: COLORS.ustpBlue },
  tabLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  tabLabelActive: { color: COLORS.ustpBlue }
});