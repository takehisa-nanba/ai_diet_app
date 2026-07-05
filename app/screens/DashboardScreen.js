import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { profile, weightRecords } = useContext(AppContext);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][today.getDay()]})`;

  const recentRecords = [...weightRecords].slice(0, 14).reverse();
  const labels = recentRecords.length > 0 ? recentRecords.map(r => {
    const d = new Date(r.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }) : ['今日'];
  const data = recentRecords.length > 0 ? recentRecords.map(r => r.weight) : [profile.weight ? parseFloat(profile.weight) : 0];

  const currentWeightVal = data[data.length - 1] || 0;
  
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: () => theme.colors.primary,
        strokeWidth: 4
      },
      {
        data: Array(labels.length).fill(currentWeightVal - 1),
        withDots: false,
        color: () => 'rgba(0,0,0,0)', // 透明な線
        strokeWidth: 0
      }
    ]
  };

  const currentWeight = weightRecords.length > 0 ? parseFloat(weightRecords[0].weight) : (profile.weight ? parseFloat(profile.weight) : 0);
  const targetWeight = profile.targetWeight ? parseFloat(profile.targetWeight) : 0;
  const initialWeight = 110; 
  
  let progress = 0;
  let remaining = 0;
  if (currentWeight > 0 && targetWeight > 0) {
    remaining = (currentWeight - targetWeight).toFixed(1);
    progress = Math.max(0, Math.min(1, (initialWeight - currentWeight) / (initialWeight - targetWeight)));
  }

  let remainingDays = '--';
  if (profile.targetDate) {
    // 例: "2026/09/30"
    const target = new Date(profile.targetDate);
    if (!isNaN(target.getTime())) {
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      remainingDays = diffDays > 0 ? diffDays : 0;
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.greetingText}>おはようございます 👋</Text>
      </View>

      <View style={styles.statusBanner}>
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
        <Text style={styles.statusText}>今日の体重を記録済みです 🎉 素晴らしい！</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>現在の体重</Text>
          <Text style={styles.cardValue}>{currentWeight || '--'} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>目標体重</Text>
          <Text style={[styles.cardValue, { color: theme.colors.primary }]}>
            {targetWeight || '--'} <Text style={[styles.unit, { color: theme.colors.primary }]}>kg</Text>
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTitle}>
            <Ionicons name="radio-button-on-outline" size={18} color="#666" />
            <Text style={styles.progressLabel}>目標まで</Text>
          </View>
          <Text style={styles.remainingText}>あと {remaining} kg</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        
        <View style={styles.progressFooter}>
          <Text style={styles.progressSubText}>{Math.round(progress * 100)}% 達成</Text>
          <Text style={styles.progressSubText}>残り {remainingDays} 日</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>直近2週間の推移</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={180}
          withShadow={false}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(${theme.colors.primaryRgb}, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
            propsForDots: { r: '3', strokeWidth: '2', stroke: theme.colors.primary, fill: '#ffffff' },
            propsForBackgroundLines: { strokeDasharray: '4', stroke: '#E5E7EB', strokeWidth: 1 },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <TouchableOpacity 
        style={styles.trainerBanner}
        onPress={() => navigation.navigate('トレーナー')}
      >
        <View style={styles.trainerIconContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.trainerTextContainer}>
          <Text style={styles.trainerTitle}>AIトレーナーに相談する</Text>
          <Text style={styles.trainerSubTitle}>食事・運動プランを提案します</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, paddingTop: 10 },
  dateText: { fontSize: 14, color: theme.colors.textLight, marginBottom: 4 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  statusBanner: { flexDirection: 'row', backgroundColor: theme.colors.primaryLight, padding: 12, marginHorizontal: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  statusText: { color: theme.colors.primaryDark, fontWeight: 'bold', marginLeft: 8 },
  row: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', marginBottom: 16 },
  cardHalf: { flex: 0.48, backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  unit: { fontSize: 14, fontWeight: 'normal', color: theme.colors.textLight },
  card: { backgroundColor: theme.colors.card, padding: 16, marginHorizontal: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { flexDirection: 'row', alignItems: 'center' },
  progressLabel: { fontSize: 14, color: theme.colors.textLight, marginLeft: 6 },
  remainingText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  progressBarContainer: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressSubText: { fontSize: 12, color: '#999' },
  trainerBanner: { flexDirection: 'row', backgroundColor: theme.colors.card, padding: 16, marginHorizontal: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  trainerIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trainerTextContainer: { flex: 1 },
  trainerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  trainerSubTitle: { fontSize: 12, color: theme.colors.textLight }
});
