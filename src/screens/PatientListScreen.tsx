import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  Animated,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllPatients, upsertPatient } from "../db/sqlite";
import FloatingLanguageButton from "../components/FloatingLanguageButton";

export default function PatientListScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBottomMenu, setShowBottomMenu] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(300))[0];

  // Add this useEffect to filter patients when patients, searchQuery, or selectedFilter changes
  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery, selectedFilter, user]); // Add dependencies

  // Animation useEffect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Bottom menu animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showBottomMenu ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showBottomMenu]);

  // Add this to load patients when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [])
  );
// analysis


  // Your existing loadPatients function
  const loadPatients = async () => {
    try {
      // Prefer SQLite
      const sqlitePatients = await getAllPatients();
      if (sqlitePatients && sqlitePatients.length > 0) {
        const normalized = sqlitePatients.map(p => ({
          id: p.id,
          name: p.name,
          village: p.village,
          age: p.age,
          gender: p.gender,
          lastVisit: p.lastVisit,
          status: p.status,
          nextVisit: p.nextVisit,
          contact: p.contact,
          territory: {
            state: p.territory_state,
            district: p.territory_district,
            block: p.territory_block,
            village: p.territory_village,
          },
          formData: p.formData,
        }));
        setPatients(normalized);
        console.log('Loaded patients from SQLite:', normalized.length);
      } else {
        // Attempt migration from legacy AsyncStorage if present
        const legacy = await AsyncStorage.getItem('patients');
        if (legacy) {
          const legacyList = JSON.parse(legacy) || [];
          if (Array.isArray(legacyList) && legacyList.length > 0) {
            for (const patient of legacyList) {
              try {
                await upsertPatient({
                  id: String(patient.id),
                  name: patient.name || '',
                  village: patient.village || '',
                  age: Number(patient.age) || 0,
                  gender: patient.gender || '',
                  lastVisit: patient.lastVisit || '',
                  status: patient.status || 'general',
                  nextVisit: patient.nextVisit || '',
                  contact: patient.contact || '',
                  territory_state: patient.territory?.state || '',
                  territory_district: patient.territory?.district || '',
                  territory_block: patient.territory?.block || '',
                  territory_village: patient.territory?.village || '',
                  formData: patient.formData || {},
                } as any);
              } catch (e) {
                console.warn('Failed to migrate patient', patient?.id, e);
              }
            }
            await AsyncStorage.removeItem('patients');
            const reloaded = await getAllPatients();
            const normalizedReload = reloaded.map(p => ({
              id: p.id,
              name: p.name,
              village: p.village,
              age: p.age,
              gender: p.gender,
              lastVisit: p.lastVisit,
              status: p.status,
              nextVisit: p.nextVisit,
              contact: p.contact,
              territory: {
                state: p.territory_state,
                district: p.territory_district,
                block: p.territory_block,
                village: p.territory_village,
              },
              formData: p.formData,
            }));
            setPatients(normalizedReload);
            console.log('Migrated legacy patients to SQLite:', normalizedReload.length);
            return;
          }
        }

        // Load initial demo data if no stored patients anywhere
        const userDistrict = user?.territory?.district || "Pune";
        const userBlock = user?.territory?.block || "Kharadhi";
        const userVillage = user?.territory?.village || "goal";
        const initialPatients = [
          {
            id: "1",
            name: "Rita Devi",
            village: userVillage,
            age: 28,
            gender: "Female",
            lastVisit: "2024-01-15",
            status: "pregnant",
            nextVisit: "2024-01-30",
            contact: "9876543210",
            territory: {
              state: "Maharashtra",
              district: userDistrict,
              block: userBlock,
              village: userVillage
            }
          },
          {
            id: "2",
            name: "Sunita Kumari",
            village: userVillage,
            age: 25,
            gender: "Female",
            lastVisit: "2024-01-10",
            status: "child_care",
            nextVisit: "2024-02-05",
            contact: "9876543211",
            territory: {
              state: "Maharashtra",
              district: userDistrict,
              block: userBlock,
              village: userVillage
            }
          },
        ];
        setPatients(initialPatients);
        await AsyncStorage.setItem('patients', JSON.stringify(initialPatients));
        console.log('Created initial patients:', initialPatients.length);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const filterPatients = () => {
    console.log('Filtering patients, total:', patients.length);
    let filtered = patients;

    // Filter by ASHA worker's territory
    if (user?.territory) {
      console.log('Filtering by territory:', user.territory);
      const userDistrict = String(user.territory.district || '').trim().toLowerCase();
      const userBlock = String(user.territory.block || '').trim().toLowerCase();
      const priorCount = filtered.length;
      let territoryFiltered = filtered.filter(patient => {
        const patientDistrict = String(patient.territory?.district || '').trim().toLowerCase();
        const patientBlock = String(patient.territory?.block || '').trim().toLowerCase();
        const matches = patientDistrict === userDistrict && patientBlock === userBlock;
        return matches;
      });
      // If no matches due to territory mismatch, fall back to all patients to avoid empty UI
      filtered = territoryFiltered.length > 0 ? territoryFiltered : filtered;
      console.log('Territory filtered count:', territoryFiltered.length, 'from', priorCount);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact?.includes(searchQuery)
      );
    }

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(patient => patient.status === selectedFilter);
    }

    console.log('Filtered patients count:', filtered.length);
    setFilteredPatients(filtered);
  };

  // Save patients to AsyncStorage
  const savePatients = async (updatedPatients: any[]) => {
    try {
      await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
      console.error('Error saving patients:', error);
    }
  };

  // Add new patient
  const addNewPatient = async (patientData: any) => {
    try {
      const newPatient = {
        id: Date.now().toString(), // Generate unique ID
        name: patientData.fullName,
        village: patientData.village,
        age: parseInt(patientData.age) || 0,
        gender: patientData.gender,
        lastVisit: new Date().toISOString().split('T')[0], // Today's date
        status: determinePatientStatus(patientData),
        nextVisit: calculateNextVisit(patientData),
        contact: patientData.contactNumber,
        territory: {
          state: "Maharashtra",
          district: patientData.district || "Pune",
          block: patientData.block || "Kharadhi",
          village: patientData.village
        },
        // Store all form data for detailed view
        formData: patientData
      };

      const updatedPatients = [newPatient, ...patients];
      await savePatients(updatedPatients);
      return true;
    } catch (error) {
      console.error('Error adding patient:', error);
      return false;
    }
  };

  // Determine patient status based on form data
  const determinePatientStatus = (patientData: any) => {
    if (patientData.isPregnant) return "pregnant";
    if (patientData.childBirthDate) return "child_care";
    if (patientData.ancVisitsCompleted) return "anc";
    return "general";
  };

  // Calculate next visit date
  const calculateNextVisit = (patientData: any) => {
    const today = new Date();
    if (patientData.nextVaccineDate) return patientData.nextVaccineDate;
    if (patientData.expectedDeliveryDate) return patientData.expectedDeliveryDate;

    // Default: 30 days from now
    const nextVisit = new Date(today);
    nextVisit.setDate(today.getDate() + 30);
    return nextVisit.toISOString().split('T')[0];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
    Alert.alert("Updated", "Patient list has been refreshed");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            setShowProfileMenu(false);
          }
        }
      ]
    );
  };

  // New feature handlers
  const handleAnalysisPress = () => {
    setShowBottomMenu(false);
    navigation.navigate("Analysis");
  };

  const handleGuidancePress = () => {
    setShowBottomMenu(false);
    navigation.navigate("Guidance");
  };

  const handleAshaInfoPress = () => {
    setShowBottomMenu(false);
    navigation.navigate("AshaInfo");
  };

  const handleEmergencyPress = () => {
    setShowBottomMenu(false);
    Alert.alert(
      "Emergency Contacts",
      "Choose emergency service:",
      [
        {
          text: "Ambulance - 108",
          onPress: () => Linking.openURL('tel:108')
        },
        {
          text: "Women Helpline - 1091",
          onPress: () => Linking.openURL('tel:1091')
        },
        {
          text: "Police - 100",
          onPress: () => Linking.openURL('tel:100')
        },
        {
          text: "Emergency Helpline - 112",
          onPress: () => Linking.openURL('tel:112')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Main add patient function - same as existing
  const handleAddPatient = () => {
    navigation.navigate("PatientForm");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pregnant":
        return "#FDF2F8";
      case "child_care":
        return "#F0FDF4";
      case "anc":
        return "#EFF6FF";
      default:
        return "#F9FAFB";
    }
  };

  const PatientCard = ({ item, index }: { item: any; index: number }) => {
    const statusInfo = getStatusIcon(item.status);
    const cardStyle = {
      ...styles.card,
      backgroundColor: getStatusColor(item.status),
      borderLeftColor: statusInfo.color,
      opacity: fadeAnim,
      transform: [
        {
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
      ],
    };

    return (
      <Animated.View style={cardStyle}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate("PatientForm", {
            patient: item
            // Remove onSave from params to fix serialization warning
          })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.patientInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Text style={styles.statusText}>{statusInfo.icon}</Text>
                  <Text style={styles.statusLabel}>{statusInfo.label}</Text>
                </View>
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{item.village}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{item.age} yrs</Text>
                </View>
                <View style={styles.detailItem}>
                  <FontAwesome5 name="transgender" size={12} color="#6B7280" />
                  <Text style={styles.detailText}>{item.gender}</Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (item.contact) {
                    Linking.openURL(`tel:${item.contact}`);
                  }
                }}
              >
                <Feather name="phone" size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (item.contact) {
                    const msg = encodeURIComponent('Hello, this is ASHA worker.');
                    Linking.openURL(`sms:${item.contact}?body=${msg}`);
                  }
                }}
              >
                <Ionicons name="chatbubble" size={16} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  if (!item.contact) return;
                  const message = encodeURIComponent('Hello, this is ASHA worker.');
                  const phone = String(item.contact).replace(/[^0-9+]/g, '');
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
                }}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.visitInfo}>
              <View style={styles.visitItem}>
                <Text style={styles.visitLabel}>Last Visit</Text>
                <Text style={styles.visitDate}>{item.lastVisit}</Text>
              </View>
              <View style={styles.visitItem}>
                <Text style={styles.visitLabel}>Next Visit</Text>
                <Text style={[styles.visitDate, styles.nextVisit]}>
                  {item.nextVisit}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate("PatientDetails", {
                patient: item
                // Remove onSave from params to fix serialization warning
              })}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilters(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilters(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Patients</Text>
          {[
            { id: "all", label: "All Patients", icon: "👥" },
            { id: "pregnant", label: "Pregnant Women", icon: "🤰" },
            { id: "child_care", label: "Child Care", icon: "👶" },
            { id: "anc", label: "ANC", icon: "🏥" },
            { id: "general", label: "General", icon: "👤" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterOption,
                selectedFilter === filter.id && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setSelectedFilter(filter.id);
                setShowFilters(false);
              }}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedFilter === filter.id && styles.filterLabelSelected,
                ]}
              >
                {filter.label}
              </Text>
              {selectedFilter === filter.id && (
                <Ionicons name="checkmark" size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const ProfileMenuModal = () => (
    <Modal
      visible={showProfileMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowProfileMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowProfileMenu(false)}
      >
        <View style={styles.profileMenuContent}>
          {/* User Info */}
          <View style={styles.userInfoSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userAshaId}>ASHA ID: {user?.ashaId}</Text>
              {user?.territory && (
                <Text style={styles.userLocation}>
                  {user.territory.district}, {user.territory.block}
                </Text>
              )}
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="person" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>{t('patients.myProfile')}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>{t('common.settings')}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>{t('common.helpSupport')}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>{t('common.privacyPolicy')}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>{t('common.logout')}</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>{t('common.version', { version: '1.0' })}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const BottomMenuModal = () => (
    <Modal
      visible={showBottomMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowBottomMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowBottomMenu(false)}
      >
        <Animated.View
          style={[
            styles.bottomMenuContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.bottomMenuHeader}>
            <Text style={styles.bottomMenuTitle}>Quick Actions</Text>
            <TouchableOpacity
              onPress={() => setShowBottomMenu(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuGrid}>
            {/* Analysis Button */}
            <TouchableOpacity
              style={styles.menuItemCard}
              onPress={handleAnalysisPress}
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                style={styles.menuIconContainer}
              >
                <Ionicons name="analytics" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuItemTitle}>{t('patients.analysis')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('patients.analysisSubtitle')}
              </Text>
            </TouchableOpacity>

            {/* Guidance Button */}
            <TouchableOpacity
              style={styles.menuItemCard}
              onPress={handleGuidancePress}
            >
              <LinearGradient
                colors={["#10B981", "#34D399"]}
                style={styles.menuIconContainer}
              >
                <Ionicons name="book" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuItemTitle}>{t('patients.guidance')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('patients.guidanceSubtitle')}
              </Text>
            </TouchableOpacity>

            {/* Add Patient Button */}
            <TouchableOpacity
              style={styles.menuItemCard}
              onPress={handleAddPatient}
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                style={styles.menuIconContainer}
              >
                <Ionicons name="person-add" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuItemTitle}>{t('patients.addPatient')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('patients.registerNewPatient')}
              </Text>
            </TouchableOpacity>

            {/* ASHA Info Button */}
            <TouchableOpacity
              style={styles.menuItemCard}
              onPress={handleAshaInfoPress}
            >
              <LinearGradient
                colors={["#3B82F6", "#60A5FA"]}
                style={styles.menuIconContainer}
              >
                <Ionicons name="information-circle" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuItemTitle}>{t('patients.ashaInfo')}</Text>
              <Text style={styles.menuItemDescription}>
                {t('patients.resourcesAndTraining')}
              </Text>
            </TouchableOpacity>

            {/* Emergency Button */}
            <TouchableOpacity
              style={styles.menuItemCard}
              onPress={handleEmergencyPress}
            >
              <LinearGradient
                colors={["#EF4444", "#F87171"]}
                style={styles.menuIconContainer}
              >
                <Ionicons name="warning" size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuItemTitle}>Emergency</Text>
              <Text style={styles.menuItemDescription}>
                Emergency contacts & help
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Header */}
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcome}>Welcome, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>
              {user?.territory ?
                `${user.territory.block}, ${user.territory.district}` :
                'Manage your patients efficiently'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(true)}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="people" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statNumber}>{filteredPatients.length}</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#FDF2F8" }]}>
            <FontAwesome5 name="baby" size={20} color="#EC4899" />
          </View>
          <Text style={styles.statNumber}>
            {filteredPatients.filter(p => p.status === "pregnant").length}
          </Text>
          <Text style={styles.statLabel}>Pregnant</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="medkit" size={22} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>
            {filteredPatients.filter(p => p.status === "child_care").length}
          </Text>
          <Text style={styles.statLabel}>Children</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name, village..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#3B82F6" />
          {selectedFilter !== "all" && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Territory Info Banner */}
      {user?.territory && (
        <View style={styles.territoryBanner}>
          <Ionicons name="location" size={16} color="#3B82F6" />
          <Text style={styles.territoryText}>
            Serving: {user.territory.village}, {user.territory.block}, {user.territory.district}
          </Text>
        </View>
      )}

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <PatientCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No patients found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "No patients in your territory yet"}
            </Text>
            <TouchableOpacity
              style={styles.addFirstPatientButton}
              onPress={handleAddPatient}
            >
              <Text style={styles.addFirstPatientText}>Add Your First Patient</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {/* Analysis Button */}
        <TouchableOpacity
          style={styles.bottomNavButton}
          onPress={handleAnalysisPress}
        >
          <Ionicons name="analytics" size={22} color="#6B7280" />
          <Text style={styles.bottomNavLabel}>{t('patients.analysis')}</Text>
        </TouchableOpacity>

        {/* Guidance Button */}
        <TouchableOpacity
          style={styles.bottomNavButton}
          onPress={handleGuidancePress}
        >
          <Ionicons name="book" size={22} color="#6B7280" />
          <Text style={styles.bottomNavLabel}>{t('patients.guidance')}</Text>
        </TouchableOpacity>
        {/* Main Add Button - Now directly navigates to PatientForm */}
        <TouchableOpacity
          style={styles.mainAddButton}
          onPress={handleAddPatient}
        >
          <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.mainAddButtonGradient}>
          <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ASHA Info Button */}
        <TouchableOpacity
          style={styles.bottomNavButton}
          onPress={handleAshaInfoPress}
        >
          <Ionicons name="information-circle" size={22} color="#6B7280" />
          <Text style={styles.bottomNavLabel}>ASHA Info</Text>
        </TouchableOpacity>

        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.bottomNavButton}
          onPress={handleEmergencyPress}
        >
          <Ionicons name="warning" size={22} color="#6B7280" />
          <Text style={styles.bottomNavLabel}>Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions FAB - Optional: You can remove this if you want only the bottom nav */}
      <TouchableOpacity
        style={styles.quickActionsButton}
        onPress={() => setShowBottomMenu(true)}
      >
        <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.quickActionsGradient}>
          <Ionicons name="apps" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <FilterModal />
      <ProfileMenuModal />
      <BottomMenuModal />

      {/* Floating Language Button */}
      <FloatingLanguageButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
  filterButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  territoryBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  territoryText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  visitInfo: {
    flexDirection: "row",
  },
  visitItem: {
    marginRight: 16,
  },
  visitLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  visitDate: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  nextVisit: {
    color: "#EF4444",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNavButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    flex: 1,
  },
  bottomNavLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  mainAddButton: {
    position: "absolute",
    top: -25,
    alignSelf: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainAddButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  // Quick Actions FAB
  quickActionsButton: {
    position: "absolute",
    right: 20,
    bottom: 90, // Position above the bottom nav
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickActionsGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  // Bottom Menu Modal Styles
  bottomMenuContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomMenuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItemCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#EFF6FF",
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  filterLabelSelected: {
    color: "#2563eb",
  },
  // Profile Menu Styles
  profileMenuContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userAshaId: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 12,
  },
  logoutMenuItem: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 8,
  },
  logoutText: {
    color: "#EF4444",
  },
  versionSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  addFirstPatientButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addFirstPatientText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});