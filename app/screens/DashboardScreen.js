import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { profile, weightRecords } = useContext(AppContext);

  // 日付のフォーマット
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][today.getDay()]})`;

  // モック用の直近データ（データがない場合のフォールバック用）
  const chartData = {
    labels: ['7/1', '7/2', '7/3', '7/4', '7/5'],
    datasets: [
      {
        data: [105.4, 104.0, 104.6, 104.8, 102.4],
        color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  // 達成率計算
  const currentWeight = profile.weight ? parseFloat(profile.weight) : 0;
  const targetWeight = profile.targetWeight ? parseFloat(profile.targetWeight) : 0;
  const initialWeight = 110; // TODO: 初回登録時の体重を持たせる
  
  let progress = 0;
  let remaining = 0;
  if (currentWeight > 0 && targetWeight > 0) {
    remaining = (currentWeight - targetWeight).toFixed(1);
    progress = Math.max(0, Math.min(1, (initialWeight - currentWeight) / (initialWeight - targetWeight)));
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.greetingText}>おはようございます 👋</Text>
      </View>

      <View style={styles.statusBanner}>
        <Ionicons name="checkmark-circle" size={20} color="#2E8B57" />
        <Text style={styles.statusText}>今日の体重を記録済みです 🎉 素晴らしい！</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>現在の体重</Text>
          <Text style={styles.cardValue}>{currentWeight || '--'} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>目標体重</Text>
          <Text style={styles.cardValue}>{targetWeight || '--'} <Text style={styles.unit}>kg</Text></Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTitle}>
            <Ionicons name="bullseye" size={18} color="#666" />
            <Text style={styles.progressLabel}>目標まで</Text>
          </View>
          <Text style={styles.remainingText}>あと {remaining} kg</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        
        <View style={styles.progressFooter}>
          <Text style={styles.progressSubText}>{Math.round(progress * 100)}% 達成</Text>
          <Text style={styles.progressSubText}>残り -- 日</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>直近2週間の推移</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64} // padding
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#2E8B57' },
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
          <Ionicons name="chatbubble-ellipses" size={24} color="#2E8B57" />
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
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  header: { padding: 20, paddingTop: 10 },
  dateText: { fontSize: 14, color: '#666', marginBottom: 4 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statusBanner: { flexDirection: 'row', backgroundColor: '#e8f5e9', padding: 12, marginHorizontal: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  statusText: { color: '#2E8B57', fontWeight: 'bold', marginLeft: 8 },
  row: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', marginBottom: 16 },
  cardHalf: { flex: 0.48, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  unit: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  card: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { flexDirection: 'row', alignItems: 'center' },
  progressLabel: { fontSize: 14, color: '#666', marginLeft: 6 },
  remainingText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  progressBarContainer: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#2E8B57', borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressSubText: { fontSize: 12, color: '#999' },
  trainerBanner: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, marginHorizontal: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  trainerIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trainerTextContainer: { flex: 1 },
  trainerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  trainerSubTitle: { fontSize: 12, color: '#666' }
});
