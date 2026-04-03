// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB0PsEXuitkR_VjjfjWbm88HbXbr5z-jmE",
  authDomain: "uni-dorm.firebaseapp.com",
  projectId: "uni-dorm",
  storageBucket: "uni-dorm.firebasestorage.app",
  messagingSenderId: "495990333760",
  appId: "1:495990333760:web:6ebe07cb532da6066cdaa5",
  measurementId: "G-JXEZ5JBCJ9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 메시지 수신:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
