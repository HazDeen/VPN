import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext"; // 👈 ИМПОРТ ПО УМОЛЧАНИЮ
import Home from "./pages/Home";
import TopUp from "./pages/TopUp";
import History from "./pages/History";
import DeviceDetail from "./pages/DeviceDetail";
import "./styles/app.css";
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster 
      position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1c22',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/history" element={<History />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;