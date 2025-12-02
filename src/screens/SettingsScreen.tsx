import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getAllPatients } from "../db/sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { attemptSync } from "../services/sync";
import FloatingLanguageButton from "../components/FloatingLanguageButton";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const sub = NetInfo.addEventListener(state => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => sub && sub();
  }, []);

  useEffect(() => {
    (async () => {
      const ts = await AsyncStorage.getItem('last_sync_at');
      if (ts) setLastSyncedAt(ts);
    })();
  }, []);

  const exportData = async () => {
    try {
      const patients = await getAllPatients();
      const payload = { exportedAt: new Date().toISOString(), patients };
      const json = JSON.stringify(payload, null, 2);
      await saveAndShare(`asha_patients_${Date.now()}.json`, 'application/json', json);
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Unable to export data');
    }
  };

  const toCsv = (patients: any[]) => {
    const header = [
      'id','name','village','age','gender','lastVisit','status','nextVisit','contact',
      'territory_state','territory_district','territory_block','territory_village'
    ];
    const escape = (v: any) => {
      const s = v === undefined || v === null ? '' : String(v);
      const needs = /[",\n\r]/.test(s);
      const esc = s.replace(/"/g, '""');
      return needs ? `"${esc}"` : esc;
    };
    const rows = patients.map(p => [
      p.id, p.name, p.village, p.age, p.gender, p.lastVisit, p.status, p.nextVisit, p.contact,
      p.territory_state, p.territory_district, p.territory_block, p.territory_village
    ].map(escape).join(','));
    return header.join(',') + '\r\n' + rows.join('\r\n');
  };

  const exportCsv = async () => {
    try {
      const patients = await getAllPatients();
      const csv = toCsv(patients);
      await saveAndShare(`asha_patients_${Date.now()}.csv`, 'text/csv', csv);
    } catch (e: any) {
      Alert.alert('CSV export failed', e?.message || 'Unable to export CSV');
    }
  };

  const saveAndShare = async (filename: string, mime: string, data: string) => {
    const FileSystem = await import('expo-file-system');
    const defaultUri = (FileSystem.documentDirectory || FileSystem.cacheDirectory) + filename;
    // Write file (utf8 is default; avoid EncodingType to prevent undefined in some SDKs)
    await FileSystem.writeAsStringAsync(defaultUri, data);

    // Try native share sheet first (works offline too)
    try {
      const Sharing = await import('expo-sharing');
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(defaultUri, { mimeType: mime } as any);
        return;
      }
    } catch {}

    // On Android, optionally let user pick a folder (e.g., Downloads) via SAF
    if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
      try {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (perm.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(perm.directoryUri, filename, mime);
          await FileSystem.writeAsStringAsync(uri, data);
          Alert.alert('Export complete', 'File saved to selected folder.');
          return;
        }
      } catch {}
    }

    // Fallback: show local path
    Alert.alert('Export complete', `File saved at: ${defaultUri}`);
  };

  const Item = ({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.itemIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
      <Feather name="chevron-right" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const syncNow = async () => {
    try {
      await attemptSync();
      const ts = new Date().toISOString();
      await AsyncStorage.setItem('last_sync_at', ts);
      setLastSyncedAt(ts);
      Alert.alert('Sync complete', 'Offline records have been uploaded (if any).');
    } catch (e: any) {
      Alert.alert('Sync failed', e?.message || 'Unable to sync now.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusText}>{isOnline ? t('common.online') : t('common.offline')}</Text>
            {lastSyncedAt && (
              <Text style={styles.subtleText}>Last sync: {new Date(lastSyncedAt).toLocaleString()}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.syncBtn} onPress={syncNow}>
            <Feather name="refresh-ccw" size={16} color="#2563eb" />
            <Text style={styles.syncBtnText}>{t('common.syncNow')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.settings')}</Text>
          <Item
            icon={<Ionicons name="language" size={18} color="#7C3AED" />}
            color="#7C3AED"
            label={`Language: ${language.toUpperCase()}`}
            onPress={() => Alert.alert(
              'Change language',
              'Choose your preferred language',
              [
                { text: 'English', onPress: () => setLanguage('en') },
                { text: 'हिंदी', onPress: () => setLanguage('hi') },
                { text: 'मराठी', onPress: () => setLanguage('mr') },
                { text: 'বাংলা', onPress: () => setLanguage('bn') },
                { text: 'தமிழ்', onPress: () => setLanguage('ta') },
                { text: 'తెలుగు', onPress: () => setLanguage('te') },
                { text: 'ಕನ್ನಡ', onPress: () => setLanguage('kn') },
                { text: 'മലയാളം', onPress: () => setLanguage('ml') },
                { text: 'ગુજરાતી', onPress: () => setLanguage('gu') },
                { text: 'ਪੰਜਾਬੀ', onPress: () => setLanguage('pa') },
                { text: 'ଓଡିଆ', onPress: () => setLanguage('or') },
                { text: 'Cancel', style: 'cancel' },
              ]
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Item
            icon={<Feather name="download" size={18} color="#2563eb" />}
            color="#2563eb"
            label={t('common.exportJson')}
            onPress={exportData}
          />
          <Item
            icon={<Feather name="file-text" size={18} color="#22C55E" />}
            color="#22C55E"
            label={t('common.exportCsv')}
            onPress={exportCsv}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Item
            icon={<Ionicons name="person" size={18} color="#6B7280" />}
            color="#6B7280"
            label={`My Profile${user?.name ? `: ${user.name}` : ''}`}
            onPress={() => Alert.alert('My Profile', `${user?.name || ''}\n${user?.email || ''}`)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Item
            icon={<Ionicons name="help-circle" size={18} color="#0EA5E9" />}
            color="#0EA5E9"
            label="Help & Support"
            onPress={() => Alert.alert('Help & Support', 'Email: support@example.com')}
          />
          <Item
            icon={<Ionicons name="shield-checkmark" size={18} color="#22C55E" />}
            color="#22C55E"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Your data stays on device and syncs securely when online.')}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: { padding: 6 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  placeholder: { width: 34 },
  content: { padding: 16 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { color: '#111827', fontWeight: '600' },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#6B7280', fontSize: 12, fontWeight: '700', marginBottom: 8, marginLeft: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: { flex: 1, color: '#111827', fontWeight: '600' },
  subtleText: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  syncBtnText: { color: '#2563eb', fontWeight: '700', marginLeft: 6, fontSize: 12 },
});


