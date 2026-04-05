import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Pressable } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useApp } from './AppContext';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

const iconMap = {
  success: '✅',
  error: '⚠️',
  warning: '⚠️',
  confirm: '🗑️',
  info: 'ℹ️',
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const showDialog = useCallback(({ type = 'info', title, message, confirmText, cancelText, onConfirm, onCancel }) => {
    setDialog({ type, title, message, confirmText, cancelText, onConfirm, onCancel });
  }, []);

  const alert = useCallback((title, message) => {
    setDialog({ type: 'info', title, message });
  }, []);

  const success = useCallback((title, message) => {
    setDialog({ type: 'success', title, message });
  }, []);

  const error = useCallback((title, message) => {
    setDialog({ type: 'error', title, message });
  }, []);

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, destructive = false }) => {
    setDialog({ type: destructive ? 'confirm' : 'info', title, message, confirmText, cancelText, onConfirm, hasActions: true });
  }, []);

  const dismiss = useCallback(() => setDialog(null), []);

  return (
    <DialogContext.Provider value={{ showDialog, alert, success, error, confirm }}>
      {children}
      {dialog && <DialogModal dialog={dialog} onDismiss={dismiss} />}
    </DialogContext.Provider>
  );
};

const DialogModal = ({ dialog, onDismiss }) => {
  const { colors, darkMode } = useApp();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const animateOut = (cb) => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      onDismiss();
      cb && cb();
    });
  };

  const icon = iconMap[dialog.type] || iconMap.info;
  const isDestructive = dialog.type === 'confirm';
  const accentColor = isDestructive ? COLORS.red : dialog.type === 'success' ? COLORS.green : dialog.type === 'error' ? COLORS.orange : COLORS.primary;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={() => animateOut()}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
        <Animated.View style={[
          styles.dialog,
          { backgroundColor: colors.card, transform: [{ scale }], opacity },
          darkMode && { borderWidth: 1, borderColor: colors.border },
        ]}>
          <Pressable>
            <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{dialog.title}</Text>
            {dialog.message && <Text style={[styles.message, { color: colors.textSecondary }]}>{dialog.message}</Text>}

            <View style={styles.actions}>
              {dialog.hasActions ? (
                <>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn, { backgroundColor: darkMode ? colors.border : '#F1F5F9' }]}
                    onPress={() => animateOut(dialog.onCancel)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{dialog.cancelText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.confirmBtn, { backgroundColor: accentColor }]}
                    onPress={() => animateOut(dialog.onConfirm)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmText}>{dialog.confirmText}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, styles.okBtn, { backgroundColor: accentColor }]}
                  onPress={() => animateOut()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: '100%', maxWidth: 320, borderRadius: RADIUS.lg, padding: SPACING.lg + 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  icon: { fontSize: 26 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: SPACING.lg },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  btn: { flex: 1, paddingVertical: 13, borderRadius: RADIUS.sm, alignItems: 'center' },
  cancelBtn: {},
  confirmBtn: {},
  okBtn: {},
  cancelText: { fontSize: 15, fontWeight: '600' },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
