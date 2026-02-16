import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from 'sonner';
import Login from "./pages/Login";
import Home from "./pages/Home";
import TopUp from "./pages/TopUp";
import History from "./pages/History";
import DeviceDetail from "./pages/DeviceDetail";
import Admin from "./pages/Admin"; // 👈 ДОБАВЛЯЕМ
import "./styles/app.css";
import "./styles/admin.css"; // 👈 СТИЛИ АДМИНКИ

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* HashRouter уже в main.tsx */}
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
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/history" element={<History />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
          <Route path="/admin" element={<Admin />} /> {/* 👈 НОВЫЙ РОУТ */}
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;