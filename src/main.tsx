import "intersection-observer";
import ReactDOM from "react-dom/client";
import App from "./App";
import CommonStyles from "./resources/styles/CommonStyles";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <CommonStyles />
    <App />
  </>,
);

// // // 서비스 워커 등록
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/firebase-messaging-sw.js")
//     .then((registration) => {
//       console.log("서비스 워커 등록 성공:", registration);
//     })
//     .catch((err) => {
//       console.error("서비스 워커 등록 실패:", err);
//     });
// }
