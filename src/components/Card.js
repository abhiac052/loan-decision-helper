import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { RADIUS, SPACING } from '../constants/theme';

const Card = ({ children, style, delay = 0 }) => {
  const { colors, darkMode } = useApp();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[
      styles.card,
      { backgroundColor: colors.card, opacity, transform: [{ translateY }] },
      darkMode ? styles.darkShadow : styles.lightShadow,
      style,
    ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md,
  },
  lightShadow: {
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  darkShadow: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    borderWidth: 1, borderColor: '#334155',
  },
});

export default React.memo(Card);
