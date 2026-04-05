import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider, useApp } from './src/context/AppContext';
import { DialogProvider } from './src/context/DialogContext';
import ThemeToggle from './src/components/ThemeToggle';
import HomeScreen from './src/screens/HomeScreen';
import EMICalculatorScreen from './src/screens/EMICalculatorScreen';
import LoanComparisonScreen from './src/screens/LoanComparisonScreen';
import AffordabilityScreen from './src/screens/AffordabilityScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AmortizationScreen from './src/screens/AmortizationScreen';
import PrepaymentScreen from './src/screens/PrepaymentScreen';
import SavingsPlannerScreen from './src/screens/SavingsPlannerScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { colors, darkMode } = useApp();

  const baseTheme = darkMode ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: darkMode,
    colors: {
      ...baseTheme.colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '600', fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            navigationBarColor: colors.bg,
            animation: 'fade',
            animationDuration: 200,
            headerRight: () => <ThemeToggle />,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EMICalculator" component={EMICalculatorScreen} options={{ title: 'EMI Calculator' }} />
          <Stack.Screen name="LoanComparison" component={LoanComparisonScreen} options={{ title: 'Compare Loans' }} />
          <Stack.Screen name="Affordability" component={AffordabilityScreen} options={{ title: 'Affordability Check' }} />
          <Stack.Screen name="Prepayment" component={PrepaymentScreen} options={{ title: 'Prepayment Calculator' }} />
          <Stack.Screen name="SavingsPlanner" component={SavingsPlannerScreen} options={{ title: 'Savings Planner' }} />
          <Stack.Screen name="Amortization" component={AmortizationScreen} options={{ title: 'Amortization Schedule' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Saved Calculations' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <DialogProvider>
          <AppNavigator />
        </DialogProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
