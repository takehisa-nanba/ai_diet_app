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
    activityLevel: '普通',
  });
  const [weightRecords, setWeightRecords] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) setProfile(JSON.parse(storedProfile));

        const storedRecords = await AsyncStorage.getItem('weightRecords');
        if (storedRecords) setWeightRecords(JSON.parse(storedRecords));
        
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
  };

  const addWeightRecord = async (weight) => {
    const newRecord = {
      id: Date.now().toString(),
      weight: parseFloat(weight),
      date: new Date().toISOString()
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
