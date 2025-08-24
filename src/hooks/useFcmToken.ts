import { useEffect } from "react";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../apis/axiosInstance.ts";

export const useFcmToken = () => {
  useEffect(() => {
    const initFCM = async () => {
      try {
        // 현재 권한 상태 확인
        if (Notification.permission === "default") {
          // 아직 허용/거부 안 한 경우 → 권한 요청
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.warn("알림 권한 거부됨");
            return;
          }
        } else if (Notification.permission === "denied") {
          console.warn("알림 권한이 브라우저에서 차단됨");
          return;
        }

        // 권한 허용 상태 → 토큰 발급
        const token = await getToken(messaging, {
          vapidKey:
            "BG_O1TN_HO34oXS-e_Fm9pCV7GljvXpDjVZU9mA1T6LUnyp001K4EHCZV4u5gGUPo7zxnttFrTJxfzIvSDmu720",
        });

        if (token) {
          console.log("FCM 토큰:", token);
          localStorage.setItem("fcmToken", token);
          // 서버로 전송
          const sendFcmToken = async (token: string) => {
            await axiosInstance.post("/fcm/token", { token });
          };
          await sendFcmToken(token); // 여기서 tokenInstance 사용
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
