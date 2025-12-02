import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { upsertPatient, toYMD } from "../db/sqlite";
import FloatingLanguageButton from "../components/FloatingLanguageButton";

type PatientFormScreenProps = { route: any };
export default function PatientFormScreen({ route }: PatientFormScreenProps) {
  const navigation = useNavigation<any>();

  // CRITICAL FIX: Separate all states to prevent unnecessary re-renders
  const [activeSection, setActiveSection] = useState("demographics");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // CRITICAL FIX: Use ref for form data - this won't trigger re-renders
  const formDataRef = useRef({
    // Patient Demographics
    fullName: route.params?.patient?.name || "",
    age: route.params?.patient?.age?.toString() || "",
    dateOfBirth: route.params?.patient?.dateOfBirth || "",
    gender: route.params?.patient?.gender || "",
    village: route.params?.patient?.village || "",
    block: route.params?.patient?.territory?.block || "",
    district: route.params?.patient?.territory?.district || "",
    contactNumber: route.params?.patient?.contact || "",
    familyHeadName: route.params?.patient?.familyHeadName || "",
    householdId: route.params?.patient?.householdId || "",

    // Maternal Health
    isPregnant: route.params?.patient?.status === "pregnant" || false,
    pregnancyStatus: route.params?.patient?.pregnancyStatus || "",
    expectedDeliveryDate: route.params?.patient?.expectedDeliveryDate || "",
    ancVisitsCompleted: route.params?.patient?.ancVisitsCompleted || "",
    lastAncDate: route.params?.patient?.lastAncDate || "",
    supplementation: route.params?.patient?.supplementation || "",
    referralDetails: route.params?.patient?.referralDetails || "",

    // Child Health
    childBirthDate: route.params?.patient?.childBirthDate || "",
    birthWeight: route.params?.patient?.birthWeight || "",
    immunizationHistory: route.params?.patient?.immunizationHistory || "",
    lastVaccineDate: route.params?.patient?.lastVaccineDate || "",
    nextVaccineDate: route.params?.patient?.nextVaccineDate || "",
    currentWeight: route.params?.patient?.currentWeight || "",
    currentHeight: route.params?.patient?.currentHeight || "",

    // Health Visits
    visitDate: route.params?.patient?.visitDate || "",
    visitType: route.params?.patient?.visitType || "",
    bloodPressure: route.params?.patient?.bloodPressure || "",
    pulse: route.params?.patient?.pulse || "",
    temperature: route.params?.patient?.temperature || "",
    symptoms: route.params?.patient?.symptoms || "",
    treatmentGiven: route.params?.patient?.treatmentGiven || "",

    // Reminders
    vaccinationReminder: route.params?.patient?.vaccinationReminder || "",
    ancFollowUpReminder: route.params?.patient?.ancFollowUpReminder || "",
    otherReminders: route.params?.patient?.otherReminders || "",
  });

  // TextInput refs for proper focus management
  const textInputRefs = useRef<{ [key: string]: TextInput }>({});

  // CRITICAL FIX: Update form data without causing re-renders
  const updateFormData = (field: string, value: any) => {
    formDataRef.current[field] = value;
    // No setState call here - this prevents re-renders
  };

  const handleDateFieldPress = (field: string) => {
    const existingDate = formDataRef.current[field];
    if (existingDate) {
      const [year, month, day] = existingDate.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else {
      setSelectedDate(new Date());
    }
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') {
        updateFormData(currentDateField, toYMD(date));
      }
    }
  };

  const handleDateConfirm = () => {
    updateFormData(currentDateField, toYMD(selectedDate));
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!formDataRef.current.fullName.trim()) {
      Alert.alert("Validation Error", "Please enter patient's full name");
      return;
    }

    if (!formDataRef.current.village.trim()) {
      Alert.alert("Validation Error", "Please enter village name");
      return;
    }

    setIsSaving(true);
    Keyboard.dismiss();

    try {
      const id = route.params?.patient?.id || Date.now().toString();
      const record = {
        id,
        name: formDataRef.current.fullName,
        village: formDataRef.current.village,
        age: parseInt(formDataRef.current.age) || 0,
        gender: formDataRef.current.gender,
        lastVisit: toYMD(new Date()),
        status: determinePatientStatus(formDataRef.current),
        nextVisit: calculateNextVisit(formDataRef.current),
        contact: formDataRef.current.contactNumber,
        territory_state: "Bihar",
        territory_district: formDataRef.current.district || "Patna",
        territory_block: formDataRef.current.block || "Phulwari",
        territory_village: formDataRef.current.village,
        formData: formDataRef.current,
      } as any;

      await upsertPatient(record);
      Alert.alert("Success", route.params?.patient ? "Patient updated successfully!" : "Patient saved successfully!");
      navigation.goBack();

    } catch (error) {
      console.error('Error saving patient:', error);
      Alert.alert("Error", "Failed to save patient. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const determinePatientStatus = (patientData: any) => {
    if (patientData.isPregnant) return "pregnant";
    if (patientData.childBirthDate) return "child_care";
    if (patientData.ancVisitsCompleted) return "anc";
    return "general";
  };

  const calculateNextVisit = (patientData: any) => {
    const today = new Date();
    if (patientData.nextVaccineDate) return patientData.nextVaccineDate;
    if (patientData.expectedDeliveryDate) return patientData.expectedDeliveryDate;

    const nextVisit = new Date(today);
    nextVisit.setDate(today.getDate() + 30);
    return toYMD(nextVisit);
  };

  const SectionButton = ({ title, icon, isActive, onPress }: { title: string; icon: React.ReactNode; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.sectionButton, isActive && styles.sectionButtonActive]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.sectionButtonText, isActive && styles.sectionButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // CRITICAL FIX: Create a separate component for each input field
  // This prevents the entire form from re-rendering on every keystroke
  const InputField = React.memo(({
    label,
    fieldName,
    placeholder,
    icon,
    multiline = false,
    keyboardType = "default" as any,
    returnKeyType = "next" as any,
    nextField = "",
  }: {
    label: string;
    fieldName: string;
    placeholder?: string;
    icon?: React.ReactNode;
    multiline?: boolean;
    keyboardType?: any;
    returnKeyType?: any;
    nextField?: string;
  }) => {
    // CRITICAL: Each input manages its own state locally
    const [value, setValue] = useState(formDataRef.current[fieldName]);

    const handleChangeText = (text: string) => {
      setValue(text); // Update local state
      updateFormData(fieldName, text); // Update ref (no re-render)
    };

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
        <TextInput
          ref={ref => {
            if (ref) textInputRefs.current[fieldName] = ref;
          }}
          style={[styles.textInput, multiline && styles.multilineInput]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          keyboardType={keyboardType}
          autoCapitalize={label.toLowerCase().includes('name') || label.toLowerCase().includes('village') ? 'words' : 'none'}
          autoCorrect={false}
          returnKeyType={multiline ? 'default' : returnKeyType}
          blurOnSubmit={multiline ? false : true}
          onSubmitEditing={() => {
            if (nextField && textInputRefs.current[nextField]) {
              textInputRefs.current[nextField].focus();
            } else if (!multiline) {
              Keyboard.dismiss();
            }
          }}
          // Critical props to prevent keyboard issues
          contextMenuHidden={false}
          selectTextOnFocus={true}
          clearTextOnFocus={false}
          enablesReturnKeyAutomatically={false}
        />
      </View>
    );
  });

  const DateInputField = ({ label, fieldName }: { label: string; fieldName: string; }) => (
    <TouchableOpacity style={styles.inputContainer} onPress={() => handleDateFieldPress(fieldName)}>
      <View style={styles.labelContainer}>
        <Feather name="calendar" size={14} color="#6B7280" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.dateInput}>
        <Text style={[styles.dateInputText, !formDataRef.current[fieldName] && styles.placeholderText]}>
          {formDataRef.current[fieldName] || "Select date"}
        </Text>
        <Feather name="calendar" size={18} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  // CRITICAL FIX: Separate Switch component to prevent re-renders
  const PregnancySwitch = React.memo(() => {
    const [isPregnant, setIsPregnant] = useState(formDataRef.current.isPregnant);

    const handleValueChange = (value: boolean) => {
      setIsPregnant(value);
      updateFormData("isPregnant", value);
    };

    return (
      <View style={styles.switchContainer}>
        <View style={styles.switchLabel}>
          <FontAwesome5 name="baby" size={14} color="#6B7280" />
          <Text style={styles.switchText}>Is Patient Pregnant?</Text>
        </View>
        <Switch
          value={isPregnant}
          onValueChange={handleValueChange}
          trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
          thumbColor={isPregnant ? "#2563eb" : "#9CA3AF"}
        />
      </View>
    );
  });

  const SaveButton = () => (
    <TouchableOpacity
      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
      onPress={handleSave}
      disabled={isSaving}
    >
      <LinearGradient
        colors={isSaving ? ["#9CA3AF", "#6B7280"] : ["#2563eb", "#1d4ed8"]}
        style={styles.saveButtonGradient}
      >
        <Ionicons name="save" size={18} color="#fff" />
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : (route.params?.patient ? 'Update' : 'Save') + ' Patient Record'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {route.params?.patient ? 'Edit Patient' : 'New Patient Record'}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Section Navigation */}
      <View style={styles.sectionNavContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionNav}>
          <SectionButton
            title="Demographics"
            icon={<Ionicons name="person" size={14} color={activeSection === "demographics" ? "#fff" : "#6B7280"} />}
            isActive={activeSection === "demographics"}
            onPress={() => setActiveSection("demographics")}
          />
          <SectionButton
            title="Maternal Health"
            icon={<FontAwesome5 name="baby" size={12} color={activeSection === "maternal" ? "#fff" : "#6B7280"} />}
            isActive={activeSection === "maternal"}
            onPress={() => setActiveSection("maternal")}
          />
          <SectionButton
            title="Child Health"
            icon={<Ionicons name="medkit" size={14} color={activeSection === "child" ? "#fff" : "#6B7280"} />}
            isActive={activeSection === "child"}
            onPress={() => setActiveSection("child")}
          />
          <SectionButton
            title="Health Visits"
            icon={<Feather name="activity" size={14} color={activeSection === "visits" ? "#fff" : "#6B7280"} />}
            isActive={activeSection === "visits"}
            onPress={() => setActiveSection("visits")}
          />
          <SectionButton
            title="Reminders"
            icon={<Ionicons name="notifications" size={14} color={activeSection === "reminders" ? "#fff" : "#6B7280"} />}
            isActive={activeSection === "reminders"}
            onPress={() => setActiveSection("reminders")}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Patient Demographics Section */}
        {activeSection === "demographics" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color="#2563eb" />
              <Text style={styles.sectionTitle}>Patient Demographics</Text>
            </View>

            <InputField
              label="Full Name *"
              fieldName="fullName"
              placeholder="Enter patient's full name"
              icon={<Feather name="user" size={14} color="#6B7280" />}
              nextField="age"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Age"
                  fieldName="age"
                  placeholder="Age in years"
                  icon={<Feather name="calendar" size={12} color="#6B7280" />}
                  keyboardType="numeric"
                  nextField="dateOfBirth"
                />
              </View>
              <View style={styles.halfInput}>
                <DateInputField
                  label="Date of Birth"
                  fieldName="dateOfBirth"
                />
              </View>
            </View>

            <InputField
              label="Gender"
              fieldName="gender"
              placeholder="Male / Female / Other"
              icon={<FontAwesome5 name="transgender" size={12} color="#6B7280" />}
              nextField="village"
            />

            <InputField
              label="Village *"
              fieldName="village"
              placeholder="Enter village name"
              icon={<Ionicons name="location" size={14} color="#6B7280" />}
              nextField="block"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Block"
                  fieldName="block"
                  placeholder="Block name"
                  icon={<Ionicons name="business" size={12} color="#6B7280" />}
                  nextField="district"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="District"
                  fieldName="district"
                  placeholder="District name"
                  icon={<Ionicons name="map" size={12} color="#6B7280" />}
                  nextField="contactNumber"
                />
              </View>
            </View>

            <InputField
              label="Contact Number"
              fieldName="contactNumber"
              placeholder="Phone number"
              icon={<Feather name="phone" size={14} color="#6B7280" />}
              keyboardType="phone-pad"
              nextField="familyHeadName"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Family Head Name"
                  fieldName="familyHeadName"
                  placeholder="Head of family"
                  icon={<Ionicons name="people" size={12} color="#6B7280" />}
                  nextField="householdId"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Household ID"
                  fieldName="householdId"
                  placeholder="HH ID number"
                  icon={<MaterialIcons name="badge" size={12} color="#6B7280" />}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        )}

        {/* Maternal Health Section */}
        {activeSection === "maternal" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="baby" size={18} color="#2563eb" />
              <Text style={styles.sectionTitle}>Maternal Health Details</Text>
            </View>

            <PregnancySwitch />

            {formDataRef.current.isPregnant && (
              <>
                <InputField
                  label="Pregnancy Status"
                  fieldName="pregnancyStatus"
                  placeholder="Trimester, complications, etc."
                  icon={<Feather name="info" size={12} color="#6B7280" />}
                  nextField="expectedDeliveryDate"
                />

                <DateInputField
                  label="Expected Delivery Date"
                  fieldName="expectedDeliveryDate"
                />

                <InputField
                  label="ANC Visits Completed"
                  fieldName="ancVisitsCompleted"
                  placeholder="Number of ANC visits"
                  icon={<Feather name="check-circle" size={12} color="#6B7280" />}
                  keyboardType="numeric"
                  nextField="lastAncDate"
                />

                <DateInputField
                  label="Last ANC Date"
                  fieldName="lastAncDate"
                />

                <InputField
                  label="Supplementation Given"
                  fieldName="supplementation"
                  placeholder="Iron, Folic Acid, etc."
                  icon={<FontAwesome5 name="pills" size={12} color="#6B7280" />}
                  multiline
                  nextField="referralDetails"
                />

                <InputField
                  label="Referral Details"
                  fieldName="referralDetails"
                  placeholder="PHC or hospital referrals"
                  icon={<Ionicons name="medical" size={14} color="#6B7280" />}
                  multiline
                />
              </>
            )}
          </View>
        )}
        {/* Child Health Section */}
        {activeSection === "child" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit" size={18} color="#2563eb" />
              <Text style={styles.sectionTitle}>Child Health & Immunization</Text>
            </View>

            <DateInputField
              label="Child's Birth Date"
              fieldName="childBirthDate"
            />

            <InputField
              label="Birth Weight"
              fieldName="birthWeight"
              placeholder="Weight at birth (kg)"
              icon={<FontAwesome5 name="weight" size={12} color="#6B7280" />}
              keyboardType="numeric"
              nextField="immunizationHistory"
            />

            <InputField
              label="Immunization History"
              fieldName="immunizationHistory"
              placeholder="Vaccines received with dates"
              icon={<MaterialIcons name="vaccines" size={14} color="#6B7280" />}
              multiline
              nextField="lastVaccineDate"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <DateInputField
                  label="Last Vaccine Date"
                  fieldName="lastVaccineDate"
                />
              </View>
              <View style={styles.halfInput}>
                <DateInputField
                  label="Next Vaccine Due"
                  fieldName="nextVaccineDate"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Current Weight"
                  fieldName="currentWeight"
                  placeholder="Weight (kg)"
                  icon={<FontAwesome5 name="weight" size={10} color="#6B7280" />}
                  keyboardType="numeric"
                  nextField="currentHeight"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Current Height"
                  fieldName="currentHeight"
                  placeholder="Height (cm)"
                  icon={<Feather name="bar-chart-2" size={12} color="#6B7280" />}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}

