import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/chat' : 'http://localhost:8000/chat';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // ユーザーのプロフィールと目標設定
  const [profile, setProfile] = useState({
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    targetDate: '',
    activityLevel: '普通', // 低い、普通、高い
  });
  
  const [showSettings, setShowSettings] = useState(false);

  // 初期化時にローカルストレージからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('chatHistory');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        } else {
          setMessages([{ id: '1', text: 'こんにちは！見習いAIコーチです。「ムリなく痩せる」を目標に一緒に頑張りましょう！まずは右上の設定からプロフィールを入力してください。', sender: 'ai' }]);
        }
        
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error('データの読み込みに失敗しました', e);
      }
    };
    loadData();
  }, []);

  // チャットメッセージを保存する関数
  const saveMessages = async (newMessages) => {
    setMessages(newMessages);
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(newMessages));
    } catch (e) {
      console.error('メッセージの保存に失敗しました', e);
    }
  };

  // プロフィールを保存する関数
  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setShowSettings(false);
    } catch (e) {
      console.error('プロフィールの保存に失敗しました', e);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    const newMessages = [...messages, newUserMessage];
    saveMessages(newMessages);
    setInputText('');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newUserMessage.text,
          profile: profile  // AIに文脈としてプロフィールを送信
        }),
      });
      const data = await response.json();
      
      const newAiMessage = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'ai' };
      saveMessages([...newMessages, newAiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: 'エラー: AIサーバーに接続できませんでした。', sender: 'ai' };
      saveMessages([...newMessages, errorMessage]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI ダイエットコーチ</Text>
            <Text style={styles.headerSubtitle}>ランク: 見習い 🌱</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsButtonText}>⚙️ 設定</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="メッセージを入力... (Shift+Enterで改行)"
            placeholderTextColor="#999"
            multiline={true}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* プロフィール設定モーダル */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>目標＆プロフィール設定</Text>
              
              <Text style={styles.label}>年齢 (歳)</Text>
              <TextInput style={styles.modalInput} value={profile.age} onChangeText={(t) => setProfile({...profile, age: t})} keyboardType="numeric" placeholder="例: 30" />
              
              <Text style={styles.label}>身長 (cm)</Text>
              <TextInput style={styles.modalInput} value={profile.height} onChangeText={(t) => setProfile({...profile, height: t})} keyboardType="numeric" placeholder="例: 170" />
              
              <Text style={styles.label}>現在の体重 (kg)</Text>
              <TextInput style={styles.modalInput} value={profile.weight} onChangeText={(t) => setProfile({...profile, weight: t})} keyboardType="numeric" placeholder="例: 105" />
              
              <Text style={styles.label}>目標体重 (kg)</Text>
              <TextInput style={styles.modalInput} value={profile.targetWeight} onChangeText={(t) => setProfile({...profile, targetWeight: t})} keyboardType="numeric" placeholder="例: 90" />
              
              <Text style={styles.label}>目標達成期日</Text>
              <TextInput style={styles.modalInput} value={profile.targetDate} onChangeText={(t) => setProfile({...profile, targetDate: t})} placeholder="例: 2024年12月まで" />
              
              <Text style={styles.label}>日々の活動レベル（運動や肉体労働の多さ）</Text>
              <View style={styles.activityContainer}>
                {['低い', '普通', '高い'].map(level => (
                  <TouchableOpacity 
                    key={level} 
                    style={[styles.activityButton, profile.activityLevel === level && styles.activityButtonActive]}
                    onPress={() => setProfile({...profile, activityLevel: level})}
                  >
                    <Text style={[styles.activityText, profile.activityLevel === level && styles.activityTextActive]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>保存して閉じる</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  keyboardView: { flex: 1 },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#4CAF50', marginTop: 4 },
  settingsButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  settingsButtonText: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  chatList: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  messageText: { fontSize: 16, color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, fontSize: 16, maxHeight: 120 },
  sendButton: { backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // モーダル用スタイル
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 16, fontWeight: 'bold' },
  modalInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  activityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  activityButton: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  activityButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  activityText: { color: '#555', fontWeight: 'bold' },
  activityTextActive: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32, marginBottom: 20 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
