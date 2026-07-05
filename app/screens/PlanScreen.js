import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/plan' : 'http://localhost:8000/plan';

export default function PlanScreen() {
  const { profile } = useContext(AppContext);
  const [foodInput, setFoodInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planResult, setPlanResult] = useState(null);

  const generatePlan = async () => {
    if (!foodInput.trim()) return;
    setIsGenerating(true);
    setPlanResult(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          food: foodInput,
          profile: profile
        }),
      });
      const data = await response.json();
      setPlanResult(data.plan);
    } catch (error) {
      console.error(error);
      setPlanResult('通信エラーが発生しました。サーバーに接続できません。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>🍽️ わがまま食事プランナー</Text>
          <Text style={styles.subtitle}>ダイエット中でも我慢しない！今日どうしても食べたいものを教えてください。AIがそれを組み込んだ専用のプラン（献立・食べ合わせの工夫）を提案します。</Text>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={foodInput}
              onChangeText={setFoodInput}
              placeholder="例: ラーメン、焼肉、ケーキ..."
              placeholderTextColor={theme.colors.textLight}
              onSubmitEditing={generatePlan}
            />
            <TouchableOpacity style={styles.button} onPress={generatePlan} disabled={!foodInput.trim() || isGenerating}>
              <Text style={styles.buttonText}>プラン作成</Text>
              <Ionicons name="sparkles" size={16} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>AIが最新のレシピやカロリーを調べ、あなただけの献立を考えています...</Text>
          </View>
        )}

        {planResult && !isGenerating && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="restaurant" size={24} color={theme.colors.primary} />
              <Text style={styles.resultTitle}>あなた専用の食事プラン</Text>
            </View>
            <Text style={styles.resultText}>{planResult}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.textLight, lineHeight: 20, marginBottom: 20 },
  inputWrapper: { flexDirection: 'column' },
  input: { backgroundColor: theme.colors.background, padding: 16, borderRadius: 12, fontSize: 16, color: theme.colors.text, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  button: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 16, color: theme.colors.primary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  
  resultCard: { backgroundColor: theme.colors.primaryLight, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.colors.primary },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primaryDark, marginLeft: 8 },
  resultText: { fontSize: 15, color: theme.colors.text, lineHeight: 24 }
});
