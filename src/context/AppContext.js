import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [adFree, setAdFree] = useState(false);

  useEffect(() => {
    (async () => {
      const dm = await AsyncStorage.getItem('@dark_mode');
      const af = await AsyncStorage.getItem('@ad_free');
      if (dm === 'true') setDarkMode(true);
      if (af === 'true') setAdFree(true);
    })();
  }, []);

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem('@dark_mode', String(next));
  };

  const toggleAdFree = async () => {
    const next = !adFree;
    setAdFree(next);
    await AsyncStorage.setItem('@ad_free', String(next));
  };

  const colors = darkMode
    ? { bg: COLORS.darkBg, card: COLORS.darkCard, text: COLORS.darkText, textSecondary: COLORS.darkTextSecondary, border: COLORS.darkBorder, primary: COLORS.primary }
    : { bg: COLORS.bg, card: COLORS.card, text: COLORS.text, textSecondary: COLORS.textSecondary, border: COLORS.border, primary: COLORS.primary };

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode, adFree, toggleAdFree, colors }}>
      {children}
    </AppContext.Provider>
  );
};
