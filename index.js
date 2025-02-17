/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import { handleFcmMessage } from './src/utils/fcmMessages/fcmMessageHandler';

// can read from async storage here and on the basis of that
// make the api instance and use it for background processing!
// :))
//
// Something like this :))
//
// TODO: abstract background services api factory by giving standard functions to them since they are all using the same ones anyways
//

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Received background message:', remoteMessage);
  
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
  
      const api = createAuthAxios({
        accessToken: accessToken || '',
        refreshToken: refreshToken,
        setAccessToken: async (newToken) => {
          await AsyncStorage.setItem('accessToken', newToken);
        },
        signOut: async () => {
            const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

            if (storedRefreshToken) {
              await AsyncStorage.removeItem('accessToken');
              await AsyncStorage.removeItem('refreshToken');
              await messaging().deleteToken();
              console.log('Sign-out completed: Tokens cleared and messaging token deleted.');
            } else {
              console.log('Sign-out skipped: Refresh token was already cleared.');
            }
        },
      });

      // handle background message here and use api to make authenticatede calls
      //   const response = await api.get('/service/ack');
      //   console.log('Background API response:', response.data);


      await handleFcmMessage(remoteMessage, api);
  
    } catch (error) {
      console.error('Error handling background message:', error);
    }
});

messaging().onTokenRefresh(async (newFcmToken) => {
    console.log('FCM Token refreshed:', newFcmToken);
  
    try {
    // TODO: make a device hash factory util and make the hook use that so that we can stay in sync with that logic instead of making our own here
      const deviceHash = await generateDeviceHash();
  
      if (!deviceHash) {
        console.warn('Device hash generation failed. Skipping registration.');
        return;
      }
  
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const accessToken = await AsyncStorage.getItem('accessToken');
  
      const api = createAuthAxios({
        accessToken: accessToken || '',
        refreshToken: refreshToken,
        setAccessToken: async (newToken) => {
          await AsyncStorage.setItem('accessToken', newToken);
        },
        signOut: async () => {
          const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
  
          if (storedRefreshToken) {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await messaging().deleteToken();
            console.log('Sign-out completed: Tokens cleared and messaging token deleted.');
          } else {
            console.log('Sign-out skipped: Refresh token was already cleared.');
          }
        },
      });
  
      await api.post('/auth/register', {
        deviceHash,
        fcmToken: newFcmToken,
      });
  
    } catch (error) {
      console.error('Failed to register device on token refresh:', error);
    }
  });
  
  
// in signout pass from here, pass a function that checks if already signed out (through tokens)
// otherwise it creates a cyclic loop with the delete and on token refresh listener

AppRegistry.registerComponent(appName, () => App);