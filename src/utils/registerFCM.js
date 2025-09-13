// utils/registerFCM.js
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

const VAPID_KEY = "BOnE-4YZrJGAijICE9aOGB89f78TWYk_yxGlgbQKJVU4fQjgEiTuLJyUlSsGUD9zWgkecsnv_Ug3a76tXUNrl4g";

export const registerFCM = async (API_URL) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🚫 Notification permission denied");
      return;
    }

    // ✅ Register the service worker manually
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // ✅ Pass the registered SW here
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("📱 FCM token:", token);
      await fetch(`${API_URL}/api/push/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } else {
      console.warn("❌ No FCM token retrieved");
    }

    // Foreground message handler
    onMessage(messaging, (payload) => {
      console.log("🟡 Message received in foreground:", payload);
    
      const title = payload?.notification?.title || payload?.data?.title || "CRM Alert";
      const body = payload?.notification?.body || payload?.data?.body || "You have a meeting.";
    
      alert(`${title}\n${body}`);
    });    

  } catch (err) {
    console.error("🔥 FCM registration failed:", err.message);
  }
};

