import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile } from '../../services/types';
import { getFarmProfile, saveFarmProfile } from '../../services/storage';
import { isValidCoordinate } from '../../services/weather';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function FarmScreen() {
  const [profile, setProfile] = useState<FarmProfile | null>(null);

  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [land, setLand] = useState('');
  const [soil, setSoil] = useState('');
  const [irrigation, setIrrigation] = useState('');
  const [budget, setBudget] = useState('');
  const [equipment, setEquipment] = useState('');
  const [labour, setLabour] = useState('');
  const [currentCrops, setCurrentCrops] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const coordsVerified = isValidCoordinate(latitude, longitude);

  useEffect(() => {
    async function loadProfile() {
      const stored = await getFarmProfile();
      if (stored) {
        setProfile(stored);
        setName(stored.name || '');
        setVillage(stored.village || '');
        setDistrict(stored.district || '');
        setState(stored.state || '');
        setLatitude(stored.latitude || '');
        setLongitude(stored.longitude || '');
        setLand(stored.land || '');
        setSoil(stored.soil || '');
        setIrrigation(stored.irrigation || '');
        setBudget(stored.budget || '');
        setEquipment(stored.equipment || '');
        setLabour(stored.labour || '');
        setCurrentCrops(stored.currentCrops || '');
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !village.trim() || !district.trim() || !state.trim()) {
      setError('Please provide farmer name, village, district, and state.');
      return;
    }

    if (!coordsVerified) {
      setError('Valid numeric GPS coordinates (-90..90, -180..180) are required for verified weather.');
      return;
    }

    if (!land.trim() || !soil.trim() || !irrigation.trim()) {
      setError('Land area, soil type, and irrigation source cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      const updated: FarmProfile = {
        name: name.trim(),
        village: village.trim(),
        district: district.trim(),
        state: state.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        land: land.trim(),
        soil: soil.trim(),
        irrigation: irrigation.trim(),
        budget: budget.trim() || 'Not specified',
        equipment: equipment.trim() || 'Standard farm implements',
        labour: labour.trim() || 'Family labour',
        currentCrops: currentCrops.trim() || 'None',
      };

      await saveFarmProfile(updated);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update farm profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Farm Context & Land Setup</Text>
              <Text style={styles.subtitle}>
                Persistent physical resources and verified geographic parameters.
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          {savedSuccess ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.successBoxText}>Farm profile updated successfully!</Text>
            </View>
          ) : null}

          {/* Section 1: Location & Coordinates */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Location & Verified GPS</Text>
            </View>

            <Text style={styles.label}>Farmer Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Village</Text>
                <TextInput style={styles.input} value={village} onChangeText={setVillage} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>District</Text>
                <TextInput style={styles.input} value={district} onChangeText={setDistrict} />
              </View>
            </View>

            <Text style={styles.label}>State</Text>
            <TextInput style={styles.input} value={state} onChangeText={setState} />

            <View style={styles.coordsHeader}>
              <Text style={styles.label}>GPS Coordinates</Text>
              <View
                style={[
                  styles.coordBadge,
                  coordsVerified ? styles.coordBadgeGood : styles.coordBadgeBad,
                ]}
              >
                <Ionicons
                  name={coordsVerified ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={coordsVerified ? COLORS.success : COLORS.warning}
                />
                <Text
                  style={[
                    styles.coordBadgeText,
                    { color: coordsVerified ? COLORS.success : COLORS.warning },
                  ]}
                >
                  {coordsVerified ? 'Verified Station' : 'Verification Required'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <TextInput
                  style={styles.input}
                  placeholder="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfCol}>
                <TextInput
                  style={styles.input}
                  placeholder="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Section 2: Physical Land & Resources */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Physical Land & Resources</Text>
            </View>

            <Text style={styles.label}>Land Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4 Acres"
              value={land}
              onChangeText={setLand}
            />

            <Text style={styles.label}>Soil Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Medium Black Soil / Sandy Loam"
              value={soil}
              onChangeText={setSoil}
            />

            <Text style={styles.label}>Irrigation Source</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Borewell with Drip System / Canal"
              value={irrigation}
              onChangeText={setIrrigation}
            />
          </View>

          {/* Section 3: Operational Constraints */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.cardHeader}>
              <Ionicons name="options" size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Operational Parameters</Text>
            </View>

            <Text style={styles.label}>Seasonal Budget</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ₹60,000"
              value={budget}
              onChangeText={setBudget}
            />

            <Text style={styles.label}>Machinery & Implements</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tractor, cultivator, sprayer"
              value={equipment}
              onChangeText={setEquipment}
            />

            <Text style={styles.label}>Labour Availability</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Family labour + 2 seasonal helpers"
              value={labour}
              onChangeText={setLabour}
            />

            <Text style={styles.label}>Current Crops</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cotton, Red Gram"
              value={currentCrops}
              onChangeText={setCurrentCrops}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Ionicons name="save" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save Farm Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 19,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorBoxText: {
    fontSize: 13,
    color: COLORS.danger,
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  successBoxText: {
    fontSize: 13.5,
    color: COLORS.success,
    marginLeft: 8,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  coordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  coordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coordBadgeGood: {
    backgroundColor: COLORS.successSoft,
  },
  coordBadgeBad: {
    backgroundColor: COLORS.warningSoft,
  },
  coordBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
