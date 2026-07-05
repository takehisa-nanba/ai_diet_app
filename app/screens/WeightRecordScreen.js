import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { theme } from '../theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

export default function WeightRecordScreen() {
  const { weightRecords, addWeightRecord, deleteWeightRecord } = useContext(AppContext);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newMemo, setNewMemo] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleOpenAdd = () => {
    setDate(new Date());
    setNewWeight('');
    setNewMemo('');
    setIsAdding(true);
  };

  const handleRecord = () => {
    if (newWeight && !isNaN(newWeight)) {
      addWeightRecord(newWeight, date.toISOString(), newMemo);
      setIsAdding(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const current = new Date(date);
      current.setFullYear(selectedDate.getFullYear());
      current.setMonth(selectedDate.getMonth());
      current.setDate(selectedDate.getDate());
      setDate(current);
    }
  };

  const onChangeTime = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const current = new Date(date);
      current.setHours(selectedDate.getHours());
      current.setMinutes(selectedDate.getMinutes());
      setDate(current);
    }
  };

  const recentRecords = [...weightRecords].slice(0, 30).reverse();
  const labels = recentRecords.length > 0 ? recentRecords.map(r => {
    const d = new Date(r.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }) : ['今日'];
  const data = recentRecords.length > 0 ? recentRecords.map(r => r.weight) : [0];

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

  const latestWeight = weightRecords.length > 0 ? weightRecords[0].weight : '--';
  const prevWeight = weightRecords.length > 1 ? weightRecords[1].weight : latestWeight;
  const diff = latestWeight !== '--' && prevWeight !== '--' ? (latestWeight - prevWeight).toFixed(1) : 0;
  
  const formatDateStr = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const formatTimeStr = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>体重記録</Text>
          <Text style={styles.headerSubtitle}>毎日の体重を記録しましょう</Text>
        </View>
        {!isAdding && (
          <TouchableOpacity style={styles.recordButton} onPress={handleOpenAdd}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.recordButtonText}>記録する</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdding && (
        <View style={styles.addCard}>
          <View style={styles.addRow}>
            <View style={styles.addInputGroup}>
              <Text style={styles.addLabel}>体重 (kg) *</Text>
              <TextInput
                style={styles.addInput}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="例: 70.5"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.addInputGroup}>
              <Text style={styles.addLabel}>日付</Text>
              {Platform.OS === 'web' ? (
                <View style={styles.addInputWithIcon}>
                  {React.createElement('input', {
                    type: 'date',
                    value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                    onChange: (e) => {
                      const selectedDate = new Date(e.target.value);
                      if (!isNaN(selectedDate.getTime())) {
                        const current = new Date(date);
                        current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                        setDate(current);
                      }
                    },
                    style: { flex: 1, padding: 12, fontSize: 16, border: 'none', outline: 'none', backgroundColor: 'transparent', color: theme.colors.text }
                  })}
                </View>
              ) : (
                <TouchableOpacity style={styles.addInputWithIcon} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.addInputFlexText}>{formatDateStr(date)}</Text>
                  <Ionicons name="chevron-down" size={16} color="#999" style={styles.chevron} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.addInputGroupFull}>
            <Text style={styles.addLabel}>時刻</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.addInputWithIcon}>
                {React.createElement('input', {
                  type: 'time',
                  value: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
                  onChange: (e) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const current = new Date(date);
                      current.setHours(parseInt(hours, 10));
                      current.setMinutes(parseInt(minutes, 10));
                      setDate(current);
                    }
                  },
                  style: { flex: 1, padding: 12, fontSize: 16, border: 'none', outline: 'none', backgroundColor: 'transparent', color: theme.colors.text }
                })}
              </View>
            ) : (
              <TouchableOpacity style={styles.addInputWithIcon} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.addInputFlexText}>{formatTimeStr(date)}</Text>
                <Ionicons name="chevron-down" size={16} color="#999" style={styles.chevron} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.addInputGroupFull}>
            <Text style={styles.addLabel}>メモ (任意)</Text>
            <TextInput
              style={styles.addInput}
              value={newMemo}
              onChangeText={setNewMemo}
              placeholder="例: 今日は運動した"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <View style={styles.addButtonRow}>
            <TouchableOpacity style={styles.submitButton} onPress={handleRecord}>
              <Text style={styles.submitButtonText}>追加</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAdding(false)}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* DatePicker & TimePicker Modals (Native only) */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      {showTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      )}

      <View style={styles.row}>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>最新の体重</Text>
          <Text style={styles.cardValue}>{latestWeight} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.cardHalf}>
          <Text style={styles.cardLabel}>前回比</Text>
          <Text style={[styles.cardValue, { color: diff <= 0 ? theme.colors.primary : theme.colors.danger }]}>
            {diff > 0 ? '+' : ''}{diff} <Text style={[styles.unit, { color: diff <= 0 ? theme.colors.primary : theme.colors.danger }]}>kg</Text>
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>推移グラフ（直近30件）</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
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

      <Text style={styles.sectionTitle}>記録一覧</Text>
      <View style={styles.listContainer}>
        {weightRecords.map((record) => {
          const d = new Date(record.date);
          const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          
          return (
            <View key={record.id} style={styles.listItem}>
              <View>
                <Text style={styles.listWeight}>{record.weight.toFixed(1)} kg</Text>
                <Text style={styles.listDate}>{dateStr}</Text>
                {record.memo ? <Text style={styles.listMemo}>{record.memo}</Text> : null}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  headerSubtitle: { fontSize: 14, color: theme.colors.textLight, marginTop: 4 },
  
  recordButton: { flexDirection: 'row', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  recordButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  
  addCard: { backgroundColor: theme.colors.primaryLight, padding: 16, marginHorizontal: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#A7F3D0' },
  addRow: { flexDirection: 'row', justifyContent: 'space-between' },
  addInputGroup: { flex: 0.48, marginBottom: 16 },
  addInputGroupFull: { marginBottom: 16 },
  addLabel: { fontSize: 12, color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' },
  addInput: { backgroundColor: theme.colors.card, borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: theme.colors.border },
  addInputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
  addInputFlexText: { flex: 1, padding: 12, fontSize: 16, color: theme.colors.text },
  chevron: { paddingRight: 12 },
  addButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  submitButton: { flex: 0.65, backgroundColor: '#6EE7B7', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { flex: 0.32, backgroundColor: theme.colors.card, paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  
  row: { flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', marginBottom: 16 },
  cardHalf: { flex: 0.48, backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  unit: { fontSize: 14, fontWeight: 'normal', color: theme.colors.textLight },
  card: { backgroundColor: theme.colors.card, padding: 20, marginHorizontal: 16, borderRadius: 12, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginHorizontal: 20, marginBottom: 12 },
  listContainer: { paddingHorizontal: 16 },
  listItem: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  listWeight: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  listDate: { fontSize: 12, color: theme.colors.textLight },
  listMemo: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});
