import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Permission,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAuth } from '../../contexts/AuthContext';

const Icon = MaterialIcons;

// TODO ASAP: add actual stats to API Keys in the backend
// and display them here

// use kafka-cp on the backend to make a different stats service
// do event streaming

const PERMISSION_ITEMS = [
  {
    id: 'SEND_SMS',
    label: 'Enable SMS Permission',
    permission: PermissionsAndroid.PERMISSIONS.SEND_SMS,
  },
];

interface StatsData {
  provider: {
    currentDevice: null;
    allDevices: {
      failedToSendAck: number;
      sentAckNotVerified: number;
      sentAckVerified: number;
      totalMessagesSent: number;
      totalDevices: number;
      activeDevices: number;
    };
  };
  consumer: {
    aggregate: {
      totalKeys: number;
      activeKeys: number;
      oldestKey: number;
      newestKey: number;
      lastUsedKey: number;
    };
    keys: Array<{
      name: string;
      createdAt: string;
      lastUsed: string | null;
      refreshToken: string;
    }>;
  };
}

const StatCard = ({ title, value, icon, isDarkMode }: {title: any, value: any, icon: any, isDarkMode: any}) => (
  <View style={[styles.statCard, isDarkMode && styles.darkCard]}>
    <Icon name={icon} size={24} color={isDarkMode ? '#fff' : '#007bff'} />
    <Text style={[styles.statValue, isDarkMode && styles.darkText]}>{value}</Text>
    <Text style={[styles.statTitle, isDarkMode && styles.darkText]}>{title}</Text>
  </View>
);

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { api } = useAuth();
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await api.get('/auth/stats');
      setStats(response.data);
    } catch (error) {
      setStatsError('Unable to load stats. Please try again later.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [api]);

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
      }
    } catch (error) {
      // Silently handle permission request errors
    }
  };

  const remainingPermissions = PERMISSION_ITEMS.filter(p => !grantedPermissions.includes(p.id));

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {remainingPermissions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Permissions</Text>
          </View>
          <FlatList
            data={remainingPermissions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.permissionCard, isDarkMode && styles.darkCard]}
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
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Stats</Text>
        </View>
        
        {statsError && (
          <Text style={styles.errorText}>{statsError}</Text>
        )}

        {statsLoading ? (
          <ActivityIndicator style={styles.loader} color={isDarkMode ? '#fff' : '#000'} />
        ) : stats && !statsError && (
          <>
            <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>Provider</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Active Devices"
                value={stats.provider.allDevices.activeDevices}
                icon="devices"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="Messages Sent"
                value={stats.provider.allDevices.totalMessagesSent}
                icon="message"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="Verified Acks"
                value={stats.provider.allDevices.sentAckVerified}
                icon="check-circle"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="Failed Acks"
                value={stats.provider.allDevices.failedToSendAck}
                icon="error"
                isDarkMode={isDarkMode}
              />
            </View>

            <Text style={[styles.subsectionTitle, isDarkMode && styles.darkText]}>Consumer</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Keys"
                value={stats.consumer.aggregate.totalKeys}
                icon="vpn-key"
                isDarkMode={isDarkMode}
              />
              <StatCard
                title="Active Keys"
                value={stats.consumer.aggregate.activeKeys}
                icon="security"
                isDarkMode={isDarkMode}
              />
            </View>

            <TouchableOpacity
              style={[styles.expandButton, isDarkMode && styles.darkCard]}
              onPress={() => setExpandedKeys(!expandedKeys)}
            >
              <Text style={[styles.expandButtonText, isDarkMode && styles.darkText]}>
                API Keys {expandedKeys ? '(Hide)' : '(Show)'}
              </Text>
              <Icon
                name={expandedKeys ? 'expand-less' : 'expand-more'}
                size={24}
                color={isDarkMode ? '#fff' : '#000'}
              />
            </TouchableOpacity>

            {expandedKeys && (
              <FlatList
                data={stats.consumer.keys}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <View style={[styles.keyCard, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.keyName, isDarkMode && styles.darkText]}>{item.name}</Text>
                    <Text style={[styles.keyDate, isDarkMode && styles.darkText]}>
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
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
  section: {
    marginBottom: 24,
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
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  darkText: {
    color: '#fff',
  },
  loader: {
    marginTop: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#222',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  permissionCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#000',
  },
  expandButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  keyCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  keyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  keyDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;