import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import "./styles/app.css"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>  {/* 👈 ВМЕСТО BrowserRouter */}
      <App />
    </HashRouter>
  </StrictMode>,
)