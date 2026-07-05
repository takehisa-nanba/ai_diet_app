import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function WeightRecordScreen() {
  const { weightRecords, addWeightRecord, deleteWeightRecord } = useContext(AppContext);
  const [newWeight, setNewWeight] = useState('');

  const handleRecord = () => {
    if (newWeight && !isNaN(newWeight)) {
      addWeightRecord(newWeight);
      setNewWeight('');
    }
  };

  // モック用の直近30件データ
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

  const latestWeight = weightRecords.length > 0 ? weightRecords[0].weight : '--';
  const prevWeight = weightRecords.length > 1 ? weightRecords[1].weight : latestWeight;
  const diff = latestWeight !== '--' && prevWeight !== '--' ? (latestWeight - prevWeight).toFixed(1) : 0;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>体重記録</Text>
          <Text style={styles.headerSubtitle}>毎日の体重を記録しましょう</Text>
        </View>
        <View style={styles.recordInputContainer}>
          <TextInput
            style={styles.recordInput}
            value={newWeight}
            onChangeText={setNewWeight}
            placeholder="0.0"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.recordButton} onPress={handleRecord}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.recordButtonText}>記録する</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>最新の体重</Text>
          <Text style={styles.cardValue}>{latestWeight} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>前回比</Text>
          <Text style={[styles.cardValue, { color: diff <= 0 ? '#2E8B57' : '#E53935' }]}>
            {diff > 0 ? '+' : ''}{diff} <Text style={[styles.unit, { color: diff <= 0 ? '#2E8B57' : '#E53935' }]}>kg</Text>
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>推移グラフ（直近30件）</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
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

      <Text style={styles.sectionTitle}>記録一覧</Text>
      <View style={styles.listContainer}>
        {weightRecords.map((record) => {
          const date = new Date(record.date);
          const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          
          return (
            <View key={record.id} style={styles.listItem}>
              <View>
                <Text style={styles.listWeight}>{record.weight.toFixed(1)} kg</Text>
                <Text style={styles.listDate}>{dateStr}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteWeightRecord(record.id)}>
                <Ionicons name="trash-outline" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          );
        })}
        {weightRecords.length === 0 && (
          <Text style={styles.emptyText}>記録がありません</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  recordInputContainer: { flexDirection: 'row', alignItems: 'center' },
  recordInput: { backgroundColor: '#fff', borderRadius: 8, padding: 8, width: 60, textAlign: 'center', borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8, fontSize: 16 },
  recordButton: { flexDirection: 'row', backgroundColor: '#2E8B57', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  recordButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  row: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', marginBottom: 16 },
  cardHalf: { flex: 0.48, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  unit: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  card: { backgroundColor: '#fff', padding: 20, marginHorizontal: 16, borderRadius: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginBottom: 12 },
  listContainer: { paddingHorizontal: 16 },
  listItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  listWeight: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  listDate: { fontSize: 12, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});
