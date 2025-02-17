import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PlaceholderScreen from '../screens/placeholder/PlaceholderScreen';
import React from 'react';
import OtpScreen from '../screens/OtpScreen';
import MainTabsDashboard from '../screens/dashboard/MainTabsDashboard';

export type RootStackParamList = {
    MainTabsDashboard: undefined;
    Onboarding: undefined;
    Login: undefined;
    OTPScreen: { tid: string; phone: string }; // Define expected params
};

const RootNavigator = () => {
    const Stack = createNativeStackNavigator();
    // this isLoading for auth init tasks
    const { isLoading, isLoggedIn } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false}}>
                {isLoggedIn ? (
                    <Stack.Screen 
                        name="MainTabsDashboard" 
                        component={MainTabsDashboard} 
                    />
                ) : (
                    <>
                        {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen 
                            name="OTPScreen" 
                            component={OtpScreen}
                        />
                    </>
                    
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;