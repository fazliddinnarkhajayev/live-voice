/**
 * Live Voice – Offline Map of Tashkent with GPS Tracking
 *
 * This module provides:
 * - Offline map rendering for Tashkent, Uzbekistan
 * - Real-time GPS tracking that functions without internet connectivity
 * - MBTiles-based tile serving for fully offline operation
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import OfflineMapScreen from './src/screens/OfflineMapScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="OfflineMap"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="OfflineMap" component={OfflineMapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
