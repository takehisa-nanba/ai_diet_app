import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './context/AppContext';

import DashboardScreen from './screens/DashboardScreen';
import WeightRecordScreen from './screens/WeightRecordScreen';
import TrainerScreen from './screens/TrainerScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'ダッシュボード') {
                  iconName = focused ? 'apps' : 'apps-outline';
                } else if (route.name === '体重記録') {
                  iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                } else if (route.name === 'トレーナー') {
                  iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                } else if (route.name === 'プロフィール') {
                  iconName = focused ? 'person' : 'person-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#2E8B57', // モックアップの緑色
              tabBarInactiveTintColor: 'gray',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#333', fontWeight: 'bold' },
              headerTitleAlign: 'left',
              headerShadowVisible: false,
            })}
          >
            <Tab.Screen name="ダッシュボード" component={DashboardScreen} options={{ headerTitle: '💪 FitTracker' }} />
            <Tab.Screen name="体重記録" component={WeightRecordScreen} options={{ headerTitle: '💪 FitTracker' }} />
            <Tab.Screen name="トレーナー" component={TrainerScreen} options={{ headerTitle: '💪 FitTracker' }} />
            <Tab.Screen name="プロフィール" component={ProfileScreen} options={{ headerTitle: '💪 FitTracker' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
