// utils/registerFCM.js
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

const VAPID_KEY = "BOnE-4YZrJGAijICE9aOGB89f78TWYk_yxGlgbQKJVU4fQjgEiTuLJyUlSsGUD9zWgkecsnv_Ug3a76tXUNrl4g";

export const registerFCM = async (API_URL) => {
  try {
    if (!('Notification' in window)) {
      return;
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      await fetch(`${API_URL}/api/push/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }

    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "CRM Alert";
      const body = payload?.notification?.body || payload?.data?.body || "You have a meeting.";
      alert(`${title}\n${body}`);
    });    

  } catch (err) {
    // FCM registration failed silently
  }
};
