import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllPatients } from '../db/sqlite';
import FloatingLanguageButton from '../components/FloatingLanguageButton';
import {
  BarChart,
  PieChart,
  ProgressChart,
  LineChart,
} from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

// Define types matching PatientListScreen
interface Patient {
  id: string;
  name: string;
  village: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: string;
  nextVisit: string;
  contact?: string;
  territory: {
    state: string;
    district: string;
    block: string;
    village: string;
  };
  formData?: any;
}

interface ChartData {
  distributionData: any[];
  monthlyData: any;
  progressData: any;
  ageDistribution: any;
  villageDistribution: any;
}

export default function AnalysisScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pregnant: 0,
    childCare: 0,
    anc: 0,
    general: 0,
    villages: 0,
    averageAge: 0,
  });

  const [chartData, setChartData] = useState<ChartData>({
    distributionData: [],
    monthlyData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }]
    },
    progressData: {
      labels: ['Pregnant', 'Child Care', 'ANC', 'General'],
      data: [0, 0, 0, 0]
    },
    ageDistribution: {
      labels: ['0-18', '19-35', '36-50', '51+'],
      datasets: [{ data: [0, 0, 0, 0] }]
    },
    villageDistribution: {
      labels: [],
      datasets: [{ data: [] }]
    },
  });

  // Calculate statistics function
  const calculateStatistics = (patients: Patient[]) => {
    const total = patients.length;
    const pregnant = patients.filter(p => p.status === 'pregnant').length;
    const childCare = patients.filter(p => p.status === 'child_care').length;
    const anc = patients.filter(p => p.status === 'anc').length;
    const general = patients.filter(p => p.status === 'general').length;
    
    // Get unique villages
    const villages = [...new Set(patients.map(p => p.village).filter(Boolean))].length;
    
    // Calculate average age
    const totalAge = patients.reduce((sum, patient) => sum + (patient.age || 0), 0);
    const averageAge = total > 0 ? Math.round(totalAge / total) : 0;

    return {
      total,
      pregnant,
      childCare,
      anc,
      general,
      villages,
      averageAge,
    };
  };

  // Load patients similar to PatientListScreen
  const loadPatients = async () => {
    try {
      setLoading(true);
      const sqlitePatients = await getAllPatients();
      
      // Normalize patient data to match PatientListScreen structure
      const normalizedPatients = sqlitePatients.map(patient => ({
        id: patient.id,
        name: patient.name,
        village: patient.village,
        age: patient.age,
        gender: patient.gender,
        lastVisit: patient.lastVisit,
        status: patient.status,
        nextVisit: patient.nextVisit,
        contact: patient.contact,
        territory: {
          state: patient.territory_state || "Maharashtra",
          district: patient.territory_district || "Pune",
          block: patient.territory_block || "Kharadhi",
          village: patient.territory_village || patient.village || "Unknown",
        },
        formData: patient.formData,
      }));

      setAllPatients(normalizedPatients);
      
      // Filter by ASHA worker's territory with better matching
      const filtered = normalizedPatients.filter(patient => {
        if (!user?.territory) {
          console.log('No user territory defined, showing all patients');
          return true;
        }
        
        const userDistrict = String(user.territory.district || '').trim().toLowerCase();
        const userBlock = String(user.territory.block || '').trim().toLowerCase();
        const patientDistrict = String(patient.territory?.district || '').trim().toLowerCase();
        const patientBlock = String(patient.territory?.block || '').trim().toLowerCase();
        
        const matchesDistrict = patientDistrict === userDistrict;
        const matchesBlock = patientBlock === userBlock;
        
        console.log(`Patient ${patient.name}: district match=${matchesDistrict}, block match=${matchesBlock}`);
        
        return matchesDistrict && matchesBlock;
      });

      console.log('Filtered patients count:', filtered.length);
      setFilteredPatients(filtered);
      
      // Calculate stats for display - use filtered patients if available, otherwise all patients
      const patientsToDisplay = filtered.length > 0 ? filtered : normalizedPatients;
      const calculatedStats = calculateStatistics(patientsToDisplay);
      setStats(calculatedStats);
      prepareChartData(patientsToDisplay);
    } catch (error) {
      console.error('Error loading patients for analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get monthly registration data from actual patient data
  const getMonthlyData = (patients: Patient[]) => {
    const monthlyCount: { [key: string]: number } = {};
    
    patients.forEach(patient => {
      const date = patient.lastVisit;
      if (date) {
        try {
          const month = new Date(date).getMonth();
          const monthName = new Date(2024, month, 1).toLocaleString('default', { month: 'short' });
          monthlyCount[monthName] = (monthlyCount[monthName] || 0) + 1;
        } catch (error) {
          console.warn('Invalid date format for patient:', patient.id, date);
        }
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map(month => monthlyCount[month] || 0);

    return {
      labels: monthNames,
      datasets: [{ data: monthlyData }]
    };
  };

  // Get village distribution data
  const getVillageDistribution = (patients: Patient[]) => {
    const villageCount: { [key: string]: number } = {};
    
    patients.forEach(patient => {
      const village = patient.village || 'Unknown';
      villageCount[village] = (villageCount[village] || 0) + 1;
    });

    const sortedVillages = Object.entries(villageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);

    const labels = sortedVillages.map(([village]) => 
      village.length > 8 ? village.substring(0, 8) + '...' : village
    );
    const data = sortedVillages.map(([,count]) => count);

    return {
      labels,
      datasets: [{ data }]
    };
  };

  // Prepare all chart data
  const prepareChartData = (patients: Patient[]) => {
    const total = patients.length;
    const pregnant = patients.filter(p => p.status === 'pregnant').length;
    const childCare = patients.filter(p => p.status === 'child_care').length;
    const anc = patients.filter(p => p.status === 'anc').length;
    const general = patients.filter(p => p.status === 'general').length;

    const distributionData = [
      {
        name: 'Pregnant',
        population: pregnant,
        color: '#EC4899',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Child Care',
        population: childCare,
        color: '#10B981',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'ANC',
        population: anc,
        color: '#8B5CF6',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'General',
        population: general,
        color: '#6B7280',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];

    const monthlyData = getMonthlyData(patients);

    const progressData = {
      labels: ['Pregnant', 'Child Care', 'ANC', 'General'],
      data: [
        total > 0 ? pregnant / total : 0,
        total > 0 ? childCare / total : 0,
        total > 0 ? anc / total : 0,
        total > 0 ? general / total : 0,
      ],
    };

    const ageRanges = [
      { range: '0-18', count: patients.filter(p => (p.age || 0) <= 18).length },
      { range: '19-35', count: patients.filter(p => (p.age || 0) > 18 && (p.age || 0) <= 35).length },
      { range: '36-50', count: patients.filter(p => (p.age || 0) > 35 && (p.age || 0) <= 50).length },
      { range: '51+', count: patients.filter(p => (p.age || 0) > 50).length },
    ];

    const ageDistribution = {
      labels: ageRanges.map(r => r.range),
      datasets: [
        {
          data: ageRanges.map(r => r.count),
        },
      ],
    };

    const villageDistribution = getVillageDistribution(patients);

    setChartData({
      distributionData,
      monthlyData,
      progressData,
      ageDistribution,
      villageDistribution,
    });
  };

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [user?.territory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </View>
    </View>
  );

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
  };

  // Helper component to handle empty states
  const ChartWrapper = ({ children, data, height = 200 }: any) => {
    const isEmptyPie = Array.isArray(data)
      && data.length > 0
      && data.every((item: any) => typeof item?.population === 'number' ? item.population === 0 : true);
    const isEmptyDataset = !!(data?.datasets && Array.isArray(data.datasets)
      && data.datasets[0]?.data && Array.isArray(data.datasets[0].data)
      && data.datasets[0].data.every((val: number) => val === 0));

    if (!data ||
        (Array.isArray(data) && data.length === 0) ||
        isEmptyDataset ||
        isEmptyPie) {
      return (
        <View style={[styles.chartContainer, styles.emptyChart, { minHeight: height }]}>
          <Ionicons name="stats-chart" size={48} color="#D1D5DB" />
          <Text style={styles.emptyChartText}>No data available</Text>
          <Text style={styles.emptyChartSubtext}>
            {filteredPatients.length === 0 && allPatients.length === 0 
              ? 'No patients in system' 
              : 'No chart data available'}
          </Text>
        </View>
      );
    }
    return <View style={styles.chartContainer}>{children}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

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
          <View>
            <Text style={styles.headerTitle}>Patient Analytics</Text>
            <Text style={styles.headerSubtitle}>
              {user?.territory ? `${user.territory.block}, ${user.territory.district}` : 'All Territories'}
            </Text>
            <Text style={styles.patientCount}>
              {filteredPatients.length} patients in your territory • {allPatients.length} total in system
            </Text>
            {filteredPatients.length === 0 && allPatients.length > 0 && (
              <Text style={styles.warningText}>
                Showing all patients (no territory matches)
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Key Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Patients"
              value={stats.total}
              subtitle={`${allPatients.length} total in system`}
              icon="people"
              color="#3B82F6"
            />
            <StatCard
              title="Pregnant Women"
              value={stats.pregnant}
              subtitle={stats.total > 0 ? `${Math.round((stats.pregnant / stats.total) * 100)}% of total` : '0% of total'}
              icon="female"
              color="#EC4899"
            />
            <StatCard
              title="Child Care"
              value={stats.childCare}
              subtitle={stats.total > 0 ? `${Math.round((stats.childCare / stats.total) * 100)}% of total` : '0% of total'}
              icon="heart"
              color="#10B981"
            />
            <StatCard
              title="Villages"
              value={stats.villages}
              subtitle="Covered areas"
              icon="location"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Patient Distribution Pie Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Distribution</Text>
          <ChartWrapper data={chartData.distributionData} height={220}>
            <PieChart
              data={chartData.distributionData}
              width={screenWidth - 32}
              height={200}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </ChartWrapper>
        </View>

        {/* Village Distribution Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Villages</Text>
          <ChartWrapper data={chartData.villageDistribution} height={240}>
            <BarChart
              data={chartData.villageDistribution}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero={true}
              showBarTops={true}
              withInnerLines={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ChartWrapper>
        </View>

        {/* Age Distribution Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Distribution</Text>
          <ChartWrapper data={chartData.ageDistribution} height={240}>
            <BarChart
              data={chartData.ageDistribution}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero={true}
              showBarTops={true}
              withInnerLines={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </ChartWrapper>
        </View>

        {/* Progress Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Coverage</Text>
          <ChartWrapper data={chartData.progressData} height={180}>
            <ProgressChart
              data={chartData.progressData}
              width={screenWidth - 32}
              height={160}
              strokeWidth={16}
              radius={32}
              chartConfig={chartConfig}
              hideLegend={false}
            />
          </ChartWrapper>
        </View>

        {/* Additional Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <Text style={styles.insightText}>
                Average Age: <Text style={styles.insightValue}>{stats.averageAge} years</Text>
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.insightText}>
                Villages Covered: <Text style={styles.insightValue}>{stats.villages}</Text>
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color="#6B7280" />
              <Text style={styles.insightText}>
                Most Common: <Text style={styles.insightValue}>
                  {stats.pregnant >= stats.childCare && stats.pregnant >= stats.anc && stats.pregnant >= stats.general ? 'Pregnant Women' :
                   stats.childCare >= stats.anc && stats.childCare >= stats.general ? 'Child Care' :
                   stats.anc >= stats.general ? 'ANC' : 'General Care'}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analysis.quickActions')}</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('PatientList' as never)}
            >
              <Ionicons name="list" size={24} color="#3B82F6" />
              <Text style={styles.quickActionText}>{t('analysis.viewAllPatients')}</Text>
              <Text style={styles.quickActionSubtext}>{t('analysis.total', { count: allPatients.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('PatientForm' as never)}
            >
              <Ionicons name="add-circle" size={24} color="#10B981" />
              <Text style={styles.quickActionText}>{t('analysis.addNewPatient')}</Text>
              <Text style={styles.quickActionSubtext}>{t('analysis.register')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  patientCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  warningText: {
    color: '#FEF3C7',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  emptyChart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyChartSubtext: {
    marginTop: 4,
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  insightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  insightValue: {
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
});