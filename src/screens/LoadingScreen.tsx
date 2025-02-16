import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const LoadingScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size={"large"}></ActivityIndicator>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
});

export default LoadingScreen;