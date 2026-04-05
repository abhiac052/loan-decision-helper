import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

const AdBanner = () => {
  const { adFree, colors } = useApp();
  const insets = useSafeAreaInsets();
  if (adFree) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.inner}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>Ad Space</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  inner: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { fontSize: 12 },
});

export default React.memo(AdBanner);
