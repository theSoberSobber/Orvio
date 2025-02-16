import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PlaceholderScreen from '../screens/placeholder/PlaceholderScreen';
import React from 'react';

export type RootStackParamList = {
    PlaceholderMainDashboard: undefined;
    Onboarding: undefined;
    Login: undefined;
    PlaceholderOtpScreen: { tid: string; phone: string }; // Define expected params
};

const RootNavigator = () => {
    const Stack = createNativeStackNavigator();
    const { isLoading, isLoggedIn } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <Stack.Screen 
                        name="PlaceholderMainDashboard" 
                        component={PlaceholderScreen} 
                        initialParams={{ placeHolderFor: 'Main Dashboard' }}
                    />
                ) : (
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen 
                            name="PlaceholderOtpScreen" 
                            component={PlaceholderScreen} 
                            initialParams={{ placeHolderFor: 'OTP Screen' }}
                        />
                    </>
                    
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;