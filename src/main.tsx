import ReactDOM from "react-dom/client";
import App from "./App";
import "@/styles/portalVariables.css";
import "@/styles/tokens/tokens.css";
import CommonStyles from "@/resources/styles/CommonStyles";
import { initMixpanel } from "@/utils/mixpanel";

initMixpanel();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <>
    <CommonStyles />
    <App />
  </>,

  // </React.StrictMode>,
);
