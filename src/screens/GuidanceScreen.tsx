import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Linking,
    Alert,
    TextInput,
    Dimensions,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import FloatingLanguageButton from '../components/FloatingLanguageButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GuidanceScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('symptoms');
    const [searchQuery, setSearchQuery] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    React.useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleCategoryChange = (categoryId: string) => {
        // Reset animations for new content
        fadeAnim.setValue(0);
        slideAnim.setValue(50);

        setActiveCategory(categoryId);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Health Schemes Data
    const healthSchemes = [
        {
            id: '1',
            name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
            description: 'Maternity benefit program providing financial assistance to pregnant women and lactating mothers.',
            eligibility: 'Pregnant women & lactating mothers for first living child',
            benefits: '₹5,000 in three installments',
            contact: '1800-180-1551',
            link: 'https://pmmy.gov.in'
        },
        {
            id: '2',
            name: 'Janani Suraksha Yojana (JSY)',
            description: 'Safe motherhood intervention to reduce maternal and neonatal mortality.',
            eligibility: 'Pregnant women from BPL families, SC/ST, aged 19+',
            benefits: 'Cash assistance for institutional delivery',
            contact: '102/108',
            link: 'https://nhm.gov.in'
        },
        // ... other schemes
        {
            id: '3',
            name: 'Janani Shishu Suraksha Karyakram (JSSK)',
            description: 'Free delivery, C-section, drugs, diagnostics, diet, and transport for pregnant women.',
            eligibility: 'All pregnant women delivering in public health institutions',
            benefits: 'Completely free delivery services',
            contact: 'Local PHC/CHC',
            link: 'https://nhm.gov.in'
        },
        {
            id: '4',
            name: 'Ayushman Bharat Yojana',
            description: 'Health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care.',
            eligibility: 'Families based on SECC database',
            benefits: '₹5 lakh health insurance per family',
            contact: '14555',
            link: 'https://pmjay.gov.in'
        },
        {
            id: '5',
            name: 'Reproductive and Child Health (RCH)',
            description: 'Comprehensive healthcare for mothers and children including immunization and nutrition.',
            eligibility: 'All pregnant women and children',
            benefits: 'Free antenatal care, immunization, nutrition',
            contact: 'Local ASHA/ANM',
            link: 'https://nhm.gov.in'
        }
    ];

    // Health Loans Data
    const healthLoans = [
        {
            id: '1',
            name: 'Mudra Medical Loan',
            provider: 'Banks under Pradhan Mantri Mudra Yojana',
            purpose: 'Medical treatment, equipment purchase',
            amount: 'Up to ₹10 lakh',
            interest: '6.5-9% p.a.',
            contact: '1800-180-1111',
            link: 'https://mudra.org.in'
        },
        {
            id: '2',
            name: 'Medical Equipment Loan',
            provider: 'SBI, HDFC, ICICI Banks',
            purpose: 'Purchase of medical equipment',
            amount: 'Up to ₹25 lakh',
            interest: '8-11% p.a.',
            contact: 'Bank branches',
            link: 'https://sbi.co.in'
        },
        {
            id: '3',
            name: 'Emergency Medical Loan',
            provider: 'Various NBFCs',
            purpose: 'Emergency medical treatments',
            amount: 'Up to ₹5 lakh',
            interest: '10-14% p.a.',
            contact: 'Varies by provider',
            link: ''
        }
        // ... other loans
    ];

    // Symptoms and Diseases Data
    const symptomsData = {
        pregnancy: [
            {
                symptom: 'Morning Sickness',
                description: 'Nausea and vomiting during early pregnancy',
                causes: 'Hormonal changes',
                management: 'Eat small frequent meals, avoid spicy food, ginger tea',
                when_to_seek_help: 'If unable to keep fluids down for 24 hours'
            },
            {
                symptom: 'Swollen Feet',
                description: 'Edema in feet and ankles',
                causes: 'Increased fluid retention',
                management: 'Elevate feet, reduce salt intake, wear comfortable shoes',
                when_to_seek_help: 'Sudden severe swelling in hands and face'
            },
            {
                symptom: 'Back Pain',
                description: 'Lower back discomfort',
                causes: 'Weight gain, posture changes',
                management: 'Proper posture, gentle exercises, warm compress',
                when_to_seek_help: 'Severe pain with bleeding'
            }
            // ... other symptoms
        ],
        childcare: [
            {
                symptom: 'Fever',
                description: 'Elevated body temperature',
                causes: 'Infections, teething, immunizations',
                management: 'Sponge bath, hydration, paracetamol as prescribed',
                when_to_seek_help: 'Fever above 101°F for more than 24 hours'
            },
            {
                symptom: 'Diarrhea',
                description: 'Loose watery stools',
                causes: 'Infections, food intolerance',
                management: 'ORS solution, continue breastfeeding, zinc supplements',
                when_to_seek_help: 'Signs of dehydration, blood in stool'
            },
            {
                symptom: 'Cough & Cold',
                description: 'Respiratory symptoms',
                causes: 'Viral infections',
                management: 'Steam inhalation, honey (for children above 1 year), rest',
                when_to_seek_help: 'Rapid breathing, difficulty breathing'
            }
            // ... child care symptoms
        ],
        general: [
            {
                symptom: 'Headache',
                description: 'Pain in head or neck',
                causes: 'Stress, dehydration, tension',
                management: 'Rest, hydration, cold compress',
                when_to_seek_help: 'Severe sudden headache with vision changes'
            },
            {
                symptom: 'Fatigue',
                description: 'Persistent tiredness',
                causes: 'Anemia, poor nutrition, stress',
                management: 'Balanced diet, iron supplements, adequate rest',
                when_to_seek_help: 'Fatigue with shortness of breath'
            }
            // ... general symptoms
        ]
    };

    // Medication Guide
    const medications = [
        {
            name: 'Iron & Folic Acid',
            purpose: 'Prevent anemia during pregnancy',
            dosage: '1 tablet daily after food',
            timing: 'Throughout pregnancy and 3 months postpartum',
            precautions: 'Take with Vitamin C for better absorption',
            side_effects: 'Constipation, dark stools'
        },
        {
            name: 'Calcium',
            purpose: 'Bone health for mother and baby',
            dosage: '1 tablet twice daily',
            timing: '2nd and 3rd trimester',
            precautions: 'Take separately from iron tablets',
            side_effects: 'None significant'
        },
        {
            name: 'ORS (Oral Rehydration Solution)',
            purpose: 'Treat dehydration in diarrhea',
            dosage: 'As needed after every loose stool',
            timing: 'During diarrhea episodes',
            precautions: 'Use clean water, prepare fresh',
            side_effects: 'None'
        },
        {
            name: 'Paracetamol',
            purpose: 'Fever and pain relief',
            dosage: 'As per doctor\'s prescription',
            timing: 'When fever above 100°F',
            precautions: 'Do not exceed recommended dose',
            side_effects: 'Liver damage with overdose'
        }
        // ... other medications
    ];

    // First Aid Guide
    const firstAid = [
        {
            emergency: 'Fainting',
            steps: [
                'Lay person flat with legs elevated',
                'Loosen tight clothing',
                'Ensure fresh air'
            ],
            donts: [
                'Do not pour water on face',
                'Do not give anything by mouth if unconscious'
            ]
        },
        {
            emergency: 'Seizures',
            steps: [
                'Protect head from injury',
                'Turn to recovery position after seizure',
                'Time the seizure duration'
            ],
            donts: [
                'Do not restrain the person',
                'Do not put anything in mouth'
            ]
        },
        {
            emergency: 'Bleeding',
            steps: [
                'Apply direct pressure with clean cloth',
                'Elevate the injured area',
                'Do not remove embedded objects'
            ],
            donts: [
                'Do not use tourniquet unless trained',
                'Do not remove blood-soaked dressings'
            ]
        },
        {
            emergency: 'Burns',
            steps: [
                'Cool with running water for 10-20 minutes',
                'Cover with sterile non-stick dressing',
                'Do not apply ice or creams'
            ],
            donts: [
                'Do not break blisters',
                'Do not remove stuck clothing'
            ]
        },
    ];

    // Due Date Calculator
    const calculateDueDate = (lastPeriod: string) => {
        const lastPeriodDate = new Date(lastPeriod);
        const dueDate = new Date(lastPeriodDate);
        dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
        return dueDate.toLocaleDateString();
    };

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    const handleWebsite = (url: string) => {
        if (url) {
            Linking.openURL(url);
        } else {
            Alert.alert('Information', 'Website link not available');
        }
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
    const AnimatedView = Animated.createAnimatedComponent(View);

    const renderSymptoms = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search symptoms..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🤰 Pregnancy Related</Text>
                {symptomsData.pregnancy.map((item, index) => (
                    <AnimatedTouchable
                        key={index}
                        style={[
                            styles.symptomCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.symptomName}>{item.symptom}</Text>
                        <Text style={styles.symptomDesc}>{item.description}</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Causes:</Text>
                            <Text style={styles.infoText}>{item.causes}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Management:</Text>
                            <Text style={styles.infoText}>{item.management}</Text>
                        </View>
                        <View style={styles.warningBox}>
                            <Ionicons name="warning" size={16} color="#DC2626" />
                            <Text style={styles.warningText}>Seek help if: {item.when_to_seek_help}</Text>
                        </View>
                    </AnimatedTouchable>
                ))}
            </View>
        </Animated.ScrollView>
    );

    const renderMedications = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.importantNote}>
                <Ionicons name="medical" size={20} color="#DC2626" />
                <Text style={styles.importantNoteText}>
                    Always consult with a doctor before administering any medication
                </Text>
            </View>

            {medications.map((med, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.medicationCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationPurpose}>{med.purpose}</Text>

                    <View style={styles.medicationDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="time" size={16} color="#6B7280" />
                            <Text style={styles.detailLabel}>Dosage:</Text>
                            <Text style={styles.detailValue}>{med.dosage}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar" size={16} color="#6B7280" />
                            <Text style={styles.detailLabel}>Timing:</Text>
                            <Text style={styles.detailValue}>{med.timing}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="alert-circle" size={16} color="#6B7280" />
                            <Text style={styles.detailLabel}>Precautions:</Text>
                            <Text style={styles.detailValue}>{med.precautions}</Text>
                        </View>
                        {med.side_effects && (
                            <View style={styles.detailItem}>
                                <Ionicons name="warning" size={16} color="#DC2626" />
                                <Text style={styles.detailLabel}>Side Effects:</Text>
                                <Text style={styles.detailValue}>{med.side_effects}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            ))}
        </Animated.ScrollView>
    );

    const renderFirstAid = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.emergencyContacts}>
                <Text style={styles.emergencyTitle}>🚨 Emergency Contacts</Text>
                <View style={styles.contactGrid}>
                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => handleCall('108')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="medkit" size={24} color="#DC2626" />
                        <Text style={styles.emergencyButtonText}>Ambulance</Text>
                        <Text style={styles.emergencyNumber}>108</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => handleCall('102')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="medkit" size={24} color="#2563EB" />
                        <Text style={styles.emergencyButtonText}>Medical Help</Text>
                        <Text style={styles.emergencyNumber}>102</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => handleCall('1091')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="female" size={24} color="#EC4899" />
                        <Text style={styles.emergencyButtonText}>Women Helpline</Text>
                        <Text style={styles.emergencyNumber}>1091</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {firstAid.map((aid, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.firstAidCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.firstAidTitle}>{aid.emergency}</Text>

                    <View style={styles.stepsSection}>
                        <Text style={styles.stepsTitle}>Do:</Text>
                        {aid.steps.map((step, stepIndex) => (
                            <View key={stepIndex} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.stepsSection}>
                        <Text style={[styles.stepsTitle, styles.dontTitle]}>Don't:</Text>
                        {aid.donts.map((dont, dontIndex) => (
                            <View key={dontIndex} style={styles.stepItem}>
                                <View style={[styles.stepNumber, styles.dontNumber]}>
                                    <Text style={styles.stepNumberText}>✗</Text>
                                </View>
                                <Text style={styles.stepText}>{dont}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            ))}
        </Animated.ScrollView>
    );

    const renderDueDate = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.comingSoon}>Due Date Calculator - Coming Soon</Text>
        </Animated.ScrollView>
    );

    const renderSchemes = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            {healthSchemes.map((scheme) => (
                <Animated.View
                    key={scheme.id}
                    style={[
                        styles.schemeCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.schemeName}>{scheme.name}</Text>
                    <Text style={styles.schemeDescription}>{scheme.description}</Text>

                    <View style={styles.schemeDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.schemeDetailLabel}>Eligibility:</Text>
                            <Text style={styles.schemeDetailValue}>{scheme.eligibility}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.schemeDetailLabel}>Benefits:</Text>
                            <Text style={styles.schemeDetailValue}>{scheme.benefits}</Text>
                        </View>
                    </View>

                    <View style={styles.schemeActions}>
                        <TouchableOpacity
                            style={styles.schemeButton}
                            onPress={() => handleCall(scheme.contact)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={16} color="#fff" />
                            <Text style={styles.schemeButtonText}>Call {scheme.contact}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.schemeButton, styles.websiteButton]}
                            onPress={() => handleWebsite(scheme.link)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="globe" size={16} color="#fff" />
                            <Text style={styles.schemeButtonText}>Website</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ))}
        </Animated.ScrollView>
    );

    const renderLoans = () => (
        <Animated.ScrollView
            style={[
                styles.categoryContent,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
            showsVerticalScrollIndicator={false}
        >
            {healthLoans.map((loan) => (
                <Animated.View
                    key={loan.id}
                    style={[
                        styles.loanCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.loanName}>{loan.name}</Text>
                    <Text style={styles.loanProvider}>By {loan.provider}</Text>

                    <View style={styles.loanDetails}>
                        <View style={styles.loanDetailItem}>
                            <Ionicons name="card" size={16} color="#6B7280" />
                            <Text style={styles.loanDetailLabel}>Purpose:</Text>
                            <Text style={styles.loanDetailValue}>{loan.purpose}</Text>
                        </View>
                        <View style={styles.loanDetailItem}>
                            <Ionicons name="cash" size={16} color="#6B7280" />
                            <Text style={styles.loanDetailLabel}>Amount:</Text>
                            <Text style={styles.loanDetailValue}>{loan.amount}</Text>
                        </View>
                        <View style={styles.loanDetailItem}>
                            <Ionicons name="trending-up" size={16} color="#6B7280" />
                            <Text style={styles.loanDetailLabel}>Interest:</Text>
                            <Text style={styles.loanDetailValue}>{loan.interest}</Text>
                        </View>
                    </View>

                    <View style={styles.loanActions}>
                        <TouchableOpacity
                            style={styles.loanButton}
                            onPress={() => handleCall(loan.contact)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={16} color="#fff" />
                            <Text style={styles.loanButtonText}>Contact</Text>
                        </TouchableOpacity>
                        {loan.link && (
                            <TouchableOpacity
                                style={[styles.loanButton, styles.websiteButton]}
                                onPress={() => handleWebsite(loan.link)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="globe" size={16} color="#fff" />
                                <Text style={styles.loanButtonText}>Apply</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            ))}
        </Animated.ScrollView>
    );

    const categories = [
        { id: 'symptoms', name: 'Symptoms', icon: '🩺', component: renderSymptoms },
        { id: 'medications', name: 'Medications', icon: '💊', component: renderMedications },
        { id: 'firstaid', name: 'First Aid', icon: '🆘', component: renderFirstAid },
        { id: 'duedate', name: 'Due Date', icon: '📅', component: renderDueDate },
        { id: 'schemes', name: 'Schemes', icon: '🏛️', component: renderSchemes },
        { id: 'loans', name: 'Loans', icon: '💰', component: renderLoans },
    ];

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
                        <Text style={styles.headerTitle}>Health Guidance</Text>
                        <Text style={styles.headerSubtitle}>
                            Medical information & resources
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
                        <Ionicons name="help-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Category Navigation */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryNav}
                contentContainerStyle={styles.categoryNavContent}
            >
                {categories.map((category) => (
                    <AnimatedTouchable
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            activeCategory === category.id && styles.activeCategoryButton,
                            {
                                transform: [{
                                    scale: activeCategory === category.id ?
                                        fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.95, 1.05]
                                        }) : 1
                                }]
                            }
                        ]}
                        onPress={() => handleCategoryChange(category.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[
                            styles.categoryButtonText,
                            activeCategory === category.id && styles.activeCategoryButtonText,
                        ]}>
                            {category.name}
                        </Text>
                    </AnimatedTouchable>
                ))}
            </ScrollView>

            {/* Content Area - Takes remaining space */}
            <View style={styles.content}>
                {categories.find(cat => cat.id === activeCategory)?.component()}
            </View>

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
        paddingTop: Platform.OS === 'ios' ? 80 : 50,
        paddingBottom: 12,
        paddingHorizontal: 16,
        height: Platform.OS === 'ios' ? 100 : 110,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 10 : 0,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    backButton: {
        padding: 6,
    },
    helpButton: {
        padding: 6,
    },
    headerTitle: {
        color: '#fff',
        fontSize: screenWidth * 0.055,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: screenWidth * 0.035,
        textAlign: 'center',
        marginTop: 2,
    },
    categoryNav: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        maxHeight: 80,
        minHeight: 70,
    },
    categoryNavContent: {
        paddingHorizontal: screenWidth * 0.02,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: screenWidth * 0.03,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginHorizontal: 4,
        minWidth: screenWidth * 0.22,
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activeCategoryButton: {
        backgroundColor: '#2563eb',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    categoryIcon: {
        fontSize: screenWidth * 0.06,
        marginBottom: 4,
    },
    categoryButtonText: {
        fontSize: screenWidth * 0.03,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    activeCategoryButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    content: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    categoryContent: {
        flex: 1,
        padding: screenWidth * 0.04,
        paddingTop: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#374151',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: screenWidth * 0.045,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    symptomCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    symptomName: {
        fontSize: screenWidth * 0.042,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    symptomDesc: {
        fontSize: screenWidth * 0.038,
        color: '#6B7280',
        marginBottom: 10,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#374151',
        width: 90,
    },
    infoText: {
        fontSize: screenWidth * 0.034,
        color: '#6B7280',
        flex: 1,
        lineHeight: 18,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#DC2626',
    },
    warningText: {
        fontSize: screenWidth * 0.034,
        color: '#DC2626',
        marginLeft: 8,
        fontWeight: '500',
        flex: 1,
        lineHeight: 18,
    },
    importantNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEFCE8',
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    importantNoteText: {
        fontSize: screenWidth * 0.036,
        color: '#92400E',
        fontWeight: '500',
        marginLeft: 10,
        flex: 1,
        lineHeight: 20,
    },
    medicationCard: {
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
    medicationName: {
        fontSize: screenWidth * 0.042,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    medicationPurpose: {
        fontSize: screenWidth * 0.038,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    medicationDetails: {
        marginTop: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
        width: 90,
    },
    detailValue: {
        fontSize: screenWidth * 0.034,
        color: '#6B7280',
        flex: 1,
        marginLeft: 8,
        lineHeight: 18,
    },
    emergencyContacts: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emergencyTitle: {
        fontSize: screenWidth * 0.042,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    contactGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    emergencyButton: {
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 10,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    emergencyButtonText: {
        fontSize: screenWidth * 0.032,
        fontWeight: '600',
        color: '#374151',
        marginTop: 6,
        textAlign: 'center',
    },
    emergencyNumber: {
        fontSize: screenWidth * 0.038,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 4,
    },
    firstAidCard: {
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
    firstAidTitle: {
        fontSize: screenWidth * 0.042,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    stepsSection: {
        marginBottom: 12,
    },
    stepsTitle: {
        fontSize: screenWidth * 0.038,
        fontWeight: '600',
        color: '#10B981',
        marginBottom: 8,
    },
    dontTitle: {
        color: '#DC2626',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    dontNumber: {
        backgroundColor: '#DC2626',
    },
    stepNumberText: {
        fontSize: screenWidth * 0.032,
        fontWeight: '700',
        color: '#fff',
    },
    stepText: {
        fontSize: screenWidth * 0.036,
        color: '#374151',
        flex: 1,
        lineHeight: 20,
    },
    comingSoon: {
        fontSize: screenWidth * 0.045,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        marginTop: screenHeight * 0.3,
    },
    schemeCard: {
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
    schemeName: {
        fontSize: screenWidth * 0.04,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    schemeDescription: {
        fontSize: screenWidth * 0.036,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    schemeDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    // detailLabel/detailValue defined earlier for medication details; avoid duplicates here
    schemeDetailLabel: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#374151',
        width: 90,
    },
    schemeDetailValue: {
        fontSize: screenWidth * 0.034,
        color: '#6B7280',
        flex: 1,
        lineHeight: 18,
    },
    schemeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    schemeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    websiteButton: {
        backgroundColor: '#10B981',
    },
    schemeButtonText: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 6,
    },
    loanCard: {
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
    loanName: {
        fontSize: screenWidth * 0.04,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
    },
    loanProvider: {
        fontSize: screenWidth * 0.036,
        color: '#6B7280',
        marginBottom: 12,
    },
    loanDetails: {
        marginBottom: 12,
    },
    loanDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    loanDetailLabel: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#374151',
        width: 80,
        marginLeft: 8,
    },
    loanDetailValue: {
        fontSize: screenWidth * 0.034,
        color: '#6B7280',
        flex: 1,
        marginLeft: 8,
        lineHeight: 18,
    },
    loanActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    loanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    loanButtonText: {
        fontSize: screenWidth * 0.034,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 6,
    },
});