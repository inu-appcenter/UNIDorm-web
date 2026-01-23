import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CommonStyles from "@/resources/styles/CommonStyles";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CommonStyles />
    <App />
  </React.StrictMode>,
);
