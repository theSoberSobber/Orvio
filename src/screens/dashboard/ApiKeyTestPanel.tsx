import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { createAuthAxios } from '../../utils/apiLogicFactory'; // Adjust the import path
import Toast from 'react-native-toast-message';

const ApiKeyTestPanel = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    tid?: string;
    timestamp: string;
  } | null>(null);

  const testApiKey = async () => {
    if (!apiKey.trim() || !recipient.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please enter both API key and recipient',
        position: 'bottom',
      });
      return;
    }

    setIsLoading(true);
    try {
        console.log(apiKey);
      const testApi = createAuthAxios({
        accessToken: '',
        refreshToken: apiKey,
      });

      const response = await testApi.post('/service/sendOtp', {
        phoneNumber: recipient,
      });

      setLastTestResult({
        success: true,
        tid: response.data.tid,
        timestamp: new Date().toLocaleTimeString(),
      });

      Toast.show({
        type: 'success',
        text1: 'OTP sent successfully',
        text2: `TID: ${response.data.tid}`,
        position: 'bottom',
      });
    } catch (error: any) {
      setLastTestResult({
        success: false,
        timestamp: new Date().toLocaleTimeString(),
      });

      Toast.show({
        type: 'error',
        // text1: 'Failed to send OTP',
        text2: error.response?.data?.message || 'Unknown error occurred',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
        ✨ Test API Key ✨
        </Text>
        <MaterialIcons 
          name={isExpanded ? 'expand-less' : 'expand-more'} 
          size={24} 
          color={isDarkMode ? '#fff' : '#000'} 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput,
            ]}
            placeholder="Enter API Key"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={apiKey}
            onChangeText={setApiKey}
          />
          
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput
            ]}
            placeholder="Enter recipient"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={recipient}
            onChangeText={setRecipient}
            keyboardType="phone-pad"
          />
          
          <TouchableOpacity
            style={[
              styles.testButton,
              isLoading && styles.testButtonDisabled
            ]}
            onPress={testApiKey}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.testButtonText}>Test Key</Text>
            )}
          </TouchableOpacity>

          {lastTestResult && (
            <View style={[
              styles.resultContainer,
              lastTestResult.success ? styles.successResult : styles.errorResult
            ]}>
              <Text style={[styles.resultText, isDarkMode && styles.darkText]}>
                Last test at {lastTestResult.timestamp}:
                {lastTestResult.success ? (
                  <>
                    {'\n'}TID: {lastTestResult.tid}
                  </>
                ) : (
                  '\nFailed to send OTP'
                )}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
  },
  darkContainer: {
    backgroundColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#000',
    height: 45, // Fixed height for consistency
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: '#fff',
  },
  testButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonDisabled: {
    opacity: 0.7,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
  },
  successResult: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  errorResult: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  resultText: {
    color: '#000',
  },
});

export default ApiKeyTestPanel;