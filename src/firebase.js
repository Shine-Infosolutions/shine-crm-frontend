// firebase.js - Lazy loaded Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXpJ1dv_3SDq9TVa-_hoSoT4CFteNJsBM",
  authDomain: "hotel-buddha-avenue.firebaseapp.com",
  projectId: "hotel-buddha-avenue",
  storageBucket: "hotel-buddha-avenue.appspot.com",
  messagingSenderId: "20353209537",
  appId: "1:20353209537:web:a6f748af3d97def3393040",
};

let firebaseApp = null;
let messaging = null;

export async function loadFirebase() {
  if (firebaseApp) return { app: firebaseApp, messaging };
  
  const { initializeApp } = await import("firebase/app");
  const { getMessaging } = await import("firebase/messaging");
  
  firebaseApp = initializeApp(firebaseConfig);
  messaging = getMessaging(firebaseApp);
  
  return { app: firebaseApp, messaging };
}
