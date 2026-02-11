import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import TopUp from "./pages/TopUp";

import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
