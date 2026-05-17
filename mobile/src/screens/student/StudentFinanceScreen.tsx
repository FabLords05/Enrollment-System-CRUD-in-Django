import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosSetup';
import { COLORS } from '../../constants/colors';

export default function StudentFinanceScreen() {
  const auth = useContext(AuthContext);
  const [state, setState] = useState({ loading: true, status: 'ADVISING', units: 0, balance: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [stu, sub] = await Promise.all([api.get('students/'), api.get('subjects/')]);
        const active = stu.data.find((s: any) => s.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
        if (!active) return;

        const filtered = sub.data.filter((s: any) => s.secId === active.section);
        const unitsCount = filtered.reduce((sum: number, s: any) => sum + s.units, 0);
        setState({
          loading: false,
          status: active.enrollment_status,
          units: unitsCount,
          balance: active.enrollment_status === 'ASSESSED' ? (unitsCount * 400) + 3550 : 0
        });
      } catch (e) { console.error(e); }
    })();
  }, []);

  if (state.status === 'ADVISING') {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.centerTitle}>Assessment Pending ⏳</Text>
        <Text style={styles.centerDesc}>Your course loads are undergoing verification checks by the Registrar. Fee breakdowns will appear here upon authorization approval windows.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 14, backgroundColor: '#F9FAFB' }}>
      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceLabel}>Outstanding Balance Statement</Text>
        <Text style={styles.invoiceAmount}>₱{state.balance.toLocaleString()}</Text>
        <Text style={styles.invoiceSub}>Clearance Status: {state.status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fee Breakdown Checklist</Text>
        <View style={styles.itemRow}><Text style={styles.itemName}>Tuition Credit Fees ({state.units} u × ₱400)</Text><Text style={styles.itemVal}>₱{(state.units * 400).toLocaleString()}</Text></View>
        <View style={styles.itemRow}><Text style={styles.itemName}>Miscellaneous Registration Fees</Text><Text style={styles.itemVal}>₱1,500</Text></View>
        <View style={styles.itemRow}><Text style={styles.itemName}>Laboratory Access Costs</Text><Text style={styles.itemVal}>₱1,200</Text></View>
        <View style={styles.itemRow}><Text style={styles.itemName}>Student Welfare Funds</Text><Text style={styles.itemVal}>₱850</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.blueBg, margin: 20, borderRadius: 12 },
  centerTitle: { fontSize: 16, fontWeight: '800', color: '#2B6CB0', marginBottom: 6 },
  centerDesc: { fontSize: 12, color: '#4A5568', textAlign: 'center', lineHeight: 18 },
  invoiceCard: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 20, alignItems: 'center', marginBottom: 14 },
  invoiceLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  invoiceAmount: { fontSize: 26, fontWeight: '900', color: COLORS.red, marginVertical: 4 },
  invoiceSub: { fontSize: 11, fontWeight: '700', color: COLORS.purple },
  card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.ustpDarkBlue, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  itemName: { fontSize: 12, color: COLORS.textMain },
  itemVal: { fontSize: 12, fontWeight: '700', color: COLORS.textMain }
});