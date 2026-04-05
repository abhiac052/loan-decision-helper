import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@loan_history';

export const saveCalculation = async (calc) => {
  try {
    const existing = await getHistory();
    const updated = [{ ...calc, id: Date.now(), date: new Date().toLocaleDateString('en-IN') }, ...existing].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch { return false; }
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const deleteHistoryItem = async (id) => {
  try {
    const existing = await getHistory();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(i => i.id !== id)));
    return true;
  } catch { return false; }
};

export const clearHistory = async () => {
  try { await AsyncStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
};
