import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
// import { captureRef } from 'react-native-view-shot'; // Uncomment after installing dependency
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatingLanguageButton from '../components/FloatingLanguageButton';

interface Patient {
  id: string;
  name: string;
  village: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: string;
  nextVisit: string;
  contact: string;
  territory: {
    state: string;
    district: string;
    block: string;
    village: string;
  };
  formData?: any;
}

interface Visit {
  id: string;
  date: string;
  type: string;
  notes: string;
  followUpRequired: boolean;
  nextVisitDate?: string;
}

interface MedicalHistory {
  maternalHealth?: {
    lmpDate?: string;
    edd?: string;
    pregnancyWeek?: number;
    parity?: number;
    gravida?: number;
    complications?: string[];
    bloodGroup?: string;
    hemoglobin?: number;
    bloodPressure?: string;
    previousDeliveries?: Array<{
      date: string;
      type: 'normal' | 'cesarean';
      birthWeight?: number;
      outcome: 'live' | 'stillbirth';
    }>;
  };
  childHealth?: {
    birthDate?: string;
    birthWeight?: number;
    gestationalAge?: number;
    deliveryType?: 'normal' | 'cesarean';
    vaccinations?: Array<{
      name: string;
      date: string;
      status: 'completed' | 'pending' | 'overdue';
      dueDate?: string;
    }>;
    growthRecords?: Array<{
      date: string;
      weight: number;
      height: number;
      headCircumference?: number;
    }>;
    developmentalMilestones?: Array<{
      milestone: string;
      achieved: boolean;
      expectedAge: string;
      achievedAge?: string;
    }>;
  };
  medicalConditions?: Array<{
    condition: string;
    diagnosedDate: string;
    status: 'active' | 'resolved';
    medications?: string[];
    notes?: string;
  }>;
  allergies?: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
  familyHistory?: {
    diabetes: boolean;
    hypertension: boolean;
    heartDisease: boolean;
    geneticDisorders: boolean;
    otherConditions?: string[];
  };
}

