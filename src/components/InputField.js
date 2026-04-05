import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const InputField = ({ label, value, onChangeText, placeholder, suffix, keyboardType = 'numeric' }) => {
  const { colors, darkMode } = useApp();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: focused ? COLORS.primary : colors.textSecondary }]}>{label}</Text>
      <View style={[
        styles.inputWrap,
        { backgroundColor: darkMode ? colors.card : '#F8FAFC', borderColor: focused ? COLORS.primary : colors.border },
        focused && styles.focusedWrap,
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary + '80'}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && (
          <View style={[styles.suffixWrap, { backgroundColor: focused ? COLORS.primary + '15' : colors.border + '60' }]}>
            <Text style={[styles.suffix, { color: focused ? COLORS.primary : colors.textSecondary }]}>{suffix}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  focusedWrap: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 13, paddingHorizontal: SPACING.md, fontWeight: '500' },
  suffixWrap: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: 'center',
  },
  suffix: { fontSize: 14, fontWeight: '700' },
});

export default React.memo(InputField);
