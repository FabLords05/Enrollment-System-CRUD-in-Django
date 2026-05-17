import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  textColor?: string;
  bgColor?: string;
}

export default function StatCard({ label, value, sub, textColor = COLORS.textMain, bgColor = '#FFF' }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  value: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  sub: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 }
});