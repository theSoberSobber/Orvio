/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// can read from async storage here and on the basis of that
// make the api instance and use it for background processing!
// :))
//
// Something like this :))
//
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     console.log('Received background message:', remoteMessage);
  
//     try {
//       const refreshToken = await AsyncStorage.getItem('refreshToken');
//       const accessToken = await AsyncStorage.getItem('accessToken');
  
//       const api = createAuthAxios({
//         accessToken: accessToken || '',
//         refreshToken: refreshToken,
//         setAccessToken: async (newToken) => {
//           await AsyncStorage.setItem('accessToken', newToken);
//         },
//         signOut: async () => {
//           await AsyncStorage.removeItem('accessToken');
//           await AsyncStorage.removeItem('refreshToken');
//         },
//       });
  
//       // Example: Make an authenticated API call
//       const response = await api.get('/ack');
//       console.log('Background API response:', response.data);
  
//     } catch (error) {
//       console.error('Error handling background message:', error);
//     }
// });
  

AppRegistry.registerComponent(appName, () => App);