export default function PatientDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { patient } = route.params as { patient: Patient };
  
  const [activeTab, setActiveTab] = useState('overview');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({});
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false);
  const [newVisit, setNewVisit] = useState({
    type: 'routine',
    notes: '',
    followUpRequired: false,
    nextVisitDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadVisits();
    loadMedicalHistory();
  }, []);

  const loadVisits = async () => {
    // Mock data - replace with actual storage implementation
    const mockVisits: Visit[] = [
      {
        id: '1',
        date: '2024-01-15',
        type: 'anc',
        notes: 'Regular checkup, all parameters normal',
        followUpRequired: true,
        nextVisitDate: '2024-02-15',
      },
      {
        id: '2',
        date: '2024-01-01',
        type: 'registration',
        notes: 'Initial patient registration',
        followUpRequired: true,
        nextVisitDate: '2024-01-15',
      },
    ];
    setVisits(mockVisits);
  };

  const loadMedicalHistory = async () => {
    // Mock medical history data
    const mockMedicalHistory: MedicalHistory = {
      maternalHealth: {
        lmpDate: '2023-11-01',
        edd: '2024-08-08',
        pregnancyWeek: 12,
        parity: 1,
        gravida: 2,
        bloodGroup: 'B+',
        hemoglobin: 11.5,
        bloodPressure: '120/80',
        complications: ['Anemia'],
        previousDeliveries: [
          {
            date: '2022-05-15',
            type: 'normal',
            birthWeight: 2.8,
            outcome: 'live'
          }
        ]
      },
      childHealth: {
        birthDate: '2022-05-15',
        birthWeight: 2.8,
        gestationalAge: 38,
        deliveryType: 'normal',
        vaccinations: [
          { name: 'BCG', date: '2022-05-15', status: 'completed' },
          { name: 'OPV-0', date: '2022-05-15', status: 'completed' },
          { name: 'Hep-B', date: '2022-05-15', status: 'completed' },
          { name: 'DPT-1', date: '2022-06-15', status: 'completed' },
          { name: 'OPV-1', date: '2022-06-15', status: 'completed' },
          { name: 'DPT-2', date: '2022-07-15', status: 'pending', dueDate: '2022-07-15' }
        ],
        growthRecords: [
          { date: '2022-05-15', weight: 2.8, height: 48, headCircumference: 34 },
          { date: '2022-06-15', weight: 3.5, height: 52, headCircumference: 36 },
          { date: '2022-07-15', weight: 4.2, height: 55, headCircumference: 38 }
        ],
        developmentalMilestones: [
          { milestone: 'Social Smile', achieved: true, expectedAge: '2 months', achievedAge: '6 weeks' },
          { milestone: 'Head Holding', achieved: true, expectedAge: '3 months', achievedAge: '10 weeks' },
          { milestone: 'Rolling Over', achieved: false, expectedAge: '4-6 months' }
        ]
      },
      medicalConditions: [
        {
          condition: 'Anemia',
          diagnosedDate: '2023-12-01',
          status: 'active',
          medications: ['Iron Supplements', 'Folic Acid'],
          notes: 'Mild iron deficiency anemia'
        }
      ],
      allergies: [
        {
          allergen: 'Penicillin',
          reaction: 'Skin Rash',
          severity: 'moderate'
        }
      ],
      familyHistory: {
        diabetes: true,
        hypertension: false,
        heartDisease: true,
        geneticDisorders: false,
        otherConditions: ['Asthma']
      }
    };
    setMedicalHistory(mockMedicalHistory);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pregnant":
        return { icon: "🤰", color: "#EC4899", label: "Pregnant" };
      case "child_care":
        return { icon: "👶", color: "#10B981", label: "Child Care" };
      case "anc":
        return { icon: "🏥", color: "#3B82F6", label: "ANC" };
      default:
        return { icon: "👤", color: "#6B7280", label: "General" };
    }
  };

  const statusInfo = getStatusIcon(patient.status);

  const handleCall = () => {
    if (patient.contact) {
      Linking.openURL(`tel:${patient.contact}`);
    } else {
      Alert.alert('No Contact', 'Phone number not available for this patient');
    }
  };

  const handleMessage = () => {
    if (patient.contact) {
      const msg = encodeURIComponent(`Hello ${patient.name}, this is ASHA worker ${user?.name}.`);
      Linking.openURL(`sms:${patient.contact}?body=${msg}`);
    } else {
      Alert.alert('No Contact', 'Phone number not available for this patient');
    }
  };

  const handleWhatsApp = async () => {
    if (!patient.contact) {
      Alert.alert('No Contact', 'Phone number not available for this patient');
      return;
    }

    const message = encodeURIComponent(`Hello ${patient.name}, this is ASHA worker ${user?.name}.`);
    const phone = String(patient.contact).replace(/[^0-9+]/g, '');
    const appUrl = `whatsapp://send?phone=${phone}&text=${message}`;
    const webUrl = `https://wa.me/${phone}?text=${message}`;
    
    try {
      const supported = await Linking.canOpenURL('whatsapp://send');
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      Alert.alert('WhatsApp unavailable', 'Please install WhatsApp to send a message.');
    }
  };

  const handleAddVisit = () => {
    const newVisitObj: Visit = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newVisit.type,
      notes: newVisit.notes,
      followUpRequired: newVisit.followUpRequired,
      nextVisitDate: newVisit.followUpRequired ? newVisit.nextVisitDate.toISOString().split('T')[0] : undefined,
    };

    setVisits([newVisitObj, ...visits]);
    setShowAddVisitModal(false);
    setNewVisit({
      type: 'routine',
      notes: '',
      followUpRequired: false,
      nextVisitDate: new Date(),
    });

    Alert.alert('Success', 'Visit recorded successfully');
  };

  const downloadPatientInfo = async () => {
    try {
      const patientInfo = `
PATIENT INFORMATION
===================

Name: ${patient.name}
Age: ${patient.age} years
Gender: ${patient.gender}
Status: ${statusInfo.label}
Contact: ${patient.contact || 'Not provided'}
Village: ${patient.village}

Territory Information:
- State: ${patient.territory.state}
- District: ${patient.territory.district}
- Block: ${patient.territory.block}
- Village: ${patient.territory.village}

Medical Visits (${visits.length}):
${visits.map(visit => `
Visit Date: ${visit.date}
Type: ${visit.type.toUpperCase()}
Notes: ${visit.notes}
${visit.followUpRequired ? `Next Visit: ${visit.nextVisitDate}` : 'No follow-up required'}
`).join('\n')}

Last Updated: ${new Date().toLocaleDateString()}
ASHA Worker: ${user?.name}
      `.trim();

      const fileUri = FileSystem.documentDirectory + `patient_${patient.name}_${Date.now()}.txt`;
      
      await FileSystem.writeAsStringAsync(fileUri, patientInfo, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Download Complete', 'Patient information saved locally.');
    } catch (error) {
      console.error('Error downloading patient info:', error);
      Alert.alert('Error', 'Failed to download patient information');
    }
  };

  const upcomingVisits = visits.filter(visit => 
    visit.followUpRequired && visit.nextVisitDate && 
    new Date(visit.nextVisitDate) >= new Date()
  );

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const visitDate = new Date(date);
    const diffTime = visitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Overdue';
    return `In ${diffDays} days`;
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Patient Basic Info */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{patient.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{patient.age} years</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="transgender" size={14} color="#6B7280" />
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{patient.gender}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Village</Text>
            <Text style={styles.infoValue}>{patient.village}</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <View style={styles.contactActions}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#3B82F6" />
            <Text style={styles.contactButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleMessage}>
            <Ionicons name="chatbubble" size={20} color="#10B981" />
            <Text style={styles.contactButtonText}>SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#22C55E" />
            <Text style={styles.contactButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
        {patient.contact && (
          <Text style={styles.contactNumber}>Phone: {patient.contact}</Text>
        )}
      </View>

      {/* Territory Information */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Territory Information</Text>
        <View style={styles.territoryInfo}>
          <View style={styles.territoryItem}>
            <Text style={styles.territoryLabel}>State</Text>
            <Text style={styles.territoryValue}>{patient.territory.state}</Text>
          </View>
          <View style={styles.territoryItem}>
            <Text style={styles.territoryLabel}>District</Text>
            <Text style={styles.territoryValue}>{patient.territory.district}</Text>
          </View>
          <View style={styles.territoryItem}>
            <Text style={styles.territoryLabel}>Block</Text>
            <Text style={styles.territoryValue}>{patient.territory.block}</Text>
          </View>
          <View style={styles.territoryItem}>
            <Text style={styles.territoryLabel}>Village</Text>
            <Text style={styles.territoryValue}>{patient.territory.village}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderVisits = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={styles.addVisitButton}
        onPress={() => setShowAddVisitModal(true)}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addVisitButtonText}>Record New Visit</Text>
      </TouchableOpacity>

      {visits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Visits Recorded</Text>
          <Text style={styles.emptyStateText}>
            Record the first visit for {patient.name}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.visitsList}>
          {visits.map((visit) => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <View style={styles.visitDateContainer}>
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text style={styles.visitDate}>{visit.date}</Text>
                </View>
                <View style={[styles.visitType, { backgroundColor: getStatusIcon(visit.type).color + '20' }]}>
                  <Text style={[styles.visitTypeText, { color: getStatusIcon(visit.type).color }]}>
                    {visit.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.visitNotes}>{visit.notes}</Text>
              {visit.followUpRequired && visit.nextVisitDate && (
                <View style={styles.followUpInfo}>
                  <Ionicons name="arrow-redo" size={14} color="#F59E0B" />
                  <Text style={styles.followUpText}>
                    Next visit: {visit.nextVisitDate}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderUpcoming = () => (
    <View style={styles.tabContent}>
      {upcomingVisits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Upcoming Visits</Text>
          <Text style={styles.emptyStateText}>
            All follow-ups are completed
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.visitsList}>
          {upcomingVisits.map((visit) => (
            <View key={visit.id} style={styles.upcomingVisitCard}>
              <View style={styles.upcomingVisitHeader}>
                <View>
                  <Text style={styles.upcomingVisitDate}>{visit.nextVisitDate}</Text>
                  <Text style={styles.upcomingVisitType}>{visit.type.toUpperCase()} Follow-up</Text>
                </View>
                <View style={styles.urgencyBadge}>
                  <Ionicons name="time" size={14} color="#fff" />
                  <Text style={styles.urgencyText}>
                    {getDaysUntil(visit.nextVisitDate!)}
                  </Text>
                </View>
              </View>
              <Text style={styles.upcomingVisitNotes}>
                Previous visit: {visit.date} - {visit.notes}
              </Text>
              <TouchableOpacity style={styles.markCompleteButton}>
                <Text style={styles.markCompleteText}>Mark as Completed</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderMedicalHistory = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={styles.addVisitButton}
        onPress={() => setShowMedicalHistoryModal(true)}
      >
        <Ionicons name="medical" size={20} color="#fff" />
        <Text style={styles.addVisitButtonText}>Update Medical History</Text>
      </TouchableOpacity>

      {/* Maternal Health Section */}
      {medicalHistory.maternalHealth && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="female" size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>Maternal Health</Text>
          </View>
          <View style={styles.historyGrid}>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>LMP Date</Text>
              <Text style={styles.historyValue}>{medicalHistory.maternalHealth.lmpDate}</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>EDD</Text>
              <Text style={styles.historyValue}>{medicalHistory.maternalHealth.edd}</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>Pregnancy Week</Text>
              <Text style={styles.historyValue}>Week {medicalHistory.maternalHealth.pregnancyWeek}</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>Blood Group</Text>
              <Text style={styles.historyValue}>{medicalHistory.maternalHealth.bloodGroup}</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>Hemoglobin</Text>
              <Text style={styles.historyValue}>{medicalHistory.maternalHealth.hemoglobin} g/dL</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>Blood Pressure</Text>
              <Text style={styles.historyValue}>{medicalHistory.maternalHealth.bloodPressure}</Text>
            </View>
          </View>
          
          {medicalHistory.maternalHealth.complications && medicalHistory.maternalHealth.complications.length > 0 && (
            <View style={styles.complicationsSection}>
              <Text style={styles.complicationsTitle}>Complications</Text>
              {medicalHistory.maternalHealth.complications.map((comp, index) => (
                <View key={index} style={styles.complicationItem}>
                  <Ionicons name="warning" size={16} color="#DC2626" />
                  <Text style={styles.complicationText}>{comp}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Child Health Section */}
      {medicalHistory.childHealth && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="happy" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Child Health</Text>
          </View>
          
          {/* Vaccination Status */}
          <View style={styles.vaccinationSection}>
            <Text style={styles.subsectionTitle}>Vaccination Schedule</Text>
            {medicalHistory.childHealth.vaccinations?.map((vaccine, index) => (
              <View key={index} style={[
                styles.vaccineItem,
                vaccine.status === 'completed' && styles.vaccineCompleted,
                vaccine.status === 'pending' && styles.vaccinePending,
                vaccine.status === 'overdue' && styles.vaccineOverdue,
              ]}>
                <View style={styles.vaccineInfo}>
                  <Text style={styles.vaccineName}>{vaccine.name}</Text>
                  <Text style={styles.vaccineDate}>
                    {vaccine.status === 'completed' ? `Given: ${vaccine.date}` : `Due: ${vaccine.dueDate}`}
                  </Text>
                </View>
                <View style={[
                  styles.vaccineStatus,
                  vaccine.status === 'completed' && styles.statusCompleted,
                  vaccine.status === 'pending' && styles.statusPending,
                  vaccine.status === 'overdue' && styles.statusOverdue,
                ]}>
                  <Text style={styles.vaccineStatusText}>
                    {vaccine.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Growth Chart */}
          <View style={styles.growthSection}>
            <Text style={styles.subsectionTitle}>Growth Records</Text>
            {medicalHistory.childHealth.growthRecords?.map((record, index) => (
              <View key={index} style={styles.growthRecord}>
                <Text style={styles.growthDate}>{record.date}</Text>
                <View style={styles.growthMetrics}>
                  <Text style={styles.growthMetric}>Weight: {record.weight} kg</Text>
                  <Text style={styles.growthMetric}>Height: {record.height} cm</Text>
                  {record.headCircumference && (
                    <Text style={styles.growthMetric}>Head: {record.headCircumference} cm</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Medical Conditions */}
      {medicalHistory.medicalConditions && medicalHistory.medicalConditions.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Medical Conditions</Text>
          </View>
          {medicalHistory.medicalConditions.map((condition, index) => (
            <View key={index} style={styles.conditionItem}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionName}>{condition.condition}</Text>
                <View style={[
                  styles.conditionStatus,
                  condition.status === 'active' ? styles.statusActive : styles.statusResolved
                ]}>
                  <Text style={styles.conditionStatusText}>
                    {condition.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.conditionDate}>Diagnosed: {condition.diagnosedDate}</Text>
              {condition.medications && condition.medications.length > 0 && (
                <View style={styles.medicationsList}>
                  <Text style={styles.medicationsTitle}>Medications:</Text>
                  {condition.medications.map((med, medIndex) => (
                    <Text key={medIndex} style={styles.medicationItem}>• {med}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Allergies */}
      {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Allergies</Text>
          </View>
          {medicalHistory.allergies.map((allergy, index) => (
            <View key={index} style={styles.allergyItem}>
              <Text style={styles.allergyName}>{allergy.allergen}</Text>
              <Text style={styles.allergyReaction}>{allergy.reaction}</Text>
              <View style={[
                styles.allergySeverity,
                allergy.severity === 'mild' && styles.severityMild,
                allergy.severity === 'moderate' && styles.severityModerate,
                allergy.severity === 'severe' && styles.severitySevere,
              ]}>
                <Text style={styles.allergySeverityText}>
                  {allergy.severity.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Family History */}
      {medicalHistory.familyHistory && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Family History</Text>
          </View>
          <View style={styles.familyHistoryGrid}>
            <View style={styles.familyHistoryItem}>
              <Text style={styles.familyHistoryLabel}>Diabetes</Text>
              <Ionicons 
                name={medicalHistory.familyHistory.diabetes ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={medicalHistory.familyHistory.diabetes ? "#10B981" : "#DC2626"} 
              />
            </View>
            <View style={styles.familyHistoryItem}>
              <Text style={styles.familyHistoryLabel}>Hypertension</Text>
              <Ionicons 
                name={medicalHistory.familyHistory.hypertension ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={medicalHistory.familyHistory.hypertension ? "#10B981" : "#DC2626"} 
              />
            </View>
            <View style={styles.familyHistoryItem}>
              <Text style={styles.familyHistoryLabel}>Heart Disease</Text>
              <Ionicons 
                name={medicalHistory.familyHistory.heartDisease ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={medicalHistory.familyHistory.heartDisease ? "#10B981" : "#DC2626"} 
              />
            </View>
            <View style={styles.familyHistoryItem}>
              <Text style={styles.familyHistoryLabel}>Genetic Disorders</Text>
              <Ionicons 
                name={medicalHistory.familyHistory.geneticDisorders ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={medicalHistory.familyHistory.geneticDisorders ? "#10B981" : "#DC2626"} 
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header */}
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Patient Details</Text>
            <Text style={styles.headerSubtitle}>{patient.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={downloadPatientInfo}>
              <Ionicons name="download-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Patient Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusInfo.color + '20' }]}>
        <Text style={styles.statusEmoji}>{statusInfo.icon}</Text>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
          <Text style={styles.statusSubtext}>
            Last visit: {patient.lastVisit} • Next visit: {patient.nextVisit}
          </Text>
        </View>
      </View>

      {/* Tab Navigation - Updated with Medical History */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
          onPress={() => setActiveTab('medical')}
        >
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
            Medical
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'visits' && styles.activeTab]}
          onPress={() => setActiveTab('visits')}
        >
          <Text style={[styles.tabText, activeTab === 'visits' && styles.activeTabText]}>
            Visits ({visits.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingVisits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'medical' && renderMedicalHistory()}
        {activeTab === 'visits' && renderVisits()}
        {activeTab === 'upcoming' && renderUpcoming()}
      </ScrollView>

      {/* Add Visit Modal */}
      <Modal
        visible={showAddVisitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddVisitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record New Visit</Text>
              <TouchableOpacity onPress={() => setShowAddVisitModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Visit Type</Text>
                <View style={styles.visitTypeOptions}>
                  {['routine', 'anc', 'pregnancy', 'child_care', 'emergency'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.visitTypeOption,
                        newVisit.type === type && styles.visitTypeOptionSelected,
                      ]}
                      onPress={() => setNewVisit({ ...newVisit, type })}
                    >
                      <Text style={[
                        styles.visitTypeOptionText,
                        newVisit.type === type && styles.visitTypeOptionTextSelected,
                      ]}>
                        {type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Visit Notes</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Enter visit details, observations, recommendations..."
                  value={newVisit.notes}
                  onChangeText={(text) => setNewVisit({ ...newVisit, notes: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setNewVisit({ ...newVisit, followUpRequired: !newVisit.followUpRequired })}
                >
                  <View style={[
                    styles.checkbox,
                    newVisit.followUpRequired && styles.checkboxChecked,
                  ]}>
                    {newVisit.followUpRequired && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Schedule follow-up visit</Text>
                </TouchableOpacity>

                {newVisit.followUpRequired && (
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                    <Text style={styles.dateInputText}>
                      {newVisit.nextVisitDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddVisitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddVisit}
              >
                <Text style={styles.saveButtonText}>Save Visit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Medical History Modal */}
      <Modal
        visible={showMedicalHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMedicalHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Medical History</Text>
              <TouchableOpacity onPress={() => setShowMedicalHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Implement medical history form here with sections for:
                - Maternal Health
                - Child Health
                - Medical Conditions
                - Allergies
                - Family History
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={newVisit.nextVisitDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setNewVisit({ ...newVisit, nextVisitDate: date });
            }
          }}
        />
      )}

      {/* Floating Language Button */}
      <FloatingLanguageButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  contactButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  territoryInfo: {
    // Territory info styles
  },
  territoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  territoryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  territoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addVisitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  visitsList: {
    flex: 1,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  visitType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  visitNotes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  followUpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
  },
  followUpText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
  upcomingVisitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  upcomingVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  upcomingVisitDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  upcomingVisitType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
  upcomingVisitNotes: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  markCompleteButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  markCompleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  visitTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  visitTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  visitTypeOptionSelected: {
    backgroundColor: '#2563eb',
  },
  visitTypeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  visitTypeOptionTextSelected: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dateInputText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Medical History Styles
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  historyItem: {
    width: '48%',
    marginBottom: 12,
  },
  historyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  complicationsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  complicationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  complicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    marginBottom: 4,
  },
  complicationText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '500',
  },
  vaccinationSection: {
    marginBottom: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  vaccineCompleted: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  vaccinePending: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  vaccineOverdue: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  vaccineDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  vaccineStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusOverdue: {
    backgroundColor: '#DC2626',
  },
  vaccineStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  growthSection: {
    marginBottom: 16,
  },
  growthRecord: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  growthDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  growthMetrics: {
    alignItems: 'flex-end',
  },
  growthMetric: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  conditionItem: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  conditionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#FEF2F2',
  },
  statusResolved: {
    backgroundColor: '#F0FDF4',
  },
  conditionStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  conditionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  medicationsList: {
    marginTop: 4,
  },
  medicationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  medicationItem: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  allergyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    marginBottom: 8,
  },
  allergyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  allergyReaction: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  allergySeverity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityMild: {
    backgroundColor: '#F0FDF4',
  },
  severityModerate: {
    backgroundColor: '#FFFBEB',
  },
  severitySevere: {
    backgroundColor: '#FEF2F2',
  },
  allergySeverityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  familyHistoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  familyHistoryItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  familyHistoryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});