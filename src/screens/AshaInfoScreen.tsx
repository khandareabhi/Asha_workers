import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingLanguageButton from '../components/FloatingLanguageButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  details: string[];
  color?: string;
};

type TrainingCardProps = {
  phase: string;
  duration: string;
  topics: string[];
  index: number;
};

type IncentiveCardProps = {
  service: string;
  amount: string;
  condition: string;
};

const InfoCard = ({ icon, title, description, details, color = '#2563EB' }: InfoCardProps) => (
  <View style={styles.infoCard}>
    <View style={[styles.cardHeader, { backgroundColor: color + '15' }]}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={[styles.cardTitle, { color }]}>{title}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
    <View style={styles.detailsContainer}>
      {details.map((detail: string, index: number) => (
        <View key={index} style={styles.detailItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.detailText}>{detail}</Text>
        </View>
      ))}
    </View>
  </View>
);

const TrainingCard = ({ phase, duration, topics, index }: TrainingCardProps) => (
  <View style={styles.trainingCard}>
    <View style={styles.trainingHeader}>
      <View style={styles.phaseIndicator}>
        <Text style={styles.phaseNumber}>{index + 1}</Text>
      </View>
      <View>
        <Text style={styles.phaseTitle}>{phase}</Text>
        <Text style={styles.phaseDuration}>{duration}</Text>
      </View>
    </View>
    <View style={styles.topicsContainer}>
      {topics.map((topic: string, topicIndex: number) => (
        <View key={topicIndex} style={styles.topicItem}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color="#6B7280" />
          <Text style={styles.topicText}>{topic}</Text>
        </View>
      ))}
    </View>
  </View>
);

const IncentiveCard = ({ service, amount, condition }: IncentiveCardProps) => (
  <View style={styles.incentiveCard}>
    <View style={styles.incentiveHeader}>
      <Text style={styles.incentiveService}>{service}</Text>
      <Text style={styles.incentiveAmount}>{amount}</Text>
    </View>
    <Text style={styles.incentiveCondition}>{condition}</Text>
  </View>
);

