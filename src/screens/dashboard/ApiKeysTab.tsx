import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Clipboard,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import ApiKeyTestPanel from './ApiKeyTestPanel';

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  session: {
    id: string;
    refreshToken: string;
  };
}

interface CreateApiKeyDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

const CreateApiKeyDialog = ({ visible, onClose, onSubmit, isLoading }: CreateApiKeyDialogProps) => {
  const [name, setName] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          isDarkMode && styles.darkModalContent
        ]}>
          <Text style={[
            styles.modalTitle,
            isDarkMode && styles.darkText
          ]}>
            Create New API Key
          </Text>
          
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.darkInput
            ]}
            placeholder="Enter API key name"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setName('');
                onClose();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                isLoading && styles.createButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !name.trim()}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ApiKeyItem = ({ item, onRevoke }: { item: ApiKey; onRevoke: (key: string) => void }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setString(item.session.refreshToken);
    Toast.show({
      type: 'success',
      text1: 'API key copied to clipboard',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <TouchableOpacity 
        style={styles.keyHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.keyInfo}>
          <Text style={[styles.keyName, isDarkMode && styles.darkText]}>{item.name}</Text>
          <Text style={[styles.keyDate, isDarkMode && styles.darkSubText]}>
            Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <MaterialIcons 
          name={isExpanded ? 'expand-less' : 'expand-more'} 
          size={24} 
          color={isDarkMode ? '#fff' : '#000'} 
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={[styles.apiKeyText, isDarkMode && styles.darkSubText]} numberOfLines={1}>
            {item.session.refreshToken.substring(0, 32)}...
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.iconButton, !isDarkMode && styles.darkIconButton]} onPress={copyToClipboard}>
              <MaterialIcons name="content-copy" size={20} color={'#000'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.revokeButton]}
              onPress={() => onRevoke(item.session.refreshToken)}
            >
              <MaterialIcons name="delete" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const ApiKeysScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { api } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/auth/apiKey/getAll');
      setApiKeys(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch API keys',
        text2: 'Please try again later',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const createNewApiKey = async (name: string) => {
    setCreating(true);
    try {
      const response = await api.post('/auth/apiKey/createNew', { name });
      const newKey = response.data;
      
      // Copy the new key to clipboard
      await Clipboard.setString(newKey);
      
      Toast.show({
        type: 'success',
        text1: 'API key created and copied to clipboard',
        position: 'bottom',
      });
      
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to create API key',
        position: 'bottom',
      });
    } finally {
      setCreating(false);
      setIsDialogVisible(false);
    }
  };

  const revokeApiKey = async (apiKey: string) => {
    try {
      await api.post('/auth/apiKey/revoke', { apiKey });
      Toast.show({
        type: 'success',
        text1: 'API key revoked successfully',
        position: 'bottom',
      });
      fetchApiKeys(); // Refresh the list
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to revoke API key',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>API Keys</Text>
        <TouchableOpacity 
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={() => setIsDialogVisible(true)}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialIcons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Make it look better and make it work ... */}
      <ApiKeyTestPanel />  

      {loading ? (
        <ActivityIndicator style={styles.loader} color={isDarkMode ? '#fff' : '#000'} />
      ) : (
        <FlatList
          data={apiKeys}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ApiKeyItem item={item} onRevoke={revokeApiKey} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <CreateApiKeyDialog
        visible={isDialogVisible}
        onClose={() => setIsDialogVisible(false)}
        onSubmit={createNewApiKey}
        isLoading={creating}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#aaa',
  },
  createButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  loader: {
    marginTop: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  darkCard: {
    backgroundColor: '#222',
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  keyInfo: {
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  keyDate: {
    fontSize: 14,
    color: '#666',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  apiKeyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  darkIconButton: {
    backgroundColor: '#eeefef',
  },
  revokeButton: {
    backgroundColor: '#fff0f0',
  },
  // New styles for the modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }
    })
  },
  darkModalContent: {
    backgroundColor: '#222'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: '#fff'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default ApiKeysScreen;