import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigators/rootNavigator";
import { useAuth } from "../contexts/AuthContext";

const OtpScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { verifyOtp, sendOtp } = useAuth();

  const { tid, phone } = route.params as { tid: string; phone: string };

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-focus first input when screen loads
    inputRefs.current[0]?.focus();
  }, []);

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    const success = await verifyOtp(tid, code);
    setLoading(false);

    if (success) {
      navigation.replace("MainTabsDashboard");
    } else {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const newTid = await sendOtp(phone);
    if (newTid) {
      setResendTimer(30);
    } else {
      Alert.alert("Error", "Failed to resend OTP. Try again later.");
    }
  };

  const handleInputChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return; // Allow only digits (or empty for backspace)
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus(); // Move to next input
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus(); // Move back if empty
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Phone verification</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        We've sent an SMS with a verification code to your phone <Text style={[styles.phoneText, isDarkMode && styles.darkPhoneText]}>{phone}</Text>
      </Text>

      {/* OTP Input Fields */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            style={[styles.otpInput, isDarkMode && styles.darkOtpInput]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleInputChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify"}</Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0}>
        <Text style={[styles.resendText, isDarkMode && styles.darkResendText]}>
          Resend code {resendTimer > 0 ? `in ${resendTimer}s` : "now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  darkContainer: { backgroundColor: "#000" },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", marginBottom: 10 },
  darkTitle: { color: "#fff" },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 30 },
  darkSubtitle: { color: "#bbb" },
  phoneText: { fontWeight: "bold", color: "#000" },
  darkPhoneText: { color: "#fff" },
  otpContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  otpInput: {
    width: 50,
    height: 50,
    fontSize: 22,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginHorizontal: 5,
    color: "#000",
  },
  darkOtpInput: { borderBottomColor: "#bbb", color: "#fff" },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  resendText: { textAlign: "center", color: "#444", marginTop: 20 },
  darkResendText: { color: "#bbb" },
});