{/* Health Visits Section */}
        {activeSection === "visits" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={18} color="#2563eb" />
              <Text style={styles.sectionTitle}>Health Visits & Checkups</Text>
            </View>

            <DateInputField
              label="Visit Date"
              fieldName="visitDate"
            />

            <InputField
              label="Visit Type"
              fieldName="visitType"
              placeholder="ANC, Immunization, General Checkup"
              icon={<Ionicons name="medical" size={14} color="#6B7280" />}
              nextField="bloodPressure"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Blood Pressure"
                  fieldName="bloodPressure"
                  placeholder="BP reading"
                  icon={<Feather name="activity" size={10} color="#6B7280" />}
                  nextField="pulse"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Pulse Rate"
                  fieldName="pulse"
                  placeholder="Pulse per minute"
                  icon={<Ionicons name="pulse" size={12} color="#6B7280" />}
                  keyboardType="numeric"
                  nextField="temperature"
                />
              </View>
            </View>

            <InputField
              label="Temperature"
              fieldName="temperature"
              placeholder="Temperature in °C"
              icon={<Feather name="thermometer" size={12} color="#6B7280" />}
              keyboardType="numeric"
              nextField="symptoms"
            />

            <InputField
              label="Symptoms & Complaints"
              fieldName="symptoms"
              placeholder="Any symptoms or health complaints"
              icon={<MaterialIcons name="sick" size={14} color="#6B7280" />}
              multiline
              nextField="treatmentGiven"
            />

            <InputField
              label="Treatment & Advice"
              fieldName="treatmentGiven"
              placeholder="Treatment given or advice provided"
              icon={<Feather name="file-text" size={12} color="#6B7280" />}
              multiline
            />
          </View>
        )}
        {/* Reminders Section */}
        {activeSection === "reminders" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={18} color="#2563eb" />
              <Text style={styles.sectionTitle}>Reminders & Follow-up</Text>
            </View>

            <InputField
              label="Vaccination Reminders"
              fieldName="vaccinationReminder"
              placeholder="Upcoming vaccination dates"
              icon={<MaterialIcons name="vaccines" size={14} color="#6B7280" />}
              multiline
              nextField="ancFollowUpReminder"
            />

            <InputField
              label="ANC Follow-up Reminders"
              fieldName="ancFollowUpReminder"
              placeholder="Next ANC visit dates"
              icon={<FontAwesome5 name="baby" size={12} color="#6B7280" />}
              multiline
              nextField="otherReminders"
            />

            <InputField
              label="Other Reminders"
              fieldName="otherReminders"
              placeholder="Any other scheduled visits or alerts"
              icon={<Ionicons name="alert-circle" size={14} color="#6B7280" />}
              multiline
            />
          </View>
        )}
        {/* Add other sections similarly... */}
        <SaveButton />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Select {currentDateField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>

                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.datePicker}
                  minimumDate={currentDateField.includes('Birth') ? new Date(1900, 0, 1) : new Date()}
                  maximumDate={currentDateField.includes('Birth') ? new Date() : new Date(2100, 0, 1)}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleDateCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleDateConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Select Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={currentDateField.includes('Birth') ? new Date(1900, 0, 1) : new Date()}
              maximumDate={currentDateField.includes('Birth') ? new Date() : new Date(2100, 0, 1)}
            />
          )}
        </>
      )}

      {/* Floating Language Button */}
      <FloatingLanguageButton />
    </View>
  );
}

// Styles remain exactly the same as before...
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
    paddingBottom: 12,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholder: {
    width: 34,
  },
  sectionNavContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionNav: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 70,
  },
  sectionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    height: 54,
  },
  sectionButtonActive: {
    backgroundColor: "#2563eb",
  },
  sectionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 4,
  },
  sectionButtonTextActive: {
    color: "#fff",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  section: {
    marginBottom: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#374151",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    fontSize: 14,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  saveButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    margin: 20,
    width: '90%',
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
    textAlign: "center",
  },
  datePicker: {
    width: '100%',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: "#2563eb",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});