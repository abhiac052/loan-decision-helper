import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const SegmentToggle = ({ options, selected, onSelect }) => {
  const { colors, darkMode } = useApp();
  return (
    <View style={[styles.container, { backgroundColor: darkMode ? colors.darkBorder : '#E2E8F0' }]}>
      {options.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[styles.option, isActive && styles.active]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, { color: colors.textSecondary }, isActive && styles.activeText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm,
    padding: 4,
    marginBottom: SPACING.md,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm - 2,
  },
  active: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text: { fontSize: 14, fontWeight: '600' },
  activeText: { color: '#FFF' },
});

export default React.memo(SegmentToggle);
