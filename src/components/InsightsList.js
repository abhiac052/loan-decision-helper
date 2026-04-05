import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const severityBg = {
  high: COLORS.red + '10',
  medium: COLORS.orange + '10',
  low: COLORS.green + '10',
  tip: COLORS.primary + '10',
};

const InsightsList = ({ insights }) => {
  const { colors } = useApp();
  if (!insights || insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>🧠 Smart Insights</Text>
      {insights.map((item, i) => (
        <View key={i} style={[styles.item, { backgroundColor: severityBg[item.severity] || severityBg.tip }]}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.text, { color: colors.text }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  title: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: SPACING.sm + 4, borderRadius: RADIUS.sm, marginBottom: SPACING.xs + 2,
  },
  icon: { fontSize: 16, marginRight: SPACING.sm, marginTop: 1 },
  text: { fontSize: 13, fontWeight: '500', lineHeight: 20, flex: 1 },
});

export default React.memo(InsightsList);
