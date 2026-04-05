import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getHistory, deleteHistoryItem, clearHistory } from '../utils/storage';
import { formatINR } from '../utils/calculations';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn } from '../utils/animations';

const typeMeta = {
  EMI: { icon: '🧮', color: COLORS.primary },
  Comparison: { icon: '⚖️', color: COLORS.green },
  Affordability: { icon: '💰', color: COLORS.orange },
  Prepayment: { icon: '⚡', color: '#EC4899' },
  SavingsPlan: { icon: '🎯', color: '#06B6D4' },
};

import { useDialog } from '../context/DialogContext';

const HistoryScreen = () => {
  const { colors, darkMode } = useApp();
  const dialog = useDialog();
  const [history, setHistory] = useState([]);

  useFocusEffect(useCallback(() => {
    getHistory().then(setHistory);
  }, []));

  const handleDelete = (id) => {
    dialog.confirm({
      title: 'Delete',
      message: 'Remove this calculation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        await deleteHistoryItem(id);
        setHistory(h => h.filter(i => i.id !== id));
      },
    });
  };

  const handleClear = () => {
    dialog.confirm({
      title: 'Clear All',
      message: 'Delete all saved calculations? This cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Keep',
      destructive: true,
      onConfirm: async () => {
        await clearHistory();
        setHistory([]);
      },
    });
  };

  const renderItem = ({ item, index }) => {
    const meta = typeMeta[item.type] || typeMeta.EMI;
    return (
      <FadeIn delay={index * 80} slideUp={20}>
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => handleDelete(item.id)}
          style={[styles.card, { backgroundColor: colors.card }, darkMode && { borderWidth: 1, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: meta.color + '15' }]}>
              <Text style={styles.typeIcon}>{meta.icon}</Text>
              <Text style={[styles.typeText, { color: meta.color }]}>{item.type}</Text>
            </View>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
          {item.type === 'EMI' && (
            <View>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {formatINR(item.amount)} @ {item.rate}% for {item.tenure} {item.tenureType}
              </Text>
              <Text style={[styles.emi, { color: COLORS.primary }]}>EMI: {formatINR(item.emi)}</Text>
            </View>
          )}
          {item.type === 'Comparison' && (
            <View>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {item.loanCount || 2} loans compared
              </Text>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {item.r1 && `A: ${formatINR(item.r1.emi)}/mo`}{item.r2 && `  B: ${formatINR(item.r2.emi)}/mo`}{item.r3 && `  C: ${formatINR(item.r3.emi)}/mo`}{item.r4 && `  D: ${formatINR(item.r4.emi)}/mo`}
              </Text>
            </View>
          )}
          {item.type === 'Affordability' && (
            <View>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>Salary: {formatINR(item.salary)}</Text>
              <Text style={[styles.emi, { color: item.riskColor }]}>{item.risk} — Safe EMI: {formatINR(item.safeEMI)}</Text>
            </View>
          )}
          {item.type === 'Prepayment' && (
            <View>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {formatINR(item.amount)} @ {item.rate}% | Extra: {formatINR(item.extraYearly)}/yr
              </Text>
              <Text style={[styles.emi, { color: COLORS.green }]}>Saves {formatINR(item.interestSaved)} | {item.monthsSaved} months</Text>
            </View>
          )}
          {item.type === 'SavingsPlan' && (
            <View>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                {formatINR(item.amount)} @ {item.rate}% | Goal: {item.targetTenure} {item.tenureType}
              </Text>
              <Text style={[styles.emi, { color: '#06B6D4' }]}>Save {formatINR(item.interestSaved)} in interest</Text>
            </View>
          )}
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Long press to delete</Text>
        </TouchableOpacity>
      </FadeIn>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {history.length > 0 && (
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Text style={[styles.count, { color: colors.textSecondary }]}>{history.length} saved</Text>
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearBtn}>
            <Text style={styles.clearIcon}>🗑️</Text>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={history}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <FadeIn delay={100} slideUp={30}>
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved calculations</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your saved EMI calculations will appear here</Text>
            </View>
          </FadeIn>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  count: { fontSize: 13, fontWeight: '500' },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: COLORS.red + '12',
  },
  clearIcon: { fontSize: 13, marginRight: 5 },
  clearText: { fontSize: 13, fontWeight: '600', color: COLORS.red },
  list: { padding: SPACING.lg, paddingBottom: 80 },
  card: {
    padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.md,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeIcon: { fontSize: 14, marginRight: 4 },
  typeText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12 },
  detail: { fontSize: 13, marginTop: 2, lineHeight: 19 },
  emi: { fontSize: 17, fontWeight: '700', marginTop: 6 },
  hint: { fontSize: 10, marginTop: SPACING.sm, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 120 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: SPACING.md },
  emptyText: { fontSize: 14, marginTop: 6 },
});

export default HistoryScreen;
