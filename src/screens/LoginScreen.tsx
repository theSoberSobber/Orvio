import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigators/rootNavigator";

const LoginScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const { sendOtp } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Invalid phone number", "Please enter a valid 10-digit number.");
      return;
    }

    setLoading(true);
    // const tid = await sendOtp(`+91${phone}`);
    const tid = (await sendOtp(`+91${phone}`)) || "meow";
    setLoading(false);
    if (tid) {
      navigation.push("PlaceholderOtpScreen", {tid, phone: `+91${phone}`});
    } else {
      // why going back to onboarding screen when this fails?
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Phone number</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        We send to use phone number authentication to prevent abuse, sorry for any inconvineance 🙏
      </Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={styles.countryCodeContainer}>
          <Image source={require("../../assets/india-flag.png")} style={styles.flag} />
          <Text style={styles.countryCode}>+91</Text>
        </View>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
          style={[styles.input, isDarkMode && styles.darkInput]}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sending..." : "Continue"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  darkContainer: { backgroundColor: "#000" },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 10 },
  darkTitle: { color: "#fff" },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 30 },
  darkSubtitle: { color: "#bbb" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
  },
  countryCodeContainer: { flexDirection: "row", alignItems: "center", marginRight: 10 },
  flag: { width: 30, height: 20, marginRight: 5 },
  countryCode: { fontSize: 18, fontWeight: "bold", color: "#000" },
  input: { flex: 1, fontSize: 18, color: "#000", padding: 10 },
  darkInput: { color: "#fff" },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