export default function AshaInfoScreen() {
  const navigation = useNavigation();

  const ashaResponsibilities = [
    {
      icon: '🩺',
      title: 'Maternal Health',
      description: 'Provide antenatal care, assist with institutional deliveries, and postnatal care for mothers and newborns.',
      details: [
        'Identify and register pregnant women',
        'Provide antenatal checkups',
        'Accompany for institutional delivery',
        'Postnatal home visits'
      ]
    },
    {
      icon: '👶',
      title: 'Child Health',
      description: 'Monitor child growth, provide immunization services, and manage childhood illnesses.',
      details: [
        'Growth monitoring of children',
        'Immunization services',
        'Management of diarrhea & pneumonia',
        'Nutrition counseling'
      ]
    },
    {
      icon: '💊',
      title: 'Family Planning',
      description: 'Provide family planning services and contraceptive distribution.',
      details: [
        'Counseling on family planning',
        'Distribution of contraceptives',
        'Referral for terminal methods',
        'Follow-up services'
      ]
    },
    {
      icon: '🏥',
      title: 'Health Services',
      description: 'Provide basic healthcare and referral services for various health conditions.',
      details: [
        'First aid for minor ailments',
        'DOTS provider for TB',
        'Malaria prevention',
        'Referral to PHC/CHC'
      ]
    },
    {
      icon: '📝',
      title: 'Record Keeping',
      description: 'Maintain health records and submit monthly reports.',
      details: [
        'Maintain household survey',
        'Keep maternal & child registers',
        'Submit monthly reports',
        'Update due lists for services'
      ]
    },
    {
      icon: '👥',
      title: 'Community Mobilization',
      description: 'Organize community meetings and health awareness sessions.',
      details: [
        'Conduct village health meetings',
        'Organize health days',
        'Mobilize for health camps',
        'Community awareness programs'
      ]
    }
  ];

  const ashaTraining = [
    {
      phase: 'Phase 1',
      duration: '23 days',
      topics: ['Community mobilization', 'Maternal health', 'Child health', 'Family planning']
    },
    {
      phase: 'Phase 2',
      duration: '24 days',
      topics: ['Communication skills', 'First aid', 'Disease prevention', 'Record keeping']
    },
    {
      phase: 'Phase 3',
      duration: '12 days',
      topics: ['Skill development', 'Field practice', 'Problem solving', 'Service delivery']
    }
  ];

  const incentives = [
    { service: 'Institutional Delivery', amount: '₹600', condition: 'Accompanying pregnant woman' },
    { service: 'JSY Registration', amount: '₹300', condition: 'Complete registration' },
    { service: 'Complete Immunization', amount: '₹100', condition: 'Per child completed' },
    { service: 'Family Planning', amount: '₹150', condition: 'Sterilization case' },
    { service: 'TB DOTS', amount: '₹250', condition: 'Complete treatment' }
  ];

  const handleCallASHA = () => {
    Linking.openURL('tel:104');
  };

  const handleVisitNHM = () => {
    Linking.openURL('https://nhm.gov.in');
  };

  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* Header */}
      <LinearGradient 
        colors={["#2563eb", "#1d4ed8"]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>ASHA Workers</Text>
            <Text style={styles.headerSubtitle}>
              Accredited Social Health Activists
            </Text>
          </View>
          <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
            <Ionicons name="information-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="account-heart" size={40} color="#2563EB" />
          </View>
          <Text style={styles.heroTitle}>What is an ASHA Worker?</Text>
          <Text style={styles.heroDescription}>
            ASHA (Accredited Social Health Activist) is a trained female community health volunteer. 
            Selected from the village itself and accountable to it, she serves as a bridge between 
            the community and the public health system.
          </Text>
        </View>

        {/* Key Responsibilities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clipboard-list" size={24} color="#2563EB" />
            <Text style={styles.sectionTitle}>Key Responsibilities</Text>
          </View>
          {ashaResponsibilities.map((responsibility, index) => (
            <InfoCard
              key={index}
              icon={responsibility.icon}
              title={responsibility.title}
              description={responsibility.description}
              details={responsibility.details}
              color={['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'][index]}
            />
          ))}
        </View>

        {/* Training Program */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="school" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Training Program</Text>
          </View>
          <Text style={styles.sectionDescription}>
            ASHA workers undergo comprehensive training in three phases to equip them with 
            necessary health knowledge and skills.
          </Text>
          {ashaTraining.map((training, index) => (
            <TrainingCard
              key={index}
              phase={training.phase}
              duration={training.duration}
              topics={training.topics}
              index={index}
            />
          ))}
        </View>

        {/* Incentive Structure */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cash" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Incentive Structure</Text>
          </View>
          <Text style={styles.sectionDescription}>
            ASHA workers receive performance-based incentives for various health services provided.
          </Text>
          <View style={styles.incentivesGrid}>
            {incentives.map((incentive, index) => (
              <IncentiveCard
                key={index}
                service={incentive.service}
                amount={incentive.amount}
                condition={incentive.condition}
              />
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="phone" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>Contact & Support</Text>
          </View>
          <View style={styles.contactCards}>
            <TouchableOpacity style={styles.contactCard} onPress={handleCallASHA}>
              <MaterialCommunityIcons name="phone-in-talk" size={32} color="#2563EB" />
              <Text style={styles.contactTitle}>Health Helpline</Text>
              <Text style={styles.contactNumber}>104</Text>
              <Text style={styles.contactDescription}>24x7 Free Medical Helpline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleVisitNHM}>
              <MaterialCommunityIcons name="web" size={32} color="#10B981" />
              <Text style={styles.contactTitle}>NHM Website</Text>
              <Text style={styles.contactNumber}>nhm.gov.in</Text>
              <Text style={styles.contactDescription}>National Health Mission</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#DC2626" />
          <Text style={styles.footerText}>
            ASHA workers are the backbone of rural healthcare in India, bringing health services 
            to the doorsteps of millions.
          </Text>
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
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  helpButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  trainingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  phaseDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
  },
  incentivesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  incentiveCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  incentiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incentiveService: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  incentiveAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  incentiveCondition: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  contactSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  contactCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  footerText: {
    fontSize: 13,
    color: '#7C2D12',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});