import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
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
        // replace here, don't let them go back
      navigation.replace("PlaceholderMainDashboard");
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

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Phone verification</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        We've sent an SMS with a verification code to your phone <Text style={styles.phoneText}>{phone}</Text>
      </Text>

      {/* OTP Input Fields */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={[styles.otpInput, isDarkMode && styles.darkOtpInput]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => {
              const newOtp = [...otp];
              newOtp[index] = text;
              setOtp(newOtp);
            }}
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify"}</Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0}>
        <Text style={styles.resendText}>
          Resend code in {resendTimer > 0 ? `${resendTimer}s` : "now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 20, justifyContent: "center" },
    darkContainer: { backgroundColor: "#000" },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 10 },
    darkTitle: { color: "#fff" }, // Explicitly defining dark mode title color
    subtitle: { fontSize: 16, color: "#bbb", marginBottom: 30 },
    darkSubtitle: { color: "#bbb" }, // Explicitly defining dark mode subtitle color
    phoneText: { fontWeight: "bold", color: "#fff" },
    otpContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
    otpInput: {
      width: 50,
      height: 50,
      fontSize: 22,
      textAlign: "center",
      borderBottomWidth: 2,
      borderBottomColor: "#fff",
      marginHorizontal: 5,
      color: "#fff",
    },
    darkOtpInput: { borderBottomColor: "#bbb" },
    button: {
      backgroundColor: "#007bff",
      paddingVertical: 14,
      borderRadius: 25,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    resendText: { textAlign: "center", color: "#bbb", marginTop: 20 },
  });
  
