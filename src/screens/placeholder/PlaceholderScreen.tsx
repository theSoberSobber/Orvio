import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PlaceholderScreen = ({ route }: { route: any }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Placeholder Screen for {route.params.placeHolderFor}</Text>
      <View style={styles.paramsContainer}>
        {route.params ? (
          Object.entries(route.params).map(([key, value]) => (
            <Text key={key} style={styles.paramText}>
              {key}: {JSON.stringify(value)}
            </Text>
          ))
        ) : (
          <Text style={styles.paramText}>No parameters received.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  paramsContainer: { marginTop: 10 },
  paramText: { fontSize: 16, marginBottom: 5, textAlign: "left" },
});

export default PlaceholderScreen;