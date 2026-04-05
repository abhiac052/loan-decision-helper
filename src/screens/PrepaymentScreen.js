import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useDialog } from '../context/DialogContext';
import { calculatePrepayment, formatINR, validateNumber, formatAmountInput, stripCommas } from '../utils/calculations';
import { saveCalculation } from '../utils/storage';
import { captureAndShare } from '../utils/exportShare';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn, ScaleIn } from '../utils/animations';
import InputField from '../components/InputField';
import SegmentToggle from '../components/SegmentToggle';
import Button from '../components/Button';
import Card from '../components/Card';
import AdBanner from '../components/AdBanner';

const PrepaymentScreen = () => {
  const { colors } = useApp();
  const dialog = useDialog();
  const captureRef = useRef();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [extraYearly, setExtraYearly] = useState('');
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  const calculate = useCallback(() => {
    if (!amount || !rate || !tenure || !extraYearly) { dialog.error('Missing Input', 'Please fill all fields'); return; }
    const rawAmount = stripCommas(amount);
    const rawExtra = stripCommas(extraYearly);
    const months = tenureType === 'years' ? parseInt(tenure) * 12 : parseInt(tenure);
    if (months <= 0 || parseFloat(rate) <= 0 || parseFloat(rawAmount) <= 0 || parseFloat(rawExtra) <= 0) {
      dialog.error('Invalid Input', 'All values must be greater than 0'); return;
    }
    const r = calculatePrepayment(rawAmount, rate, months, rawExtra);
    if (!r) { dialog.error('Error', 'Could not calculate'); return; }
    setResult(r);
    setResultKey(k => k + 1);
  }, [amount, rate, tenure, tenureType, extraYearly]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    await saveCalculation({ type: 'Prepayment', amount: stripCommas(amount), rate, tenure, tenureType, extraYearly: stripCommas(extraYearly), ...result });
    dialog.success('Saved!', 'Calculation saved to history');
  }, [result, amount, rate, tenure, tenureType, extraYearly]);

  const handleExport = useCallback(async () => {
    if (!result) return;
    const ok = await captureAndShare(captureRef);
    if (!ok) dialog.error('Export Failed', 'Could not capture the result');
  }, [result]);

  const formatTenure = (m) => m >= 12 ? `${Math.floor(m / 12)}y ${m % 12}m` : `${m}m`;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <InputField label="Loan Amount" value={amount} onChangeText={v => setAmount(formatAmountInput(v))} placeholder="e.g. 30,00,000" suffix="₹" />
        <InputField label="Interest Rate (per annum)" value={rate} onChangeText={v => setRate(validateNumber(v))} placeholder="e.g. 8.5" suffix="%" />
        <SegmentToggle
          options={[{ label: 'Years', value: 'years' }, { label: 'Months', value: 'months' }]}
          selected={tenureType} onSelect={setTenureType}
        />
        <InputField label={`Tenure (${tenureType})`} value={tenure} onChangeText={v => setTenure(validateNumber(v))} placeholder={tenureType === 'years' ? 'e.g. 20' : 'e.g. 240'} />
        <InputField label="Extra Payment Per Year" value={extraYearly} onChangeText={v => setExtraYearly(formatAmountInput(v))} placeholder="e.g. 50,000" suffix="₹" />

        <Button title="Calculate Savings" onPress={calculate} />

        {result && (
          <View key={resultKey} ref={captureRef} collapsable={false}>
            <ScaleIn delay={0}>
              <LinearGradient colors={COLORS.gradient2} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsCard}>
                <Text style={styles.savingsLabel}>You Save</Text>
                <Text style={styles.savingsValue}>{formatINR(result.interestSaved)}</Text>
                <Text style={styles.savingsSubtext}>in interest + {result.monthsSaved} months earlier</Text>
              </LinearGradient>
            </ScaleIn>

            <FadeIn delay={200}>
              <Card delay={250}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparison</Text>
                <CompareRow label="Tenure" original={formatTenure(result.originalMonths)} updated={formatTenure(result.newMonths)} colors={colors} />
                <CompareRow label="Total Interest" original={formatINR(result.originalInterest)} updated={formatINR(result.newInterest)} colors={colors} highlight />
                <CompareRow label="Total Payment" original={formatINR(result.originalTotal)} updated={formatINR(result.newTotal)} colors={colors} />
              </Card>
            </FadeIn>

            <FadeIn delay={400}>
              <View style={styles.statsRow}>
                <Card style={styles.statCard} delay={450}>
                  <Text style={styles.statIcon}>📅</Text>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>{result.monthsSaved}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Months Saved</Text>
                </Card>
                <Card style={styles.statCard} delay={550}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={[styles.statValue, { color: COLORS.green }]}>{formatINR(result.interestSaved)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Interest Saved</Text>
                </Card>
              </View>
            </FadeIn>

            <FadeIn delay={600}>
              <View style={styles.actionRow}>
                <Button title="💾 Save" onPress={handleSave} variant="outline" style={styles.actionBtn} />
                <Button title="📤 Export" onPress={handleExport} variant="outline" style={styles.actionBtn} />
              </View>
            </FadeIn>
          </View>
        )}
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const CompareRow = ({ label, original, updated, colors, highlight }) => (
  <View style={[styles.compareRow, { borderBottomColor: colors.border }]}>
    <Text style={[styles.compareLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={styles.compareValues}>
      <Text style={[styles.compareOld, { color: colors.textSecondary }]}>{original}</Text>
      <Text style={styles.compareArrow}>→</Text>
      <Text style={[styles.compareNew, highlight && { color: COLORS.green }]}>{updated}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 80 },
  savingsCard: { padding: SPACING.lg + 4, borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.md },
  savingsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  savingsValue: { fontSize: 34, fontWeight: '800', color: '#FFF', marginTop: 4 },
  savingsSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.sm },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  compareLabel: { fontSize: 13, fontWeight: '500' },
  compareValues: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compareOld: { fontSize: 13, textDecorationLine: 'line-through' },
  compareArrow: { fontSize: 12, color: COLORS.green },
  compareNew: { fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
});

export default PrepaymentScreen;
