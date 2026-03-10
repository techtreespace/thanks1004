import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";  // ← 추가
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>  {/* ← App을 HashRouter로 감싸기 */}
    <App />
  </HashRouter>
);
