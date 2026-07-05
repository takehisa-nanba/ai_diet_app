import React, { useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile, saveProfile } = useContext(AppContext);

  // プロフィール更新用ヘルパー
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="person-outline" size={24} color="#2E8B57" />
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
          <Ionicons name="scale-outline" size={20} color="#2E8B57" />
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
          <Ionicons name="calendar-outline" size={20} color="#2E8B57" />
          <Text style={styles.cardTitle}>目標設定</Text>
        </View>

        <Text style={styles.label}>目標達成期限</Text>
        <TextInput
          style={[styles.input, { marginBottom: 16 }]}
          value={profile.targetDate}
          onChangeText={(t) => updateField('targetDate', t)}
          placeholder="例: 2026/09/30"
        />

        <Text style={styles.label}>日々の活動レベル</Text>
        <View style={styles.activityContainer}>
          {['低い', '普通', '高い'].map(level => (
            <TouchableOpacity 
              key={level} 
              style={[styles.activityButton, profile.activityLevel === level && styles.activityButtonActive]}
              onPress={() => updateField('activityLevel', level)}
            >
              <Text style={[styles.activityText, profile.activityLevel === level && styles.activityTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  header: { padding: 20 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  headerSubtitle: { fontSize: 14, color: '#666', marginLeft: 32 },
  bmiCard: { flexDirection: 'row', backgroundColor: '#e8f5e9', padding: 20, marginHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1, borderColor: '#c8e6c9' },
  bmiLabel: { fontSize: 16, color: '#2E8B57', fontWeight: 'bold' },
  bmiValue: { fontSize: 28, fontWeight: 'bold', color: '#2E8B57' },
  card: { backgroundColor: '#fff', padding: 20, marginHorizontal: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  inputGroup: { flex: 0.48 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', color: '#333' },
  activityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  activityButton: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  activityButtonActive: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  activityText: { color: '#666', fontWeight: 'bold' },
  activityTextActive: { color: '#fff', fontWeight: 'bold' },
});
