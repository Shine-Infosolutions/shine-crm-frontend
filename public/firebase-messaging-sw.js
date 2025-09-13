/* eslint-disable no-undef */
// firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBXpJ1dv_3SDq9TVa-_hoSoT4CFteNJsBM",
  authDomain: "hotel-buddha-avenue.firebaseapp.com",
  projectId: "hotel-buddha-avenue",
  storageBucket: "hotel-buddha-avenue.appspot.com",
  messagingSenderId: "20353209537",
  appId: "1:20353209537:web:a6f748af3d97def3393040",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Background message:", payload);
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "CRM", {
    body: body || "New notification",
    icon: "/logo192.png",
  });
});
