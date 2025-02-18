import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
  Permission,
  StyleSheet,
  useColorScheme,
  ToastAndroid,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useDeviceHash } from '../../hooks/getDeviceHash';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import { handleFcmMessage } from '../../utils/fcmMessages/fcmMessageHandler';

import ApiKeysScreen from "./ApiKeysTab";

const Icon = MaterialIcons;

const PERMISSION_ITEMS = [
  {
    id: 'SEND_SMS',
    label: 'Enable SMS Permission',
    permission: PermissionsAndroid.PERMISSIONS.SEND_SMS,
  },
];

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const checkPermissions = async () => {
      const results = await Promise.all(
        PERMISSION_ITEMS.map(async (item) => {
          const granted = await PermissionsAndroid.check(item.permission);
          return granted ? item.id : null;
        })
      );

      setGrantedPermissions(results.filter((id) => id !== null) as string[]);
    };

    checkPermissions();
  }, []);

  const requestPermission = async (id: string, permission: Permission) => {
    try {
      const result = await PermissionsAndroid.request(permission);
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setGrantedPermissions((prev) => [...prev, id]);
      } else {
        Alert.alert('Permission Denied', 'You need to allow this permission for full functionality.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while requesting permission.');
    }
  };

  const remainingPermissions = PERMISSION_ITEMS.filter(p => !grantedPermissions.includes(p.id));

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {remainingPermissions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Permissions</Text>
          <FlatList
            data={remainingPermissions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, isDarkMode && styles.darkCard]}
                onPress={() => requestPermission(item.id, item.permission)}
              >
                <Text style={[styles.cardText, isDarkMode && styles.darkText]}>{item.label}</Text>
                <Icon name="chevron-right" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Stats</Text>
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardText, isDarkMode && styles.darkText]}>Placeholder for stats section.</Text>
        </View>
      </View>
    </View>
  );
};



const Tab = createBottomTabNavigator();

const MainTabsDashboard = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const { api } = useAuth();
    const deviceHash = useDeviceHash();
  
    useEffect(() => {
      const registerDevice = async () => {
        if(deviceHash){
          try {
            Toast.show({
              type: 'info',
              text1: 'Registering device...',
              position: 'top',
            });
    
            const fcmToken = await messaging().getToken();

            const res = await api.post('/auth/register', {
              deviceHash,
              fcmToken,
            });
    
            Toast.show({
              type: 'success',
              text1: 'Device registered!',
              position: 'top',
              autoHide: true,
              visibilityTime: 2000,
            });
          } catch (error) {
            console.error('Failed to register device:', error);
            Toast.show({
              type: 'error',
              text1: 'Registration failed',
              text2: 'Please try again later',
              position: 'top',
            });
          }
        }
      };

      registerDevice();
  
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Received FCM Foreground message:', remoteMessage);
        await handleFcmMessage(remoteMessage, api);
      });
  
      return () => unsubscribe();
    }, [api, deviceHash]);
  
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'API Keys') {
              iconName = 'key';
            }
            return <Icon name={iconName! as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#000' : '#fff',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="API Keys" component={ApiKeysScreen} />
      </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
    },
    darkContainer: {
      backgroundColor: '#000',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 16,
    },
    darkText: {
      color: '#fff',
    },
    card: {
      backgroundColor: '#f5f5f5',
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    darkCard: {
      backgroundColor: '#222',
    },
    cardText: {
      fontSize: 16,
      color: '#000',
    },
    button: {
      backgroundColor: '#007bff',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
});  
  
export default MainTabsDashboard;  