import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { FadeIn, usePressAnimation } from '../utils/animations';
import AdBanner from '../components/AdBanner';

const features = [
  { key: 'EMICalculator', icon: '🧮', title: 'EMI Calculator', desc: 'Calculate monthly EMI, total interest & payment', gradient: ['#4F46E5', '#7C3AED'] },
  { key: 'LoanComparison', icon: '⚖️', title: 'Compare Loans', desc: 'Compare 2 loans side by side', gradient: ['#10B981', '#059669'] },
  { key: 'Affordability', icon: '💰', title: 'Affordability Check', desc: 'Know how much EMI you can afford', gradient: ['#F59E0B', '#F97316'] },
  { key: 'Prepayment', icon: '⚡', title: 'Prepayment Calculator', desc: 'See how extra payments save interest & time', gradient: ['#EC4899', '#DB2777'] },
  { key: 'SavingsPlanner', icon: '🎯', title: 'Savings Planner', desc: 'Set a goal to pay off your loan faster', gradient: ['#06B6D4', '#0891B2'] },
];

const AnimatedCard = ({ feature, onPress, colors, darkMode, delay }) => {
  const { scale, onPressIn, onPressOut } = usePressAnimation();
  return (
    <FadeIn delay={delay} slideUp={30}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.card, { backgroundColor: colors.card }, darkMode && { borderWidth: 1, borderColor: colors.border }]}
        >
          <LinearGradient colors={feature.gradient} style={styles.iconWrap}>
            <Text style={styles.icon}>{feature.icon}</Text>
          </LinearGradient>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{feature.title}</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
          </View>
          <View style={[styles.arrowWrap, { backgroundColor: colors.bg }]}>
            <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </FadeIn>
  );
};

const HomeScreen = ({ navigation }) => {
  const { colors, darkMode, toggleDarkMode } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <FadeIn duration={500}>
          <LinearGradient colors={COLORS.gradient1} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View style={styles.headerTop}>
              <Text style={styles.greeting}>🇮🇳</Text>
              <TouchableOpacity onPress={toggleDarkMode} style={styles.themeBtn} activeOpacity={0.6}>
                <Text style={styles.themeBtnIcon}>{darkMode ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Loan Decision{'\n'}Helper</Text>
            <Text style={styles.subtitle}>Smart EMI calculations for India</Text>
          </LinearGradient>
        </FadeIn>

        <View style={styles.content}>
          {features.map((f, i) => (
            <AnimatedCard
              key={f.key}
              feature={f}
              onPress={() => navigation.navigate(f.key)}
              colors={colors}
              darkMode={darkMode}
              delay={200 + i * 120}
            />
          ))}

          <FadeIn delay={560} slideUp={20}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('History')}
              style={[styles.historyBtn, { backgroundColor: COLORS.primary + '0A', borderColor: COLORS.primary + '30' }]}
            >
              <Text style={styles.historyIcon}>📋</Text>
              <Text style={[styles.historyText, { color: COLORS.primary }]}>Saved Calculations</Text>
              <Text style={[styles.arrow, { color: COLORS.primary }]}>›</Text>
            </TouchableOpacity>
          </FadeIn>
        </View>
      </ScrollView>
      <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.lg, paddingBottom: 30,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 32 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  themeBtnIcon: { fontSize: 20 },
  title: { fontSize: 30, fontWeight: '800', color: '#FFF', lineHeight: 38 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  content: { padding: SPACING.lg, marginTop: -8 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
    borderRadius: RADIUS.md, marginBottom: SPACING.md,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  iconWrap: { width: 52, height: 52, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 24 },
  cardContent: { flex: 1, marginLeft: SPACING.md },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  arrowWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  arrow: { fontSize: 22, fontWeight: '400' },
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1.5, marginBottom: SPACING.md,
  },
  historyIcon: { fontSize: 20, marginRight: SPACING.sm },
  historyText: { fontSize: 15, fontWeight: '600', flex: 1 },
});

export default HomeScreen;
