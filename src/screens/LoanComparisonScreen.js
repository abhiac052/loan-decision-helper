import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useDialog } from '../context/DialogContext';
import { calculateEMI, formatINR, validateNumber, formatAmountInput, stripCommas } from '../utils/calculations';
import { saveCalculation } from '../utils/storage';
import { SPACING, COLORS, RADIUS } from '../constants/theme';
import { FadeIn, ScaleIn } from '../utils/animations';
import Button from '../components/Button';
import Card from '../components/Card';
import AdBanner from '../components/AdBanner';

const LABELS = ['A', 'B', 'C', 'D'];
const GRADIENTS = [['#4F46E5', '#7C3AED'], ['#10B981', '#059669'], ['#F59E0B', '#F97316'], ['#EC4899', '#DB2777']];
const EMPTY = { amount: '', rate: '', tenure: '' };

const CompactInput = ({ label, value, onChangeText, placeholder, colors, darkMode }) => (
  <View style={styles.compactField}>
    <Text style={[styles.compactLabel, { color: colors.textSecondary }]}>{label}</Text>
    <TextInput
      style={[styles.compactInput, { color: colors.text, backgroundColor: darkMode ? colors.card : '#F8FAFC', borderColor: colors.border }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary + '60'}
      keyboardType="numeric"
    />
  </View>
);

const LoanColumn = ({ index, loan, setLoan, colors, darkMode }) => (
  <View style={styles.loanCol}>
    <LinearGradient colors={GRADIENTS[index]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.colBadge}>
      <Text style={styles.colBadgeText}>Loan {LABELS[index]}</Text>
    </LinearGradient>
    <CompactInput label="Amount (₹)" value={loan.amount} onChangeText={v => setLoan({ ...loan, amount: formatAmountInput(v) })} placeholder="10,00,000" colors={colors} darkMode={darkMode} />
    <CompactInput label="Rate (%)" value={loan.rate} onChangeText={v => setLoan({ ...loan, rate: validateNumber(v) })} placeholder="8.5" colors={colors} darkMode={darkMode} />
    <CompactInput label="Months" value={loan.tenure} onChangeText={v => setLoan({ ...loan, tenure: validateNumber(v) })} placeholder="240" colors={colors} darkMode={darkMode} />
  </View>
);

const LoanComparisonScreen = () => {
  const { colors, darkMode } = useApp();
  const dialog = useDialog();
  const [loans, setLoans] = useState([{ ...EMPTY }, { ...EMPTY }]);
  const [results, setResults] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  const update = (i, v) => setLoans(p => p.map((l, j) => j === i ? v : l));
  const addLoan = () => loans.length < 4 && setLoans(p => [...p, { ...EMPTY }]);
  const removeLoan = (i) => { if (loans.length > 2) { setLoans(p => p.filter((_, j) => j !== i)); setResults(null); } };

  const compare = useCallback(() => {
    for (let i = 0; i < loans.length; i++) {
      const raw = stripCommas(loans[i].amount);
      if (!raw || !loans[i].rate || !loans[i].tenure || parseFloat(raw) <= 0 || parseFloat(loans[i].rate) <= 0 || parseFloat(loans[i].tenure) <= 0) {
        dialog.error('Missing Input', `Fill all fields for Loan ${LABELS[i]}`); return;
      }
    }
    setResults(loans.map(l => calculateEMI(stripCommas(l.amount), l.rate, l.tenure)));
    setResultKey(k => k + 1);
  }, [loans]);

  const winIdx = results ? results.reduce((b, r, i) => r.totalPayment < results[b].totalPayment ? i : b, 0) : -1;

  const handleShare = useCallback(async () => {
    if (!results) return;
    let text = `Loan Comparison (${results.length} loans)\n\n`;
    results.forEach((r, i) => {
      text += `${i === winIdx ? '✅ ' : ''}Loan ${LABELS[i]}: EMI ${formatINR(r.emi)} | Total ${formatINR(r.totalPayment)}\n`;
    });
    text += `\n— Loan Decision Helper`;
    await Share.share({ message: text });
  }, [results, winIdx]);

  const handleSave = useCallback(async () => {
    if (!results) return;
    const data = { type: 'Comparison', loanCount: loans.length };
    loans.forEach((l, i) => { data[`loan${LABELS[i]}`] = { amount: stripCommas(l.amount), rate: l.rate, tenure: l.tenure }; });
    results.forEach((r, i) => { data[`r${i + 1}`] = r; });
    await saveCalculation(data);
    dialog.success('Saved!', 'Comparison saved to history');
  }, [results, loans]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Side-by-side A & B */}
        <View style={[styles.sideBySide, { backgroundColor: colors.card, borderColor: darkMode ? colors.border : 'transparent' }, darkMode && { borderWidth: 1 }]}>
          <LoanColumn index={0} loan={loans[0]} setLoan={v => update(0, v)} colors={colors} darkMode={darkMode} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <LoanColumn index={1} loan={loans[1]} setLoan={v => update(1, v)} colors={colors} darkMode={darkMode} />
        </View>

        {/* Extra loans C, D */}
        {loans.length > 2 && (
          <View style={[styles.sideBySide, { backgroundColor: colors.card, borderColor: darkMode ? colors.border : 'transparent', marginTop: SPACING.sm }, darkMode && { borderWidth: 1 }]}>
            <LoanColumn index={2} loan={loans[2]} setLoan={v => update(2, v)} colors={colors} darkMode={darkMode} />
            {loans.length > 2 && (
              <TouchableOpacity onPress={() => removeLoan(2)} style={styles.colRemove} activeOpacity={0.7}>
                <Text style={styles.colRemoveText}>✕</Text>
              </TouchableOpacity>
            )}
            {loans.length > 3 ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <LoanColumn index={3} loan={loans[3]} setLoan={v => update(3, v)} colors={colors} darkMode={darkMode} />
                <TouchableOpacity onPress={() => removeLoan(3)} style={[styles.colRemove, { right: 8 }]} activeOpacity={0.7}>
                  <Text style={styles.colRemoveText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.loanCol}>
                  <TouchableOpacity onPress={addLoan} style={[styles.addInline, { borderColor: COLORS.primary + '40' }]} activeOpacity={0.7}>
                    <Text style={[styles.addInlineText, { color: COLORS.primary }]}>+ Loan D</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {loans.length === 2 && (
          <TouchableOpacity onPress={addLoan} style={[styles.addBtn, { borderColor: COLORS.primary + '40' }]} activeOpacity={0.7}>
            <Text style={[styles.addBtnText, { color: COLORS.primary }]}>+ Add More Loans</Text>
          </TouchableOpacity>
        )}

        <Button title={`Compare ${loans.length} Loans`} onPress={compare} />

        {/* Results */}
        {results && (
          <View key={resultKey}>
            <ScaleIn delay={0}>
              <LinearGradient colors={GRADIENTS[winIdx]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verdictCard}>
                <Text style={styles.verdictIcon}>🏆</Text>
                <Text style={styles.verdict}>Loan {LABELS[winIdx]} is the cheapest</Text>
                <Text style={styles.verdictSub}>
                  Saves {formatINR(Math.max(...results.map(r => r.totalPayment)) - results[winIdx].totalPayment)} vs costliest
                </Text>
              </LinearGradient>
            </ScaleIn>

            <FadeIn delay={200}>
              <View style={styles.resultGrid}>
                {results.map((r, i) => {
                  const isWin = i === winIdx;
                  return (
                    <Card key={i} style={[styles.resultCard, isWin && { borderColor: COLORS.green, borderWidth: 2 }]} delay={300 + i * 80}>
                      {isWin && <Text style={styles.winBadge}>✅ Best</Text>}
                      <LinearGradient colors={GRADIENTS[i]} style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>{LABELS[i]}</Text>
                      </LinearGradient>
                      <Text style={[styles.resultEmi, { color: colors.text }]}>{formatINR(r.emi)}</Text>
                      <Text style={[styles.resultSub, { color: colors.textSecondary }]}>per month</Text>
                      <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
                      <Text style={[styles.resultDetail, { color: COLORS.red }]}>{formatINR(r.totalInterest)}</Text>
                      <Text style={[styles.resultDetailLabel, { color: colors.textSecondary }]}>interest</Text>
                      <Text style={[styles.resultDetail, { color: colors.text }]}>{formatINR(r.totalPayment)}</Text>
                      <Text style={[styles.resultDetailLabel, { color: colors.textSecondary }]}>total</Text>
                    </Card>
                  );
                })}
              </View>
            </FadeIn>

            {results.length > 2 && (
              <FadeIn delay={500}>
                <Card delay={550}>
                  <Text style={[styles.rankTitle, { color: colors.text }]}>📊 Ranking</Text>
                  {[...results].map((r, i) => ({ ...r, i })).sort((a, b) => a.totalPayment - b.totalPayment).map((r, rank) => (
                    <View key={r.i} style={[styles.rankRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.rankNum, { color: rank === 0 ? COLORS.green : colors.textSecondary }]}>#{rank + 1}</Text>
                      <LinearGradient colors={GRADIENTS[r.i]} style={styles.rankDot} />
                      <Text style={[styles.rankLabel, { color: colors.text }]}>Loan {LABELS[r.i]}</Text>
                      <Text style={[styles.rankValue, { color: rank === 0 ? COLORS.green : colors.text }]}>{formatINR(r.totalPayment)}</Text>
                    </View>
                  ))}
                </Card>
              </FadeIn>
            )}

            <FadeIn delay={650}>
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

  // Side-by-side card
  sideBySide: {
    flexDirection: 'row', borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  loanCol: { flex: 1 },
  divider: { width: 1, marginHorizontal: SPACING.sm },
  colBadge: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14, marginBottom: SPACING.sm },
  colBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  colRemove: { position: 'absolute', top: 4, right: '52%', zIndex: 1 },
  colRemoveText: { fontSize: 13, fontWeight: '700', color: COLORS.red, padding: 4 },

  // Compact inputs
  compactField: { marginBottom: SPACING.sm },
  compactLabel: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
  compactInput: {
    fontSize: 14, fontWeight: '500', paddingVertical: 8, paddingHorizontal: 10,
    borderWidth: 1, borderRadius: RADIUS.sm - 4,
  },

  // Add buttons
  addBtn: { paddingVertical: 12, borderRadius: RADIUS.sm, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', marginBottom: SPACING.sm },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  addInline: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderRadius: RADIUS.sm - 4, paddingVertical: 40 },
  addInlineText: { fontSize: 14, fontWeight: '700' },

  // Verdict
  verdictCard: { alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.md },
  verdictIcon: { fontSize: 30 },
  verdict: { fontSize: 17, fontWeight: '800', marginTop: SPACING.xs, textAlign: 'center', color: '#FFF' },
  verdictSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  // Result grid
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  resultCard: { width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  winBadge: { fontSize: 10, fontWeight: '700', color: COLORS.green, marginBottom: 4 },
  resultBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  resultBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  resultEmi: { fontSize: 16, fontWeight: '800' },
  resultSub: { fontSize: 10, marginTop: 1 },
  resultDivider: { height: 1, width: '100%', marginVertical: SPACING.sm },
  resultDetail: { fontSize: 13, fontWeight: '700' },
  resultDetailLabel: { fontSize: 9, marginBottom: 4 },

  // Ranking
  rankTitle: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  rankNum: { fontSize: 14, fontWeight: '800', width: 28 },
  rankDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  rankLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  rankValue: { fontSize: 14, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
});

export default LoanComparisonScreen;
