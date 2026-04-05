import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/calculations';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const InterestShock = ({ principal, totalPayment, totalInterest }) => {
  const { colors, darkMode } = useApp();
  const multiplier = (totalPayment / parseFloat(principal)).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1C1017' : '#FEF2F2', borderColor: COLORS.red + '30' }]}>
      <Text style={[styles.title, { color: COLORS.red }]}>💸 The Real Cost</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>You borrow</Text>
          <Text style={[styles.value, { color: COLORS.primary }]}>{formatINR(principal)}</Text>
        </View>
        <Text style={[styles.arrow, { color: COLORS.red }]}>→</Text>
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>You pay back</Text>
          <Text style={[styles.value, { color: COLORS.red }]}>{formatINR(totalPayment)}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: COLORS.red + '15' }]}>
        <Text style={[styles.badgeText, { color: COLORS.red }]}>
          {formatINR(totalInterest)} extra as interest ({multiplier}x your loan)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1,
  },
  title: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  col: { flex: 1 },
  label: { fontSize: 11, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  arrow: { fontSize: 24, fontWeight: '700', marginHorizontal: SPACING.sm },
  badge: { marginTop: SPACING.sm, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

export default React.memo(InterestShock);
