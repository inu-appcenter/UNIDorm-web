export {};

declare global {
    interface Window {
        // ✅ 안드로이드 브릿지 정의
        AndroidBridge?: {
            onRouteChange: (path: string) => void;
            requestAppUpdate: () => void;
            onAppReady?: () => void;
        };

        // ✅ iOS WebKit 브릿지 정의
        webkit?: {
            messageHandlers: {
                [key: string]: any;
                requestAppUpdate?: {
                    postMessage: (message: any) => void;
                };
                enterDetailView?: {
                    postMessage: (message: { type: "CHAT" | "NOTICE"; id: string }) => void;
                };
                onAppReady?: {
                    postMessage: (message: any) => void;
                };
                routeChange?: {
                    postMessage: (message: any) => void;
                };
            };
        };

        // ✅ 기존 useAppInit에서 사용하던 FCM 수신 함수
        onReceiveFcmToken?: ((token: string) => void) | null;

        // ✅ 알림 라우팅용 전역 함수 정의
        navigateToPath?: (path: string) => void;
    }
}