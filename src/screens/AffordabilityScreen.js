import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { getAffordability, formatINR, validateNumber, formatAmountInput, stripCommas } from '../utils/calculations';
import { saveCalculation } from '../utils/storage';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn, ScaleIn } from '../utils/animations';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Card from '../components/Card';
import AdBanner from '../components/AdBanner';

const riskGradients = {
  'Low Risk': ['#10B981', '#059669'],
  'Medium Risk': ['#F59E0B', '#F97316'],
  'High Risk': ['#EF4444', '#DC2626'],
};

import { useDialog } from '../context/DialogContext';

const AffordabilityScreen = () => {
  const { colors } = useApp();
  const dialog = useDialog();
  const [salary, setSalary] = useState('');
  const [expenses, setExpenses] = useState('');
  const [existingEMIs, setExistingEMIs] = useState('');
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  const calculate = useCallback(() => {
    if (!salary) { dialog.error('Missing Input', 'Please enter your monthly salary'); return; }
    const rawSalary = stripCommas(salary);
    if (parseFloat(rawSalary) <= 0) { dialog.error('Invalid', 'Salary must be greater than 0'); return; }
    setResult(getAffordability(rawSalary, stripCommas(expenses), stripCommas(existingEMIs)));
    setResultKey(k => k + 1);
  }, [salary, expenses, existingEMIs]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    await saveCalculation({ type: 'Affordability', salary: stripCommas(salary), expenses: stripCommas(expenses), existingEMIs: stripCommas(existingEMIs), ...result });
    dialog.success('Saved!', 'Calculation saved to history');
  }, [result, salary, expenses, existingEMIs]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = `Loan Affordability Check\n\nMonthly Salary: ${formatINR(stripCommas(salary))}\nExpenses: ${formatINR(stripCommas(expenses))}\nExisting EMIs: ${formatINR(stripCommas(existingEMIs))}\n\nSafe EMI: ${formatINR(result.safeEMI)}\nMax EMI: ${formatINR(result.maxEMI)}\nRisk Level: ${result.risk}\n\n— Loan Decision Helper`;
    await Share.share({ message: text });
  }, [result, salary, expenses, existingEMIs]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <InputField label="Monthly Salary (₹)" value={salary} onChangeText={v => setSalary(formatAmountInput(v))} placeholder="e.g. 80,000" suffix="₹" />
        <InputField label="Monthly Expenses (₹)" value={expenses} onChangeText={v => setExpenses(formatAmountInput(v))} placeholder="e.g. 30,000" suffix="₹" />
        <InputField label="Existing EMIs (₹)" value={existingEMIs} onChangeText={v => setExistingEMIs(formatAmountInput(v))} placeholder="e.g. 10,000" suffix="₹" />

        <Button title="Check Affordability" onPress={calculate} />

        {result && (
          <View key={resultKey}>
            <ScaleIn delay={0}>
              <LinearGradient
                colors={riskGradients[result.risk] || riskGradients['Medium Risk']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.riskCard}
              >
                <Text style={styles.riskLabel}>Risk Level</Text>
                <Text style={styles.riskValue}>{result.risk}</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(result.usedRatio, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{result.usedRatio}% of income committed</Text>
              </LinearGradient>
            </ScaleIn>

            <View style={styles.grid}>
              {[
                { icon: '💵', label: 'Disposable Income', value: formatINR(result.disposable), color: COLORS.primary },
                { icon: '✅', label: 'Safe EMI (≤30%)', value: formatINR(result.safeEMI), color: COLORS.green },
                { icon: '⚠️', label: 'Max Possible EMI', value: formatINR(result.maxEMI), color: COLORS.orange },
              ].map((stat, i) => (
                <FadeIn key={i} delay={200 + i * 120} slideUp={20}>
                  <Card style={styles.statCard} delay={250 + i * 120}>
                    <View style={styles.statHeader}>
                      <Text style={styles.statIcon}>{stat.icon}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                    </View>
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  </Card>
                </FadeIn>
              ))}
            </View>

            <FadeIn delay={600}>
              <Card delay={650}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>💡 Tips</Text>
                {result.risk === 'Low Risk' && <Text style={[styles.tip, { color: colors.textSecondary }]}>Great financial health! You can comfortably take a new loan within the safe EMI range.</Text>}
                {result.risk === 'Medium Risk' && <Text style={[styles.tip, { color: colors.textSecondary }]}>Be cautious. Try to keep new EMIs below {formatINR(result.safeEMI)} to stay safe.</Text>}
                {result.risk === 'High Risk' && <Text style={[styles.tip, { color: colors.textSecondary }]}>Your commitments are high. Avoid new loans or try to reduce existing expenses first.</Text>}
              </Card>
            </FadeIn>

            <FadeIn delay={750}>
              <View style={styles.actionRow}>
                <Button title="💾 Save" onPress={handleSave} variant="outline" style={styles.actionBtn} />
                <Button title="📤 Share" onPress={handleShare} variant="outline" style={styles.actionBtn} />
              </View>
            </FadeIn>
          </View>
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 80 },
  riskCard: {
    padding: SPACING.lg, borderRadius: RADIUS.md,
    marginTop: SPACING.md, marginBottom: SPACING.md,
  },
  riskLabel: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  riskValue: { fontSize: 26, fontWeight: '800', color: '#FFF', marginVertical: SPACING.xs },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginTop: SPACING.xs },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFF' },
  progressText: { fontSize: 12, marginTop: 8, color: 'rgba(255,255,255,0.9)' },
  grid: { gap: SPACING.sm },
  statCard: { paddingVertical: SPACING.lg, marginBottom: 0 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statIcon: { fontSize: 18, marginRight: 8 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  statValue: { fontSize: 24, fontWeight: '800' },
  tipTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.xs },
  tip: { fontSize: 14, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
});

export default AffordabilityScreen;
