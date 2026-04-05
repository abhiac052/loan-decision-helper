import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { SPACING } from '../constants/theme';

const PieChart = ({ data, size = 180, centerLabel }) => {
  const { colors } = useApp();
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const radius = size / 2;
  const innerRadius = radius * 0.55;
  const cx = radius, cy = radius;
  let startAngle = -Math.PI / 2;

  const paths = data.map((item, i) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const ox1 = cx + radius * Math.cos(startAngle);
    const oy1 = cy + radius * Math.sin(startAngle);
    const ox2 = cx + radius * Math.cos(endAngle);
    const oy2 = cy + radius * Math.sin(endAngle);
    const ix1 = cx + innerRadius * Math.cos(endAngle);
    const iy1 = cy + innerRadius * Math.sin(endAngle);
    const ix2 = cx + innerRadius * Math.cos(startAngle);
    const iy2 = cy + innerRadius * Math.sin(startAngle);
    const d = `M ${ox1} ${oy1} A ${radius} ${radius} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    startAngle = endAngle;
    return <Path key={i} d={d} fill={item.color} />;
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>{paths}</Svg>
        {centerLabel && (
          <View style={[styles.centerLabel, { width: size, height: size }]}>
            <Text style={[styles.centerValue, { color: colors.text }]}>{centerLabel}</Text>
          </View>
        )}
      </View>
      <View style={styles.legend}>
        {data.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
            <Text style={[styles.legendPercent, { color: colors.text }]}>
              {((item.value / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: SPACING.md },
  centerLabel: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  centerValue: { fontSize: 14, fontWeight: '700' },
  legend: { marginTop: SPACING.md, width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: SPACING.sm },
  dot: { width: 14, height: 14, borderRadius: 4, marginRight: 10 },
  legendText: { fontSize: 13, fontWeight: '500', flex: 1 },
  legendPercent: { fontSize: 13, fontWeight: '700' },
});

export default React.memo(PieChart);
