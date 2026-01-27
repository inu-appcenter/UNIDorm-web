// src/types/global.d.ts (없으면 생성)
interface Window {
    AndroidBridge?: {
        onRouteChange: (path: string) => void;
        requestAppUpdate: () => void;
    };
}