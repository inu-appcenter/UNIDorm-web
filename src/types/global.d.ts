export {};

declare global {
    interface Window {
        // ✅ 안드로이드 브릿지 정의
        AndroidBridge?: {
            onRouteChange: (path: string) => void;
            requestAppUpdate: () => void;
        };

        // ✅ iOS WebKit 브릿지 정의
        webkit?: {
            messageHandlers: {
                requestAppUpdate: {
                    postMessage: (message: any) => void;
                };
                // 추가로 필요한 핸들러가 있다면 여기에 정의하세요.
            };
        };

        // ✅ 기존 useAppInit에서 사용하던 FCM 수신 함수
        onReceiveFcmToken?: ((token: string) => void) | null;
    }
}