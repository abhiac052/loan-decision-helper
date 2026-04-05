import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useApp();
  return (
    <TouchableOpacity onPress={toggleDarkMode} style={styles.btn} activeOpacity={0.6}>
      <Text style={styles.icon}>{darkMode ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { padding: 6, marginRight: 4 },
  icon: { fontSize: 20 },
});

export default React.memo(ThemeToggle);
