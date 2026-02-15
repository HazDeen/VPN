import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // 👈 ДОБАВЛЯЕМ
import "./styles/app.css"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/VPN">  {/* 👈 basename = имя репозитория */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)