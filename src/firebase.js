// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBXpJ1dv_3SDq9TVa-_hoSoT4CFteNJsBM",
  authDomain: "hotel-buddha-avenue.firebaseapp.com",
  projectId: "hotel-buddha-avenue",
  storageBucket: "hotel-buddha-avenue.appspot.com",
  messagingSenderId: "20353209537",
  appId: "1:20353209537:web:a6f748af3d97def3393040",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging }; // ✅ only export messaging
