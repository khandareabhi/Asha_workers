import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Animated,
  Dimensions 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import FloatingLanguageButton from "../components/FloatingLanguageButton";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const { t } = useLanguage();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* ASHA Workers Background Image */}
      <Image
        source={require('../../assets/p_asha_logo.png')}
        style={styles.backgroundImage}
      />
      
      {/* Dark Overlay with opacity for better readability */}
      <View style={styles.overlay} />

      <StatusBar barStyle="light-content" backgroundColor="#1e40af" translucent />

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoBackground}>
              <Image
                 source={require('../../assets/asha_logo.png')}
                style={styles.logo}
              />
            </View>
          </View>
          
          {/* App Name */}
          <Text style={styles.title}>ASHA</Text>
          <Text style={styles.subtitle}>
            {t('landing.subtitle')}
          </Text>
        
          
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.9}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>{t('landing.getStarted')}</Text>
              <Text style={styles.buttonIcon}>→</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.helperText}>
            {t('landing.helper')}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('landing.footer', { version: '1.0' })}</Text>
      </View>

      {/* Floating Language Button */}
      <FloatingLanguageButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height:500,
    bottom:160,
    left:0
   
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: '#0000009b', // Blue with opacity
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  logoWrapper: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
   
 
  },
  logo: {
    width: 100,
    height: 110,
    tintColor: "#1e40af", // Blue color for the icon
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuresContainer: {
    width: "100%",
    maxWidth: 300,
    marginTop: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 10)",
  },
  buttonInner: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  buttonText: {
    color: "#1e40af",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  buttonIcon: {
    color: "#1e40af",
    fontSize: 18,
    fontWeight: "bold",
  },
  helperText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    paddingBottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});