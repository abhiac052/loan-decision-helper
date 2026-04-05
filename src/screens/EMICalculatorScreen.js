import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useDialog } from '../context/DialogContext';
import { calculateEMI, formatINR, validateNumber, formatAmountInput, stripCommas } from '../utils/calculations';
import { generateInsights, generateShareText } from '../utils/insightEngine';
import { getLoanHealthScore } from '../utils/healthScore';
import { saveCalculation } from '../utils/storage';
import * as Sharing from 'expo-sharing';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn, ScaleIn } from '../utils/animations';
import InputField from '../components/InputField';
import SegmentToggle from '../components/SegmentToggle';
import Button from '../components/Button';
import Card from '../components/Card';
import PieChart from '../components/PieChart';
import AdBanner from '../components/AdBanner';
import InterestShock from '../components/InterestShock';
import HealthScoreRing from '../components/HealthScoreRing';
import InsightsList from '../components/InsightsList';
import ViewShot from 'react-native-view-shot';

const EMICalculatorScreen = () => {
  const { colors } = useApp();
  const dialog = useDialog();
  const navigation = useNavigation();
  const captureRef = useRef();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [tenureType, setTenureType] = useState('years');
  const [income, setIncome] = useState('');
  const [showIncome, setShowIncome] = useState(false);
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  const months = useMemo(() => {
    if (!tenure) return 0;
    return tenureType === 'years' ? parseInt(tenure) * 12 : parseInt(tenure);
  }, [tenure, tenureType]);

  const insights = useMemo(() => {
    if (!result) return [];
    return generateInsights({
      principal: stripCommas(amount), rate, months, emi: result.emi,
      totalInterest: result.totalInterest, totalPayment: result.totalPayment,
      income: stripCommas(income) || null,
    });
  }, [result, amount, rate, months, income]);

  const healthScore = useMemo(() => {
    if (!result) return null;
    return getLoanHealthScore({ emi: result.emi, income: stripCommas(income) || null, rate, months });
  }, [result, income, rate, months]);

  const calculate = useCallback(() => {
    const rawAmount = stripCommas(amount);
    if (!rawAmount || !rate || !tenure) { dialog.error('Missing Input', 'Please fill all fields'); return; }
    const m = tenureType === 'years' ? parseInt(tenure) * 12 : parseInt(tenure);
    if (m <= 0 || parseFloat(rate) <= 0 || parseFloat(rawAmount) <= 0) { dialog.error('Invalid Input', 'All values must be greater than 0'); return; }
    setResult(calculateEMI(rawAmount, rate, m));
    setResultKey(k => k + 1);
  }, [amount, rate, tenure, tenureType]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    await saveCalculation({ type: 'EMI', amount: stripCommas(amount), rate, tenure, tenureType, months, income: stripCommas(income), ...result });
    dialog.success('Saved!', 'Calculation saved to history');
  }, [result, amount, rate, tenure, tenureType, months, income]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = generateShareText({
      principal: stripCommas(amount), rate, tenure, tenureType,
      emi: result.emi, totalInterest: result.totalInterest, totalPayment: result.totalPayment,
      insights,
    });
    await Share.share({ message: text });
  }, [result, amount, rate, tenure, tenureType, insights]);

  const handleExport = useCallback(async () => {
    if (!result || !captureRef.current) return;
    try {
      const uri = await captureRef.current.capture();
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Calculation' });
    } catch {
      dialog.error('Export Failed', 'Could not capture the result');
    }
  }, [result]);

  const viewSchedule = useCallback(() => {
    if (!result) return;
    navigation.navigate('Amortization', { amount: stripCommas(amount), rate, months });
  }, [result, amount, rate, months]);

  const reset = () => { setAmount(''); setRate(''); setTenure(''); setIncome(''); setResult(null); };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <InputField label="Loan Amount" value={amount} onChangeText={v => setAmount(formatAmountInput(v))} placeholder="e.g. 10,00,000" suffix="₹" />
        <InputField label="Interest Rate (per annum)" value={rate} onChangeText={v => setRate(validateNumber(v))} placeholder="e.g. 8.5" suffix="%" />
        <SegmentToggle
          options={[{ label: 'Years', value: 'years' }, { label: 'Months', value: 'months' }]}
          selected={tenureType} onSelect={setTenureType}
        />
        <InputField label={`Tenure (${tenureType})`} value={tenure} onChangeText={v => setTenure(validateNumber(v))} placeholder={tenureType === 'years' ? 'e.g. 20' : 'e.g. 240'} />

        {!showIncome ? (
          <TouchableOpacity onPress={() => setShowIncome(true)} style={styles.incomeToggle} activeOpacity={0.7}>
            <Text style={[styles.incomeToggleText, { color: COLORS.primary }]}>+ Add income for smarter insights</Text>
          </TouchableOpacity>
        ) : (
          <InputField label="Monthly Income (optional)" value={income} onChangeText={v => setIncome(formatAmountInput(v))} placeholder="e.g. 80,000" suffix="₹" />
        )}

        <Button title="Calculate EMI" onPress={calculate} />
        {result && <Button title="Reset" onPress={reset} variant="outline" />}

        {result && (
          <View key={resultKey}>
          <ViewShot ref={captureRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: colors.bg }}>
            <ScaleIn delay={0}>
              <View style={styles.emiHighlight}>
                <LinearGradient colors={COLORS.gradient1} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emiGradient}>
                  <Text style={styles.emiLabel}>Monthly EMI</Text>
                  <Text style={styles.emiValue}>{formatINR(result.emi)}</Text>
                </LinearGradient>
              </View>
            </ScaleIn>

            <FadeIn delay={100}>
              <InterestShock principal={stripCommas(amount)} totalPayment={result.totalPayment} totalInterest={result.totalInterest} />
            </FadeIn>

            <FadeIn delay={200}>
              <View style={styles.statsRow}>
                <Card style={styles.statCard} delay={250}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Interest</Text>
                  <Text style={[styles.statValue, { color: COLORS.red }]}>{formatINR(result.totalInterest)}</Text>
                </Card>
                <Card style={styles.statCard} delay={350}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Payment</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{formatINR(result.totalPayment)}</Text>
                </Card>
              </View>
            </FadeIn>

            {healthScore && (
              <FadeIn delay={350}>
                <Card delay={400}>
                  <HealthScoreRing score={healthScore.score} label={healthScore.label} color={healthScore.color} />
                </Card>
              </FadeIn>
            )}

            <FadeIn delay={450}>
              <Card delay={500}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Payment Breakdown</Text>
                <PieChart
                  data={[
                    { label: 'Principal', value: parseFloat(stripCommas(amount)), color: COLORS.primary },
                    { label: 'Interest', value: result.totalInterest, color: COLORS.red },
                  ]}
                  centerLabel={`${((parseFloat(stripCommas(amount)) / result.totalPayment) * 100).toFixed(0)}% Principal`}
                />
              </Card>
            </FadeIn>

            {insights.length > 0 && (
              <FadeIn delay={550}>
                <Card delay={600}>
                  <InsightsList insights={insights} />
                </Card>
              </FadeIn>
            )}
          </ViewShot>

            <FadeIn delay={650}>
              <Button title="📊 View Amortization Schedule" onPress={viewSchedule} variant="outline" />
              <View style={styles.actionRow}>
                <Button title="💾 Save" onPress={handleSave} variant="outline" style={styles.actionBtn} />
                <Button title="📤 Share" onPress={handleShare} variant="outline" style={styles.actionBtn} />
                <Button title="🖼️ Export" onPress={handleExport} variant="outline" style={styles.actionBtn} />
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
  incomeToggle: { paddingVertical: 10, marginBottom: SPACING.sm },
  incomeToggleText: { fontSize: 13, fontWeight: '600' },
  emiHighlight: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.md, marginBottom: SPACING.md },
  emiGradient: { padding: SPACING.lg + 4, alignItems: 'center', borderRadius: RADIUS.md },
  emiLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  emiValue: { fontSize: 36, fontWeight: '800', color: '#FFF', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.xs },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
});

export default EMICalculatorScreen;
