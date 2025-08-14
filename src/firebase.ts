// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB0PsEXuitkR_VjjfjWbm88HbXbr5z-jmE",
  authDomain: "uni-dorm.firebaseapp.com",
  projectId: "uni-dorm",
  storageBucket: "uni-dorm.firebasestorage.app",
  messagingSenderId: "495990333760",
  appId: "1:495990333760:web:6ebe07cb532da6066cdaa5",
  measurementId: "G-JXEZ5JBCJ9",
};

const app = initializeApp(firebaseConfig);

// messaging 객체 생성
export const messaging = getMessaging(app);
