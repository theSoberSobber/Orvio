import React, { useEffect, useState } from 'react';
import { NativeModules } from "react-native";
import {
  SafeAreaView,
  Text,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';

// Define colors for dark and light modes
const Colors = {
  dark: '#121212',
  light: '#ffffff',
  textDark: '#ffffff',
  textLight: '#000000',
  buttonDark: '#333333',
  buttonLight: '#dddddd',
};

const { SmsModule } = NativeModules;

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.dark : Colors.light,
  };

  const textStyle = {
    color: isDarkMode ? Colors.textDark : Colors.textLight,
  };

  const buttonStyle = {
    backgroundColor: isDarkMode ? Colors.buttonDark : Colors.buttonLight,
  };

  // Request SEND_SMS permission
  const requestSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to send SMS messages.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const sendSMS = async() => {
    await SmsModule.sendSms("+912343454565", "This is a test message...");
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <Text style={[styles.text, textStyle]}>Meow</Text>

      <TouchableOpacity style={[styles.button, buttonStyle]} onPress={requestSMSPermission}>
        <Text style={[styles.text, textStyle]}>Request SMS Permission</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, buttonStyle]} onPress={sendSMS}>
        <Text style={[styles.text, textStyle]}>Send SMS</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default App;