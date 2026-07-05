import React, { useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function ProfileScreen() {
  const { profile, saveProfile } = useContext(AppContext);

  const updateField = (field, value) => {
    saveProfile({ ...profile, [field]: value });
  };

  // BMI計算
  let bmi = 0;
  if (profile.weight && profile.height) {
    const heightM = parseFloat(profile.height) / 100;
    const weightKg = parseFloat(profile.weight);
    if (heightM > 0) {
      bmi = (weightKg / (heightM * heightM)).toFixed(1);
    }
  }

  const activityLevels = [
    { label: '座り仕事が多い（ほぼ運動なし）' },
    { label: '軽い運動（週1〜3日）' },
    { label: '中程度の運動（週3〜5日）' },
    { label: '激しい運動（週6〜7日）' },
    { label: '非常に激しい運動（1日2回など）' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="person-outline" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>プロフィール設定</Text>
        </View>
        <Text style={styles.headerSubtitle}>あなたの情報を入力してください</Text>
      </View>

      <View style={styles.bmiCard}>
        <Text style={styles.bmiLabel}>現在のBMI</Text>
        <Text style={styles.bmiValue}>{bmi > 0 ? bmi : '--'}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="scale-outline" size={20} color={theme.colors.primaryDark} />
          <Text style={styles.cardTitle}>体重・身体情報</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>現在の体重 (kg)</Text>
            <TextInput
              style={styles.input}
              value={profile.weight}
              onChangeText={(t) => updateField('weight', t)}
              keyboardType="numeric"
              placeholder="例: 105.4"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>目標体重 (kg)</Text>
            <TextInput
              style={styles.input}
              value={profile.targetWeight}
              onChangeText={(t) => updateField('targetWeight', t)}
              keyboardType="numeric"
              placeholder="例: 85"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>身長 (cm)</Text>
            <TextInput
              style={styles.input}
              value={profile.height}
              onChangeText={(t) => updateField('height', t)}
              keyboardType="numeric"
              placeholder="例: 171"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齢</Text>
            <TextInput
              style={styles.input}
              value={profile.age}
              onChangeText={(t) => updateField('age', t)}
              keyboardType="numeric"
              placeholder="例: 42"
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pulse-outline" size={20} color={theme.colors.primaryDark} />
          <Text style={styles.cardTitle}>活動レベル</Text>
        </View>

        <View style={styles.activityVerticalContainer}>
          {activityLevels.map(level => {
            const isActive = profile.activityLevel === level.label;
            return (
              <TouchableOpacity 
                key={level.label} 
                style={[styles.activityVerticalButton, isActive && styles.activityVerticalButtonActive]}
                onPress={() => updateField('activityLevel', level.label)}
              >
                <Text style={[styles.activityVerticalText, isActive && styles.activityVerticalTextActive]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.primaryDark} />
          <Text style={styles.cardTitle}>リマインダー通知</Text>
        </View>

        {profile.reminderEnabled && (
          <View style={styles.reminderBanner}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primaryDark} />
            <Text style={styles.reminderBannerText}>毎日 {profile.reminderTime || '7:00'} にリマインダーが届きます</Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 8 }]}>通知時刻</Text>
        <View style={styles.timeInputContainer}>
          <TextInput
            style={styles.timeInput}
            value={profile.reminderTime}
            onChangeText={(t) => updateField('reminderTime', t)}
            placeholder="7:00"
            maxLength={5}
          />
          <Ionicons name="chevron-down" size={20} color="#999" />
        </View>

        <Text style={styles.reminderNote}>
          ※ アプリを開いている時間帯に通知が届きます。毎日この時間帯にブラウザを開いておいてください。
        </Text>

        <View style={styles.reminderButtonRow}>
          <TouchableOpacity 
            style={styles.saveReminderBtn} 
            onPress={() => updateField('reminderEnabled', true)}
          >
            <Text style={styles.saveReminderBtnText}>設定を保存</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.disableReminderBtn} 
            onPress={() => updateField('reminderEnabled', false)}
          >
            <Ionicons name="notifications-off-outline" size={16} color={theme.colors.text} style={{ marginRight: 4 }} />
            <Text style={styles.disableReminderBtnText}>無効化</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveProfileBtn} onPress={() => saveProfile(profile)}>
        <Text style={styles.saveProfileBtnText}>プロフィールを保存</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 },
  headerSubtitle: { fontSize: 14, color: theme.colors.textLight, marginLeft: 32 },
  bmiCard: { flexDirection: 'row', backgroundColor: theme.colors.primaryLight, padding: 20, marginHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1, borderColor: theme.colors.primary },
  bmiLabel: { fontSize: 16, color: theme.colors.primaryDark, fontWeight: 'bold' },
  bmiValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primaryDark },
  card: { backgroundColor: theme.colors.card, padding: 20, marginHorizontal: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  inputGroup: { flex: 0.48 },
  label: { fontSize: 14, color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: theme.colors.card, borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text },
  
  activityVerticalContainer: { marginTop: 4 },
  activityVerticalButton: { backgroundColor: theme.colors.card, padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  activityVerticalButtonActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primaryDark },
  activityVerticalText: { color: theme.colors.text, fontSize: 15 },
  activityVerticalTextActive: { color: theme.colors.primaryDark, fontWeight: 'bold' },
  
  reminderBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primaryLight, padding: 12, borderRadius: 8, marginBottom: 16 },
  reminderBannerText: { color: theme.colors.primaryDark, fontSize: 14, marginLeft: 8 },
  timeInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.card, marginBottom: 12 },
  timeInput: { fontSize: 16, color: theme.colors.text, flex: 1 },
  reminderNote: { fontSize: 12, color: theme.colors.textLight, marginBottom: 16, lineHeight: 18 },
  reminderButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveReminderBtn: { flex: 0.65, backgroundColor: theme.colors.primaryDark, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveReminderBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  disableReminderBtn: { flex: 0.3, flexDirection: 'row', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  disableReminderBtnText: { color: theme.colors.text, fontSize: 14 },
  
  saveProfileBtn: { backgroundColor: theme.colors.primaryDark, paddingVertical: 16, marginHorizontal: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveProfileBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
