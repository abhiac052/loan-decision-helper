import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useDialog } from '../context/DialogContext';
import { formatINR, validateNumber, formatAmountInput, stripCommas } from '../utils/calculations';
import { planSavings } from '../utils/savingsPlanner';
import { saveCalculation } from '../utils/storage';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn, ScaleIn } from '../utils/animations';
import InputField from '../components/InputField';
import SegmentToggle from '../components/SegmentToggle';
import Button from '../components/Button';
import Card from '../components/Card';
import AdBanner from '../components/AdBanner';

const SavingsPlannerScreen = () => {
  const { colors } = useApp();
  const dialog = useDialog();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [currentTenure, setCurrentTenure] = useState('');
  const [targetTenure, setTargetTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  const calculate = useCallback(() => {
    if (!amount || !rate || !currentTenure || !targetTenure) {
      dialog.error('Missing Input', 'Please fill all fields'); return;
    }
    const currentM = tenureType === 'years' ? parseInt(currentTenure) * 12 : parseInt(currentTenure);
    const targetM = tenureType === 'years' ? parseInt(targetTenure) * 12 : parseInt(targetTenure);
    if (targetM >= currentM) {
      dialog.error('Invalid', 'Target tenure must be shorter than current tenure'); return;
    }
    if (parseFloat(stripCommas(amount)) <= 0 || parseFloat(rate) <= 0) {
      dialog.error('Invalid', 'Amount and rate must be greater than 0'); return;
    }
    const r = planSavings(stripCommas(amount), rate, currentM, targetM);
    if (!r) { dialog.error('Error', 'Could not calculate savings plan'); return; }
    setResult(r);
    setResultKey(k => k + 1);
  }, [amount, rate, currentTenure, targetTenure, tenureType]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    await saveCalculation({ type: 'SavingsPlan', amount: stripCommas(amount), rate, currentTenure, targetTenure, tenureType, ...result });
    dialog.success('Saved!', 'Savings plan saved to history');
  }, [result, amount, rate, currentTenure, targetTenure, tenureType]);

  const fmtTenure = (m) => {
    const y = Math.floor(m / 12), mo = m % 12;
    return y > 0 ? (mo > 0 ? `${y}y ${mo}m` : `${y} years`) : `${mo} months`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            🎯 Set a goal to pay off your loan faster. We'll tell you exactly how.
          </Text>
        </Card>

        <InputField label="Loan Amount" value={amount} onChangeText={v => setAmount(formatAmountInput(v))} placeholder="e.g. 30,00,000" suffix="₹" />
        <InputField label="Interest Rate (per annum)" value={rate} onChangeText={v => setRate(validateNumber(v))} placeholder="e.g. 8.5" suffix="%" />
        <SegmentToggle
          options={[{ label: 'Years', value: 'years' }, { label: 'Months', value: 'months' }]}
          selected={tenureType} onSelect={setTenureType}
        />
        <InputField label={`Current Tenure (${tenureType})`} value={currentTenure} onChangeText={v => setCurrentTenure(validateNumber(v))} placeholder={tenureType === 'years' ? 'e.g. 20' : 'e.g. 240'} />
        <InputField label={`Target Tenure (${tenureType})`} value={targetTenure} onChangeText={v => setTargetTenure(validateNumber(v))} placeholder={tenureType === 'years' ? 'e.g. 12' : 'e.g. 144'} />

        <Button title="Plan My Savings" onPress={calculate} />

        {result && (
          <View key={resultKey}>
            <ScaleIn delay={0}>
              <LinearGradient colors={COLORS.gradient2} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
                <Text style={styles.heroLabel}>You can save</Text>
                <Text style={styles.heroValue}>{formatINR(result.interestSaved)}</Text>
                <Text style={styles.heroSub}>in interest by finishing {fmtTenure(result.monthsSaved)} earlier</Text>
              </LinearGradient>
            </ScaleIn>

            <FadeIn delay={200}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Two ways to achieve this:</Text>
            </FadeIn>

            <FadeIn delay={300}>
              <Card delay={350}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionIcon}>📈</Text>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Option 1: Increase EMI</Text>
                </View>
                <View style={styles.optionRow}>
                  <View style={styles.optionCol}>
                    <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>Current EMI</Text>
                    <Text style={[styles.optionValue, { color: colors.textSecondary }]}>{formatINR(result.currentEMI)}</Text>
                  </View>
                  <Text style={[styles.optionArrow, { color: COLORS.green }]}>→</Text>
                  <View style={styles.optionCol}>
                    <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>New EMI</Text>
                    <Text style={[styles.optionValue, { color: COLORS.primary }]}>{formatINR(result.targetEMI)}</Text>
                  </View>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: COLORS.primary + '12' }]}>
                  <Text style={[styles.diffText, { color: COLORS.primary }]}>+{formatINR(result.emiIncrease)}/month extra</Text>
                </View>
              </Card>
            </FadeIn>

            <FadeIn delay={450}>
              <Card delay={500}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionIcon}>💰</Text>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Option 2: Yearly Prepayment</Text>
                </View>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Keep your current EMI of {formatINR(result.currentEMI)} and make a lump sum payment every year:
                </Text>
                <View style={[styles.prepayBadge, { backgroundColor: COLORS.green + '12' }]}>
                  <Text style={[styles.prepayValue, { color: COLORS.green }]}>{formatINR(result.yearlyPrepayment)}</Text>
                  <Text style={[styles.prepayLabel, { color: COLORS.green }]}>per year</Text>
                </View>
              </Card>
            </FadeIn>

            <FadeIn delay={600}>
              <Card delay={650}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Interest Comparison</Text>
                <CompareRow label="Current Plan" value={formatINR(result.currentInterest)} color={COLORS.red} textColor={colors.textSecondary} />
                <CompareRow label="With Goal" value={formatINR(result.targetInterest)} color={COLORS.green} textColor={colors.textSecondary} />
                <View style={[styles.savingsBadge, { backgroundColor: COLORS.green + '10' }]}>
                  <Text style={[styles.savingsText, { color: COLORS.green }]}>💰 You save {formatINR(result.interestSaved)}</Text>
                </View>
              </Card>
            </FadeIn>

            <FadeIn delay={750}>
              <Button title="💾 Save Plan" onPress={handleSave} variant="outline" />
            </FadeIn>
          </View>
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const CompareRow = ({ label, value, color, textColor }) => (
  <View style={styles.compareRow}>
    <Text style={[styles.compareLabel, { color: textColor }]}>{label}</Text>
    <Text style={[styles.compareValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 80 },
  hint: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  heroCard: { padding: SPACING.lg + 4, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.md },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroValue: { fontSize: 34, fontWeight: '800', color: '#FFF', marginTop: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  optionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  optionIcon: { fontSize: 20, marginRight: SPACING.sm },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionCol: { flex: 1 },
  optionLabel: { fontSize: 11, fontWeight: '500' },
  optionValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  optionArrow: { fontSize: 20, fontWeight: '700', marginHorizontal: SPACING.sm },
  optionDesc: { fontSize: 13, lineHeight: 20, marginBottom: SPACING.sm },
  diffBadge: { marginTop: SPACING.sm, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'center' },
  diffText: { fontSize: 13, fontWeight: '700' },
  prepayBadge: { alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.sm },
  prepayValue: { fontSize: 28, fontWeight: '800' },
  prepayLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F020' },
  compareLabel: { fontSize: 13, fontWeight: '500' },
  compareValue: { fontSize: 15, fontWeight: '700' },
  savingsBadge: { marginTop: SPACING.sm, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center' },
  savingsText: { fontSize: 14, fontWeight: '700' },
});

export default SavingsPlannerScreen;
