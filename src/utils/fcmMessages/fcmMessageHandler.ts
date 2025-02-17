import { NativeModules } from "react-native";

const MessageType = {
  OTP: 'OTP',
  PING: 'PING',
};

const { SmsModule } = NativeModules;

const formatTimestamp = (timestamp: any) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const handleFcmMessage = async (remoteMessage: any, api: any) => {
  const isForegroundMessage = !!remoteMessage.notification;
  if (isForegroundMessage) return;

  const { type, otp, phoneNumber, timestamp, tid } = remoteMessage?.data || {};

  switch (type) {
    case MessageType.OTP:
      console.log("[FCM OTP] FCM OTP message received, handling it...");
      const formattedTimestamp = formatTimestamp(timestamp);
      console.log(`OTP: ${otp}, Phone Number: ${phoneNumber}, Timestamp: ${formattedTimestamp}, TID: ${tid}`);
      
      try {
        await SmsModule.sendSms(phoneNumber, `${otp}. It was requested at ${formattedTimestamp}`);
        console.log('SMS sent successfully!');

        await api.post('/service/ack', { tid });
        console.log('Acknowledgment sent for TID:', tid);
      } catch (error) {
        console.error('Error handling OTP message:', error);
      }
      break;
      
    case MessageType.PING:
      console.log("[FCM PING] FCM PING message received, handling it...");
      console.log(`Timestamp: ${timestamp}`);
      break;
    
    default:
      console.log("Unknown message type");
      break;
  }
};