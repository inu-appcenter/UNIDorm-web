import { useEffect } from "react";
import { messaging } from "@/firebase";
import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../apis/axiosInstance.ts";

export const useFcmToken = () => {
  useEffect(() => {
    const isAndroidWebView = () => {
      const ua = navigator.userAgent;
      return /wv|Android.*Version\/[\d.]+/i.test(ua);
    };

    const isIOSWebView = () => {
      const ua = navigator.userAgent;
      return (
        /iPhone|iPod|iPad/i.test(ua) &&
        /AppleWebKit/i.test(ua) &&
        !/Safari/i.test(ua)
      );
    };

    const isWebView = () => isAndroidWebView() || isIOSWebView();

    if (isWebView()) {
      console.warn("WebView 환경에서는 FCM 훅을 실행하지 않습니다.");
      return;
    }

    const initFCM = async () => {
      try {
        // 알림 권한 확인 및 요청
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.warn("알림 권한 거부됨");
            return;
          }
        } else if (Notification.permission === "denied") {
          console.warn("알림 권한이 브라우저에서 차단됨");
          return;
        }

        // FCM 토큰 발급
        const token = await getToken(messaging, {
          vapidKey:
            "BG_O1TN_HO34oXS-e_Fm9pCV7GljvXpDjVZU9mA1T6LUnyp001K4EHCZV4u5gGUPo7zxnttFrTJxfzIvSDmu720",
        });

        if (token) {
          console.log("FCM 토큰:", token);
          localStorage.setItem("fcmToken", token);
          await axiosInstance.post("/fcm/token", { token });
        } else {
          localStorage.setItem("fcmToken", "FCM 토큰 발급 실패");
        }
      } catch (err) {
        console.error("FCM 초기화 실패:", err);
      }
    };

    initFCM();

    // 포그라운드 메시지 수신
    onMessage(messaging, (payload) => {
      console.log("포그라운드 메시지:", payload);
    });
  }, []);
};
