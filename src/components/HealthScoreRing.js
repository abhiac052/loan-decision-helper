import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { SPACING, RADIUS } from '../constants/theme';

const HealthScoreRing = ({ score, label, color }) => {
  const { colors } = useApp();
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={[styles.score, { color }]}>{score}</Text>
        </View>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Loan Health</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: SPACING.sm },
  center: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  score: { fontSize: 28, fontWeight: '800' },
  label: { fontSize: 16, fontWeight: '700', marginTop: SPACING.sm },
  sub: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});

export default React.memo(HealthScoreRing);
