import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile } from '../services/types';
import { saveFarmProfile } from '../services/storage';
import { isValidCoordinate } from '../services/weather';
import { COLORS, SHADOWS } from '../constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();

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

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const coordsVerified = isValidCoordinate(latitude, longitude);

  const handleLoadSampleProfile = () => {
    setName('Ramesh Patel');
    setVillage('Kothapalli');
    setDistrict('Adilabad');
    setState('Telangana');
    setLatitude('19.6641');
    setLongitude('78.5320');
    setLand('4 Acres');
    setSoil('Deep Black Cotton Soil');
    setIrrigation('Borewell with Drip System');
    setBudget('₹65,000');
    setEquipment('Tractor, Rotavator, Power Sprayer');
    setLabour('Family labour + 2 seasonal helpers');
    setCurrentCrops('Cotton, Red Gram (Pigeon Pea)');
    setError('');
  };

  const handleSetPresetCoords = (lat: string, lon: string, dist: string, st: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setDistrict(dist);
    setState(st);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Please enter farmer name.');
      return;
    }
    if (!village.trim() || !district.trim() || !state.trim()) {
      setError('Please enter village, district, and state.');
      return;
    }
    if (!coordsVerified) {
      setError(
        'Valid GPS coordinates are required for accurate weather and mandi calculations. Coordinates cannot be inferred from village names.'
      );
      return;
    }
    if (!land.trim() || !soil.trim() || !irrigation.trim()) {
      setError('Please specify land area, soil type, and irrigation source.');
      return;
    }

    setSaving(true);
    try {
      const profile: FarmProfile = {
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
        labour: labour.trim() || 'Self / family labour',
        currentCrops: currentCrops.trim() || 'None / New season',
      };

      await saveFarmProfile(profile);
      router.replace('/tabs');
    } catch (err: any) {
      setError('Failed to save farm profile: ' + err.message);
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>FARM ONBOARDING</Text>
            </View>
            <Text style={styles.title}>Register Your Land</Text>
            <Text style={styles.subtitle}>
              GenZ Farm understands your physical conditions before suggesting optimal crop plans.
            </Text>

            <TouchableOpacity style={styles.sampleProfileBtn} onPress={handleLoadSampleProfile}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sampleProfileBtnText}>Fill Sample Farm Profile</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          {/* Section 1: Farmer & Location */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Farmer & Geography</Text>
            </View>

            <Text style={styles.inputLabel}>Farmer Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Patel"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>Village *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Kothapalli"
                  placeholderTextColor={COLORS.textMuted}
                  value={village}
                  onChangeText={setVillage}
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>District *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Adilabad"
                  placeholderTextColor={COLORS.textMuted}
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>State *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Telangana"
              placeholderTextColor={COLORS.textMuted}
              value={state}
              onChangeText={setState}
            />

            {/* GPS Coordinates & Verification */}
            <View style={styles.coordsHeader}>
              <Text style={styles.inputLabel}>GPS Coordinates *</Text>
              <View
                style={[
                  styles.coordStatusPill,
                  coordsVerified ? styles.coordVerified : styles.coordUnverified,
                ]}
              >
                <Ionicons
                  name={coordsVerified ? 'checkmark-circle' : 'warning-outline'}
                  size={15}
                  color={coordsVerified ? COLORS.success : COLORS.warning}
                />
                <Text
                  style={[
                    styles.coordStatusText,
                    { color: coordsVerified ? COLORS.success : COLORS.warning },
                  ]}
                >
                  {coordsVerified ? 'Verified Coordinates' : 'Verification Required'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Latitude (e.g. 19.6641)"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={setLatitude}
                />
              </View>
              <View style={styles.halfCol}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Longitude (e.g. 78.5320)"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>
            </View>

            <Text style={styles.presetTitle}>Select Regional Coordinates:</Text>
            <View style={styles.presetWrap}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleSetPresetCoords('19.6641', '78.5320', 'Adilabad', 'Telangana')}
              >
                <Text style={styles.presetChipText}>Adilabad (19.66, 78.53)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleSetPresetCoords('16.3067', '80.4365', 'Guntur', 'Andhra Pradesh')}
              >
                <Text style={styles.presetChipText}>Guntur (16.30, 80.43)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleSetPresetCoords('19.9975', '73.7898', 'Nashik', 'Maharashtra')}
              >
                <Text style={styles.presetChipText}>Nashik (19.99, 73.78)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Physical Resources */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Physical Land Resources</Text>
            </View>

            <Text style={styles.inputLabel}>Land Area (Acres) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 4 Acres"
              placeholderTextColor={COLORS.textMuted}
              value={land}
              onChangeText={setLand}
            />

            <Text style={styles.inputLabel}>Soil Type *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Medium Black Cotton Soil / Red Loam"
              placeholderTextColor={COLORS.textMuted}
              value={soil}
              onChangeText={setSoil}
            />

            <Text style={styles.inputLabel}>Irrigation Source *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Borewell with Drip System / Canal"
              placeholderTextColor={COLORS.textMuted}
              value={irrigation}
              onChangeText={setIrrigation}
            />
          </View>

          {/* Section 3: Operational Constraints */}
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Operational Capabilities</Text>
            </View>

            <Text style={styles.inputLabel}>Available Seasonal Budget</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. ₹60,000"
              placeholderTextColor={COLORS.textMuted}
              value={budget}
              onChangeText={setBudget}
            />

            <Text style={styles.inputLabel}>Available Machinery</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Tractor, Rotavator, Knapsack Sprayer"
              placeholderTextColor={COLORS.textMuted}
              value={equipment}
              onChangeText={setEquipment}
            />

            <Text style={styles.inputLabel}>Labour Availability</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Family labour + 2 seasonal helpers"
              placeholderTextColor={COLORS.textMuted}
              value={labour}
              onChangeText={setLabour}
            />

            <Text style={styles.inputLabel}>Current / Existing Crops</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Cotton, Red Gram, or Fresh Season"
              placeholderTextColor={COLORS.textMuted}
              value={currentCrops}
              onChangeText={setCurrentCrops}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Registering Farm...' : 'Save Profile & Enter Farm'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
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
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  sampleProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  sampleProfileBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSoft,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorBoxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.danger,
    marginLeft: 10,
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 10,
  },
  inputLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  coordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  coordStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coordVerified: {
    backgroundColor: COLORS.successSoft,
  },
  coordUnverified: {
    backgroundColor: COLORS.warningSoft,
  },
  coordStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 14,
    marginBottom: 8,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  presetChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 36,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
