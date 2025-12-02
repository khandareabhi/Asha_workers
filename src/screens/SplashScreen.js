import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="medkit" size={80} color="#2563eb" />
      <Text style={styles.title}>ASHA Health Tracker</Text>
      <Text style={styles.subtitle}>Loading your workspace...</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  loader: {
    marginTop: 30,
  },
});