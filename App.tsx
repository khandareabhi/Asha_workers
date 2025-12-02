import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import LandingScreen from "./src/screens/LandingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import PatientListScreen from "./src/screens/PatientListScreen";
import PatientFormScreen from "./src/screens/PatientFormScreen";
import SplashScreen from "./src/screens/SplashScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { initDatabase } from "./src/db/sqlite";
import { attemptSync, startConnectivitySync, stopConnectivitySync } from "./src/services/sync";
import { AppState } from "react-native";
import AnalysisScreen from "./src/screens/AnalysisScreen";
import PatientDetailsScreen from './src/screens/PatientDetailsScreen';
import GuidanceScreen from './src/screens/GuidanceScreen';
import AshaInfoScreen from './src/screens/AshaInfoScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    (async () => {
      await initDatabase();
      // Best-effort background sync on app start
      await attemptSync();
      startConnectivitySync();
    })();
    return () => {
      stopConnectivitySync();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        attemptSync();
      }
    });
    return () => sub.remove();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App screens
          <>
            <Stack.Screen name="PatientList" component={PatientListScreen} />
            <Stack.Screen name="PatientForm" component={PatientFormScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Analysis" component={AnalysisScreen} />
            <Stack.Screen
              name="PatientDetails"
              component={PatientDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Guidance"
              component={GuidanceScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AshaInfo"
              component={AshaInfoScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppNavigator />
      </LanguageProvider>
    </AuthProvider>
  );
}