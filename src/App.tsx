import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import { AuthProvider } from './contexts/AuthContext';
import RootNavigator from './navigators/rootNavigator';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {

  // I think wrap in auth provider and then use isAuth to 
  // either show Onboarding or the dashboard (mainTabs)
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

export default App;