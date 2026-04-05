import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { usePressAnimation } from '../utils/animations';

const Button = ({ title, onPress, variant = 'primary', style }) => {
  const isPrimary = variant === 'primary';
  const { scale, onPressIn, onPressOut } = usePressAnimation();

  if (isPrimary) {
    return (
      <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
          <LinearGradient colors={COLORS.gradient1} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            <Text style={styles.primaryText}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.outlineWrapper, { transform: [{ scale }] }, style]}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.outline}>
        <Text style={styles.outlineText} numberOfLines={1}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: SPACING.xs, borderRadius: RADIUS.sm, overflow: 'hidden' },
  gradient: { paddingVertical: 15, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  outlineWrapper: { marginVertical: SPACING.xs },
  outline: {
    paddingVertical: 14, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  outlineText: { color: COLORS.primary, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});

export default React.memo(Button);
