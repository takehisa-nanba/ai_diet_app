import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    targetDate: '',
    activityLevel: '座り仕事メイン',
    reminderEnabled: false,
    reminderTime: '20:00', // デフォルト20:00
  });
  const [weightRecords, setWeightRecords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const p = JSON.parse(storedProfile);
          // 既存データに新しいフィールドがない場合のフォールバック
          if (!p.reminderTime) p.reminderTime = '20:00';
          if (!p.activityLevel || p.activityLevel === '普通') p.activityLevel = '座り仕事メイン';
          setProfile(p);
        }

        const storedRecords = await AsyncStorage.getItem('weightRecords');
        
        // ご指定のデータを初期データとしてセット
        const initialMockData = [
          { id: '1', date: '2026-07-05T10:25:00.000Z', weight: 102.4 },
          { id: '2', date: '2026-07-04T20:12:00.000Z', weight: 104.8 },
          { id: '3', date: '2026-07-04T08:55:00.000Z', weight: 102.6 },
          { id: '4', date: '2026-07-03T19:36:00.000Z', weight: 104.6 },
          { id: '5', date: '2026-07-03T06:30:00.000Z', weight: 104.5 },
          { id: '6', date: '2026-07-02T07:00:00.000Z', weight: 104.0 },
          { id: '7', date: '2026-07-01T07:00:00.000Z', weight: 105.4 },
        ];

        let parsedRecords = storedRecords ? JSON.parse(storedRecords) : [];
        // まだデータがない場合、またはデモ用に強制的にデータを上書き
        if (parsedRecords.length < 7) {
          parsedRecords = initialMockData;
          await AsyncStorage.setItem('weightRecords', JSON.stringify(parsedRecords));
        }
        setWeightRecords(parsedRecords);
        
        const storedMessages = await AsyncStorage.getItem('chatHistory');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        } else {
          setMessages([{ 
            id: '1', 
            text: 'こんにちは！見習いAIコーチです。「ムリなく痩せる」を目標に一緒に頑張りましょう！まずは右下のタブからプロフィールを入力してください。', 
            sender: 'ai',
            date: new Date().toISOString()
          }]);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveProfile = async (newProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    
    // リマインダーのスケジュール設定
    if (newProfile.reminderEnabled && newProfile.reminderTime) {
      const [hour, minute] = newProfile.reminderTime.split(':').map(Number);
      if (!isNaN(hour) && !isNaN(minute)) {
        const { registerForPushNotificationsAsync, scheduleDailyReminder } = require('../utils/notifications');
        const hasPermission = await registerForPushNotificationsAsync();
        if (hasPermission) {
          await scheduleDailyReminder(hour, minute);
        }
      }
    } else {
      const { cancelAllReminders } = require('../utils/notifications');
      await cancelAllReminders();
    }
  };

  const addWeightRecord = async (weight, customDate, memo) => {
    const newRecord = {
      id: Date.now().toString(),
      weight: parseFloat(weight),
      date: customDate || new Date().toISOString(),
      memo: memo || ''
    };
    const newRecords = [newRecord, ...weightRecords];
    setWeightRecords(newRecords);
    await AsyncStorage.setItem('weightRecords', JSON.stringify(newRecords));
    
    // プロフィールの体重も更新する
    saveProfile({ ...profile, weight: weight.toString() });
  };
  
  const deleteWeightRecord = async (id) => {
    const newRecords = weightRecords.filter(r => r.id !== id);
    setWeightRecords(newRecords);
    await AsyncStorage.setItem('weightRecords', JSON.stringify(newRecords));
  };

  const addMessage = async (message) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    await AsyncStorage.setItem('chatHistory', JSON.stringify(newMessages));
  };

  return (
    <AppContext.Provider value={{
      profile, saveProfile,
      weightRecords, addWeightRecord, deleteWeightRecord,
      messages, addMessage,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};
