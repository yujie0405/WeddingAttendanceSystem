// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 确保引入了这个
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* 必须在这里用 BrowserRouter 包裹 App */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)