import { useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";
import EncryptedStorage from "react-native-encrypted-storage";
import { createHash } from "crypto";

const DEVICE_HASH_KEY = "deviceHash";

export const generateDeviceHash = (): string => {
  const uniqueId = JSON.stringify(DeviceInfo.getUniqueId()); // Unique per device
  console.log(uniqueId);
  const brand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel();
  const systemVersion = DeviceInfo.getSystemVersion();

  // using ;; as delimeter

  const rawString = `${uniqueId};;${brand};;${model};;${systemVersion}`;
  // return createHash("sha256").update(rawString).digest("hex");
  return rawString;
};

export const useDeviceHash = () => {
  const [deviceHash, setDeviceHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceHash = async () => {
      try {
        // Check if the hash is already stored
        let storedHash = await EncryptedStorage.getItem(DEVICE_HASH_KEY);

        if (!storedHash) {
          storedHash = generateDeviceHash();
          await EncryptedStorage.setItem(DEVICE_HASH_KEY, storedHash);
        }

        setDeviceHash(storedHash);
      } catch (error) {
        console.error("Error fetching device hash:", error);
        setDeviceHash("fallback-device-hash"); // In case of an error
      }
    };

    fetchDeviceHash();
  }, []);

  return deviceHash;
};