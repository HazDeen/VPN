// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import TopUp from "./pages/TopUp";
import History from "./pages/History";
import DeviceDetail from "./pages/DeviceDetail";

import "./styles/app.css";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/history" element={<History />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}