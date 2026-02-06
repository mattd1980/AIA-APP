import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function ThemeInit() {
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.classList.toggle('dark', m.matches) }
    apply()
    m.addEventListener('change', apply)
    return () => m.removeEventListener('change', apply)
  }, [])
  return null
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeInit />
    <App />
  </StrictMode>,
)
