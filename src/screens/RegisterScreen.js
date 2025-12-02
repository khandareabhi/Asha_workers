import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import FloatingLanguageButton from "../components/FloatingLanguageButton";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ashaId: "",
    phone: "",
    supervisorId: "",
    territory: {
      state: "",
      district: "",
      block: "",
      village: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();

  const updateFormData = (field, value) => {
    if (field.startsWith("territory.")) {
      const territoryField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        territory: {
          ...prev.territory,
          [territoryField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, ashaId, phone, territory } = formData;

    if (!name || !email || !password || !confirmPassword || !ashaId || !phone) {
      Alert.alert(t('alerts.error'), t('alerts.fillAllRequired'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('alerts.error'), t('alerts.passwordsNoMatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('alerts.error'), t('alerts.passwordMin'));
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert(t('alerts.success'), t('alerts.welcomeToApp', { name: result.user.name }));
    } else {
      Alert.alert(t('alerts.registrationFailed'), result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auth.register')}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.illustration}>
            <FontAwesome5 name="user-nurse" size={80} color="#2563eb" />
            <Text style={styles.illustrationText}>{t('register.joinAshaNetwork')}</Text>
            <Text style={styles.illustrationSubtext}>{t('register.createYourAccount')}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('register.personalInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.fullName')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterFullName')}
                  value={formData.name}
                  onChangeText={(text) => updateFormData("name", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.ashaId')}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterAshaId')}
                  value={formData.ashaId}
                  onChangeText={(text) => updateFormData("ashaId", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.phoneNumber')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterPhone')}
                  value={formData.phone}
                  onChangeText={(text) => updateFormData("phone", text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('register.accountInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.emailAddress')}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterEmail')}
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.password')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.createPassword')}
                  value={formData.password}
                  onChangeText={(text) => updateFormData("password", text)}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.confirmPassword')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.confirmYourPassword')}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData("confirmPassword", text)}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Territory Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('register.territoryInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.state')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="map" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterState')}
                  value={formData.territory.state}
                  onChangeText={(text) => updateFormData("territory.state", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.district')}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterDistrict')}
                  value={formData.territory.district}
                  onChangeText={(text) => updateFormData("territory.district", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>{t('register.block')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('placeholders.enterBlock')}
                    value={formData.territory.block}
                    onChangeText={(text) => updateFormData("territory.block", text)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>{t('register.village')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="home" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('placeholders.enterVillage')}
                    value={formData.territory.village}
                    onChangeText={(text) => updateFormData("territory.village", text)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('register.supervisorId')}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="supervisor-account" size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('placeholders.enterSupervisorId')}
                  value={formData.supervisorId}
                  onChangeText={(text) => updateFormData("supervisorId", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient 
              colors={["#2563eb", "#1d4ed8"]} 
              style={styles.registerButtonGradient}
            >
              {loading ? (
                <Text style={styles.registerButtonText}>{t('register.creatingAccount')}</Text>
              ) : (
                <>
                  <Text style={styles.registerButtonText}>{t('register.createAccount')}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>{t('auth.signInLink')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Language Button */}
      <FloatingLanguageButton />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  illustration: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  illustrationText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  illustrationSubtext: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  registerButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#6B7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
});