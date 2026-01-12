import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router";
import "./index.css";
import "./init";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
