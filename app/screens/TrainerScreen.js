import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/chat' : 'http://localhost:8000/chat';

export default function TrainerScreen() {
  const { profile, messages, addMessage } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = { id: Date.now().toString(), text: inputText, sender: 'user', date: new Date().toISOString() };
    await addMessage(newUserMessage);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newUserMessage.text,
          profile: profile
        }),
      });
      const data = await response.json();
      
      const newAiMessage = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'ai', date: new Date().toISOString() };
      await addMessage(newAiMessage);
    } catch (error) {
      console.error(error);
      const errorMessage = { id: (Date.now() + 1).toString(), text: '通信エラー: AIサーバーに接続できませんでした。', sender: 'ai', date: new Date().toISOString() };
      await addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.sender === 'ai' && <Ionicons name="logo-android" size={16} color="#2E8B57" style={{ marginBottom: 4 }} />}
      <Text style={[styles.messageText, item.sender === 'ai' && styles.aiMessageText]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 統合プランバナー */}
      <View style={styles.planBanner}>
        <View style={styles.planBannerLeft}>
          <Ionicons name="clipboard-outline" size={24} color="#2E8B57" />
          <View style={styles.planBannerText}>
            <Text style={styles.planTitle}>AIダイエットプラン</Text>
            <Text style={styles.planSubtitle}>1日の目標: 1800kcal</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.planButton}>
          <Text style={styles.planButtonText}>詳細</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
        inverted={false} // 古い順に表示（新しいのが下）
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>AIが入力中...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="AIコーチに相談する..."
          placeholderTextColor="#999"
          multiline={true}
          onKeyPress={(e) => {
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <TouchableOpacity style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!inputText.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  planBanner: { flexDirection: 'row', backgroundColor: '#e8f5e9', padding: 16, margin: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#c8e6c9' },
  planBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  planBannerText: { marginLeft: 12 },
  planTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E8B57' },
  planSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  planButton: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#2E8B57' },
  planButtonText: { color: '#2E8B57', fontSize: 12, fontWeight: 'bold' },
  
  chatList: { paddingHorizontal: 16, paddingBottom: 16 },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 16 },
  userBubble: { backgroundColor: '#2E8B57', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  messageText: { fontSize: 15, color: '#fff', lineHeight: 22 },
  aiMessageText: { color: '#333' },
  
  typingIndicator: { paddingHorizontal: 20, paddingBottom: 10 },
  typingText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 20, marginRight: 10, fontSize: 15, maxHeight: 100, color: '#333' },
  sendButton: { backgroundColor: '#2E8B57', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: '#a5d6a7' },
});
